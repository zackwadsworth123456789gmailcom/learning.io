import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowLeft,
  RotateCcw,
  Maximize2,
  Minimize2,
  ExternalLink,
  Heart,
  Info,
  Keyboard,
  CheckCircle2,
} from 'lucide-react';

export const GamePlayer = ({
  game,
  isFavorite,
  onToggleFavorite,
  onBack,
}) => {
  const containerRef = useRef(null);
  const iframeRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);

  // Helper to resolve iframe src with Vite base path (supports GitHub Pages subpaths)
  const resolveSrc = (src) => {
    if (!src) return '';
    if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('data:')) {
      return src;
    }
    const base = import.meta.env.BASE_URL || './';
    if (src.startsWith('/')) {
      const cleanBase = base.endsWith('/') ? base : `${base}/`;
      return `${cleanBase}${src.slice(1)}`;
    }
    return src;
  };

  const resolvedIframeSrc = resolveSrc(game.iframe.src);

  // Handle reload
  const handleReload = () => {
    setIsLoading(true);
    setIframeKey((prev) => prev + 1);
  };

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Keyboard shortcut: Escape exits or returns
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !document.fullscreenElement) {
        onBack();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onBack]);

  const handleCopyLink = () => {
    try {
      const fullUrl = new URL(resolvedIframeSrc, window.location.href).href;
      navigator.clipboard.writeText(fullUrl);
    } catch {
      navigator.clipboard.writeText(resolvedIframeSrc);
    }
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div
      ref={containerRef}
      id="game-player-screen"
      className={`flex flex-col bg-zinc-950 text-zinc-300 ${
        isFullscreen ? 'h-screen w-screen p-2' : 'w-full max-w-5xl mx-auto'
      }`}
    >
      {/* Player Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-zinc-900 border border-zinc-800 rounded-t-lg px-4 py-2.5">
        <div className="flex items-center gap-3">
          <button
            id="player-back-btn"
            onClick={onBack}
            className="flex items-center gap-1.5 rounded bg-zinc-800 border border-zinc-700 px-2.5 py-1 text-xs font-bold text-zinc-200 hover:bg-zinc-750 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>GAMES</span>
          </button>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white tracking-tight">{game.title}</h2>
              <span className="rounded bg-indigo-500/10 text-indigo-400 px-1.5 py-0.5 text-[10px] font-mono uppercase font-bold border border-indigo-500/20">
                {game.category}
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5">
          <button
            id="player-favorite-btn"
            onClick={() => onToggleFavorite(game.id)}
            className={`flex items-center gap-1.5 rounded border px-2 py-1 text-xs font-mono transition-colors cursor-pointer ${
              isFavorite
                ? 'border-rose-500/40 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20'
                : 'border-zinc-700 bg-zinc-800 text-zinc-300 hover:bg-zinc-750'
            }`}
            title="Toggle favorite"
          >
            <Heart className={`h-3.5 w-3.5 ${isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
            <span className="hidden sm:inline text-[11px]">{isFavorite ? 'Favorited' : 'Favorite'}</span>
          </button>

          <button
            id="player-reload-btn"
            onClick={handleReload}
            className="flex items-center gap-1.5 rounded border border-zinc-700 bg-zinc-800 px-2 py-1 text-xs font-mono text-zinc-300 hover:bg-zinc-750 hover:text-white transition-colors cursor-pointer"
            title="Reload game iframe"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span className="hidden sm:inline text-[11px]">Restart</span>
          </button>

          <a
            id="player-open-tab-link"
            href={resolvedIframeSrc}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded border border-zinc-700 bg-zinc-800 px-2 py-1 text-xs font-mono text-zinc-300 hover:bg-zinc-750 hover:text-white transition-colors"
            title="Open game directly in new tab"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            <span className="hidden sm:inline text-[11px]">Tab</span>
          </a>

          <button
            id="player-fullscreen-btn"
            onClick={toggleFullscreen}
            className="flex items-center gap-1.5 rounded bg-indigo-600 px-3 py-1 text-xs font-bold text-white hover:bg-indigo-500 transition-colors shadow-xs cursor-pointer"
            title="Toggle fullscreen (F)"
          >
            {isFullscreen ? (
              <>
                <Minimize2 className="h-3.5 w-3.5" />
                <span className="hidden sm:inline text-[11px]">Exit</span>
              </>
            ) : (
              <>
                <Maximize2 className="h-3.5 w-3.5" />
                <span className="hidden sm:inline text-[11px]">Fullscreen</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Iframe Player Viewport */}
      <div
        className={`relative w-full bg-black border-x border-zinc-800 overflow-hidden flex items-center justify-center ${
          isFullscreen ? 'flex-1 h-full' : 'aspect-[16/10] min-h-[460px] max-h-[640px]'
        }`}
      >
        {isLoading && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-zinc-950/85 backdrop-blur-xs">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent mb-2" />
            <span className="text-xs font-mono text-zinc-400">Loading {game.title}...</span>
          </div>
        )}

        {/* The Game Iframe - configured directly from JSON */}
        <iframe
          key={iframeKey}
          ref={iframeRef}
          id={game.iframe.id || "active-game-iframe"}
          src={resolvedIframeSrc}
          title={game.iframe.title || game.title}
          allow={game.iframe.allow || 'autoplay; fullscreen; gamepad'}
          sandbox={game.iframe.sandbox || undefined}
          allowFullScreen={game.iframe.allowFullScreen !== false}
          scrolling={game.iframe.scrolling || "auto"}
          onLoad={() => setIsLoading(false)}
          className="w-full h-full border-0 bg-transparent block"
        />
      </div>

      {/* Game Details & Controls Footer (hidden in fullscreen) */}
      {!isFullscreen && (
        <div className="rounded-b-lg border border-zinc-800 bg-zinc-900 p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Description */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em] mb-1.5">
                <Info className="h-3.5 w-3.5 text-indigo-400" />
                <span>About this game</span>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">{game.description}</p>

              {/* JSON source info badge */}
              <div className="mt-3 flex items-center gap-2 text-xs text-zinc-500">
                <span className="font-mono bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800 text-[10px] text-indigo-400">
                  iframe src: {resolvedIframeSrc}
                </span>
                <button
                  onClick={handleCopyLink}
                  className="text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer text-[11px]"
                  title="Copy iframe source link"
                >
                  {copiedLink ? (
                    <span className="flex items-center gap-1 text-emerald-400 text-[10px] font-mono">
                      <CheckCircle2 className="h-3 w-3" /> Copied
                    </span>
                  ) : (
                    <span className="underline text-[10px] font-mono">Copy src</span>
                  )}
                </button>
              </div>
            </div>

            {/* Controls */}
            <div className="rounded bg-zinc-950 border border-zinc-800 p-3">
              <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em] mb-1.5">
                <Keyboard className="h-3.5 w-3.5 text-yellow-500" />
                <span>Controls</span>
              </div>
              <p className="text-xs text-zinc-200 font-mono leading-normal">
                {game.controls || 'Mouse or standard keyboard arrow keys.'}
              </p>
              <div className="mt-2 text-[10px] text-zinc-500 font-mono">
                Click game viewport to focus controls.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
