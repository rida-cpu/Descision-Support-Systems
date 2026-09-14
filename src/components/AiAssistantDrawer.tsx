import React, { useState } from 'react';
import { Bot, X, Send, Loader2 } from 'lucide-react';
import { CorrelationFactor, DatasetRow } from '../types';
import { formatNumber } from '../utils/dataAnalysis';

interface AiAssistantDrawerProps {
  isOpen: boolean;
  onToggle: () => void;
  fileName: string;
  rows: DatasetRow[];
  targetKey: string;
  targetAverage: number;
  targetStd: number;
  factors: CorrelationFactor[];
}

interface ChatMessage {
  sender: 'ai' | 'user';
  text: string;
}

export const AiAssistantDrawer: React.FC<AiAssistantDrawerProps> = ({
  isOpen,
  onToggle,
  fileName,
  rows,
  targetKey,
  targetAverage,
  targetStd,
  factors
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: 'ai',
      text: `Hello! I am your InsightIQ Analytics Copilot. Ask me about correlations, what-if sensitivity questions (e.g. "what if Advertising increases by 10%?"), or dataset statistics for ${fileName}.`
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userText = input.trim();
    const nextMessages: ChatMessage[] = [...messages, { sender: 'user', text: userText }];
    setMessages(nextMessages);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          history: nextMessages.slice(0, -1).map((m) => ({ sender: m.sender, text: m.text })),
          datasetContext: {
            fileName,
            rowCount: rows.length,
            targetKey,
            targetAverage,
            targetStd,
            topFactors: factors.slice(0, 5).map((f) => ({ name: f.name, correlation: f.correlation }))
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const data = await response.json();
      const reply =
        data?.reply ||
        `I couldn't generate a response right now. For dataset '${fileName}' (${rows.length} rows), the strongest predictor is '${factors[0]?.name || 'N/A'}' (r = ${factors[0]?.correlation.toFixed(2) || '0'}).`;

      setMessages((prev) => [...prev, { sender: 'ai', text: reply }]);
    } catch (err) {
      console.error('AI Assistant request failed:', err);
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: `⚠️ I couldn't reach the AI backend just now. Meanwhile: for '${fileName}' (${rows.length} rows), the historical average for '${targetKey}' is ${formatNumber(targetAverage)}, and the strongest driver is '${factors[0]?.name || 'N/A'}'.`
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={onToggle}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white shadow-2xl flex items-center justify-center transition-colors cursor-pointer print:hidden"
        title="Open AI Analytics Assistant"
      >
        <Bot size={24} />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-88 sm:w-96 bg-white rounded-2xl border border-slate-200/90 shadow-2xl overflow-hidden flex flex-col h-[480px] animate-fadeIn print:hidden">
      <div className="px-4 py-3 bg-slate-900 text-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center text-white">
            <Bot size={17} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-100">InsightIQ Analytics Copilot</h4>
            <span className="text-xs text-emerald-400 font-medium">Ready · {fileName}</span>
          </div>
        </div>
        <button
          type="button"
          onClick={onToggle}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          title="Close assistant"
        >
          <X size={17} />
        </button>
      </div>

      <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/50 text-sm">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[82%] p-3 rounded-xl leading-relaxed whitespace-pre-wrap ${
                m.sender === 'user'
                  ? 'bg-indigo-600 text-white rounded-br-2xs'
                  : 'bg-white border border-slate-200/80 text-slate-800 shadow-2xs rounded-bl-2xs'
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-[82%] p-3 rounded-xl bg-white border border-slate-200/80 text-slate-500 shadow-2xs rounded-bl-2xs flex items-center gap-2">
              <Loader2 size={14} className="animate-spin" />
              <span className="text-xs">Thinking...</span>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSend} className="p-2.5 bg-white border-t border-slate-200 flex items-center gap-2">
        <input
          type="text"
          placeholder="Ask a question about the data..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isLoading}
          className="flex-1 px-3 py-1.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-slate-50 disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
        </button>
      </form>
    </div>
  );
};
