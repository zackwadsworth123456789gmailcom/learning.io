import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Globe,
  Gamepad2,
  Shield,
  ExternalLink,
  X,
  RotateCw,
  Check,
  FileText,
  Folder,
  Layers,
  Sparkles,
  ArrowRight,
  Eye,
  Zap,
} from 'lucide-react';

const GOOGLE_APPS = [
  { name: 'Classroom', url: 'https://classroom.google.com', icon: '🏫', color: '#10b981' },
  { name: 'Drive', url: 'https://drive.google.com', icon: '📁', color: '#3b82f6' },
  { name: 'Docs', url: 'https://docs.google.com', icon: '📄', color: '#2563eb' },
  { name: 'Slides', url: 'https://slides.google.com', icon: '📊', color: '#f59e0b' },
  { name: 'Sheets', url: 'https://sheets.google.com', icon: '📈', color: '#10b981' },
  { name: 'Translate', url: 'https://translate.google.com', icon: '🌐', color: '#6366f1' },
  { name: 'Maps', url: 'https://maps.google.com', icon: '🗺️', color: '#ef4444' },
  { name: 'Earth', url: 'https://earth.google.com', icon: '🌍', color: '#06b6d4' },
  { name: 'Scholar', url: 'https://scholar.google.com', icon: '🎓', color: '#8b5cf6' },
];

const GOOGLE_EASTER_EGGS = [
  {
    id: 'dino',
    title: 'Chrome Dino Runner',
    desc: 'The iconic offline dinosaur hurdle runner built into Chrome when your internet drops.',
    type: 'internal_game',
    gameId: 'runner',
    tag: 'Built-in Game',
    color: '#3b82f6',
  },
  {
    id: 'snake',
    title: 'Google Snake Game',
    desc: 'Slither through the grid and collect apples in the classic Google search doodle.',
    type: 'internal_game',
    gameId: 'snake',
    tag: 'Built-in Game',
    color: '#10b981',
  },
  {
    id: 'breakout',
    title: 'Google Atari Breakout',
    desc: 'The legendary Google image search Easter egg turning results into playable bricks.',
    type: 'internal_game',
    gameId: 'breakout',
    tag: 'Built-in Game',
    color: '#f43f5e',
  },
  {
    id: 'barrel-roll',
    title: 'Do a Barrel Roll',
    desc: 'Triggers the famous Google search Easter egg that spins the entire screen 360 degrees.',
    type: 'action',
    action: 'barrel_roll',
    tag: 'Screen Effect',
    color: '#a855f7',
  },
  {
    id: 'gravity',
    title: 'Google Gravity (Mr. Doob)',
    desc: 'Watch the entire Google home page collapse to the bottom under gravitational physics.',
    type: 'external',
    url: 'https://elgoog.im/gravity/',
    tag: 'External Doodle',
    color: '#eab308',
  },
  {
    id: 'pacman',
    title: 'Google Pac-Man 30th Doodle',
    desc: 'The full playable Pac-Man arcade game built directly into the Google logo doodle.',
    type: 'external',
    url: 'https://www.google.com/logos/2010/pacman10-i.html',
    tag: 'Interactive Doodle',
    color: '#f59e0b',
  },
];

const CLOAK_PRESETS = [
  {
    id: 'google',
    name: 'Google Search',
    title: 'Google',
    iconUrl: 'https://www.google.com/favicon.ico',
    description: 'Disguises your tab as standard Google Search homepage',
  },
  {
    id: 'classroom',
    name: 'Google Classroom',
    title: 'Classes',
    iconUrl: 'https://ssl.gstatic.com/classroom/favicon.png',
    description: 'Disguises your tab as Google Classroom assignments list',
  },
  {
    id: 'docs',
    name: 'Google Docs',
    title: 'World History Notes - Google Docs',
    iconUrl: 'https://ssl.gstatic.com/docs/documents/images/kix-favicon7.ico',
    description: 'Disguises your tab as an active history document in Google Docs',
  },
  {
    id: 'drive',
    name: 'Google Drive',
    title: 'My Drive - Google Drive',
    iconUrl: 'https://ssl.gstatic.com/images/branding/product/1x/drive_2020q4_32dp.png',
    description: 'Disguises your tab as your school Google Drive folder',
  },
];

