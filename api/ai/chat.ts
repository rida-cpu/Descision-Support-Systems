import type { IncomingMessage, ServerResponse } from 'http';

function readBody(req: IncomingMessage): Promise<any> {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
    });
    req.on('end', () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch (e) {
        reject(e);
      }
    });
    req.on('error', reject);
  });
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.end(JSON.stringify({ error: 'Method not allowed' }));
    return;
  }

  try {
    const body = await readBody(req);
    const { message, history, datasetContext } = body || {};

    if (!message || typeof message !== 'string') {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'message is required' }));
      return;
    }

    const rawKey = (
      process.env.OPENROUTER_API_KEY ||
      process.env.API_KEY ||
      ''
    ).trim();

    const hasValidKey = Boolean(rawKey && rawKey !== 'MY_OPENROUTER_API_KEY' && rawKey.length > 5);

    const fileName = datasetContext?.fileName || 'the loaded dataset';
    const rowCount = datasetContext?.rowCount ?? 0;
    const targetKey = datasetContext?.targetKey || 'the target variable';
    const targetAverage = datasetContext?.targetAverage ?? 0;
    const targetStd = datasetContext?.targetStd ?? 0;
    const topFactors: Array<{ name: string; correlation: number }> = Array.isArray(datasetContext?.topFactors)
      ? datasetContext.topFactors
      : [];

    const factorsStr = topFactors.length
      ? topFactors.map((f) => `${f.name} (r=${Number(f.correlation).toFixed(2)})`).join(', ')
      : 'none computed yet';

    if (!hasValidKey) {
      const notice = `> ⚙️ **To enable live AI reasoning**:\n> Please configure \`OPENROUTER_API_KEY\` in your environment variables.`;
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(
        JSON.stringify({
          reply: `### 📊 Dataset Overview\n- **File**: \`${fileName}\`\n- **Rows**: **${rowCount}**\n- **Target**: **${targetKey}** (Mean: **${Number(targetAverage).toFixed(2)}**, Std Dev: **${Number(targetStd).toFixed(2)}**)\n- **Top Drivers**: ${factorsStr}\n\n---\n${notice}`,
          source: 'local_assistant'
        })
      );
      return;
    }

    const systemInstruction = `You are the InsightIQ Analytics Copilot, an expert data-science assistant embedded inside a predictive analytics web app called Insight_IQ.
You are helping a user analyze the dataset currently loaded in the app: "${fileName}" (${rowCount} rows).
The current forecast target variable is "${targetKey}" with a historical mean of ${Number(targetAverage).toFixed(2)} and standard deviation of ${Number(targetStd).toFixed(2)}.
The strongest correlated drivers of the target are: ${factorsStr}.
Answer the user's questions about correlations, what-if sensitivity scenarios, algorithm choice (Random Forest, Gradient Boosting, Linear Ridge Regression), risk levels, and business recommendations, grounded in the dataset context above.
Keep answers concise (under 150 words unless the user asks for detail), use markdown formatting (bold, bullet points) where helpful, and speak like a knowledgeable, friendly data analyst.`;

    const chatMessages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { role: 'system', content: systemInstruction }
    ];

    if (Array.isArray(history) && history.length > 0) {
      const recentHistory = history.slice(-8);
      for (const msg of recentHistory) {
        const text = (msg?.text || '').trim();
        if (!text) continue;
        const isUser = msg.sender === 'user' || msg.role === 'user';
        chatMessages.push({ role: isUser ? 'user' : 'assistant', content: text });
      }
    }

    chatMessages.push({ role: 'user', content: message.trim() });

    const candidateModels = [
      'openrouter/free',
      'meta-llama/llama-3.2-3b-instruct:free',
      'mistralai/mistral-7b-instruct:free'
    ];

    let replyText: string | null = null;
    let usedModel = '';

    for (const modelName of candidateModels) {
      try {
        const orResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${rawKey}`,
            'HTTP-Referer': process.env.APP_URL || 'http://localhost:3000',
            'X-Title': 'Insight_IQ Predictive Engine'
          },
          body: JSON.stringify({
            model: modelName,
            messages: chatMessages,
            temperature: 0.4,
            max_tokens: 500
          })
        });

        if (!orResponse.ok) {
          const errBody = await orResponse.text();
          console.warn(`Model ${modelName} in serverless failed (${orResponse.status}):`, errBody);
          continue;
        }

        const data = await orResponse.json();
        const text = data?.choices?.[0]?.message?.content?.trim();

        if (text) {
          replyText = text;
          usedModel = modelName;
          break;
        }
      } catch (mErr: any) {
        console.warn(`Model ${modelName} in serverless failed:`, mErr?.message || mErr);
      }
    }

    if (replyText) {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(
        JSON.stringify({
          reply: replyText,
          source: 'openrouter_api',
          model: usedModel
        })
      );
      return;
    }

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(
      JSON.stringify({
        reply: `I couldn't reach the AI model right now (all providers were unavailable). Here's what I can tell you directly: the target **${targetKey}** has a historical average of **${Number(targetAverage).toFixed(2)}**, and the strongest driver is **${topFactors[0]?.name || 'not yet computed'}**. Please try again in a moment.`,
        source: 'local_assistant'
      })
    );
  } catch (err) {
    console.error('Server error handling AI chat (serverless):', err);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Internal server error' }));
  }
}
