import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';

dotenv.config({ path: ['.env.local', '.env'] });

async function createServer() {
  const app = express();
  app.use(express.json({ limit: '20mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.post('/api/ai/chat', async (req, res) => {
    try {
      const { message, history, datasetContext } = req.body || {};

      if (!message || typeof message !== 'string') {
        return res.status(400).json({ error: 'message is required' });
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
        const keyNotice = `> ⚙️ **To enable live AI reasoning on localhost**:\n> Add your OpenRouter API key to a \`.env\` file in your project folder:\n> \`OPENROUTER_API_KEY="${rawKey || 'sk-or-v1-your_key_here'}"\`\n> Then restart \`npm run dev\`.`;

        return res.json({
          reply: `### 📊 Dataset Overview\n- **File**: \`${fileName}\`\n- **Rows**: **${rowCount}**\n- **Target**: **${targetKey}** (Mean: **${Number(targetAverage).toFixed(2)}**, Std Dev: **${Number(targetStd).toFixed(2)}**)\n- **Top Drivers**: ${factorsStr}\n\n---\n${keyNotice}`,
          source: 'local_assistant'
        });
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
            console.warn(`Model ${modelName} call failed (${orResponse.status}):`, errBody);
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
          console.warn(`Model ${modelName} call failed:`, mErr?.message || mErr);
        }
      }

      if (replyText) {
        return res.json({
          reply: replyText,
          source: 'openrouter_api',
          model: usedModel
        });
      }

      return res.json({
        reply: `I couldn't reach the AI model right now (all providers were unavailable). Here's what I can tell you directly: the target **${targetKey}** has a historical average of **${Number(targetAverage).toFixed(2)}**, and the strongest driver is **${topFactors[0]?.name || 'not yet computed'}**. Please try again in a moment.`,
        source: 'local_assistant'
      });
    } catch (err) {
      console.error('Server error handling AI chat:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  if (process.env.NODE_ENV === 'production') {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  }

  const port = process.env.PORT ? Number(process.env.PORT) : 3000;
  app.listen(port, '0.0.0.0', () => {
    console.log(`Insight_IQ server running at http://localhost:${port}`);
  });
}

createServer();
