import React, { useState, useEffect, useRef } from 'react';
import { X, Plus, Compass } from 'lucide-react';

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

const WALL_QUOTES = [
  'Spider-Crewmate!',
  'Look, I can crawl up walls!',
  'Gravity? What gravity?!',
  'Wall hacks enabled!',
  'Sticky suction boots!',
  'Cyan saw me climbing the wall!',
  'Crawling up in Electrical!',
  'SUS on the wall!',
  'Climbing to the top!',
  'Heading back down!',
  'Red is climbing the wall!',
  'Spider-sus, Spider-sus!',
  'No ceiling needed!',
];

const HATS = ['party', 'sprout', 'cheese', 'none'];

export const AmongUsWalker = ({ isActive, onClose }) => {
  const [crewmates, setCrewmates] = useState([
    {
      id: 1,
      edge: 'bottom',
      x: 180,
      y: 0,
      speed: 2.2, // Moving right across floor towards right wall
      scale: 1,
      color: CREWMATE_COLORS[0], // Red
      hat: 'party',
      speech: 'Spider-Crewmate!',
      speechTimer: 180,
      isJumping: false,
    },
    {
      id: 2,
      edge: 'left',
      x: 12,
      y: 360,
      speed: -2.0, // Crawling UP the left wall
      scale: 0.95,
      color: CREWMATE_COLORS[1], // Cyan
      hat: 'sprout',
      speech: 'Crawling up walls!',
      speechTimer: 150,
      isJumping: false,
    },
    {
      id: 3,
      edge: 'right',
      x: 950,
      y: 280,
      speed: 1.9, // Crawling UP the right wall
      scale: 0.9,
      color: CREWMATE_COLORS[2], // Lime
      hat: 'cheese',
      speech: 'No ceiling for me!',
      speechTimer: 160,
      isJumping: false,
    },
  ]);

  const animFrameRef = useRef(null);
  const nextIdRef = useRef(4);

  // Spawn a new random wall-crawling crewmate (floor or side walls only, never ceiling)
  const spawnCrewmate = () => {
    const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 1200;
    const screenHeight = typeof window !== 'undefined' ? window.innerHeight : 800;
    const minX = 12;
    const maxX = Math.max(minX + 100, screenWidth - 76);
    const minY = 64;
    const maxY = Math.max(minY + 100, screenHeight - 76);

    const edges = ['bottom', 'right', 'left']; // No 'top' (no ceiling)
    const randomEdge = edges[Math.floor(Math.random() * edges.length)];
    const randomColor = CREWMATE_COLORS[Math.floor(Math.random() * CREWMATE_COLORS.length)];
    const randomHat = HATS[Math.floor(Math.random() * HATS.length)];
    const speedMagnitude = 1.8 + Math.random() * 1.3;

    let initX = minX;
    let initY = maxY;
    let initSpeed = speedMagnitude;

    if (randomEdge === 'bottom') {
      initX = minX + Math.random() * (maxX - minX);
      initY = maxY;
      initSpeed = (Math.random() > 0.5 ? 1 : -1) * speedMagnitude;
    } else if (randomEdge === 'right') {
      initX = maxX;
      initY = minY + 40 + Math.random() * (maxY - minY - 60);
      initSpeed = (Math.random() > 0.5 ? 1 : -1) * speedMagnitude;
    } else if (randomEdge === 'left') {
      initX = minX;
      initY = minY + 40 + Math.random() * (maxY - minY - 60);
      initSpeed = (Math.random() > 0.5 ? 1 : -1) * speedMagnitude;
    }

    const newMate = {
      id: nextIdRef.current++,
      edge: randomEdge,
      x: initX,
      y: initY,
      speed: initSpeed,
      scale: 0.85 + Math.random() * 0.25,
      color: randomColor,
      hat: randomHat,
      speech: 'I climb walls!',
      speechTimer: 140,
      isJumping: false,
    };

    setCrewmates((prev) => [...prev, newMate]);
  };

  // Flip directions of all crewmates
  const handleFlipAll = () => {
    setCrewmates((prev) =>
      prev.map((c) => ({
        ...c,
        speed: -c.speed,
        isJumping: true,
        speech: 'Turn around!',
        speechTimer: 100,
      }))
    );
    setTimeout(() => {
      setCrewmates((prev) => prev.map((c) => ({ ...c, isJumping: false })));
    }, 350);
  };

  // Click on a crewmate to make them jump off the wall/floor & reverse direction
  const handleCrewmateClick = (id) => {
    setCrewmates((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const randomQuote = WALL_QUOTES[Math.floor(Math.random() * WALL_QUOTES.length)];
          return {
            ...c,
            isJumping: true,
            speech: randomQuote,
            speechTimer: 160,
            speed: -c.speed, // Reverse crawl direction on click
          };
        }
        return c;
      })
    );

    // Reset jump animation after 350ms
    setTimeout(() => {
      setCrewmates((prev) =>
        prev.map((c) => (c.id === id ? { ...c, isJumping: false } : c))
      );
    }, 350);
  };

  // Floor and wall crawl animation loop (NO ceiling)
  useEffect(() => {
    if (!isActive) return;

    let lastTime = performance.now();

    const updateLoop = (currentTime) => {
      const dt = Math.min((currentTime - lastTime) / 16.66, 2.5);
      lastTime = currentTime;

      const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 1200;
      const screenHeight = typeof window !== 'undefined' ? window.innerHeight : 800;

      // Coordinate boundaries: floor and left/right walls only
      const minX = 12;
      const maxX = Math.max(minX + 100, screenWidth - 76);
      const minY = 64; // Highest point they crawl up walls (stops before ceiling)
      const maxY = Math.max(minY + 100, screenHeight - 76); // Floor level

      setCrewmates((prev) =>
        prev.map((c) => {
          let edge = c.edge || 'bottom';
          let x = c.x;
          let y = c.y;
          let speed = c.speed;

          // Safety guard: if ever on top, drop down to floor
          if (edge === 'top') {
            edge = 'bottom';
            y = maxY;
          }

          // State machine for floor and walls
          if (edge === 'bottom') {
            y = maxY;
            x += speed * dt;
            if (speed > 0 && x >= maxX) {
              // Reached right wall -> start crawling UP right wall
              x = maxX;
              edge = 'right';
              speed = Math.abs(speed); // Positive speed crawls UP right wall
            } else if (speed < 0 && x <= minX) {
              // Reached left wall -> start crawling UP left wall
              x = minX;
              edge = 'left';
              speed = -Math.abs(speed); // Negative speed crawls UP left wall
            }
          } else if (edge === 'right') {
            x = maxX;
            if (speed > 0) {
              // Crawling UP right wall towards top
              y -= speed * dt;
              if (y <= minY) {
                // Reached top of wall! Do NOT go on ceiling - reverse and crawl down!
                y = minY;
                speed = -Math.abs(speed);
              }
            } else {
              // Crawling DOWN right wall towards floor
              y -= speed * dt; // speed is negative, so y increases
              if (y >= maxY) {
                // Reached floor! Turn and walk left across floor
                y = maxY;
                edge = 'bottom';
                speed = -Math.abs(speed); // Move left along floor
              }
            }
          } else if (edge === 'left') {
            x = minX;
            if (speed < 0) {
              // Crawling UP left wall towards top
              y += speed * dt; // speed is negative, so y decreases
              if (y <= minY) {
                // Reached top of wall! Do NOT go on ceiling - reverse and crawl down!
                y = minY;
                speed = Math.abs(speed); // Reverse to crawl down
              }
            } else {
              // Crawling DOWN left wall towards floor
              y += speed * dt; // speed is positive, so y increases
              if (y >= maxY) {
                // Reached floor! Turn and walk right across floor
                y = maxY;
                edge = 'bottom';
                speed = Math.abs(speed); // Move right along floor
              }
            }
          }

          // Speech bubble timer management
          let newTimer = c.speechTimer > 0 ? c.speechTimer - dt : 0;
          let speech = c.speech;
          if (newTimer <= 0) {
            speech = '';
            // Occasional spontaneous wall chatter (approx once every 6 seconds per mate)
            if (Math.random() < 0.003) {
              speech = WALL_QUOTES[Math.floor(Math.random() * WALL_QUOTES.length)];
              newTimer = 140;
            }
          }

          return {
            ...c,
            edge,
            x,
            y,
            speed,
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
      id="amongus-wall-crawling-container"
      className="fixed inset-0 z-40 pointer-events-none overflow-hidden"
    >
      {/* Floating Mini Controls Bar for Among Us wall crawler */}
      <div className="absolute right-4 bottom-12 pointer-events-auto flex items-center gap-1.5 bg-zinc-950/90 border border-zinc-700/80 rounded-full px-3 py-1 shadow-xl shadow-black/80 backdrop-blur-xs text-xs z-50 select-none">
        <span className="text-[11px] font-mono text-zinc-300 flex items-center gap-1 font-bold">
          <span className="text-red-500 text-sm">ඞ</span>
          <span>Wall Crawlers ({crewmates.length})</span>
        </span>
        <div className="w-px h-3.5 bg-zinc-700 mx-1"></div>
        <button
          onClick={spawnCrewmate}
          className="flex items-center gap-1 rounded bg-red-600 hover:bg-red-500 text-white px-2 py-0.5 text-[10px] font-mono font-bold transition-colors cursor-pointer"
          title="Spawn another wall crawler"
        >
          <Plus className="h-3 w-3" />
          <span>Add Sus</span>
        </button>
        <button
          onClick={handleFlipAll}
          className="flex items-center gap-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 px-2 py-0.5 text-[10px] font-mono font-bold transition-colors cursor-pointer"
          title="Flip crawl directions"
        >
          <Compass className="h-3 w-3 text-purple-400" />
          <span>Flip</span>
        </button>
        <button
          onClick={onClose}
          className="p-1 text-zinc-400 hover:text-white rounded hover:bg-zinc-800 transition-colors cursor-pointer"
          title="Dismiss Among Us"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Render Wall-Crawling Crewmates */}
      {crewmates.map((c) => {
        const edge = c.edge || 'bottom';

        // Rotation angles so suction feet adhere to the surface:
        // - bottom: feet on floor (0deg)
        // - right: feet on right wall (-90deg)
        // - left: feet on left wall (90deg)
        let rotation = 0;
        if (edge === 'right') rotation = -90;
        else if (edge === 'left') rotation = 90;

        // ScaleX flip: facing forward in the direction of movement
        const flipX = c.speed >= 0 ? 1 : -1;

        // Jump offset direction (jumping away from the wall/floor when clicked)
        let jumpX = 0;
        let jumpY = 0;
        if (c.isJumping) {
          if (edge === 'bottom') jumpY = -30;
          else if (edge === 'right') jumpX = -30;
          else if (edge === 'left') jumpX = 30;
        }

        // Upright speech bubble positioning so it stays readable on-screen
        let bubbleStyle = {};
        if (edge === 'bottom') {
          bubbleStyle = {
            bottom: '76px',
            left: '50%',
            transform: 'translateX(-50%)',
          };
        } else if (edge === 'right') {
          bubbleStyle = {
            right: '76px',
            top: '50%',
            transform: 'translateY(-50%)',
          };
        } else if (edge === 'left') {
          bubbleStyle = {
            left: '76px',
            top: '50%',
            transform: 'translateY(-50%)',
          };
        }

        return (
          <div
            key={c.id}
            id={`amongus-crewmate-${c.id}`}
            className="absolute cursor-pointer pointer-events-auto select-none transition-transform duration-100"
            style={{
              left: `${c.x + jumpX}px`,
              top: `${c.y + jumpY}px`,
              width: '64px',
              height: '70px',
              transition: c.isJumping
                ? 'transform 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                : 'none',
            }}
            onClick={() => handleCrewmateClick(c.id)}
            title="Click to bounce & reverse wall crawler!"
          >
            {/* Always-upright readable Speech Bubble */}
            {c.speech && (
              <div
                className="absolute whitespace-nowrap px-2.5 py-1 rounded-md bg-zinc-900 border border-purple-500/60 text-[11px] font-bold font-mono text-zinc-100 shadow-xl shadow-black/80 z-50 pointer-events-none animate-bounce"
                style={bubbleStyle}
              >
                <span>{c.speech}</span>
                {/* Speech pointer tailored to the edge */}
                {edge === 'bottom' && (
                  <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[6px] border-t-zinc-900" />
                )}
                {edge === 'right' && (
                  <div className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-0 h-0 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent border-l-[6px] border-l-zinc-900" />
                )}
                {edge === 'left' && (
                  <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-0 h-0 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent border-r-[6px] border-r-zinc-900" />
                )}
              </div>
            )}

            {/* Crewmate SVG with rotation aligned to current wall + waddle animation */}
            <div
              className="w-full h-full"
              style={{
                transform: `scale(${c.scale}) rotate(${rotation}deg) scaleX(${flipX})`,
                transformOrigin: 'center center',
              }}
            >
              <div
                style={{
                  animation: 'amongus-wall-waddle 0.26s infinite alternate ease-in-out',
                }}
              >
                {/* Optional Accessory Hats */}
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
                  className="drop-shadow-lg overflow-visible"
                >
                  {/* Wall suction foot shadow */}
                  <ellipse cx="32" cy="67" rx="18" ry="3.5" fill="rgba(0, 0, 0, 0.4)" />

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

                  {/* Main Body with legs & crotch */}
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

                  {/* Body Shadows */}
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
                  {/* Visor lower shadow */}
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
                  {/* Visor reflection */}
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
          </div>
        );
      })}

      {/* Global CSS for wall waddle animation */}
      <style>{`
        @keyframes amongus-wall-waddle {
          0% {
            transform: rotate(-6deg) translateY(0px);
          }
          50% {
            transform: rotate(0deg) translateY(-4px);
          }
          100% {
            transform: rotate(6deg) translateY(0px);
          }
        }
      `}</style>
    </div>
  );
};
