import React from 'react';
import { Heart, Play, Gamepad2, Rocket, Trophy, Grid, Layers, Flame, Dices, Zap } from 'lucide-react';

const getCategoryBg = (category) => {
  switch (category?.toLowerCase()) {
    case 'arcade': return 'bg-rose-950/40 border-rose-900/30';
    case 'puzzle': return 'bg-blue-950/40 border-blue-900/30';
    case 'action': return 'bg-indigo-950/40 border-indigo-900/30';
    case 'sports': return 'bg-orange-950/40 border-orange-900/30';
    default: return 'bg-zinc-900/80 border-zinc-800';
  }
};

const getIconComponent = (iconName) => {
  switch (iconName) {
    case 'Gamepad2': return <Gamepad2 className="h-5 w-5 text-white" />;
    case 'Grid': return <Grid className="h-5 w-5 text-white" />;
    case 'Flame': return <Flame className="h-5 w-5 text-white" />;
    case 'Rocket': return <Rocket className="h-5 w-5 text-white" />;
    case 'Layers': return <Layers className="h-5 w-5 text-white" />;
    case 'Trophy': return <Trophy className="h-5 w-5 text-white" />;
    case 'Zap': return <Zap className="h-5 w-5 text-white" />;
    case 'Dices': return <Dices className="h-5 w-5 text-white" />;
    default: return <Gamepad2 className="h-5 w-5 text-white" />;
  }
};

export const GameCard = ({
  game,
  isFavorite,
  onToggleFavorite,
  onSelectGame,
}) => {
  const accentColor = game.themeColor || '#6366f1';
  const categoryHeaderBg = getCategoryBg(game.category);

  return (
    <div
      id={`game-card-${game.id}`}
      onClick={() => onSelectGame(game)}
      className="group relative bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden flex flex-col hover:border-zinc-700 hover:shadow-lg transition-all duration-200 cursor-pointer select-none"
    >
      {/* Visual Header / Graphic Banner */}
      <div className={`h-28 sm:h-32 ${categoryHeaderBg} flex items-center justify-center relative overflow-hidden`}>
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:8px_8px]" />

        {/* The Graphic Element */}
        <div
          className="w-12 h-12 rounded flex items-center justify-center shadow-md transform group-hover:scale-110 transition-transform duration-300"
          style={{ backgroundColor: accentColor }}
        >
          {getIconComponent(game.icon)}
        </div>

        {/* Favorite toggle in top-right */}
        <button
          id={`fav-btn-${game.id}`}
          onClick={(e) => onToggleFavorite(game.id, e)}
          className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded bg-zinc-900/80 text-zinc-400 hover:text-rose-400 hover:bg-zinc-800 transition-colors cursor-pointer"
          title={isFavorite ? 'Remove favorite' : 'Add favorite'}
        >
          <Heart
            className={`h-3.5 w-3.5 ${isFavorite ? 'fill-rose-500 text-rose-500' : 'text-zinc-400'}`}
          />
        </button>

        {/* Custom badge */}
        {game.isCustom && (
          <span className="absolute top-2 left-2 rounded bg-indigo-500/20 px-1.5 py-0.5 text-[9px] font-mono font-bold text-indigo-400 border border-indigo-500/30 uppercase">
            Custom
          </span>
        )}

        {/* Hover play prompt */}
        <div className="absolute bottom-1.5 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-[10px] font-mono text-zinc-300 bg-zinc-900/90 px-1.5 py-0.5 rounded border border-zinc-700">
          <span>RUN</span>
          <Play className="h-2.5 w-2.5 fill-zinc-300 text-zinc-300" />
        </div>
      </div>

      {/* Card Info */}
      <div className="p-3 border-t border-zinc-800 bg-zinc-900 flex-1 flex flex-col justify-between">
        <div>
          <h4 className="text-xs font-bold text-white mb-0.5 truncate group-hover:text-indigo-400 transition-colors">
            {game.title}
          </h4>
          <p className="text-[11px] text-zinc-400 line-clamp-1 leading-snug">
            {game.description}
          </p>
        </div>

        {/* Bottom stats row */}
        <div className="flex justify-between items-center mt-2.5 pt-2 border-t border-zinc-800/80">
          <span className="text-[9px] text-zinc-500 uppercase font-mono">
            {game.category}
          </span>
          <div className="flex items-center gap-1.5">
            {game.plays && (
              <span className="text-[9px] text-zinc-500 font-mono">
                {game.plays >= 1000 ? `${(game.plays / 1000).toFixed(1)}k` : game.plays} plays
              </span>
            )}
            <span className="text-[10px] text-yellow-500 font-mono font-bold">
              ★ {game.rating ? game.rating.toFixed(1) : '4.8'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
