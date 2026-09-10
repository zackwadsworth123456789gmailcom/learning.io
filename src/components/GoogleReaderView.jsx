import React, { useState } from 'react';
import { ArrowLeft, Check, Copy, ExternalLink, Globe, Share2, Sparkles, BookOpen } from 'lucide-react';

export const GoogleReaderView = ({ result, onBack, onSearchQuery }) => {
  const [copied, setCopied] = useState(false);

  if (!result) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(`${result.title}\n\n${result.content || result.snippet}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 sm:p-6 shadow-2xl animate-in fade-in zoom-in-98 duration-150 text-left">
      {/* Navigation Header */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-zinc-800">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-750 text-zinc-200 hover:text-white px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Search Results</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1 rounded-lg bg-zinc-800 hover:bg-zinc-750 text-zinc-300 hover:text-white px-2.5 py-1.5 text-xs transition-colors cursor-pointer"
            title="Copy article summary"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
          </button>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
            In-Website Reader
          </span>
        </div>
      </div>

      {/* Domain & Breadcrumb */}
      <div className="flex items-center gap-2 mb-2 text-xs text-zinc-400 font-mono">
        <Globe className="h-3.5 w-3.5 text-blue-400 shrink-0" />
        <span className="text-zinc-300 font-medium">{result.domain || 'web source'}</span>
        <span className="text-zinc-600">›</span>
        <span className="text-zinc-500 truncate">{result.url || 'in-website article'}</span>
      </div>

      {/* Title */}
      <h1 className="text-lg sm:text-2xl font-bold text-white tracking-tight mb-3 leading-snug">
        {result.title}
      </h1>

      {/* Sitelinks / Section Chips */}
      {Array.isArray(result.sitelinks) && result.sitelinks.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {result.sitelinks.map((link, idx) => (
            <span
              key={idx}
              className="text-[11px] font-mono bg-zinc-800/80 border border-zinc-700/60 text-zinc-300 px-2 py-0.5 rounded-md"
            >
              § {link}
            </span>
          ))}
        </div>
      )}

      {/* Article Content */}
      <div className="prose prose-invert max-w-none text-zinc-300 text-sm leading-relaxed space-y-3 pt-2">
        {result.content ? (
          result.content.split('\n\n').map((para, idx) => (
            <p key={idx} className="leading-relaxed">
              {para}
            </p>
          ))
        ) : (
          <p className="leading-relaxed">{result.snippet}</p>
        )}
      </div>

      {/* Footnote badge */}
      <div className="mt-6 pt-4 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-500">
        <div className="flex items-center gap-1.5">
          <BookOpen className="h-3.5 w-3.5 text-blue-400" />
          <span>Rendered directly on this website without external navigation.</span>
        </div>
        <button
          type="button"
          onClick={onBack}
          className="text-blue-400 hover:text-blue-300 underline font-medium cursor-pointer"
        >
          Return to Results
        </button>
      </div>
    </div>
  );
};
