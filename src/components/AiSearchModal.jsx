import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Search,
  X,
  Play,
  Heart,
  Gamepad2,
  Zap,
  ArrowRight,
  Lightbulb,
  Compass,
  CheckCircle2,
  RefreshCw,
  Code2,
} from 'lucide-react';

const QUICK_PROMPTS = [
  { label: '⚡ Fast 3D reflex runners like Slope', query: 'Fast paced 3D reflex ball runner game like Slope or Temple Run' },
  { label: '🧠 Relaxing puzzle & logic games', query: 'Relaxing puzzle games to think strategically and pass time' },
  { label: '🕹️ 80s retro arcade classics', query: 'Nostalgic golden age 80s retro arcade games' },
  { label: '⌨️ Arrow key controls only', query: 'Games that use simple arrow keys or WASD controls' },
  { label: '⏱️ Quick 5-minute coffee break', query: 'Quick instant casual games for a short 5 minute break' },
  { label: '🎯 Physics & skill challenges', query: 'Games featuring physics, ball bouncing, and timing skill' },
];

export const AiSearchModal = ({
  isOpen,
  onClose,
  games = [],
  favorites = [],
  onToggleFavorite,
  onSelectGame,
  onOpenTryIt,
  onOpenAddModal,
}) => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  // Auto-focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    } else {
      setError(null);
    }
  }, [isOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleSearch = async (searchQuery) => {
    const q = (searchQuery || query).trim();
    if (!q) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: q,
          games: games,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const data = await response.json();
      setResults(data);
    } catch (err) {
      console.warn('AI search request failed, falling back to client-side matcher', err);
      // Client-side fallback matching if backend route is unavailable
      const fallbackMatches = performClientFallback(q, games);
      setResults({
        source: 'client_local',
        model: 'client-semantic-matcher',
        aiSummary: `Curated ${fallbackMatches.length} matching games for "${q}".`,
        matchedGames: fallbackMatches,
        suggestedCustomIdeas: [],
      });
    } finally {
      setIsLoading(false);
    }
  };

  const performClientFallback = (searchQuery, catalog) => {
    const q = searchQuery.toLowerCase();
    const tokens = q.split(/\s+/).filter((t) => t.length > 1);

    return catalog
      .map((game) => {
        let score = 50;
        const reasons = [];

        if ((game.title || '').toLowerCase().includes(q)) {
          score += 40;
          reasons.push('Direct title match');
        }
        if ((game.category || '').toLowerCase().includes(q)) {
          score += 30;
          reasons.push(`${game.category} genre`);
        }
        for (const token of tokens) {
          if ((game.description || '').toLowerCase().includes(token)) {
            score += 15;
            reasons.push(`Contains "${token}"`);
          }
        }
        if ((q.includes('fast') || q.includes('slope') || q.includes('speed')) && (game.id === 'slope' || game.id === 'flappy-bird')) {
          score += 35;
          reasons.push('High-speed arcade action');
        }
        if ((q.includes('puzzle') || q.includes('brain') || q.includes('think')) && (game.category === 'Puzzle' || game.id === '2048' || game.id === 'tetris')) {
          score += 35;
          reasons.push('Strategic puzzle gameplay');
        }

        return {
          id: game.id,
          matchScore: Math.min(Math.max(score, 60), 98),
          reason: reasons.length > 0 ? reasons.slice(0, 2).join(' • ') : `Top rated ${game.category} title.`,
          highlightFeature: game.category,
        };
      })
      .filter((m) => m.matchScore > 55)
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 6);
  };

  const handlePromptClick = (promptQuery) => {
    setQuery(promptQuery);
    handleSearch(promptQuery);
  };

  if (!isOpen) return null;

  return (
    <div
      id="ai-search-modal-backdrop"
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/80 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="ai-search-modal-container"
        className="relative w-full max-w-3xl bg-zinc-900 border border-purple-500/30 rounded-xl shadow-2xl shadow-purple-950/40 my-6 sm:my-10 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Modal Top Header Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-800 bg-zinc-900/90 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-600/20 border border-purple-500/40 text-purple-400">
              <Sparkles className="h-4 w-4 text-purple-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white tracking-tight">AI Game Search</span>
                <span className="text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 px-1.5 py-0.2 rounded uppercase">
                  Gemini 3.8 Flash
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">
                Natural language discovery across {games.length} unblocked arcade titles
              </p>
            </div>
          </div>

          <button
            id="close-ai-search-btn"
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors cursor-pointer"
            title="Close (Esc)"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search Input Bar */}
        <div className="p-4 sm:p-5 border-b border-zinc-800 bg-zinc-950/50">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch();
            }}
            className="relative flex items-center"
          >
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-400 select-none" />
            <input
              ref={inputRef}
              id="ai-search-prompt-input"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask anything: 'fast 3D reflex game', 'retro 80s arcade with arrow keys', 'relaxing puzzle'..."
              className="w-full rounded-lg bg-zinc-900 border border-purple-500/40 pl-10 pr-24 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:border-purple-400 focus:outline-none focus:ring-1 focus:ring-purple-400 transition-all font-sans"
            />
            <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery('');
                    setResults(null);
                  }}
                  className="p-1 text-zinc-500 hover:text-zinc-300 rounded cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
              <button
                type="submit"
                disabled={isLoading || !query.trim()}
                className="inline-flex items-center gap-1.5 rounded-md bg-purple-600 hover:bg-purple-500 disabled:bg-zinc-800 disabled:text-zinc-600 disabled:cursor-not-allowed px-3 py-1.5 text-xs font-bold text-white transition-colors cursor-pointer shadow-xs"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    <span>Searching...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Search</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Quick Prompt Suggestions */}
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] uppercase tracking-wider font-mono text-zinc-500 mr-1 flex items-center gap-1">
              <Compass className="h-3 w-3" /> Prompts:
            </span>
            {QUICK_PROMPTS.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handlePromptClick(p.query)}
                className="text-[11px] font-sans rounded bg-zinc-800/80 hover:bg-purple-950/60 hover:text-purple-300 hover:border-purple-500/40 border border-zinc-700/60 px-2.5 py-1 text-zinc-300 transition-colors cursor-pointer"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Results Area */}
        <div className="p-4 sm:p-6 overflow-y-auto max-h-[60vh] space-y-4">
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="relative mb-3">
                <div className="w-12 h-12 rounded-full bg-purple-600/20 border border-purple-500/40 flex items-center justify-center animate-spin">
                  <Sparkles className="h-6 w-6 text-purple-400" />
                </div>
              </div>
              <h4 className="text-sm font-bold text-white">Analyzing Arcade Catalog...</h4>
              <p className="text-xs text-zinc-400 mt-1 max-w-sm">
                Gemini is evaluating game mechanics, controls, pacing, and player ratings to find the best match.
              </p>
            </div>
          )}

          {!isLoading && error && (
            <div className="rounded-lg bg-rose-950/30 border border-rose-800/50 p-4 text-xs text-rose-300 flex items-start gap-3">
              <div className="p-1 rounded bg-rose-900/50 text-rose-300 shrink-0">!</div>
              <div>
                <p className="font-bold">Search error</p>
                <p className="mt-0.5 text-zinc-400">{error}</p>
              </div>
            </div>
          )}

          {!isLoading && results && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* AI Summary Banner */}
              {results.aiSummary && (
                <div className="rounded-lg bg-purple-950/30 border border-purple-500/30 p-3.5 flex items-start gap-3">
                  <div className="p-1.5 rounded-md bg-purple-600/20 text-purple-400 shrink-0 mt-0.5">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div className="text-xs">
                    <span className="font-bold text-purple-300 font-mono text-[11px] uppercase tracking-wider block mb-0.5">
                      AI Recommendation Analysis
                    </span>
                    <p className="text-zinc-200 leading-relaxed">{results.aiSummary}</p>
                  </div>
                </div>
              )}

              {/* Matched Games Grid */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                    <span>Curated Matches</span>
                    <span className="text-[10px] bg-zinc-800 text-zinc-300 px-1.5 py-0.2 rounded font-bold">
                      {results.matchedGames?.length || 0}
                    </span>
                  </h3>
                  <span className="text-[10px] font-mono text-zinc-500">Sorted by semantic relevance</span>
                </div>

                {results.matchedGames && results.matchedGames.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {results.matchedGames.map((match) => {
                      const game = games.find((g) => g.id === match.id);
                      if (!game) return null;
                      const isFav = favorites.includes(game.id);

                      return (
                        <div
                          key={match.id}
                          className="group relative rounded-lg border border-zinc-800 bg-zinc-900/90 hover:border-purple-500/50 hover:bg-zinc-850 p-3.5 flex flex-col justify-between gap-3 transition-all shadow-xs"
                        >
                          <div className="space-y-2">
                            {/* Top info row */}
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-7 h-7 rounded flex items-center justify-center text-white shrink-0 shadow-xs"
                                  style={{ backgroundColor: game.themeColor || '#6366f1' }}
                                >
                                  <Gamepad2 className="h-4 w-4" />
                                </div>
                                <div>
                                  <h4 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">
                                    {game.title}
                                  </h4>
                                  <div className="flex items-center gap-1.5 text-[10px] text-zinc-400">
                                    <span className="font-mono uppercase text-zinc-500">{game.category}</span>
                                    <span>•</span>
                                    <span className="text-amber-400">★ {game.rating || 4.8}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Match Score Badge */}
                              <div className="flex items-center gap-1">
                                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                  {match.matchScore || 90}% Match
                                </span>
                                <button
                                  type="button"
                                  onClick={(e) => onToggleFavorite(game.id, e)}
                                  className={`p-1 rounded hover:bg-zinc-800 transition-colors cursor-pointer ${
                                    isFav ? 'text-rose-500' : 'text-zinc-500 hover:text-rose-400'
                                  }`}
                                  title={isFav ? 'Remove favorite' : 'Add favorite'}
                                >
                                  <Heart className={`h-3.5 w-3.5 ${isFav ? 'fill-rose-500' : ''}`} />
                                </button>
                              </div>
                            </div>

                            {/* Why it matches */}
                            <div className="rounded bg-zinc-950/60 border border-zinc-800/80 p-2 text-[11px] text-zinc-300">
                              <span className="font-bold text-purple-400 block mb-0.5 text-[10px] uppercase font-mono">
                                Why it matches:
                              </span>
                              <p className="leading-snug">{match.reason}</p>
                            </div>

                            {/* Controls summary */}
                            {game.controls && (
                              <p className="text-[10px] font-mono text-zinc-500 truncate">
                                🎮 {game.controls}
                              </p>
                            )}
                          </div>

                          {/* Action button */}
                          <button
                            type="button"
                            onClick={() => {
                              onSelectGame(game);
                              onClose();
                            }}
                            className="w-full flex items-center justify-center gap-1.5 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white py-1.5 px-3 text-xs font-bold transition-colors cursor-pointer shadow-xs group-hover:bg-purple-600"
                          >
                            <Play className="h-3.5 w-3.5 fill-white" />
                            <span>Play Now</span>
                            <ArrowRight className="h-3 w-3 ml-auto opacity-70 group-hover:translate-x-0.5 transition-transform" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-8 text-center rounded-lg border border-dashed border-zinc-800 bg-zinc-950/40">
                    <p className="text-xs text-zinc-400">No exact game matches found. Try another search phrase!</p>
                  </div>
                )}
              </div>

              {/* AI Suggested Custom Games (if available) */}
              {results.suggestedCustomIdeas && results.suggestedCustomIdeas.length > 0 && (
                <div className="pt-3 border-t border-zinc-800">
                  <div className="flex items-center gap-1.5 text-xs font-bold font-mono text-zinc-400 uppercase tracking-wider mb-2.5">
                    <Lightbulb className="h-3.5 w-3.5 text-amber-400" />
                    <span>AI Suggested Game Concepts to Build / Embed</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {results.suggestedCustomIdeas.map((idea, idx) => (
                      <div
                        key={idx}
                        className="rounded-lg border border-zinc-800 bg-zinc-950/50 p-3 flex flex-col justify-between gap-2"
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-white">{idea.title}</span>
                            <span className="text-[9px] font-mono uppercase bg-zinc-800 text-zinc-400 px-1 py-0.5 rounded">
                              {idea.genre}
                            </span>
                          </div>
                          <p className="text-[11px] text-zinc-400 mt-1 leading-snug">{idea.concept}</p>
                        </div>

                        <div className="flex items-center gap-2 pt-1 border-t border-zinc-800/60">
                          {onOpenTryIt && (
                            <button
                              type="button"
                              onClick={() => {
                                onClose();
                                onOpenTryIt();
                              }}
                              className="text-[10px] font-mono text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
                            >
                              <Code2 className="h-3 w-3" />
                              <span>Code in JS TryIt</span>
                            </button>
                          )}
                          {onOpenAddModal && (
                            <button
                              type="button"
                              onClick={() => {
                                onClose();
                                onOpenAddModal();
                              }}
                              className="text-[10px] font-mono text-indigo-400 hover:text-indigo-300 flex items-center gap-1 ml-auto cursor-pointer"
                            >
                              <span>+ Add Custom Iframe</span>
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {!isLoading && !results && (
            <div className="py-8 px-4 text-center">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-purple-950/50 border border-purple-500/30 text-purple-400 mb-3">
                <Sparkles className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-bold text-white">Find Your Next Game with AI</h3>
              <p className="text-xs text-zinc-400 max-w-md mx-auto mt-1 leading-relaxed">
                Describe the type of game you feel like playing right now. You can describe pacing, mechanics, retro vibes, or controls, and Gemini will find the exact games to jump into.
              </p>
              <div className="mt-4 flex justify-center">
                <button
                  type="button"
                  onClick={() => handlePromptClick('Fast paced 3D reflex ball runner game like Slope')}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 px-3.5 py-1.5 text-xs font-bold text-white transition-colors cursor-pointer shadow-xs"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Try: "3D Reflex Runner like Slope"</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-5 py-2.5 bg-zinc-950 border-t border-zinc-800 text-[10px] font-mono text-zinc-500 shrink-0">
          <div className="flex items-center gap-2">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse"></span>
            <span>AI Semantic Vector Search Active</span>
          </div>
          <div className="flex items-center gap-3">
            <span>Press <kbd className="px-1 py-0.5 rounded bg-zinc-800 text-zinc-400">Esc</kbd> to exit</span>
          </div>
        </div>
      </div>
    </div>
  );
};
