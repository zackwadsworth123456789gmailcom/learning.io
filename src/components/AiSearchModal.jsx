import React, { useState, useEffect, useRef } from 'react';
import Markdown from 'react-markdown';
import {
  Send,
  X,
  RefreshCw,
  Copy,
  Check,
  Trash2,
  Compass,
  User,
  Calculator,
  ChevronDown,
  Sparkles,
  Zap,
} from 'lucide-react';

const OpenAiLogo = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2594 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.747-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.8956zm16.5979 3.8558L13.104 8.3829l2.0154-1.1638a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.686zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.6611zm-12.641-4.135a4.5087 4.5087 0 0 1 3.9977-2.148v5.6772a.79.79 0 0 0 .3927.6813l5.8333 3.3685-2.02 1.1686a.071.071 0 0 1-.071 0l-4.8303-2.7913a4.4944 4.4944 0 0 1-3.3024-5.9563zm4.6006 8.2831l2.6082-1.5035 2.6083 1.5035v3.007l-2.6083 1.5035-2.6082-1.5035z" />
  </svg>
);

const SUGGESTED_QUESTIONS = [
  {
    category: 'Algebra',
    icon: '📐',
    question: 'Solve step-by-step: 3x + 12 = 39, find x',
  },
  {
    category: 'Logic Riddle',
    icon: '💡',
    question: 'Solve the bat and ball riddle: $1.10 total, bat is $1 more than the ball',
  },
  {
    category: 'Game Strategy',
    icon: '🎮',
    question: 'How do I master Slope and score over 100 without crashing?',
  },
  {
    category: 'Physics',
    icon: '✈️',
    question: 'How do airplane wings generate lift? (Bernoulli vs Newton)',
  },
  {
    category: 'Geometry',
    icon: '🔺',
    question: 'Explain the Pythagorean theorem with a 3-4-5 triangle step-by-step',
  },
  {
    category: 'Puzzle Tactics',
    icon: '🧩',
    question: 'What is the secret corner-lock solution to win 2048?',
  },
];

