import React, { useState } from 'react';
import { X, Copy, Check, Download, FileCode } from 'lucide-react';

export const JsonViewerModal = ({
  isOpen,
  onClose,
  games,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const jsonString = JSON.stringify(games, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'games.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
      <div className="flex flex-col w-full max-w-3xl max-h-[85vh] rounded-lg border border-zinc-800 bg-zinc-900 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3 bg-zinc-950/80">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <FileCode className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-bold text-xs text-white uppercase font-mono tracking-wider">games.json Data Store</h3>
              <p className="text-[10px] text-zinc-400 font-mono">
                {games.length} games configured with iframe source & permissions
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 rounded border border-zinc-700 bg-zinc-800 px-2.5 py-1 text-xs font-mono text-zinc-200 hover:bg-zinc-750 hover:text-white transition-colors cursor-pointer"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 rounded bg-indigo-600 px-2.5 py-1 text-xs font-mono font-bold text-white hover:bg-indigo-500 transition-colors cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download</span>
            </button>

            <button
              onClick={onClose}
              className="rounded p-1 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors ml-1 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Code Content */}
        <div className="flex-1 overflow-auto p-4 bg-zinc-950 font-mono text-[11px] text-zinc-300 leading-relaxed scrollbar-thin selection:bg-indigo-500 selection:text-white">
          <pre className="text-indigo-300/90">{jsonString}</pre>
        </div>

        {/* Footer */}
        <div className="border-t border-zinc-800 bg-zinc-950/60 px-4 py-2 text-[10px] text-zinc-400 flex items-center justify-between font-mono">
          <span>SOURCE: <code className="text-indigo-400">/public/games.json</code></span>
          <button
            onClick={onClose}
            className="rounded bg-zinc-800 border border-zinc-700 px-2.5 py-1 text-[10px] font-mono font-bold text-zinc-300 hover:bg-zinc-750 hover:text-white cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
