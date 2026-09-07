import React, { useState, useEffect, useMemo } from 'react';
import { DEFAULT_GAMES } from './data/defaultGames.js';
import { Navbar } from './components/Navbar.jsx';
import { CategoryFilterBar } from './components/CategoryFilter.jsx';
import { GameCard } from './components/GameCard.jsx';
import { GamePlayer } from './components/GamePlayer.jsx';
import { AddGameModal } from './components/AddGameModal.jsx';
import { JsonViewerModal } from './components/JsonViewerModal.jsx';
import { JsTryItEditorModal } from './components/JsTryItEditorModal.jsx';
import { PanicOverlay } from './components/PanicOverlay.jsx';
import {
  Flame,
  Search,
  FileCode,
  RotateCcw,
  Code2,
} from 'lucide-react';

export default function App() {
  const [games, setGames] = useState(DEFAULT_GAMES);
  const [activeGame, setActiveGame] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem('unblocked_favorites');
      return saved ? JSON.parse(saved) : ['snake', '2048', 'tetris'];
    } catch {
      return ['snake', '2048', 'tetris'];
    }
  });

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isJsonModalOpen, setIsJsonModalOpen] = useState(false);
  const [isTryItModalOpen, setIsTryItModalOpen] = useState(false);
  const [isPanicActive, setIsPanicActive] = useState(false);

  // Load from games.json on mount
  useEffect(() => {
    const fetchGamesJson = async () => {
      try {
        const base = import.meta.env.BASE_URL || './';
        const url = base.endsWith('/') ? `${base}games.json` : `${base}/games.json`;
        const response = await fetch(url);
        if (response.ok) {
          const jsonGames = await response.json();
          // Merge with any custom games saved in localStorage
          const savedCustom = localStorage.getItem('unblocked_custom_games');
          const customGames = savedCustom
            ? JSON.parse(savedCustom).filter((g) => g.id !== 'sandbox-game')
            : [];

          // Combine JSON games and user custom games
          const combined = [...jsonGames, ...customGames];
          setGames(combined);
          setActiveGame((current) => (current?.id === 'sandbox-game' ? null : current));
        }
      } catch (err) {
        console.warn('Using bundled default games list', err);
      }
    };
    fetchGamesJson();
  }, []);

  // Save favorites to localStorage
  const toggleFavorite = (id, e) => {
    if (e) e.stopPropagation();
    setFavorites((prev) => {
      const updated = prev.includes(id) ? prev.filter((favId) => favId !== id) : [...prev, id];
      try {
        localStorage.setItem('unblocked_favorites', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // Add custom game
  const handleAddGame = (newGame) => {
    setGames((prev) => {
      const updated = [newGame, ...prev];
      try {
        const customOnly = updated.filter((g) => g.isCustom);
        localStorage.setItem('unblocked_custom_games', JSON.stringify(customOnly));
      } catch {}
      return updated;
    });
    // Immediately open the newly added game
    setActiveGame(newGame);
  };

  // Reset custom games if requested
  const handleResetToDefaults = () => {
    try {
      localStorage.removeItem('unblocked_custom_games');
      setGames(DEFAULT_GAMES);
    } catch {}
  };

  // Filter games based on category and search query
  const filteredGames = useMemo(() => {
    return games.filter((game) => {
      // Category match
      if (selectedCategory === 'Favorites') {
        if (!favorites.includes(game.id)) return false;
      } else if (selectedCategory !== 'All') {
        if (game.category.toLowerCase() !== selectedCategory.toLowerCase()) return false;
      }

      // Search match
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = game.title.toLowerCase().includes(q);
        const matchesDesc = game.description.toLowerCase().includes(q);
        const matchesCat = game.category.toLowerCase().includes(q);
        const matchesSrc = game.iframe.src.toLowerCase().includes(q);
        return matchesTitle || matchesDesc || matchesCat || matchesSrc;
      }

      return true;
    });
  }, [games, selectedCategory, searchQuery, favorites]);

  // Category counts
  const gameCounts = useMemo(() => {
    return {
      All: games.length,
      Arcade: games.filter((g) => g.category === 'Arcade').length,
      Puzzle: games.filter((g) => g.category === 'Puzzle').length,
      Action: games.filter((g) => g.category === 'Action').length,
      Sports: games.filter((g) => g.category === 'Sports').length,
      Favorites: favorites.filter((id) => games.some((g) => g.id === id)).length,
    };
  }, [games, favorites]);

  return (
    <div className="h-screen w-full flex flex-col bg-zinc-950 text-zinc-300 font-sans overflow-hidden selection:bg-indigo-500 selection:text-white">
      {/* Panic Cloaking Screen */}
      <PanicOverlay
        isActive={isPanicActive}
        onDeactivate={() => setIsPanicActive(false)}
      />

      {/* Navigation Bar */}
      <Navbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onOpenJsonModal={() => setIsJsonModalOpen(true)}
        onOpenTryItModal={() => setIsTryItModalOpen(true)}
        onTriggerPanic={() => setIsPanicActive(true)}
        activeGameTitle={activeGame?.title}
        onBackToGrid={() => setActiveGame(null)}
      />

      {/* Main Container with High-Density Layout */}
      <main className="flex flex-1 overflow-hidden">
        {/* Desktop High-Density Sidebar */}
        <aside className="hidden md:flex w-48 lg:w-52 bg-zinc-900/50 border-r border-zinc-800 p-4 flex-col gap-6 shrink-0 overflow-y-auto">
          <div>
            <h3 className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em] mb-3">
              Categories
            </h3>
            <CategoryFilterBar
              variant="sidebar"
              currentCategory={selectedCategory}
              onSelectCategory={(cat) => {
                setSelectedCategory(cat);
                if (activeGame) setActiveGame(null);
              }}
              gameCounts={gameCounts}
            />
          </div>

          <div>
            <h3 className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em] mb-2.5">
              Server Status
            </h3>
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded p-3">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-[10px] font-bold text-emerald-400 uppercase font-mono">
                  Latency Optimal
                </span>
              </div>
              <div className="text-[9px] text-emerald-400/70 font-mono">Region: US-EAST-1 (9ms)</div>
            </div>
          </div>

          <div>
            <h3 className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em] mb-2.5">
              Arcade System
            </h3>
            <div className="bg-zinc-900 border border-zinc-800 rounded p-2.5 text-[10px] font-mono text-zinc-400 space-y-1.5">
              <div className="flex justify-between">
                <span>SANDBOX:</span>
                <span className="text-zinc-200 font-bold">ISOLATED</span>
              </div>
              <div className="flex justify-between">
                <span>DATABASE:</span>
                <span className="text-indigo-400 font-bold">games.json</span>
              </div>
              <div className="flex justify-between">
                <span>CATALOG:</span>
                <span className="text-zinc-200 font-bold">{games.length} TITLES</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em] mb-2.5">
              Dev Tools
            </h3>
            <button
              id="sidebar-tryit-btn"
              onClick={() => setIsTryItModalOpen(true)}
              className="w-full flex items-center justify-between rounded bg-zinc-900 border border-zinc-800 hover:border-emerald-500/50 hover:bg-zinc-850 p-2 text-xs transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-2">
                <Code2 className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-[11px] font-mono text-zinc-200 group-hover:text-white">JS TryIt</span>
              </div>
              <span className="text-[9px] font-mono bg-emerald-500/20 text-emerald-300 px-1 py-0.5 rounded font-bold">
                Run »
              </span>
            </button>
          </div>

          {games.some((g) => g.isCustom) && (
            <div className="pt-2 border-t border-zinc-800">
              <button
                onClick={handleResetToDefaults}
                className="w-full flex items-center justify-center gap-1.5 rounded bg-zinc-800/80 hover:bg-zinc-800 text-rose-400 hover:text-rose-300 py-1 px-2 text-[10px] font-mono transition-colors cursor-pointer border border-zinc-700/50"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Reset Custom</span>
              </button>
            </div>
          )}
        </aside>

        {/* Section Area */}
        <section className="flex-1 p-4 sm:p-6 overflow-y-auto flex flex-col gap-4">
          {activeGame ? (
            /* Active Game Iframe Stage */
            <div className="animate-in fade-in duration-150">
              <GamePlayer
                game={activeGame}
                isFavorite={favorites.includes(activeGame.id)}
                onToggleFavorite={toggleFavorite}
                onBack={() => setActiveGame(null)}
              />
            </div>
          ) : (
            /* Games Catalog View */
            <div className="flex flex-col gap-4">
              {/* Mobile Category Filters */}
              <div className="md:hidden">
                <CategoryFilterBar
                  variant="horizontal"
                  currentCategory={selectedCategory}
                  onSelectCategory={setSelectedCategory}
                  gameCounts={gameCounts}
                />
              </div>

              {/* High Density Status Header Bar */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-500"></span>
                    <span className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em] font-mono">
                      {selectedCategory === 'All' ? 'ALL UNBLOCKED GAMES' : `${selectedCategory.toUpperCase()} COLLECTION`}
                    </span>
                  </div>
                  <h1 className="text-sm sm:text-base font-bold text-white tracking-tight">
                    Fast-Loading Iframe Arcade Sandbox
                  </h1>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      const randomGame = games[Math.floor(Math.random() * games.length)];
                      if (randomGame) setActiveGame(randomGame);
                    }}
                    className="inline-flex items-center gap-1.5 rounded bg-indigo-600 hover:bg-indigo-500 px-3 py-1.5 text-xs font-bold text-white transition-colors cursor-pointer"
                  >
                    <Flame className="h-3.5 w-3.5" />
                    <span className="text-[11px] font-mono">Random Game</span>
                  </button>

                  <button
                    onClick={() => setIsJsonModalOpen(true)}
                    className="inline-flex items-center gap-1 rounded bg-zinc-800 hover:bg-zinc-750 text-zinc-300 border border-zinc-700 px-2.5 py-1.5 text-xs font-mono transition-colors cursor-pointer"
                  >
                    <FileCode className="h-3.5 w-3.5 text-indigo-400" />
                    <span className="text-[11px] font-mono">{games.length} in JSON</span>
                  </button>
                </div>
              </div>

              {/* Game Cards High-Density Grid */}
              {filteredGames.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3.5 content-start">
                  {filteredGames.map((game) => (
                    <GameCard
                      key={game.id}
                      game={game}
                      isFavorite={favorites.includes(game.id)}
                      onToggleFavorite={toggleFavorite}
                      onSelectGame={setActiveGame}
                    />
                  ))}
                </div>
              ) : (
                /* Empty state */
                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-zinc-800 bg-zinc-900/50 p-12 text-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded bg-zinc-800 text-zinc-400 mb-3">
                    <Search className="h-5 w-5" />
                  </div>
                  <h3 className="font-bold text-sm text-white">No games found</h3>
                  <p className="mt-1 text-xs text-zinc-400 max-w-sm">
                    {searchQuery
                      ? `No games matched "${searchQuery}". Try searching for another title or clear the filter.`
                      : 'You do not have any favorite games saved yet. Click the heart icon on any game card to add it!'}
                  </p>
                  <div className="mt-4 flex gap-2">
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="rounded bg-zinc-800 border border-zinc-700 px-3 py-1.5 text-xs font-mono text-white hover:bg-zinc-750 cursor-pointer"
                      >
                        Clear Search
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setSelectedCategory('All');
                        setSearchQuery('');
                      }}
                      className="rounded bg-indigo-600 px-3 py-1.5 text-xs font-mono font-bold text-white hover:bg-indigo-500 cursor-pointer"
                    >
                      View All Games
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      </main>

      {/* Modals */}
      <AddGameModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddGame={handleAddGame}
      />

      <JsonViewerModal
        isOpen={isJsonModalOpen}
        onClose={() => setIsJsonModalOpen(false)}
        games={games}
      />

      <JsTryItEditorModal
        isOpen={isTryItModalOpen}
        onClose={() => setIsTryItModalOpen(false)}
      />

      {/* High-Density Ticker Footer */}
      <footer className="flex flex-wrap items-center justify-between px-6 py-2 bg-zinc-900 border-t border-zinc-800 text-[10px] text-zinc-500 uppercase tracking-widest shrink-0 select-none">
        <div className="flex items-center gap-6">
          <span>Users Online: <span className="text-indigo-400 font-mono font-bold">12,402</span></span>
          <span>Active Games: <span className="text-indigo-400 font-mono font-bold">{games.length}</span></span>
          <span className="hidden sm:inline">Iframe Runtime: <span className="text-emerald-400 font-mono font-bold">Healthy</span></span>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsTryItModalOpen(true)}
            className="text-emerald-400 hover:text-emerald-300 transition-colors font-mono font-bold cursor-pointer flex items-center gap-1"
          >
            <span>&lt;/&gt; JS TryIt Editor</span>
          </button>
          <button
            onClick={() => setIsJsonModalOpen(true)}
            className="text-indigo-400 hover:text-indigo-300 transition-colors font-mono cursor-pointer"
          >
            games.json
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
          >
            + Custom Game
          </button>
        </div>
      </footer>
    </div>
  );
}
