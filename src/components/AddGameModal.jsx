import React, { useState } from 'react';
import { X, Plus, Sparkles } from 'lucide-react';

export const AddGameModal = ({
  isOpen,
  onClose,
  onAddGame,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Arcade');
  const [iframeSrc, setIframeSrc] = useState('');
  const [description, setDescription] = useState('');
  const [controls, setControls] = useState('');
  const [themeColor, setThemeColor] = useState('#10b981');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a game title.');
      return;
    }
    if (!iframeSrc.trim()) {
      setError('Please provide an iframe source URL.');
      return;
    }

    // Parse src and attributes if someone pasted a full <iframe ...> snippet
    let cleanSrc = iframeSrc.trim();
    let gameTitle = title.trim();
    let iframeId = 'active-game-iframe';
    let iframeClass = 'iframe-default';

    if (cleanSrc.includes('<iframe')) {
      const srcMatch = cleanSrc.match(/src=["'](.*?)["']/i);
      if (srcMatch && srcMatch[1]) cleanSrc = srcMatch[1];

      const titleMatch = cleanSrc.match(/title=["'](.*?)["']/i);
      if (!gameTitle && titleMatch && titleMatch[1]) gameTitle = titleMatch[1];

      const idMatch = cleanSrc.match(/id=["'](.*?)["']/i);
      if (idMatch && idMatch[1]) iframeId = idMatch[1];

      const classMatch = cleanSrc.match(/class(?:Name)?=["'](.*?)["']/i);
      if (classMatch && classMatch[1]) iframeClass = classMatch[1];
    }

    if (!gameTitle) {
      setError('Please provide a game title.');
      return;
    }

    const newGame = {
      id: 'custom-' + Date.now(),
      title: gameTitle,
      category,
      description: description.trim() || 'Custom unblocked game embedded via iframe.',
      iframe: {
        id: iframeId,
        src: cleanSrc,
        title: `${gameTitle} Game`,
        width: '100%',
        height: '100%',
        frameBorder: '0',
        className: iframeClass,
        allow: 'autoplay; fullscreen; gamepad',
        allowFullScreen: true,
        scrolling: 'auto',
      },
      themeColor,
      icon: 'Gamepad2',
      controls: controls.trim() || 'Standard mouse / keyboard controls',
      featured: false,
      rating: 5.0,
      plays: 1,
      isCustom: true,
    };

    onAddGame(newGame);
    onClose();
    // Reset inputs
    setTitle('');
    setIframeSrc('');
    setDescription('');
    setControls('');
    setError('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
      <div className="w-full max-w-lg rounded-lg border border-zinc-800 bg-zinc-900 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3 bg-zinc-950/80">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Plus className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-bold text-xs text-white uppercase font-mono tracking-wider">Add Custom Iframe Game</h3>
              <p className="text-[10px] text-zinc-400">Append entry to the local JSON datastore</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded p-1 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3.5">
          {error && (
            <div className="rounded bg-rose-500/10 border border-rose-500/30 p-2 text-xs text-rose-300 font-mono">
              {error}
            </div>
          )}

          <div>
            <label className="block text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em] mb-1">
              Game Title *
            </label>
            <input
              type="text"
              placeholder="e.g. Pixel Runner 2026"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-xs text-white placeholder-zinc-600 focus:border-indigo-500 focus:outline-none font-mono"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em] mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded border border-zinc-800 bg-zinc-950 px-2.5 py-1.5 text-xs text-white focus:border-indigo-500 focus:outline-none font-mono cursor-pointer"
              >
                <option value="Arcade">Arcade</option>
                <option value="Puzzle">Puzzle</option>
                <option value="Action">Action</option>
                <option value="Sports">Sports</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em] mb-1">
                Accent Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={themeColor}
                  onChange={(e) => setThemeColor(e.target.value)}
                  className="h-7 w-10 rounded border border-zinc-800 bg-zinc-950 cursor-pointer"
                />
                <span className="font-mono text-xs text-zinc-400">{themeColor}</span>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em]">
                Iframe URL / Embed Src *
              </label>
              <span className="text-[9px] text-zinc-500 font-mono">Accepts URL or &lt;iframe&gt; code</span>
            </div>
            <input
              type="text"
              placeholder="https://example.com/game.html or <iframe src='...'></iframe>"
              value={iframeSrc}
              onChange={(e) => setIframeSrc(e.target.value)}
              className="w-full rounded border border-zinc-800 bg-zinc-950 px-3 py-1.5 font-mono text-xs text-indigo-400 placeholder-zinc-600 focus:border-indigo-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em] mb-1">
              Description
            </label>
            <textarea
              rows={2}
              placeholder="Brief summary of gameplay..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-xs text-white placeholder-zinc-600 focus:border-indigo-500 focus:outline-none resize-none"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em] mb-1">
              Controls Guide
            </label>
            <input
              type="text"
              placeholder="e.g. Arrow keys to steer, Space to boost"
              value={controls}
              onChange={(e) => setControls(e.target.value)}
              className="w-full rounded border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-xs text-white placeholder-zinc-600 focus:border-indigo-500 focus:outline-none font-mono"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded border border-zinc-800 px-3 py-1.5 text-xs font-mono text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded bg-indigo-600 px-4 py-1.5 text-xs font-mono font-bold text-white hover:bg-indigo-500 transition-colors cursor-pointer"
            >
              <Sparkles className="h-3 w-3" />
              <span>Add to JSON List</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
