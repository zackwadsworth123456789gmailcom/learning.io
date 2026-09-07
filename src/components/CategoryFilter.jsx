import React from 'react';
import { Sparkles, Gamepad2, Puzzle, Zap, Trophy, Heart } from 'lucide-react';

export const CategoryFilterBar = ({
  currentCategory,
  onSelectCategory,
  gameCounts,
  variant = 'horizontal',
}) => {
  const categories = [
    { key: 'All', label: 'All Games', icon: <Sparkles className="h-3.5 w-3.5" /> },
    { key: 'Arcade', label: 'Arcade', icon: <Gamepad2 className="h-3.5 w-3.5" /> },
    { key: 'Puzzle', label: 'Puzzle', icon: <Puzzle className="h-3.5 w-3.5" /> },
    { key: 'Action', label: 'Action', icon: <Zap className="h-3.5 w-3.5" /> },
    { key: 'Sports', label: 'Sports', icon: <Trophy className="h-3.5 w-3.5" /> },
    { key: 'Favorites', label: 'Favorites', icon: <Heart className="h-3.5 w-3.5 fill-rose-500/30 text-rose-400" /> },
  ];

  if (variant === 'sidebar') {
    return (
      <ul className="space-y-1">
        {categories.map((cat) => {
          const isActive = currentCategory === cat.key;
          const count = gameCounts[cat.key] ?? 0;

          return (
            <li key={cat.key}>
              <button
                id={`sidebar-category-btn-${cat.key.toLowerCase()}`}
                onClick={() => onSelectCategory(cat.key)}
                className={`flex items-center justify-between w-full text-xs py-2 px-3 rounded transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-zinc-800 text-white font-bold border-l-2 border-indigo-500'
                    : 'text-zinc-400 hover:bg-zinc-850 hover:text-zinc-200'
                }`}
              >
                <span className="flex items-center gap-2">
                  {cat.icon}
                  <span>{cat.label}</span>
                </span>
                <span className={`text-[10px] font-mono ${isActive ? 'text-indigo-400 font-bold' : 'opacity-50'}`}>
                  {count}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    );
  }

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
      {categories.map((cat) => {
        const isActive = currentCategory === cat.key;
        const count = gameCounts[cat.key] ?? 0;

        return (
          <button
            key={cat.key}
            id={`category-btn-${cat.key.toLowerCase()}`}
            onClick={() => onSelectCategory(cat.key)}
            className={`inline-flex items-center gap-2 whitespace-nowrap rounded px-2.5 py-1 text-xs font-semibold transition-colors cursor-pointer ${
              isActive
                ? 'bg-zinc-800 text-white border border-indigo-500/50 shadow-xs'
                : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:bg-zinc-800 hover:text-zinc-200'
            }`}
          >
            {cat.icon}
            <span>{cat.label}</span>
            <span
              className={`rounded px-1.5 py-0.2 text-[10px] font-mono ${
                isActive ? 'bg-indigo-950 text-indigo-300 font-bold' : 'bg-zinc-800 text-zinc-500'
              }`}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
};
