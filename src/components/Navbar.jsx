import React from 'react';
import { Gamepad2, Plus, FileCode, ShieldAlert, X, Code2, Sparkles } from 'lucide-react';

export const Navbar = ({
  searchQuery,
  onSearchChange,
  onOpenAddModal,
  onOpenJsonModal,
  onOpenTryItModal,
  onOpenAiSearchModal,
  onToggleAmongUs,
  isAmongUsActive,
  onTriggerPanic,
  activeGameTitle,
  onBackToGrid,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800 bg-zinc-900 shrink-0">
      <div className="flex h-12 items-center justify-between gap-4 px-4 sm:px-6">
        {/* Brand / Logo */}
        <div className="flex items-center gap-6">
          <button
            id="brand-home-btn"
            onClick={onBackToGrid}
            className="flex items-center gap-2.5 text-left transition-opacity hover:opacity-90 cursor-pointer"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded bg-indigo-600 text-white shadow-sm">
              <Gamepad2 className="h-4 w-4 text-white" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base sm:text-lg font-black tracking-tighter text-indigo-500">
                ARCADE.IO
              </span>
              <span className="hidden sm:inline-block text-[10px] font-mono uppercase tracking-widest text-zinc-500">
                UNBLOCKED
              </span>
            </div>
          </button>

          {activeGameTitle && (
            <div className="hidden md:flex items-center gap-2 pl-4 border-l border-zinc-800 text-xs text-zinc-400">
              <span className="text-zinc-500 uppercase tracking-wider text-[10px]">Playing:</span>
              <span className="font-bold text-white truncate max-w-xs">{activeGameTitle}</span>
            </div>
          )}
        </div>

        {/* Search bar */}
        <div className="flex-1 max-w-md hidden md:block">
          <div className="relative flex items-center">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-xs font-mono select-none">
              /
            </span>
            <input
              id="game-search-input"
              type="text"
              placeholder="Search games, tags, or categories..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full rounded bg-zinc-800 border border-zinc-700 pl-8 pr-16 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 transition-colors focus:border-indigo-500 focus:outline-none"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {searchQuery ? (
                <button
                  onClick={() => onSearchChange('')}
                  className="text-zinc-400 hover:text-zinc-200 p-0.5 cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onOpenAiSearchModal}
                  className="flex items-center gap-1 text-[10px] font-mono text-purple-400 bg-purple-950/60 border border-purple-500/40 hover:bg-purple-900/60 px-1.5 py-0.5 rounded cursor-pointer"
                  title="Ask AI to solve any question (no code)"
                >
                  <Sparkles className="h-2.5 w-2.5" />
                  <span>Ask AI</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Action controls */}
        <div className="flex items-center gap-2">
          {/* Ask AI Tab - placed right by JS TryIt */}
          <button
            id="open-ai-search-btn"
            onClick={onOpenAiSearchModal}
            className="inline-flex items-center gap-1.5 rounded bg-purple-950/60 border border-purple-500/50 hover:bg-purple-900/70 hover:border-purple-400 px-2.5 py-1 text-xs font-bold text-purple-300 transition-colors shadow-xs cursor-pointer group"
            title="Ask AI to solve questions step-by-step without code"
          >
            <Sparkles className="h-3.5 w-3.5 text-purple-400 group-hover:animate-pulse" />
            <span className="text-[11px] font-mono">Ask AI</span>
          </button>

          {/* JS TryIt Tab */}
          <button
            id="open-tryit-editor-btn"
            onClick={onOpenTryItModal}
            className="inline-flex items-center gap-1.5 rounded bg-emerald-950/50 border border-emerald-500/50 hover:bg-emerald-900/60 px-2.5 py-1 text-xs font-bold text-emerald-300 transition-colors shadow-xs cursor-pointer"
            title="Open W3Schools-style JavaScript TryIt Editor"
          >
            <Code2 className="h-3.5 w-3.5 text-emerald-400" />
            <span className="text-[11px] font-mono">JS TryIt</span>
          </button>

          <button
            id="view-json-btn"
            onClick={onOpenJsonModal}
            className="hidden sm:inline-flex items-center gap-1.5 rounded bg-zinc-800 border border-zinc-700 px-2.5 py-1 text-xs font-semibold text-zinc-300 hover:bg-zinc-750 hover:text-white transition-colors cursor-pointer"
            title="Inspect games.json iframe dataset"
          >
            <FileCode className="h-3.5 w-3.5 text-indigo-400" />
            <span className="text-[11px] font-mono">games.json</span>
          </button>

          {/* Moving Among Us Button */}
          <button
            id="toggle-amongus-nav-btn"
            onClick={onToggleAmongUs}
            className={`inline-flex items-center gap-1.5 rounded border px-2.5 py-1 text-xs font-bold transition-all shadow-xs cursor-pointer ${
              isAmongUsActive
                ? 'bg-red-600 border-red-500 text-white shadow-red-950/50'
                : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-750 hover:text-white'
            }`}
            title="Toggle moving Among Us crewmates at bottom of screen"
          >
            <span className="text-xs">ඞ</span>
            <span className="hidden sm:inline text-[11px] font-mono">Among Us</span>
            {isAmongUsActive && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            )}
          </button>

          <button
            id="add-custom-game-btn"
            onClick={onOpenAddModal}
            className="inline-flex items-center gap-1 rounded bg-indigo-600 hover:bg-indigo-500 px-2.5 py-1 text-xs font-bold text-white transition-colors shadow-xs cursor-pointer"
            title="Add a custom iframe game"
          >
            <Plus className="h-3.5 w-3.5" />
            <span className="hidden sm:inline text-[11px]">Add Game</span>
          </button>

          <button
            id="panic-button"
            onClick={onTriggerPanic}
            className="inline-flex items-center gap-1 rounded border border-rose-900/60 bg-rose-950/40 px-2 py-1 text-xs font-medium text-rose-300 hover:bg-rose-900/50 hover:text-rose-100 transition-colors cursor-pointer"
            title="Stealth panic button"
          >
            <ShieldAlert className="h-3.5 w-3.5 text-rose-400" />
            <span className="hidden lg:inline text-[11px]">Panic</span>
          </button>

          <div
            className="w-7 h-7 rounded bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[10px] font-black text-indigo-400 select-none ml-1"
            title="Local Gamer Session"
          >
            IO
          </div>
        </div>
      </div>

      {/* Mobile search bar */}
      <div className="md:hidden border-t border-zinc-800 px-4 py-2 bg-zinc-900">
        <div className="relative flex items-center">
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500 text-xs font-mono">/</span>
          <input
            id="mobile-search-input"
            type="text"
            placeholder="Search games..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full rounded bg-zinc-800 border border-zinc-700 pl-7 pr-16 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:border-indigo-500 focus:outline-none"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {searchQuery ? (
              <button
                onClick={() => onSearchChange('')}
                className="text-zinc-400 p-0.5 cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={onOpenAiSearchModal}
                className="flex items-center gap-1 text-[10px] font-mono text-purple-400 bg-purple-950/60 border border-purple-500/40 px-1.5 py-0.5 rounded cursor-pointer"
              >
                <Sparkles className="h-2.5 w-2.5" />
                <span>AI</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
