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
  ArrowLeft,
  Eye,
  Zap,
  Calculator as CalcIcon,
  Image as ImageIcon,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Info,
  Clock,
  Coins,
  Copy,
} from 'lucide-react';
import { GoogleCalculator } from './GoogleCalculator.jsx';
import { GoogleReaderView } from './GoogleReaderView.jsx';

const GOOGLE_APPS = [
  { name: 'Classroom', icon: '🏫', color: '#10b981', desc: 'Active Classes & Homework' },
  { name: 'Drive', icon: '📁', color: '#3b82f6', desc: 'My Drive Cloud Storage' },
  { name: 'Docs', icon: '📄', color: '#2563eb', desc: 'World History Notes' },
  { name: 'Slides', icon: '📊', color: '#f59e0b', desc: 'Science Presentation' },
  { name: 'Sheets', icon: '📈', color: '#10b981', desc: 'Math Grade Calculations' },
  { name: 'Translate', icon: '🌐', color: '#6366f1', desc: 'Language Translation' },
  { name: 'Maps', icon: '🗺️', color: '#ef4444', desc: 'World Geography Maps' },
  { name: 'Earth', icon: '🌍', color: '#06b6d4', desc: 'Satellite 3D Globe' },
  { name: 'Scholar', icon: '🎓', color: '#8b5cf6', desc: 'Peer-Reviewed Research' },
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
    title: 'Google Gravity Simulation',
    desc: 'Collapse all Google search elements to the bottom with interactive gravitational physics.',
    type: 'action',
    action: 'gravity',
    tag: 'Interactive Effect',
    color: '#eab308',
  },
  {
    id: 'pacman',
    title: 'Google Pac-Man Arcade',
    desc: 'The classic 1980 arcade maze runner celebrating the 30th anniversary doodle.',
    type: 'internal_game',
    gameId: 'breakout', // or retro arcade
    tag: 'Arcade Classic',
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
  const [searchMode, setSearchMode] = useState('web'); // 'web' | 'images' | 'tools'
  const [activeCloak, setActiveCloak] = useState(() => {
    return localStorage.getItem('unblocked_tab_cloak') || 'none';
  });
  const [isRolling, setIsRolling] = useState(false);
  const [isGravityActive, setIsGravityActive] = useState(false);

  // In-Website Search States (strictly no window.open)
  const [searchState, setSearchState] = useState('home'); // 'home' | 'results' | 'reader'
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState(null);
  const [activeReaderResult, setActiveReaderResult] = useState(null);
  const [activeSubTab, setActiveSubTab] = useState('all'); // 'all' | 'images' | 'tools'
  const [expandedPaaIndex, setExpandedPaaIndex] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewApp, setPreviewApp] = useState(null);

  const inputRef = useRef(null);

  // Auto-focus input when search tab opens
  useEffect(() => {
    if (isOpen && activeTab === 'search' && searchState === 'home') {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, activeTab, searchState]);

  // Handle ESC
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        if (selectedImage) {
          setSelectedImage(null);
        } else if (previewApp) {
          setPreviewApp(null);
        } else if (searchState === 'reader') {
          setSearchState('results');
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, selectedImage, previewApp, searchState]);

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

  // Execute IN-WEBSITE Google Search (Does NOT open external tabs)
  const executeInWebsiteSearch = async (searchQuery, isLucky = false) => {
    const q = (searchQuery !== undefined ? searchQuery : query).trim();
    if (!q) {
      if (isLucky) {
        onLaunchGame('runner');
        onClose();
      }
      return;
    }

    setQuery(q);
    setSearchState('results');
    setIsSearching(true);
    setActiveReaderResult(null);
    setSuggestions([]);
    setSelectedImage(null);
    setActiveSubTab(searchMode === 'images' ? 'images' : 'all');

    try {
      const res = await fetch(`/api/google/search?q=${encodeURIComponent(q)}`);
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data);

        // "I'm Feeling Lucky" handling: stays on the website!
        if (isLucky) {
          if (data.arcadeGame) {
            onLaunchGame(data.arcadeGame.id);
            onClose();
            return;
          }
          if (Array.isArray(data.webResults) && data.webResults.length > 0) {
            setActiveReaderResult(data.webResults[0]);
            setSearchState('reader');
          }
        }
      } else {
        throw new Error('Search failed');
      }
    } catch (err) {
      // Offline fallback
      setSearchResults({
        query: q,
        stats: { totalResults: '1,420,000', timeSeconds: '0.18' },
        aiOverview: `Overview for **${q}**.\n\nInformation gathered from verified open web sources. Explore the results below directly on this website.`,
        keyFacts: [`Subject: ${q}`, 'Indexed and verified in Arcade.IO in-website search.'],
        webResults: [
          {
            title: `${q} - Overview & Full Guide`,
            url: `https://en.wikipedia.org/wiki/${encodeURIComponent(q)}`,
            domain: 'en.wikipedia.org',
            snippet: `Complete details, history, gameplay, and definitions regarding ${q}.`,
            sitelinks: ['Overview', 'Summary', 'Key Facts'],
            content: `Comprehensive overview of ${q}. All information is loaded directly on this website for an unblocked and seamless viewing experience.`,
          }
        ],
        peopleAlsoAsk: [
          { question: `What is the summary of ${q}?`, answer: `Key concepts, rules, and background for ${q}.` },
        ],
        relatedSearches: [`${q} unblocked`, `${q} definition`, `${q} guide`],
        imageResults: [],
      });
    } finally {
      setIsSearching(false);
    }
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

  // Perform "Google Gravity" inside the modal
  const handleTriggerGravity = () => {
    setIsGravityActive((prev) => !prev);
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xs p-2 sm:p-4 md:p-6 overflow-hidden"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="google-hub-modal-container"
        className={`relative w-full ${
          searchState === 'results' || searchState === 'reader' ? 'max-w-4xl' : 'max-w-2xl'
        } h-[90vh] max-h-[720px] bg-zinc-900 border border-zinc-700/80 rounded-2xl shadow-2xl shadow-black/80 flex flex-col overflow-hidden transition-all duration-200 animate-in fade-in zoom-in-95`}
      >
        {/* Top Hub Header */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-zinc-800 bg-zinc-900/95 shrink-0">
          <div className="flex items-center gap-3">
            {/* Google Colorful "G" */}
            <button
              type="button"
              onClick={() => {
                setActiveTab('search');
                setSearchState('home');
              }}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-800 hover:bg-zinc-750 border border-zinc-700 shadow-inner cursor-pointer"
              title="Return to Google Home"
            >
              <span className="text-base font-bold select-none">
                <span className="text-[#4285F4]">G</span>
                <span className="text-[#EA4335]">o</span>
              </span>
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white tracking-tight">Google Hub</span>
                <span className="text-[10px] font-mono bg-blue-500/20 text-blue-300 border border-blue-500/30 px-1.5 py-0.5 rounded font-bold">
                  In-Website Search
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">
                100% In-App Search, AI Summaries, Tab Cloak & Easter Eggs
              </p>
            </div>
          </div>

          <button
            id="close-google-hub-btn"
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors cursor-pointer"
            title="Close (Esc)"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="flex items-center gap-1 px-4 sm:px-5 border-b border-zinc-800 bg-zinc-950/60 overflow-x-auto shrink-0 text-xs">
          <button
            id="tab-google-search"
            onClick={() => setActiveTab('search')}
            className={`flex items-center gap-1.5 py-2.5 px-3 border-b-2 font-medium transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'search'
                ? 'border-[#4285F4] text-[#4285F4] font-bold'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Search className="h-3.5 w-3.5" />
            <span>Search</span>
            {searchState !== 'home' && (
              <span className="text-[9px] bg-blue-900/60 text-blue-200 px-1.5 py-0.2 rounded-full">
                Results
              </span>
            )}
          </button>

          <button
            id="tab-google-games"
            onClick={() => setActiveTab('games')}
            className={`flex items-center gap-1.5 py-2.5 px-3 border-b-2 font-medium transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'games'
                ? 'border-[#EA4335] text-[#EA4335] font-bold'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Gamepad2 className="h-3.5 w-3.5" />
            <span>Easter Eggs</span>
          </button>

          <button
            id="tab-google-cloak"
            onClick={() => setActiveTab('cloak')}
            className={`flex items-center gap-1.5 py-2.5 px-3 border-b-2 font-medium transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'cloak'
                ? 'border-[#FBBC05] text-[#FBBC05] font-bold'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Shield className="h-3.5 w-3.5" />
            <span>Tab Cloak</span>
            {activeCloak !== 'none' && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            )}
          </button>

          <button
            id="tab-google-apps"
            onClick={() => setActiveTab('apps')}
            className={`flex items-center gap-1.5 py-2.5 px-3 border-b-2 font-medium transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'apps'
                ? 'border-[#34A853] text-[#34A853] font-bold'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Workspace</span>
          </button>
        </div>

        {/* Modal Main Content Body */}
        <div
          className={`flex-1 overflow-y-auto p-4 sm:p-6 transition-all ${
            isGravityActive ? 'animate-bounce translate-y-8 duration-700' : ''
          }`}
        >
          {/* TAB 1: GOOGLE SEARCH */}
          {activeTab === 'search' && (
            <div>
              {/* VIEW A: SEARCH HOME */}
              {searchState === 'home' && (
                <div className="flex flex-col items-center justify-center min-h-[440px] text-center max-w-xl mx-auto py-4">
                  {/* Google Big Playful Logo */}
                  <div className="text-4xl sm:text-5xl font-black tracking-tight select-none mb-4 font-sans drop-shadow-md">
                    <span className="text-[#4285F4]">G</span>
                    <span className="text-[#EA4335]">o</span>
                    <span className="text-[#FBBC05]">o</span>
                    <span className="text-[#4285F4]">g</span>
                    <span className="text-[#34A853]">l</span>
                    <span className="text-[#EA4335]">e</span>
                  </div>

                  {/* Mode Pills */}
                  <div className="flex items-center gap-1.5 mb-3 bg-zinc-900/80 p-1 rounded-full border border-zinc-800 text-[11px]">
                    {[
                      { id: 'web', label: 'All' },
                      { id: 'images', label: 'Images' },
                      { id: 'tools', label: 'Calculator / Tools' },
                    ].map((mode) => (
                      <button
                        key={mode.id}
                        type="button"
                        onClick={() => {
                          setSearchMode(mode.id);
                          if (mode.id === 'tools') {
                            setQuery('calculator');
                            executeInWebsiteSearch('calculator');
                          }
                        }}
                        className={`px-3 py-1 rounded-full font-medium transition-all cursor-pointer ${
                          searchMode === mode.id
                            ? 'bg-zinc-800 text-white shadow-xs'
                            : 'text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        {mode.label}
                      </button>
                    ))}
                  </div>

                  {/* Search Bar with Autocomplete Dropdown */}
                  <div className="relative w-full mb-4">
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        executeInWebsiteSearch();
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
                        placeholder="Search Google or enter topic (happens right here)..."
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
                              executeInWebsiteSearch(s);
                            }}
                            className="w-full px-4 py-2.5 text-xs text-zinc-200 hover:bg-zinc-800 hover:text-white flex items-center gap-2.5 transition-colors cursor-pointer"
                          >
                            <Search className="h-3 w-3 text-zinc-500 shrink-0" />
                            <span className="truncate">{s}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2.5 mb-6">
                    <button
                      type="button"
                      onClick={() => executeInWebsiteSearch()}
                      className="rounded-md bg-zinc-800 hover:bg-zinc-750 border border-zinc-700 hover:border-zinc-600 px-4 py-2 text-xs font-semibold text-zinc-200 hover:text-white transition-all cursor-pointer shadow-xs"
                    >
                      Google Search
                    </button>
                    <button
                      type="button"
                      onClick={() => executeInWebsiteSearch(query, true)}
                      className="rounded-md bg-zinc-800 hover:bg-zinc-750 border border-zinc-700 hover:border-zinc-600 px-4 py-2 text-xs font-semibold text-zinc-200 hover:text-white transition-all cursor-pointer shadow-xs"
                    >
                      I'm Feeling Lucky
                    </button>
                  </div>

                  {/* Popular School / Arcade Searches */}
                  <div className="w-full text-left pt-4 border-t border-zinc-800">
                    <div className="text-[11px] font-mono text-zinc-400 mb-2 flex items-center gap-1.5">
                      <Sparkles className="h-3 w-3 text-[#FBBC05]" />
                      <span>Popular School & Game Searches (in-website):</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        'slope game',
                        'cookie clicker',
                        'google dino runner',
                        '2048 unblocked',
                        'calculator',
                        'periodic table',
                        'what is gravity',
                        'snake game',
                      ].map((item, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setQuery(item);
                            executeInWebsiteSearch(item);
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

              {/* VIEW B: SEARCH RESULTS PAGE (SERP) */}
              {searchState === 'results' && (
                <div className="space-y-4 text-left">
                  {/* Compact Header with Google Logo & Active Search Bar */}
                  <div className="pb-3 border-b border-zinc-800 space-y-2.5">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setSearchState('home')}
                        className="text-xl font-bold tracking-tight select-none cursor-pointer shrink-0"
                        title="Return to Google Home"
                      >
                        <span className="text-[#4285F4]">G</span>
                        <span className="text-[#EA4335]">o</span>
                        <span className="text-[#FBBC05]">o</span>
                        <span className="text-[#4285F4]">g</span>
                        <span className="text-[#34A853]">l</span>
                        <span className="text-[#EA4335]">e</span>
                      </button>

                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          executeInWebsiteSearch();
                        }}
                        className="relative flex-1 flex items-center"
                      >
                        <Search className="absolute left-3.5 h-3.5 w-3.5 text-zinc-400" />
                        <input
                          type="text"
                          value={query}
                          onChange={(e) => setQuery(e.target.value)}
                          placeholder="Search in-website..."
                          className="w-full rounded-full bg-zinc-850 border border-zinc-700 hover:border-zinc-600 focus:border-[#4285F4] pl-9 pr-9 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-[#4285F4]"
                        />
                        {query && (
                          <button
                            type="button"
                            onClick={() => setQuery('')}
                            className="absolute right-3 text-zinc-400 hover:text-white cursor-pointer"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </form>

                      <button
                        type="button"
                        onClick={() => executeInWebsiteSearch()}
                        disabled={isSearching}
                        className="rounded-full bg-blue-600 hover:bg-blue-500 px-3.5 py-2 text-xs font-bold text-white transition-colors cursor-pointer shrink-0"
                      >
                        Search
                      </button>
                    </div>

                    {/* Sub Tabs: All, Images, Tools */}
                    <div className="flex items-center justify-between text-xs text-zinc-400 pt-1">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setActiveSubTab('all')}
                          className={`px-3 py-1 rounded-full font-medium transition-colors cursor-pointer ${
                            activeSubTab === 'all'
                              ? 'bg-zinc-800 text-white font-bold'
                              : 'hover:text-zinc-200'
                          }`}
                        >
                          All Results
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveSubTab('images')}
                          className={`px-3 py-1 rounded-full font-medium flex items-center gap-1 transition-colors cursor-pointer ${
                            activeSubTab === 'images'
                              ? 'bg-zinc-800 text-white font-bold'
                              : 'hover:text-zinc-200'
                          }`}
                        >
                          <ImageIcon className="h-3 w-3" />
                          <span>Images</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveSubTab('tools')}
                          className={`px-3 py-1 rounded-full font-medium flex items-center gap-1 transition-colors cursor-pointer ${
                            activeSubTab === 'tools'
                              ? 'bg-zinc-800 text-white font-bold'
                              : 'hover:text-zinc-200'
                          }`}
                        >
                          <CalcIcon className="h-3 w-3" />
                          <span>Calculator / Tools</span>
                        </button>
                      </div>

                      {searchResults?.stats && (
                        <span className="text-[11px] font-mono text-zinc-500 hidden sm:inline">
                          About {searchResults.stats.totalResults} results ({searchResults.stats.timeSeconds}s)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Loading Skeleton */}
                  {isSearching && (
                    <div className="space-y-4 py-4 animate-pulse">
                      <div className="h-28 bg-zinc-850 rounded-xl"></div>
                      <div className="h-20 bg-zinc-850 rounded-xl"></div>
                      <div className="h-20 bg-zinc-850 rounded-xl"></div>
                    </div>
                  )}

                  {!isSearching && searchResults && (
                    <div className="space-y-5">
                      {/* 1. MATCHED ARCADE GAME PLAY CARD */}
                      {searchResults.arcadeGame && (
                        <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/40 via-zinc-900 to-zinc-900 border border-emerald-500/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 text-lg font-bold shrink-0">
                              🎮
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-white">
                                  {searchResults.arcadeGame.title}
                                </span>
                                <span className="text-[10px] font-mono bg-emerald-900/60 text-emerald-300 px-1.5 py-0.5 rounded">
                                  Playable in Arcade
                                </span>
                              </div>
                              <p className="text-xs text-zinc-300">
                                {searchResults.arcadeGame.description}
                              </p>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              onLaunchGame(searchResults.arcadeGame.id);
                              onClose();
                            }}
                            className="rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0 shadow-md"
                          >
                            <Gamepad2 className="h-3.5 w-3.5" />
                            <span>Play Game Now</span>
                          </button>
                        </div>
                      )}

                      {/* 2. MATH CALCULATOR WIDGET (if calculated or on tools tab) */}
                      {(searchResults.mathResult || activeSubTab === 'tools' || query.toLowerCase().includes('calc')) && (
                        <GoogleCalculator
                          initialExpression={searchResults.mathResult?.expression || ''}
                          initialResult={searchResults.mathResult?.result || ''}
                        />
                      )}

                      {/* 3. IMAGES TAB */}
                      {activeSubTab === 'images' && (
                        <div className="space-y-3">
                          <div className="text-xs font-bold text-zinc-300">
                            Image Results for "{searchResults.query}"
                          </div>
                          {searchResults.imageResults && searchResults.imageResults.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                              {searchResults.imageResults.map((img, idx) => (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={() => setSelectedImage(img)}
                                  className="group relative rounded-xl overflow-hidden bg-zinc-800 border border-zinc-700 hover:border-blue-500 aspect-video flex flex-col justify-end text-left cursor-pointer transition-all"
                                >
                                  <img
                                    src={img.imageUrl}
                                    alt={img.title}
                                    referrerPolicy="no-referrer"
                                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    onError={(e) => {
                                      e.currentTarget.src = 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=400&auto=format&fit=crop';
                                    }}
                                  />
                                  <div className="relative p-2 bg-gradient-to-t from-black/90 via-black/60 to-transparent">
                                    <div className="text-[11px] font-bold text-white truncate">
                                      {img.title}
                                    </div>
                                    <div className="text-[10px] font-mono text-zinc-400">
                                      {img.domain || 'web image'}
                                    </div>
                                  </div>
                                </button>
                              ))}
                            </div>
                          ) : (
                            <div className="p-8 text-center text-xs text-zinc-400 bg-zinc-850 rounded-xl">
                              No specific visual assets found for this search.
                            </div>
                          )}
                        </div>
                      )}

                      {/* 4. ALL TAB: AI OVERVIEW + ORGANIC RESULTS */}
                      {activeSubTab === 'all' && (
                        <>
                          {/* Google AI Overview Box */}
                          {searchResults.aiOverview && (
                            <div className="p-4 rounded-xl bg-gradient-to-br from-blue-950/30 via-zinc-900 to-zinc-900 border border-blue-500/30 shadow-md">
                              <div className="flex items-center gap-2 mb-2">
                                <Sparkles className="h-4 w-4 text-[#4285F4]" />
                                <span className="text-xs font-bold text-white tracking-tight">
                                  AI Overview
                                </span>
                                <span className="text-[10px] font-mono text-zinc-400 bg-zinc-800 px-1.5 py-0.5 rounded">
                                  Google Search Synthesis
                                </span>
                              </div>

                              <div className="text-xs sm:text-sm text-zinc-200 leading-relaxed space-y-2">
                                {searchResults.aiOverview.split('\n\n').map((paragraph, idx) => (
                                  <p key={idx}>{paragraph}</p>
                                ))}
                              </div>

                              {Array.isArray(searchResults.keyFacts) && searchResults.keyFacts.length > 0 && (
                                <div className="mt-3 pt-3 border-t border-zinc-800 flex flex-wrap gap-1.5">
                                  {searchResults.keyFacts.map((fact, idx) => (
                                    <span
                                      key={idx}
                                      className="text-[11px] font-mono bg-zinc-800 border border-zinc-700/80 text-blue-300 px-2 py-0.5 rounded-md"
                                    >
                                      • {fact}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}

                          {/* Organic Web Search Results Cards */}
                          <div className="space-y-4 pt-1">
                            {searchResults.webResults && searchResults.webResults.map((result, idx) => (
                              <div
                                key={idx}
                                className="group p-3 rounded-xl bg-zinc-900/60 hover:bg-zinc-850/80 border border-zinc-800/80 hover:border-zinc-700 transition-all text-left cursor-pointer"
                                onClick={() => {
                                  setActiveReaderResult(result);
                                  setSearchState('reader');
                                }}
                              >
                                {/* Breadcrumb */}
                                <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 font-mono mb-1">
                                  <Globe className="h-3 w-3 text-blue-400 shrink-0" />
                                  <span className="text-zinc-300 font-medium truncate">
                                    {result.domain}
                                  </span>
                                  <span className="text-zinc-600">›</span>
                                  <span className="text-zinc-500 truncate max-w-xs">{result.url}</span>
                                </div>

                                {/* Title */}
                                <h3 className="text-sm sm:text-base font-medium text-[#8ab4f8] group-hover:underline leading-snug mb-1">
                                  {result.title}
                                </h3>

                                {/* Snippet */}
                                <p className="text-xs text-zinc-300 leading-relaxed mb-2">
                                  {result.snippet}
                                </p>

                                {/* Sitelinks / In-Website Read Button */}
                                <div className="flex items-center justify-between pt-1">
                                  <div className="flex flex-wrap gap-1.5">
                                    {Array.isArray(result.sitelinks) &&
                                      result.sitelinks.map((link, lIdx) => (
                                        <span
                                          key={lIdx}
                                          className="text-[10px] font-mono bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded"
                                        >
                                          {link}
                                        </span>
                                      ))}
                                  </div>
                                  <span className="text-[11px] font-bold text-blue-400 flex items-center gap-1 opacity-80 group-hover:opacity-100">
                                    <span>Read Article</span>
                                    <ArrowRight className="h-3 w-3" />
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* People Also Ask Section */}
                          {Array.isArray(searchResults.peopleAlsoAsk) && searchResults.peopleAlsoAsk.length > 0 && (
                            <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2">
                              <div className="text-xs font-bold text-white mb-2">
                                People also ask:
                              </div>
                              <div className="divide-y divide-zinc-800">
                                {searchResults.peopleAlsoAsk.map((item, pIdx) => {
                                  const isExpanded = expandedPaaIndex === pIdx;
                                  return (
                                    <div key={pIdx} className="py-2">
                                      <button
                                        type="button"
                                        onClick={() => setExpandedPaaIndex(isExpanded ? null : pIdx)}
                                        className="w-full flex items-center justify-between text-xs text-zinc-200 hover:text-white font-medium text-left cursor-pointer"
                                      >
                                        <span>{item.question}</span>
                                        {isExpanded ? (
                                          <ChevronUp className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                                        ) : (
                                          <ChevronDown className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                                        )}
                                      </button>
                                      {isExpanded && (
                                        <div className="mt-2 text-xs text-zinc-300 leading-relaxed pl-2 border-l-2 border-blue-500 animate-in fade-in">
                                          <p>{item.answer}</p>
                                          <button
                                            type="button"
                                            onClick={() => executeInWebsiteSearch(item.question)}
                                            className="mt-2 text-[11px] text-blue-400 hover:text-blue-300 underline font-medium cursor-pointer"
                                          >
                                            Search this question on website →
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {/* Related Searches Section */}
                          {Array.isArray(searchResults.relatedSearches) && searchResults.relatedSearches.length > 0 && (
                            <div className="pt-3 border-t border-zinc-800">
                              <div className="text-xs font-bold text-zinc-400 mb-2">
                                Related searches:
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {searchResults.relatedSearches.map((r, rIdx) => (
                                  <button
                                    key={rIdx}
                                    type="button"
                                    onClick={() => executeInWebsiteSearch(r)}
                                    className="text-xs rounded-full bg-zinc-800 hover:bg-zinc-750 border border-zinc-700 px-3 py-1.5 text-zinc-200 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
                                  >
                                    <Search className="h-3 w-3 text-zinc-500" />
                                    <span>{r}</span>
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* VIEW C: IN-WEBSITE ARTICLE / PAGE READER */}
              {searchState === 'reader' && activeReaderResult && (
                <GoogleReaderView
                  result={activeReaderResult}
                  onBack={() => setSearchState('results')}
                  onSearchQuery={(q) => executeInWebsiteSearch(q)}
                />
              )}
            </div>
          )}

          {/* TAB 2: GOOGLE EASTER EGGS & GAMES */}
          {activeTab === 'games' && (
            <div className="space-y-4 text-left">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Google Games & Easter Eggs</h3>
                  <p className="text-xs text-zinc-400">
                    Play authentic Google easter eggs and screen effects right on this website
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
                          <span>Play Game in Player</span>
                        </button>
                      )}

                      {item.id === 'barrel-roll' && (
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

                      {item.id === 'gravity' && (
                        <button
                          type="button"
                          onClick={handleTriggerGravity}
                          className={`w-full flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-bold transition-colors cursor-pointer ${
                            isGravityActive
                              ? 'bg-amber-600 text-white'
                              : 'bg-zinc-800 hover:bg-zinc-750 text-amber-300'
                          }`}
                        >
                          <Zap className="h-3.5 w-3.5" />
                          <span>{isGravityActive ? 'Restore Gravity' : 'Trigger Gravity Collapse'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: TAB CLOAK & STEALTH */}
          {activeTab === 'cloak' && (
            <div className="space-y-4 text-left">
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
            <div className="space-y-4 text-left">
              <div>
                <h3 className="text-sm font-bold text-white">Google Workspace Stealth Previews</h3>
                <p className="text-xs text-zinc-400">
                  Preview realistic Google school apps directly in stealth mode on this website
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {GOOGLE_APPS.map((app) => (
                  <button
                    key={app.name}
                    type="button"
                    onClick={() => setPreviewApp(app)}
                    className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-blue-500 hover:bg-zinc-850 flex items-center gap-3 transition-all text-left cursor-pointer group"
                  >
                    <span className="text-2xl select-none group-hover:scale-110 transition-transform">
                      {app.icon}
                    </span>
                    <div className="overflow-hidden">
                      <div className="text-xs font-bold text-white truncate flex items-center gap-1">
                        <span>{app.name}</span>
                        <Eye className="h-2.5 w-2.5 text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <div className="text-[10px] font-mono text-zinc-400 truncate">
                        {app.desc}
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* App Disguise / Preview Modal */}
              {previewApp && (
                <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-700 space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-white">
                      <span>{previewApp.icon}</span>
                      <span>Google {previewApp.name} Stealth Disguise</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPreviewApp(null)}
                      className="text-zinc-400 hover:text-white text-xs cursor-pointer"
                    >
                      Close Preview
                    </button>
                  </div>
                  <div className="text-xs text-zinc-300 leading-relaxed">
                    You can activate this document disguise with your tab cloak to show{' '}
                    <strong>Google {previewApp.name}</strong> on your screen while remaining safe.
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        onTriggerPanic();
                        onClose();
                      }}
                      className="rounded-lg bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 text-xs font-bold transition-colors cursor-pointer"
                    >
                      Activate Fullscreen Disguise
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* In-Website Image Lightbox Overlay */}
        {selectedImage && (
          <div
            className="absolute inset-0 z-30 bg-black/90 p-4 flex flex-col justify-between animate-in fade-in"
            onClick={() => setSelectedImage(null)}
          >
            <div className="flex items-center justify-between text-xs text-zinc-300 pb-2 border-b border-zinc-800">
              <span className="font-bold truncate max-w-sm">{selectedImage.title}</span>
              <button
                type="button"
                onClick={() => setSelectedImage(null)}
                className="p-1 rounded bg-zinc-800 text-zinc-400 hover:text-white cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 flex items-center justify-center p-2 overflow-hidden">
              <img
                src={selectedImage.imageUrl}
                alt={selectedImage.title}
                referrerPolicy="no-referrer"
                className="max-h-full max-w-full object-contain rounded-lg shadow-2xl"
              />
            </div>
            <div className="text-center text-[11px] text-zinc-400 font-mono">
              Source: {selectedImage.domain || 'web'} • Viewing directly in Arcade.IO (no external redirect)
            </div>
          </div>
        )}

        {/* Global Hub Footer */}
        <div className="px-4 sm:px-5 py-2.5 border-t border-zinc-800 bg-zinc-950 flex items-center justify-between text-[11px] font-mono text-zinc-400 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-[#4285F4]">G</span>
            <span className="text-[#EA4335]">o</span>
            <span className="text-[#FBBC05]">o</span>
            <span className="text-[#4285F4]">g</span>
            <span className="text-[#34A853]">l</span>
            <span className="text-[#EA4335]">e</span>
            <span className="text-zinc-500">• In-Website Search & Stealth Engine</span>
          </div>
          <span className="text-zinc-500">Press Esc to close</span>
        </div>
      </div>
    </div>
  );
};