export const GoogleHubModal = ({
  isOpen,
  onClose,
  onLaunchGame,
  onTriggerPanic,
}) => {
  const [activeTab, setActiveTab] = useState('search'); // 'search' | 'games' | 'cloak' | 'apps'
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [searchMode, setSearchMode] = useState('web'); // 'web' | 'images' | 'videos' | 'scholar'
  const [activeCloak, setActiveCloak] = useState(() => {
    return localStorage.getItem('unblocked_tab_cloak') || 'none';
  });
  const [isRolling, setIsRolling] = useState(false);
  const inputRef = useRef(null);

  // Auto-focus input when search tab opens
  useEffect(() => {
    if (isOpen && activeTab === 'search') {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, activeTab]);

  // Handle ESC
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Fetch Google autocomplete suggestions
  useEffect(() => {
    if (!query.trim() || activeTab !== 'search') {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/google/suggest?q=${encodeURIComponent(query.trim())}`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.suggestions)) {
            setSuggestions(data.suggestions);
          }
        }
      } catch {
        // Silent fallback
      }
    }, 180);

    return () => clearTimeout(timer);
  }, [query, activeTab]);

  // Execute Google search
  const handleSearch = (searchQuery) => {
    const q = (searchQuery || query).trim();
    if (!q) return;

    let targetUrl = `https://www.google.com/search?q=${encodeURIComponent(q)}`;
    if (searchMode === 'images') {
      targetUrl = `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(q)}`;
    } else if (searchMode === 'videos') {
      targetUrl = `https://www.google.com/search?tbm=vid&q=${encodeURIComponent(q)}`;
    } else if (searchMode === 'scholar') {
      targetUrl = `https://scholar.google.com/scholar?q=${encodeURIComponent(q)}`;
    }

    window.open(targetUrl, '_blank', 'noopener,noreferrer');
  };

  const handleFeelingLucky = () => {
    const q = query.trim();
    if (!q) {
      // If empty query, launch a random arcade game
      onLaunchGame('runner');
      onClose();
      return;
    }
    window.open(`https://www.google.com/search?btnI=1&q=${encodeURIComponent(q)}`, '_blank');
  };

  // Perform "Do a Barrel Roll"
  const handleBarrelRoll = () => {
    setIsRolling(true);
    document.body.classList.add('google-barrel-roll');
    setTimeout(() => {
      document.body.classList.remove('google-barrel-roll');
      setIsRolling(false);
    }, 2000);
  };

  // Apply tab cloak
  const handleApplyCloak = (preset) => {
    if (preset === 'reset') {
      document.title = 'Unblocked Games - Web Arcade';
      let link = document.querySelector("link[rel~='icon']");
      if (link) link.href = '/vite.svg';
      setActiveCloak('none');
      localStorage.removeItem('unblocked_tab_cloak');
      return;
    }

    document.title = preset.title;
    let link = document.querySelector("link[rel~='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.getElementsByTagName('head')[0].appendChild(link);
    }
    link.href = preset.iconUrl;

    setActiveCloak(preset.id);
    localStorage.setItem('unblocked_tab_cloak', preset.id);
  };

  if (!isOpen) return null;

  return (
    <div
      id="google-hub-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xs p-3 sm:p-6 overflow-hidden"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="google-hub-modal-container"
        className="relative w-full max-w-2xl h-[85vh] max-h-[660px] bg-zinc-900 border border-zinc-700/80 rounded-2xl shadow-2xl shadow-black/80 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-800 bg-zinc-900/90 shrink-0">
          <div className="flex items-center gap-3">
            {/* Google Colorful "G" */}
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-800 border border-zinc-700 shadow-inner">
              <span className="text-base font-bold select-none">
                <span className="text-[#4285F4]">G</span>
                <span className="text-[#EA4335]">o</span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white tracking-tight">Google Hub</span>
                <span className="text-[10px] font-mono bg-blue-500/20 text-blue-300 border border-blue-500/30 px-1.5 py-0.5 rounded font-bold">
                  Search & Cloak
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">
                Google Search, Easter Eggs, Tab Cloaking & Workspace Apps
              </p>
            </div>
          </div>

          <button
            id="close-google-hub-btn"
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors cursor-pointer"
            title="Close (Esc)"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Feature Tabs */}
        <div className="flex items-center px-4 border-b border-zinc-800 bg-zinc-950/60 shrink-0 overflow-x-auto gap-1">
          <button
            onClick={() => setActiveTab('search')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'search'
                ? 'border-[#4285F4] text-[#4285F4]'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Search className="h-3.5 w-3.5" />
            <span>Google Search</span>
          </button>

          <button
            onClick={() => setActiveTab('games')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'games'
                ? 'border-[#34A853] text-[#34A853]'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Gamepad2 className="h-3.5 w-3.5" />
            <span>Google Easter Eggs</span>
          </button>

          <button
            onClick={() => setActiveTab('cloak')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'cloak'
                ? 'border-[#FBBC05] text-[#FBBC05]'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Shield className="h-3.5 w-3.5" />
            <span>Tab Cloak & Stealth</span>
            {activeCloak !== 'none' && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('apps')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'apps'
                ? 'border-[#EA4335] text-[#EA4335]'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Workspace Apps</span>
          </button>
        </div>

        {/* Tab Content Container */}
        <div className="flex-1 overflow-y-auto p-5 bg-zinc-950/40">
          {/* TAB 1: GOOGLE SEARCH */}
          {activeTab === 'search' && (
            <div className="flex flex-col items-center justify-center min-h-[380px] max-w-lg mx-auto text-center">
              {/* Google Classic Multi-Colored Display Logo */}
              <div className="mb-6 select-none flex items-center justify-center text-4xl sm:text-5xl font-extrabold tracking-tight">
                <span className="text-[#4285F4]">G</span>
                <span className="text-[#EA4335]">o</span>
                <span className="text-[#FBBC05]">o</span>
                <span className="text-[#4285F4]">g</span>
                <span className="text-[#34A853]">l</span>
                <span className="text-[#EA4335]">e</span>
              </div>

              {/* Search Type Filter Pills */}
              <div className="flex items-center gap-1.5 mb-3 bg-zinc-900/80 p-1 rounded-full border border-zinc-800 text-[11px]">
                {['web', 'images', 'videos', 'scholar'].map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setSearchMode(mode)}
                    className={`px-3 py-1 rounded-full font-medium capitalize transition-all cursor-pointer ${
                      searchMode === mode
                        ? 'bg-zinc-800 text-white shadow-xs'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>

              {/* Search Bar with live suggestions */}
              <div className="relative w-full mb-4">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSearch();
                  }}
                  className="relative flex items-center"
                >
                  <Search className="absolute left-4 h-4 w-4 text-zinc-400 select-none pointer-events-none" />
                  <input
                    ref={inputRef}
                    id="google-hub-search-input"
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search Google or enter URL..."
                    className="w-full rounded-full bg-zinc-900 border border-zinc-700 hover:border-zinc-600 focus:border-[#4285F4] pl-11 pr-10 py-3 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-[#4285F4] shadow-inner transition-all"
                  />
                  {query && (
                    <button
                      type="button"
                      onClick={() => setQuery('')}
                      className="absolute right-4 text-zinc-400 hover:text-white cursor-pointer"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </form>

                {/* Autocomplete Dropdown */}
                {suggestions.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl overflow-hidden z-20 text-left divide-y divide-zinc-800">
                    {suggestions.map((s, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setQuery(s);
                          handleSearch(s);
                        }}
                        className="w-full px-4 py-2 text-xs text-zinc-200 hover:bg-zinc-800 hover:text-white flex items-center gap-2.5 transition-colors cursor-pointer"
                      >
                        <Search className="h-3 w-3 text-zinc-500 shrink-0" />
                        <span className="truncate">{s}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 mb-6">
                <button
                  type="button"
                  onClick={() => handleSearch()}
                  className="rounded-md bg-zinc-800 hover:bg-zinc-750 border border-zinc-700 hover:border-zinc-600 px-4 py-2 text-xs font-semibold text-zinc-200 transition-all cursor-pointer shadow-xs"
                >
                  Google Search
                </button>
                <button
                  type="button"
                  onClick={handleFeelingLucky}
                  className="rounded-md bg-zinc-800 hover:bg-zinc-750 border border-zinc-700 hover:border-zinc-600 px-4 py-2 text-xs font-semibold text-zinc-200 transition-all cursor-pointer shadow-xs"
                >
                  I'm Feeling Lucky
                </button>
              </div>

              {/* Quick trending searches / unblocked topics */}
              <div className="w-full text-left pt-4 border-t border-zinc-800">
                <div className="text-[11px] font-mono text-zinc-400 mb-2 flex items-center gap-1.5">
                  <Sparkles className="h-3 w-3 text-[#FBBC05]" />
                  <span>Popular School Searches:</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'unblocked games',
                    'slope unblocked',
                    '2048 unblocked',
                    'google dino runner',
                    'scientific calculator',
                    'periodic table',
                  ].map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setQuery(item);
                        handleSearch(item);
                      }}
                      className="text-[11px] rounded bg-zinc-850 hover:bg-zinc-800 border border-zinc-750 px-2.5 py-1 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: GOOGLE EASTER EGGS & GAMES */}
          {activeTab === 'games' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Google Games & Easter Eggs</h3>
                  <p className="text-xs text-zinc-400">
                    Play authentic Google easter eggs, classic doodles, and screen effects
                  </p>
                </div>
                <button
                  onClick={handleBarrelRoll}
                  disabled={isRolling}
                  className="flex items-center gap-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white px-3 py-1.5 text-xs font-bold transition-all shadow-xs cursor-pointer"
                  title="Spin the screen 360 degrees"
                >
                  <RotateCw className={`h-3.5 w-3.5 ${isRolling ? 'animate-spin' : ''}`} />
                  <span>Do a Barrel Roll!</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {GOOGLE_EASTER_EGGS.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 flex flex-col justify-between transition-all"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold text-white flex items-center gap-1.5">
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: item.color }}
                          ></span>
                          {item.title}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                          {item.tag}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400 leading-relaxed mb-3">{item.desc}</p>
                    </div>

                    <div>
                      {item.type === 'internal_game' && (
                        <button
                          type="button"
                          onClick={() => {
                            onLaunchGame(item.gameId);
                            onClose();
                          }}
                          className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white py-1.5 text-xs font-bold transition-colors cursor-pointer"
                        >
                          <Gamepad2 className="h-3.5 w-3.5" />
                          <span>Play Game Now</span>
                        </button>
                      )}

                      {item.type === 'action' && item.action === 'barrel_roll' && (
                        <button
                          type="button"
                          onClick={handleBarrelRoll}
                          disabled={isRolling}
                          className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white py-1.5 text-xs font-bold transition-colors cursor-pointer"
                        >
                          <RotateCw className={`h-3.5 w-3.5 ${isRolling ? 'animate-spin' : ''}`} />
                          <span>Spin Screen 360°</span>
                        </button>
                      )}

                      {item.type === 'external' && (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white py-1.5 text-xs font-bold transition-colors"
                        >
                          <span>Launch Doodle</span>
                          <ExternalLink className="h-3 w-3 text-zinc-400" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: TAB CLOAK & STEALTH */}
          {activeTab === 'cloak' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-white">Google Tab Cloak & Disguise</h3>
                <p className="text-xs text-zinc-400">
                  Instantly disguise your browser tab's title and favicon as Google Search or Classroom
                </p>
              </div>

              {/* Panic Key Banner */}
              <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/40 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                    <Shield className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-amber-200">Instant Google Stealth Panic</div>
                    <div className="text-[11px] text-amber-300/80">
                      Press <kbd className="font-mono bg-zinc-900 border border-zinc-700 px-1 py-0.5 rounded text-white text-[10px]">\`</kbd> or click button to trigger instant Google Docs disguise
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onTriggerPanic();
                    onClose();
                  }}
                  className="rounded-lg bg-amber-600 hover:bg-amber-500 px-3 py-1.5 text-xs font-bold text-white transition-colors cursor-pointer shrink-0"
                >
                  Activate Panic
                </button>
              </div>

              {/* Preset Cloaks List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {CLOAK_PRESETS.map((preset) => {
                  const isCurrent = activeCloak === preset.id;
                  return (
                    <div
                      key={preset.id}
                      className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between ${
                        isCurrent
                          ? 'bg-blue-950/30 border-blue-500/60 ring-1 ring-blue-500/40'
                          : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <img
                              src={preset.iconUrl}
                              alt={preset.name}
                              className="w-4 h-4 object-contain"
                              referrerPolicy="no-referrer"
                            />
                            <span className="text-xs font-bold text-white">{preset.name}</span>
                          </div>
                          {isCurrent && (
                            <span className="text-[10px] font-mono text-emerald-400 font-bold flex items-center gap-0.5">
                              <Check className="h-3 w-3" /> Active
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-zinc-400 mb-1">
                          <strong className="text-zinc-300">Tab Title:</strong> "{preset.title}"
                        </p>
                        <p className="text-xs text-zinc-500 mb-3">{preset.description}</p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleApplyCloak(preset)}
                        className={`w-full py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          isCurrent
                            ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-750'
                            : 'bg-blue-600 hover:bg-blue-500 text-white'
                        }`}
                      >
                        {isCurrent ? 'Cloak is Active' : 'Disguise Tab as ' + preset.name}
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Reset Tab Cloak Button */}
              {activeCloak !== 'none' && (
                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={() => handleApplyCloak('reset')}
                    className="text-xs text-zinc-400 hover:text-white underline cursor-pointer"
                  >
                    Reset Tab Title & Favicon back to Unblocked Games
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: GOOGLE WORKSPACE APPS */}
          {activeTab === 'apps' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-white">Google Workspace Shortcuts</h3>
                <p className="text-xs text-zinc-400">
                  Quickly jump to official Google educational and productivity applications
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {GOOGLE_APPS.map((app) => (
                  <a
                    key={app.name}
                    href={app.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-850 flex items-center gap-3 transition-all group"
                  >
                    <span className="text-2xl select-none group-hover:scale-110 transition-transform">
                      {app.icon}
                    </span>
                    <div className="overflow-hidden">
                      <div className="text-xs font-bold text-white truncate flex items-center gap-1">
                        <span>{app.name}</span>
                        <ExternalLink className="h-2.5 w-2.5 text-zinc-500 group-hover:text-zinc-300" />
                      </div>
                      <div className="text-[10px] font-mono text-zinc-400 truncate">
                        google.com
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Global Footer */}
        <div className="px-5 py-2.5 border-t border-zinc-800 bg-zinc-950 flex items-center justify-between text-[11px] font-mono text-zinc-400 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-[#4285F4]">G</span>
            <span className="text-[#EA4335]">o</span>
            <span className="text-[#FBBC05]">o</span>
            <span className="text-[#4285F4]">g</span>
            <span className="text-[#34A853]">l</span>
            <span className="text-[#EA4335]">e</span>
            <span>Suite Integration</span>
          </div>
          <span>Press Esc to close</span>
        </div>
      </div>
    </div>
  );
};
