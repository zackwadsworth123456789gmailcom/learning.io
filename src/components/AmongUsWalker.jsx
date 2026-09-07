import React, { useState, useEffect, useRef } from 'react';
import { X, Plus, Sparkles, Volume2 } from 'lucide-react';

// Classic Among Us crewmate color palette
const CREWMATE_COLORS = [
  { name: 'Red', primary: '#ef4444', shade: '#991b1b', isSus: true },
  { name: 'Cyan', primary: '#06b6d4', shade: '#0e7490' },
  { name: 'Lime', primary: '#84cc16', shade: '#4d7c0f' },
  { name: 'Pink', primary: '#ec4899', shade: '#9d174d' },
  { name: 'Yellow', primary: '#eab308', shade: '#a16207' },
  { name: 'Purple', primary: '#a855f7', shade: '#7e22ce' },
  { name: 'Orange', primary: '#f97316', shade: '#c2410c' },
  { name: 'Black', primary: '#3f3f46', shade: '#18181b' },
  { name: 'White', primary: '#f4f4f5', shade: '#a1a1aa' },
  { name: 'Blue', primary: '#3b82f6', shade: '#1d4ed8' },
];

const SUS_QUOTES = [
  'SUS!',
  'Red is sus!',
  'I was in electrical doing wires!',
  'I saw Cyan vent!',
  'Emergency Meeting!',
  'Skip vote!',
  'Where was the body?',
  'Self report!',
  'I have medbay scan!',
  'Not me, I was in Admin!',
  'Vote him out!',
];

const HATS = ['party', 'sprout', 'mini', 'cheese', 'halo', 'none'];