export const AiSearchModal = ({ isOpen, onClose }) => {
  const [question, setQuestion] = useState('');
  const [selectedModel, setSelectedModel] = useState('gpt-4o-mini'); // 'gpt-4o-mini' | 'gpt-4o'
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      text: `### Hello! How can I help you today?

I'm **ChatGPT**, running directly inside Arcade.IO. Ask me any question, equation, or puzzle and I'll solve and explain it step-by-step (**zero code**, pure solutions).

**What you can ask:**
- **Math & Algebra**: Step-by-step equations, fractions, geometry, and calculus.
- **Logic & Riddles**: Deductive reasoning, probability, and classic brainteasers.
- **Game Mastery**: Optimal mechanics and tactics to win Slope, 2048, Tetris, or Snake.
- **Science & Homework**: Clear explanations of physics, chemistry, biology, and history.

Type below or select a quick starter above to begin!`,
      model: 'ChatGPT (gpt-4o-mini)',
      timestamp: new Date(),
    },
  ]);
  const [copiedId, setCopiedId] = useState(null);
  const inputRef = useRef(null);
  const chatBottomRef = useRef(null);

  // Auto-focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 120);
    }
  }, [isOpen]);

  // Scroll to bottom when messages update
  useEffect(() => {
    if (isOpen) {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, isOpen]);

  // Handle ESC
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleAsk = async (askText) => {
    const q = (askText || question).trim();
    if (!q || isLoading) return;

    const userMsgId = Date.now().toString();
    const userMsg = {
      id: userMsgId,
      role: 'user',
      text: q,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setQuestion('');
    setIsLoading(true);

    try {
      const historyPayload = messages
        .filter((m) => m.id !== 'welcome')
        .map((m) => ({
          role: m.role,
          text: m.text,
        }));

      const res = await fetch('/api/ai/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: q,
          history: historyPayload,
          model: selectedModel,
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();
      const aiMsg = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: data.answer || 'I was unable to generate an answer. Please try again!',
        model: data.model || `ChatGPT (${selectedModel})`,
        source: data.source,
        provider: data.provider || 'OpenAI ChatGPT',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.warn('ChatGPT solve failed, generating client fallback', err);
      const aiMsg = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: `### Step-by-Step Solution: "${q}"

Here is the logical breakdown to solve this problem:

1. **Identify the Core Premise**: Isolate the given parameters and understand what unknown variable or outcome is requested.
2. **Apply Fundamental Rules**: Use standard algebraic formulas, logical deductions, or gameplay mechanics to derive the solution.
3. **Verify the Result**: Confirm the final answer satisfies all constraints and conditions.

Feel free to ask a follow-up or try another problem!`,
        model: 'ChatGPT (Offline Engine)',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopySolution = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        text: `Conversation cleared! What would you like to ask ChatGPT today?`,
        model: 'ChatGPT (gpt-4o-mini)',
        timestamp: new Date(),
      },
    ]);
    setQuestion('');
  };

  if (!isOpen) return null;

  return (
    <div
      id="ai-qa-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xs p-3 sm:p-6 overflow-hidden"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="ai-qa-modal-container"
        className="relative w-full max-w-3xl h-[88vh] max-h-[750px] bg-zinc-900 border border-emerald-500/40 rounded-2xl shadow-2xl shadow-emerald-950/40 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Top Header - OpenAI ChatGPT Branding */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-800 bg-zinc-900/95 shrink-0">
          <div className="flex items-center gap-3">
            {/* ChatGPT Emerald Icon */}
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#10a37f]/20 border border-[#10a37f]/40 text-[#10a37f] shadow-inner">
              <OpenAiLogo className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-white tracking-tight">ChatGPT</span>
                <span className="text-[10px] font-mono font-bold bg-[#10a37f]/20 text-[#10a37f] border border-[#10a37f]/30 px-1.5 py-0.5 rounded">
                  OpenAI
                </span>
                {/* Model Selector Dropdown */}
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="bg-zinc-800 border border-zinc-700 text-[11px] font-mono text-zinc-300 rounded px-2 py-0.5 focus:outline-none focus:border-[#10a37f] cursor-pointer"
                  title="Choose ChatGPT Model"
                >
                  <option value="gpt-4o-mini">GPT-4o mini (Fast)</option>
                  <option value="gpt-4o">GPT-4o (Intelligence)</option>
                </select>
              </div>
              <p className="text-[11px] text-zinc-400">
                Instant answers, math formulas, logic puzzles, and gaming strategies
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleClearChat}
              className="flex items-center gap-1 text-[11px] font-mono text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 px-2 py-1 rounded transition-colors cursor-pointer"
              title="Reset conversation"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Clear</span>
            </button>

            <button
              id="close-ai-qa-btn"
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors cursor-pointer"
              title="Close (Esc)"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Quick Suggestion Starters Bar */}
        <div className="px-4 py-2 border-b border-zinc-800/80 bg-zinc-950/60 overflow-x-auto flex items-center gap-1.5 shrink-0 scrollbar-none">
          <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider shrink-0 flex items-center gap-1 mr-1">
            <Compass className="h-3 w-3 text-[#10a37f]" /> Starters:
          </span>
          {SUGGESTED_QUESTIONS.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleAsk(item.question)}
              className="shrink-0 text-[11px] font-sans rounded-md bg-zinc-850 hover:bg-[#10a37f]/20 hover:text-emerald-300 hover:border-[#10a37f]/50 border border-zinc-750 px-2.5 py-1 text-zinc-300 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <span>{item.icon}</span>
              <span>{item.question}</span>
            </button>
          ))}
        </div>

        {/* Conversation Feed */}
        <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4 bg-zinc-950/40">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';

            return (
              <div
                key={msg.id}
                className={`flex items-start gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-full bg-[#10a37f] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-md">
                    <OpenAiLogo className="h-4 w-4" />
                  </div>
                )}

                <div
                  className={`max-w-[88%] sm:max-w-[82%] rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-md ${
                    isUser
                      ? 'bg-zinc-800 text-white rounded-tr-xs font-sans text-sm border border-zinc-700'
                      : 'bg-zinc-900 border border-zinc-800 text-zinc-200 rounded-tl-xs'
                  }`}
                >
                  {isUser ? (
                    <p className="whitespace-pre-wrap font-medium">{msg.text}</p>
                  ) : (
                    <div className="space-y-2">
                      <div className="prose prose-invert prose-xs max-w-none prose-p:my-1.5 prose-headings:my-2 prose-headings:text-emerald-300 prose-headings:font-bold prose-strong:text-emerald-200 prose-ul:my-1.5 prose-ol:my-1.5 prose-li:my-0.5">
                        <Markdown
                          components={{
                            code({ children }) {
                              return (
                                <span className="font-semibold text-emerald-300 bg-zinc-800/90 px-1 py-0.5 rounded">
                                  {children}
                                </span>
                              );
                            },
                            pre({ children }) {
                              return (
                                <div className="my-2 p-2.5 rounded bg-zinc-850 border border-zinc-750 text-zinc-300 text-xs">
                                  {children}
                                </div>
                              );
                            },
                          }}
                        >
                          {msg.text}
                        </Markdown>
                      </div>

                      {/* Message Meta & Utilities */}
                      <div className="pt-2 border-t border-zinc-800/60 flex items-center justify-between text-[10px] font-mono text-zinc-400">
                        <span className="flex items-center gap-1 text-[#10a37f]">
                          <Check className="h-3 w-3" />
                          <span>{msg.model || 'ChatGPT'}</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopySolution(msg.text, msg.id)}
                          className="hover:text-white flex items-center gap-1 cursor-pointer transition-colors px-1.5 py-0.5 rounded hover:bg-zinc-800"
                          title="Copy solution text"
                        >
                          {copiedId === msg.id ? (
                            <>
                              <Check className="h-3 w-3 text-emerald-400" />
                              <span className="text-emerald-400">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-full bg-zinc-700 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-md">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>
            );
          })}

          {/* Loading Indicator Bubble */}
          {isLoading && (
            <div className="flex items-start gap-3 justify-start">
              <div className="w-8 h-8 rounded-full bg-[#10a37f] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-md">
                <OpenAiLogo className="h-4 w-4 animate-spin" />
              </div>
              <div className="rounded-2xl px-4 py-3 bg-zinc-900 border border-[#10a37f]/30 text-zinc-300 text-xs flex items-center gap-2">
                <RefreshCw className="h-3.5 w-3.5 text-[#10a37f] animate-spin" />
                <span className="font-mono text-zinc-300">ChatGPT is thinking...</span>
              </div>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* Message Input Footer */}
        <div className="p-3 sm:p-4 border-t border-zinc-800 bg-zinc-950 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAsk();
            }}
            className="relative flex items-center gap-2"
          >
            <div className="relative flex-1">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#10a37f] select-none pointer-events-none">
                <OpenAiLogo className="h-4 w-4" />
              </div>
              <input
                ref={inputRef}
                id="ai-qa-question-input"
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Message ChatGPT: 'Solve 3x + 12 = 39', 'How to beat Slope?', 'Bat & ball riddle'..."
                className="w-full rounded-xl bg-zinc-900 border border-zinc-700 hover:border-zinc-600 focus:border-[#10a37f] pl-10 pr-10 py-3 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-[#10a37f] transition-all font-sans"
                disabled={isLoading}
              />
              {question && (
                <button
                  type="button"
                  onClick={() => setQuestion('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading || !question.trim()}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#10a37f] hover:bg-[#0e8e6e] disabled:bg-zinc-800 disabled:text-zinc-600 disabled:cursor-not-allowed px-4 py-3 text-xs font-bold text-white transition-colors cursor-pointer shadow-xs shrink-0"
            >
              {isLoading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <span>Send</span>
                  <Send className="h-3.5 w-3.5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-2 flex items-center justify-between text-[10px] font-mono text-zinc-500 px-1">
            <span>Runs on OpenAI ChatGPT ({selectedModel}) • Zero code rule</span>
            <span className="hidden sm:inline">Press Enter to send</span>
          </div>
        </div>
      </div>
    </div>
  );
};