export const AmongUsWalker = ({ isActive, onClose }) => {
  const [crewmates, setCrewmates] = useState([
    {
      id: 1,
      x: 50,
      y: 8,
      vx: 2.2,
      scale: 1,
      color: CREWMATE_COLORS[0], // Red (sus)
      hat: 'party',
      speech: 'Red is sus!',
      speechTimer: 200,
      isJumping: false,
    },
    {
      id: 2,
      x: 350,
      y: 8,
      vx: -1.8,
      scale: 1,
      color: CREWMATE_COLORS[1], // Cyan
      hat: 'sprout',
      speech: '',
      speechTimer: 0,
      isJumping: false,
    },
  ]);

  const animFrameRef = useRef(null);
  const nextIdRef = useRef(3);

  // Spawn a new random crewmate
  const spawnCrewmate = () => {
    const randomColor = CREWMATE_COLORS[Math.floor(Math.random() * CREWMATE_COLORS.length)];
    const randomHat = HATS[Math.floor(Math.random() * HATS.length)];
    const vx = (Math.random() > 0.5 ? 1 : -1) * (1.5 + Math.random() * 1.5);
    const startX = vx > 0 ? -60 : (window.innerWidth || 1000) + 60;

    const newMate = {
      id: nextIdRef.current++,
      x: startX,
      y: 8,
      vx: vx,
      scale: 0.9 + Math.random() * 0.25,
      color: randomColor,
      hat: randomHat,
      speech: 'Joined!',
      speechTimer: 120,
      isJumping: false,
    };

    setCrewmates((prev) => [...prev, newMate]);
  };

  // Click on a crewmate to make them jump & say something sus
  const handleCrewmateClick = (id) => {
    setCrewmates((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const randomQuote = SUS_QUOTES[Math.floor(Math.random() * SUS_QUOTES.length)];
          return {
            ...c,
            isJumping: true,
            speech: randomQuote,
            speechTimer: 160,
            vx: -c.vx, // Reverse direction on click
          };
        }
        return c;
      })
    );

    // Reset jump animation after 400ms
    setTimeout(() => {
      setCrewmates((prev) =>
        prev.map((c) => (c.id === id ? { ...c, isJumping: false } : c))
      );
    }, 400);
  };

  // Animation Loop
  useEffect(() => {
    if (!isActive) return;

    let lastTime = performance.now();

    const updateLoop = (currentTime) => {
      const dt = Math.min((currentTime - lastTime) / 16.66, 2.5); // cap delta
      lastTime = currentTime;

      const screenWidth = window.innerWidth || 1200;

      setCrewmates((prev) =>
        prev.map((c) => {
          let newX = c.x + c.vx * dt;
          let newVx = c.vx;

          // Boundary turn around or wrap
          if (newX > screenWidth + 80 && c.vx > 0) {
            newX = -70;
          } else if (newX < -90 && c.vx < 0) {
            newX = screenWidth + 70;
          }

          // Decrease speech timer
          let newTimer = c.speechTimer > 0 ? c.speechTimer - dt : 0;
          let speech = c.speech;
          if (newTimer <= 0) {
            speech = '';
            // Occasional random chatter (1 in 500 chance per frame)
            if (Math.random() < 0.002) {
              speech = SUS_QUOTES[Math.floor(Math.random() * SUS_QUOTES.length)];
              newTimer = 140;
            }
          }

          return {
            ...c,
            x: newX,
            vx: newVx,
            speech,
            speechTimer: newTimer,
          };
        })
      );

      animFrameRef.current = requestAnimationFrame(updateLoop);
    };

    animFrameRef.current = requestAnimationFrame(updateLoop);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isActive]);

  if (!isActive) return null;

  return (
    <div
      id="amongus-walking-container"
      className="fixed inset-x-0 bottom-0 z-40 pointer-events-none overflow-visible h-28"
    >
      {/* Mini Controls Bar for Among Us walking experience */}
      <div className="absolute right-4 bottom-14 pointer-events-auto flex items-center gap-1.5 bg-zinc-950/90 border border-zinc-700/80 rounded-full px-3 py-1 shadow-xl shadow-black/80 backdrop-blur-xs text-xs">
        <span className="text-[11px] font-mono text-zinc-300 flex items-center gap-1 font-bold">
          <span className="text-red-500 text-sm">ඞ</span>
          <span>Among Us ({crewmates.length})</span>
        </span>
        <div className="w-px h-3.5 bg-zinc-700 mx-1"></div>
        <button
          onClick={spawnCrewmate}
          className="flex items-center gap-1 rounded bg-red-600 hover:bg-red-500 text-white px-2 py-0.5 text-[10px] font-mono font-bold transition-colors cursor-pointer"
          title="Spawn another crewmate"
        >
          <Plus className="h-3 w-3" />
          <span>Add Sus</span>
        </button>
        <button
          onClick={onClose}
          className="p-1 text-zinc-400 hover:text-white rounded hover:bg-zinc-800 transition-colors cursor-pointer"
          title="Dismiss Among Us walker"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Walking Crewmates */}
      {crewmates.map((c) => {
        const isFacingLeft = c.vx < 0;

        return (
          <div
            key={c.id}
            id={`amongus-crewmate-${c.id}`}
            className="absolute bottom-2 cursor-pointer pointer-events-auto select-none transition-transform duration-75"
            style={{
              left: `${c.x}px`,
              transform: `scale(${c.scale}) translateY(${c.isJumping ? '-28px' : '0px'})`,
              transition: c.isJumping ? 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)' : 'none',
            }}
            onClick={() => handleCrewmateClick(c.id)}
            title="Click me!"
          >
            {/* Speech Bubble */}
            {c.speech && (
              <div
                className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-1 rounded-md bg-zinc-900 border border-zinc-600 text-[11px] font-bold font-mono text-zinc-100 shadow-lg animate-bounce z-50 pointer-events-none"
                style={{
                  boxShadow: '0 4px 12px rgba(0,0,0,0.6)',
                }}
              >
                <span>{c.speech}</span>
                {/* Speech pointer triangle */}
                <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[6px] border-t-zinc-900"></div>
              </div>
            )}

            {/* Crewmate SVG with authentic waddle walk cycle */}
            <div
              className={`transform transition-transform ${isFacingLeft ? '-scale-x-100' : 'scale-x-100'}`}
              style={{
                animation: 'amongus-waddle 0.28s infinite alternate ease-in-out',
              }}
            >
              {/* Optional Hat */}
              {c.hat === 'party' && (
                <div className="absolute -top-3 left-6 z-10 pointer-events-none">
                  <svg width="20" height="20" viewBox="0 0 20 20">
                    <polygon points="10,0 2,18 18,18" fill="#f59e0b" stroke="#000" strokeWidth="1.5" />
                    <circle cx="10" cy="1" r="2" fill="#ef4444" />
                    <circle cx="6" cy="10" r="1.5" fill="#3b82f6" />
                    <circle cx="14" cy="12" r="1.5" fill="#10b981" />
                  </svg>
                </div>
              )}
              {c.hat === 'sprout' && (
                <div className="absolute -top-3 left-6 z-10 pointer-events-none">
                  <svg width="18" height="18" viewBox="0 0 18 18">
                    <path d="M 9 16 C 9 8, 4 8, 2 5 C 6 5, 9 9, 9 16 Z" fill="#22c55e" stroke="#000" strokeWidth="1.2" />
                    <path d="M 9 16 C 9 8, 14 8, 16 5 C 12 5, 9 9, 9 16 Z" fill="#4ade80" stroke="#000" strokeWidth="1.2" />
                  </svg>
                </div>
              )}
              {c.hat === 'cheese' && (
                <div className="absolute -top-2 left-6 z-10 pointer-events-none">
                  <svg width="20" height="14" viewBox="0 0 20 14">
                    <polygon points="18,12 2,12 10,2" fill="#fbbf24" stroke="#000" strokeWidth="1.5" />
                    <circle cx="8" cy="9" r="1.2" fill="#d97706" />
                    <circle cx="12" cy="7" r="1.2" fill="#d97706" />
                  </svg>
                </div>
              )}

              {/* Master Among Us Crewmate SVG */}
              <svg
                width="64"
                height="70"
                viewBox="0 0 64 70"
                className="drop-shadow-md overflow-visible"
              >
                {/* Floor Shadow */}
                <ellipse cx="32" cy="67" rx="20" ry="3.5" fill="rgba(0, 0, 0, 0.45)" />

                {/* Backpack */}
                <rect
                  x="8"
                  y="22"
                  width="13"
                  height="26"
                  rx="6"
                  fill={c.color.shade}
                  stroke="#09090b"
                  strokeWidth="3.5"
                />

                {/* Main Body with feet */}
                {/* Body Path with 2 legs and crotch gap */}
                <path
                  d="
                    M 20 24
                    C 20 9, 48 9, 48 24
                    L 48 52
                    C 48 57, 45 61, 41 61
                    L 37 61
                    C 33 61, 33 55, 33 50
                    L 29 50
                    C 29 55, 29 61, 25 61
                    L 21 61
                    C 17 61, 14 57, 14 52
                    L 14 28
                    C 14 26, 17 24, 20 24
                    Z
                  "
                  fill={c.color.primary}
                  stroke="#09090b"
                  strokeWidth="3.8"
                  strokeLinejoin="round"
                />

                {/* Body Shadowing curve */}
                <path
                  d="
                    M 26 50
                    L 36 50
                    C 36 56, 36 61, 41 61
                    L 37 61
                    C 33 61, 33 55, 33 50
                    L 29 50
                    C 29 55, 29 61, 25 61
                    L 24 61
                    C 25 58, 26 54, 26 50
                    Z
                  "
                  fill={c.color.shade}
                />
                <path
                  d="
                    M 40 18
                    C 48 22, 48 42, 46 52
                    C 45 42, 44 26, 40 18
                    Z
                  "
                  fill={c.color.shade}
                />

                {/* Visor */}
                <path
                  d="
                    M 32 19
                    C 46 19, 56 22, 56 28
                    C 56 34, 46 37, 32 37
                    C 25 37, 25 19, 32 19
                    Z
                  "
                  fill="#7dd3fc"
                  stroke="#09090b"
                  strokeWidth="3.5"
                />
                {/* Visor dark lower half */}
                <path
                  d="
                    M 26 29
                    C 32 35, 48 35, 54 29
                    C 52 35, 42 36.5, 32 36.5
                    C 27 36.5, 25.5 32, 26 29
                    Z
                  "
                  fill="#38bdf8"
                />
                {/* Visor Glare Reflection */}
                <ellipse
                  cx="40"
                  cy="24"
                  rx="9"
                  ry="3"
                  fill="#ffffff"
                  fillOpacity="0.85"
                  transform="rotate(-6 40 24)"
                />
              </svg>
            </div>
          </div>
        );
      })}

      {/* Global CSS for the Among Us waddle keyframes */}
      <style>{`
        @keyframes amongus-waddle {
          0% {
            transform: rotate(-5deg) translateY(0px);
          }
          50% {
            transform: rotate(0deg) translateY(-4px);
          }
          100% {
            transform: rotate(5deg) translateY(0px);
          }
        }
      `}</style>
    </div>
  );
};
