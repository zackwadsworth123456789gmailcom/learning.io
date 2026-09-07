import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Play,
  RotateCcw,
  Code2,
  Terminal,
  Copy,
  Check,
  Maximize2,
  Minimize2,
  X,
  Download,
  Sparkles,
  Columns,
  Rows,
  Trash2,
  ExternalLink,
  ChevronDown,
  Eye,
  EyeOff,
  Monitor,
} from 'lucide-react';

const JS_PRESETS = [
  {
    name: 'Clicker Mini-Game',
    category: 'Games',
    code: `<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: system-ui, sans-serif;
      text-align: center;
      background: #0f172a;
      color: #f8fafc;
      padding: 30px;
    }
    .cookie {
      font-size: 80px;
      cursor: pointer;
      user-select: none;
      transition: transform 0.1s;
      display: inline-block;
    }
    .cookie:active {
      transform: scale(0.88);
    }
    .count {
      font-size: 32px;
      font-weight: bold;
      color: #fbbf24;
      margin: 15px 0;
    }
    button {
      background: #3b82f6;
      color: white;
      border: none;
      padding: 10px 18px;
      border-radius: 8px;
      font-weight: bold;
      cursor: pointer;
      margin: 5px;
    }
    button:hover {
      background: #2563eb;
    }
    .log-box {
      font-family: monospace;
      font-size: 12px;
      color: #94a3b8;
      margin-top: 20px;
    }
  </style>
</head>
<body>
  <h2>🍪 Quick JS Cookie Clicker</h2>
  <div id="cookieBtn" class="cookie">🍪</div>
  <div class="count"><span id="score">0</span> Cookies</div>
  <div>
    <button id="upgradeBtn">Buy Auto-Clicker (Cost: 15)</button>
    <button id="resetBtn">Reset</button>
  </div>
  <div class="log-box" id="log">Click the cookie to start baking!</div>

  <script>
    let cookies = 0;
    let autoClickers = 0;
    const scoreEl = document.getElementById('score');
    const logEl = document.getElementById('log');

    document.getElementById('cookieBtn').addEventListener('click', () => {
      cookies++;
      updateDisplay();
      console.log('Baked a cookie! Total:', cookies);
    });

    document.getElementById('upgradeBtn').addEventListener('click', () => {
      if (cookies >= 15) {
        cookies -= 15;
        autoClickers++;
        logEl.textContent = 'Purchased an Auto-Clicker! (' + autoClickers + ' active)';
        console.log('Purchased Auto-Clicker. Active count:', autoClickers);
        updateDisplay();
      } else {
        alert('Need at least 15 cookies!');
      }
    });

    document.getElementById('resetBtn').addEventListener('click', () => {
      cookies = 0;
      autoClickers = 0;
      logEl.textContent = 'Game reset to 0.';
      updateDisplay();
      console.log('Game reset.');
    });

    setInterval(() => {
      if (autoClickers > 0) {
        cookies += autoClickers;
        updateDisplay();
      }
    }, 1000);

    function updateDisplay() {
      scoreEl.textContent = cookies;
    }
  </script>
</body>
</html>`,
  },
  {
    name: 'Bouncing Physics Canvas',
    category: 'Graphics',
    code: `<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      margin: 0;
      background: #0f172a;
      overflow: hidden;
      font-family: system-ui, -apple-system, sans-serif;
      color: #f1f5f9;
      text-align: center;
      padding: 12px;
      user-select: none;
    }
    .hud {
      display: flex;
      justify-content: center;
      gap: 16px;
      margin-bottom: 8px;
      font-size: 13px;
      font-family: monospace;
    }
    .badge {
      background: #1e293b;
      padding: 4px 10px;
      border-radius: 6px;
      border: 1px solid #334155;
    }
    .highlight { color: #38bdf8; font-weight: bold; }
    .accent { color: #f43f5e; font-weight: bold; }
    canvas {
      display: block;
      margin: 0 auto;
      background: #020617;
      border: 2px solid #334155;
      border-radius: 10px;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5);
      cursor: crosshair;
    }
    .controls {
      margin-top: 10px;
      display: flex;
      justify-content: center;
      gap: 8px;
    }
    button {
      background: #334155;
      color: #f8fafc;
      border: 1px solid #475569;
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 11px;
      font-family: monospace;
      font-weight: bold;
      cursor: pointer;
      transition: all 0.15s;
    }
    button:hover {
      background: #475569;
      color: #38bdf8;
    }
    button.active {
      background: #0284c7;
      border-color: #38bdf8;
    }
  </style>
</head>
<body>
  <div class="hud">
    <div class="badge">Balls: <span id="ball-count" class="highlight">0</span></div>
    <div class="badge">Collisions: <span id="col-count" class="accent">0</span></div>
    <div class="badge hidden-sm">Click canvas to launch!</div>
  </div>

  <canvas id="c" width="440" height="280"></canvas>

  <div class="controls">
    <button id="add-btn">+ Add 5 Balls</button>
    <button id="grav-btn" class="active">Gravity: ON</button>
    <button id="clear-btn">Clear All</button>
  </div>

  <script>
    const canvas = document.getElementById('c');
    const ctx = canvas.getContext('2d');
    const ballCountEl = document.getElementById('ball-count');
    const colCountEl = document.getElementById('col-count');
    const gravBtn = document.getElementById('grav-btn');

    let balls = [];
    let collisionCount = 0;
    let gravityEnabled = true;
    const colors = [
      '#f43f5e', '#ec4899', '#d946ef', '#a855f7',
      '#6366f1', '#3b82f6', '#06b6d4', '#10b981',
      '#84cc16', '#eab308', '#f97316'
    ];

    function spawnBall(x, y, vx, vy, r) {
      balls.push({
        x: x !== undefined ? x : Math.random() * (canvas.width - 40) + 20,
        y: y !== undefined ? y : Math.random() * 60 + 20,
        vx: vx !== undefined ? vx : (Math.random() - 0.5) * 8,
        vy: vy !== undefined ? vy : (Math.random() - 0.5) * 6,
        radius: r !== undefined ? r : Math.random() * 10 + 8,
        color: colors[Math.floor(Math.random() * colors.length)],
        flash: 0
      });
      ballCountEl.textContent = balls.length;
    }

    // Spawn 8 initial balls with various velocities
    for (let i = 0; i < 8; i++) spawnBall();

    // Click canvas to spawn ball toward click or with random force
    canvas.addEventListener('click', (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      spawnBall(x, y, (Math.random() - 0.5) * 10, (Math.random() - 0.5) * 10);
    });

    document.getElementById('add-btn').addEventListener('click', () => {
      for (let i = 0; i < 5; i++) spawnBall();
    });

    document.getElementById('clear-btn').addEventListener('click', () => {
      balls = [];
      collisionCount = 0;
      ballCountEl.textContent = '0';
      colCountEl.textContent = '0';
    });

    gravBtn.addEventListener('click', () => {
      gravityEnabled = !gravityEnabled;
      gravBtn.textContent = gravityEnabled ? 'Gravity: ON' : 'Gravity: OFF';
      gravBtn.className = gravityEnabled ? 'active' : '';
    });

    function loop() {
      // Semi-transparent background for subtle motion trails
      ctx.fillStyle = 'rgba(2, 6, 23, 0.35)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 1. Move balls and apply gravity
      balls.forEach(b => {
        if (gravityEnabled) {
          b.vy += 0.2; // Gravity force
        }
        b.x += b.vx;
        b.y += b.vy;

        // Air drag
        b.vx *= 0.998;
        b.vy *= 0.998;

        // Bounce walls with restitution
        const restitution = 0.88;
        if (b.x - b.radius < 0) {
          b.x = b.radius;
          b.vx = Math.abs(b.vx) * restitution;
        } else if (b.x + b.radius > canvas.width) {
          b.x = canvas.width - b.radius;
          b.vx = -Math.abs(b.vx) * restitution;
        }

        if (b.y - b.radius < 0) {
          b.y = b.radius;
          b.vy = Math.abs(b.vy) * restitution;
        } else if (b.y + b.radius > canvas.height) {
          b.y = canvas.height - b.radius;
          b.vy = -Math.abs(b.vy) * restitution;
        }

        if (b.flash > 0) b.flash--;
      });

      // 2. Ball-to-ball collision detection and 2D elastic response
      for (let i = 0; i < balls.length; i++) {
        for (let j = i + 1; j < balls.length; j++) {
          const b1 = balls[i];
          const b2 = balls[j];

          const dx = b2.x - b1.x;
          const dy = b2.y - b1.y;
          const dist = Math.hypot(dx, dy);
          const minDist = b1.radius + b2.radius;

          if (dist < minDist && dist > 0.0001) {
            // Normal unit vector
            const nx = dx / dist;
            const ny = dy / dist;

            // Separate overlapping balls to prevent sticking
            const overlap = minDist - dist;
            b1.x -= nx * (overlap * 0.5);
            b1.y -= ny * (overlap * 0.5);
            b2.x += nx * (overlap * 0.5);
            b2.y += ny * (overlap * 0.5);

            // Relative velocity
            const rvx = b1.vx - b2.vx;
            const rvy = b1.vy - b2.vy;

            // Velocity along normal
            const velAlongNormal = rvx * nx + rvy * ny;

            // Only resolve if balls are moving toward each other
            if (velAlongNormal > 0) {
              // Mass proportional to area (radius squared)
              const m1 = b1.radius * b1.radius;
              const m2 = b2.radius * b2.radius;

              // Restitution (elasticity)
              const e = 0.92;
              const impulse = ((1 + e) * velAlongNormal) / (1 / m1 + 1 / m2);

              b1.vx -= (impulse / m1) * nx;
              b1.vy -= (impulse / m1) * ny;
              b2.vx += (impulse / m2) * nx;
              b2.vy += (impulse / m2) * ny;

              // Visual feedback
              b1.flash = 4;
              b2.flash = 4;
              collisionCount++;
              colCountEl.textContent = collisionCount;
            }
          }
        }
      }

      // 3. Draw all balls
      balls.forEach(b => {
        ctx.save();
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);

        // Flash white on impact
        if (b.flash > 0) {
          ctx.fillStyle = '#ffffff';
          ctx.shadowColor = '#ffffff';
          ctx.shadowBlur = 12;
        } else {
          ctx.fillStyle = b.color;
          ctx.shadowColor = b.color;
          ctx.shadowBlur = 8;
        }
        ctx.fill();

        // Subtle specular highlight for 3D sphere look
        ctx.beginPath();
        ctx.arc(b.x - b.radius * 0.3, b.y - b.radius * 0.3, b.radius * 0.35, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.fill();

        ctx.restore();
      });

      requestAnimationFrame(loop);
    }
    loop();
  </script>
</body>
</html>`,
  },
  {
    name: 'Bouncing DVD Logo Game',
    category: 'Games',
    code: `<!DOCTYPE html>
<html>
<head>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; user-select: none; }
    body {
      background: #000000;
      color: #ffffff;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace;
      overflow: hidden;
      height: 100vh;
      display: flex;
      flex-direction: column;
    }
    #game-container {
      position: relative;
      flex: 1;
      width: 100%;
      height: 100%;
      background: radial-gradient(circle at center, #0a0a0f 0%, #000 100%);
      overflow: hidden;
    }
    /* DVD Logo Element */
    .dvd-logo {
      position: absolute;
      will-change: transform;
      cursor: grab;
      filter: drop-shadow(0 0 16px currentColor);
      transition: color 0.15s ease-out;
    }
    /* Top HUD stats like bouncingdvdlogo.com */
    .hud {
      position: absolute;
      top: 14px;
      left: 0;
      right: 0;
      display: flex;
      justify-content: center;
      gap: 16px;
      pointer-events: none;
      z-index: 20;
    }
    .stat-pill {
      background: rgba(20, 20, 25, 0.75);
      border: 1px solid rgba(255, 255, 255, 0.12);
      backdrop-filter: blur(8px);
      padding: 6px 14px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 0.5px;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .stat-pill.corner {
      border-color: rgba(251, 191, 36, 0.5);
      color: #fbbf24;
      background: rgba(40, 30, 10, 0.8);
    }
    .val {
      font-family: monospace;
      font-size: 14px;
      font-weight: 800;
      color: #38bdf8;
    }
    .stat-pill.corner .val {
      color: #f59e0b;
    }
    /* Floating Bottom Controls */
    .controls-bar {
      position: absolute;
      bottom: 14px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      align-items: center;
      gap: 8px;
      background: rgba(15, 15, 20, 0.85);
      border: 1px solid rgba(255, 255, 255, 0.15);
      backdrop-filter: blur(10px);
      padding: 6px 12px;
      border-radius: 24px;
      z-index: 20;
    }
    .btn {
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: #cbd5e1;
      padding: 5px 10px;
      border-radius: 14px;
      font-size: 11px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s;
    }
    .btn:hover {
      background: rgba(255, 255, 255, 0.2);
      color: #fff;
    }
    .btn.active {
      background: #38bdf8;
      color: #042f49;
      border-color: #38bdf8;
    }
    /* Corner Hit Celebration Overlay */
    #celebration {
      position: absolute;
      inset: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: rgba(0, 0, 0, 0.75);
      z-index: 50;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.3s;
    }
    #celebration.show {
      opacity: 1;
    }
    .banner {
      font-size: 38px;
      font-weight: 900;
      color: #fbbf24;
      text-shadow: 0 0 30px #f59e0b, 0 0 60px #fbbf24;
      letter-spacing: 2px;
      animation: pulse 0.5s infinite alternate;
    }
    @keyframes pulse {
      from { transform: scale(1); }
      to { transform: scale(1.08); }
    }
    .sub {
      font-size: 16px;
      color: #f1f5f9;
      margin-top: 8px;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div id="game-container">
    <div class="hud">
      <div class="stat-pill">
        <span>Bounces:</span>
        <span id="bounces-val" class="val">0</span>
      </div>
      <div class="stat-pill corner">
        <span>🏆 Corner Hits:</span>
        <span id="corners-val" class="val">0</span>
      </div>
      <div class="stat-pill">
        <span>Nearest Corner:</span>
        <span id="dist-val" class="val">--</span>
      </div>
    </div>

    <!-- Celebration Popup -->
    <div id="celebration">
      <div class="banner">⭐ CORNER HIT! ⭐</div>
      <div class="sub">The legendary DVD corner bounce achieved!</div>
    </div>

    <!-- Controls Bar -->
    <div class="controls-bar">
      <button id="speed-btn" class="btn">Speed: 1x</button>
      <button id="sound-btn" class="btn active">Sound: ON</button>
      <button id="add-dvd-btn" class="btn">+ DVD</button>
      <button id="corner-test-btn" class="btn" title="Simulate a corner hit celebration">Test Corner</button>
      <button id="reset-btn" class="btn">Reset</button>
    </div>
  </div>

  <script>
    const container = document.getElementById('game-container');
    const bouncesEl = document.getElementById('bounces-val');
    const cornersEl = document.getElementById('corners-val');
    const distEl = document.getElementById('dist-val');
    const celebrationEl = document.getElementById('celebration');
    const speedBtn = document.getElementById('speed-btn');
    const soundBtn = document.getElementById('sound-btn');

    let totalBounces = 0;
    let totalCorners = 0;
    let soundEnabled = true;
    let speedMultiplier = 1;
    const speeds = [1, 1.75, 2.5, 4];
    let speedIdx = 0;

    const COLORS = [
      '#ff0055', '#00ffcc', '#ffcc00', '#3b82f6',
      '#a855f7', '#10b981', '#f97316', '#ec4899', '#38bdf8'
    ];

    // Web Audio Synthesizer for Retro Bounces and Victory Fanfare
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    function playBounceSound(freq = 440) {
      if (!soundEnabled || audioCtx.state === 'suspended') return;
      try {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(freq * 0.5, audioCtx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.08);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.08);
      } catch (e) {}
    }

    function playCornerFanfare() {
      if (!soundEnabled || audioCtx.state === 'suspended') return;
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        setTimeout(() => {
          try {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
            gain.gain.setValueAtTime(0.35, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.35);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.35);
          } catch(e) {}
        }, idx * 90);
      });
    }

    // DVD SVG Template
    function createDvdSvg(w, h) {
      return \`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 84" width="\${w}" height="\${h}">
          <ellipse cx="80" cy="62" rx="66" ry="14" fill="none" stroke="currentColor" stroke-width="4.5"/>
          <ellipse cx="80" cy="62" rx="18" ry="4" fill="none" stroke="currentColor" stroke-width="2"/>
          <text x="80" y="46" font-family="'Arial Black', Impact, sans-serif" font-weight="900" font-size="44" font-style="italic" text-anchor="middle" fill="currentColor" letter-spacing="-1">DVD</text>
          <rect x="36" y="68" width="88" height="13" rx="2" fill="currentColor"/>
          <text x="80" y="78" font-family="Arial, sans-serif" font-weight="bold" font-size="9" fill="#000" text-anchor="middle" letter-spacing="3">VIDEO</text>
        </svg>
      \`;
    }

    class DvdLogo {
      constructor() {
        this.w = 140;
        this.h = 74;
        this.x = Math.random() * (container.clientWidth - this.w - 40) + 20;
        this.y = Math.random() * (container.clientHeight - this.h - 40) + 20;
        const angle = Math.random() * Math.PI * 2;
        const speed = 2.4;
        this.vx = Math.cos(angle) * speed || 2;
        this.vy = Math.sin(angle) * speed || 2;
        this.colorIdx = Math.floor(Math.random() * COLORS.length);

        this.el = document.createElement('div');
        this.el.className = 'dvd-logo';
        this.el.innerHTML = createDvdSvg(this.w, this.h);
        this.el.style.color = COLORS[this.colorIdx];
        container.appendChild(this.el);
        this.updatePos();
      }

      updatePos() {
        this.el.style.transform = \`translate3d(\${this.x}px, \${this.y}px, 0)\`;
      }

      changeColor() {
        this.colorIdx = (this.colorIdx + 1 + Math.floor(Math.random() * (COLORS.length - 1))) % COLORS.length;
        this.el.style.color = COLORS[this.colorIdx];
      }

      destroy() {
        this.el.remove();
      }
    }

    const dvds = [new DvdLogo()];

    function triggerCornerCelebration() {
      totalCorners++;
      cornersEl.textContent = totalCorners;
      playCornerFanfare();
      celebrationEl.classList.add('show');
      setTimeout(() => {
        celebrationEl.classList.remove('show');
      }, 2500);
    }

    // Animation Loop
    function update() {
      const cw = container.clientWidth;
      const ch = container.clientHeight;

      dvds.forEach((dvd) => {
        dvd.x += dvd.vx * speedMultiplier;
        dvd.y += dvd.vy * speedMultiplier;

        let hitX = false;
        let hitY = false;

        // Bounce Right
        if (dvd.x + dvd.w >= cw) {
          dvd.x = cw - dvd.w;
          dvd.vx = -Math.abs(dvd.vx);
          hitX = true;
        }
        // Bounce Left
        else if (dvd.x <= 0) {
          dvd.x = 0;
          dvd.vx = Math.abs(dvd.vx);
          hitX = true;
        }

        // Bounce Bottom
        if (dvd.y + dvd.h >= ch) {
          dvd.y = ch - dvd.h;
          dvd.vy = -Math.abs(dvd.vy);
          hitY = true;
        }
        // Bounce Top
        else if (dvd.y <= 0) {
          dvd.y = 0;
          dvd.vy = Math.abs(dvd.vy);
          hitY = true;
        }

        // Check Wall or Corner Hit
        if (hitX || hitY) {
          totalBounces++;
          bouncesEl.textContent = totalBounces;
          dvd.changeColor();

          // Corner Hit: simultaneous or close boundary collision
          if (hitX && hitY) {
            triggerCornerCelebration();
          } else {
            playBounceSound(hitX ? 480 : 360);
          }
        }

        dvd.updatePos();

        // Calculate distance to nearest 4 corners for first DVD
        if (dvd === dvds[0]) {
          const dTopLeft = Math.hypot(dvd.x, dvd.y);
          const dTopRight = Math.hypot(cw - (dvd.x + dvd.w), dvd.y);
          const dBottomLeft = Math.hypot(dvd.x, ch - (dvd.y + dvd.h));
          const dBottomRight = Math.hypot(cw - (dvd.x + dvd.w), ch - (dvd.y + dvd.h));
          const nearest = Math.min(dTopLeft, dTopRight, dBottomLeft, dBottomRight);
          distEl.textContent = Math.round(nearest) + 'px';
        }
      });

      requestAnimationFrame(update);
    }
    requestAnimationFrame(update);

    // Controls
    speedBtn.addEventListener('click', () => {
      speedIdx = (speedIdx + 1) % speeds.length;
      speedMultiplier = speeds[speedIdx];
      speedBtn.textContent = 'Speed: ' + speedMultiplier + 'x';
    });

    soundBtn.addEventListener('click', () => {
      soundEnabled = !soundEnabled;
      if (soundEnabled && audioCtx.state === 'suspended') audioCtx.resume();
      soundBtn.textContent = soundEnabled ? 'Sound: ON' : 'Sound: OFF';
      soundBtn.className = soundEnabled ? 'btn active' : 'btn';
    });

    document.getElementById('add-dvd-btn').addEventListener('click', () => {
      if (dvds.length < 8) {
        dvds.push(new DvdLogo());
      }
    });

    document.getElementById('corner-test-btn').addEventListener('click', () => {
      triggerCornerCelebration();
    });

    document.getElementById('reset-btn').addEventListener('click', () => {
      totalBounces = 0;
      totalCorners = 0;
      bouncesEl.textContent = '0';
      cornersEl.textContent = '0';
      while (dvds.length > 1) {
        const d = dvds.pop();
        d.destroy();
      }
    });

    // Tap anywhere to unlock audio context & nudge DVD
    window.addEventListener('pointerdown', () => {
      if (audioCtx.state === 'suspended') audioCtx.resume();
    });
  </script>
</body>
</html>`,
  },
  {
    name: 'Interactive Calculator',
    category: 'Utility',
    code: `<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: system-ui, sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      margin: 0;
      background: #09090b;
    }
    .calc {
      background: #18181b;
      padding: 16px;
      border-radius: 12px;
      border: 1px solid #27272a;
      width: 240px;
    }
    #screen {
      width: 100%;
      height: 48px;
      background: #09090b;
      color: #4ade80;
      font-size: 24px;
      font-family: monospace;
      text-align: right;
      padding: 8px 12px;
      border: 1px solid #27272a;
      border-radius: 6px;
      box-sizing: border-box;
      margin-bottom: 12px;
    }
    .keys {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 8px;
    }
    button {
      padding: 12px;
      font-size: 16px;
      font-weight: bold;
      border: none;
      border-radius: 6px;
      background: #27272a;
      color: #f4f4f5;
      cursor: pointer;
    }
    button:hover { background: #3f3f46; }
    button.op { background: #6366f1; }
    button.op:hover { background: #4f46e5; }
    button.clear { background: #ef4444; }
  </style>
</head>
<body>
  <div class="calc">
    <input type="text" id="screen" value="0" readonly />
    <div class="keys">
      <button class="clear" onclick="clearScreen()">C</button>
      <button class="op" onclick="press('/')">/</button>
      <button class="op" onclick="press('*')">×</button>
      <button class="op" onclick="press('-')">-</button>
      <button onclick="press('7')">7</button>
      <button onclick="press('8')">8</button>
      <button onclick="press('9')">9</button>
      <button class="op" onclick="press('+')">+</button>
      <button onclick="press('4')">4</button>
      <button onclick="press('5')">5</button>
      <button onclick="press('6')">6</button>
      <button class="op" onclick="calculate()">=</button>
      <button onclick="press('1')">1</button>
      <button onclick="press('2')">2</button>
      <button onclick="press('3')">3</button>
      <button onclick="press('0')">0</button>
    </div>
  </div>

  <script>
    const screen = document.getElementById('screen');
    let expr = '';

    function press(val) {
      if (expr === '0' && val !== '.') expr = '';
      expr += val;
      screen.value = expr;
      console.log('Key:', val, '=> Current:', expr);
    }

    function clearScreen() {
      expr = '0';
      screen.value = expr;
      console.log('Cleared screen.');
    }

    function calculate() {
      try {
        const result = Function('"use strict";return (' + expr + ')')();
        console.log('Evaluated:', expr, '=', result);
        screen.value = result;
        expr = String(result);
      } catch (err) {
        screen.value = 'Error';
        console.error('Calculation Error:', err.message);
      }
    }
  </script>
</body>
</html>`,
  },
  {
    name: 'Console & Object Inspector',
    category: 'Learning',
    code: `<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: monospace;
      padding: 20px;
      background: #0f172a;
      color: #38bdf8;
    }
    h3 { color: #f8fafc; margin-top: 0; }
    button {
      background: #0ea5e9;
      color: white;
      border: none;
      padding: 8px 14px;
      border-radius: 4px;
      font-weight: bold;
      cursor: pointer;
      margin-right: 8px;
    }
    button:hover { background: #0284c7; }
    #out {
      background: #020617;
      padding: 12px;
      border-radius: 6px;
      border: 1px solid #1e293b;
      margin-top: 15px;
      white-space: pre-wrap;
      color: #a7f3d0;
    }
  </style>
</head>
<body>
  <h3>JavaScript Console & Array Explorer</h3>
  <p>Test various console log methods, array transformations, and timer logs.</p>
  <button onclick="testLogs()">Run Console Tests</button>
  <button onclick="calculatePrimes()">Compute Primes (1-50)</button>

  <div id="out">Click a button above to run code and inspect output in both the DOM and Console below!</div>

  <script>
    function testLogs() {
      console.log("=== Basic Log Output ===");
      console.log("String message:", "Hello from TryIt!");
      console.log("Numerical math:", { sum: 40 + 2, pi: Math.PI });
      console.warn("Sample warning: High memory allocation mock");
      console.error("Sample error: 404 Simulated Resource Not Found");

      const heroes = [
        { name: 'Mario', role: 'Plumber', power: 95 },
        { name: 'Link', role: 'Hero of Time', power: 99 },
        { name: 'Samus', role: 'Bounty Hunter', power: 98 }
      ];
      console.log("Array of Objects:", heroes);

      document.getElementById('out').textContent =
        "Logs printed! Check the 'Console Output' panel at the bottom of the editor.";
    }

    function calculatePrimes() {
      const primes = [];
      for (let i = 2; i <= 50; i++) {
        let isPrime = true;
        for (let j = 2; j <= Math.sqrt(i); j++) {
          if (i % j === 0) { isPrime = false; break; }
        }
        if (isPrime) primes.push(i);
      }
      console.log("Primes found up to 50:", primes);
      document.getElementById('out').textContent =
        "Primes (1-50): " + primes.join(", ");
    }
  </script>
</body>
</html>`,
  },
  {
    name: 'Precision Stopwatch',
    category: 'Utility',
    code: `<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: system-ui, sans-serif;
      text-align: center;
      background: #18181b;
      color: white;
      padding: 40px 20px;
    }
    .time {
      font-size: 54px;
      font-family: monospace;
      font-weight: 800;
      color: #38bdf8;
      letter-spacing: 2px;
      margin: 20px 0;
    }
    button {
      padding: 10px 20px;
      margin: 4px;
      font-size: 14px;
      font-weight: bold;
      border-radius: 6px;
      border: none;
      cursor: pointer;
    }
    .start { background: #22c55e; color: white; }
    .stop { background: #ef4444; color: white; }
    .reset { background: #71717a; color: white; }
    ul {
      list-style: none;
      padding: 0;
      max-width: 260px;
      margin: 20px auto 0;
      text-align: left;
      font-family: monospace;
      color: #a1a1aa;
      font-size: 13px;
    }
    li {
      padding: 4px 8px;
      border-bottom: 1px solid #27272a;
      display: flex;
      justify-content: space-between;
    }
  </style>
</head>
<body>
  <h2>⏱️ JavaScript Stopwatch</h2>
  <div class="time" id="display">00:00.000</div>
  <div>
    <button class="start" id="startBtn" onclick="toggle()">Start</button>
    <button class="reset" onclick="lap()">Lap</button>
    <button class="reset" onclick="reset()">Reset</button>
  </div>
  <ul id="laps"></ul>

  <script>
    let startTime = 0;
    let elapsed = 0;
    let timerId = null;
    let running = false;
    const display = document.getElementById('display');
    const startBtn = document.getElementById('startBtn');
    const lapsEl = document.getElementById('laps');

    function format(ms) {
      const m = Math.floor(ms / 60000).toString().padStart(2, '0');
      const s = Math.floor((ms % 60000) / 1000).toString().padStart(2, '0');
      const milli = (ms % 1000).toString().padStart(3, '0');
      return m + ':' + s + '.' + milli;
    }

    function toggle() {
      if (!running) {
        startTime = Date.now() - elapsed;
        timerId = setInterval(() => {
          elapsed = Date.now() - startTime;
          display.textContent = format(elapsed);
        }, 33);
        running = true;
        startBtn.textContent = 'Pause';
        startBtn.className = 'stop';
        console.log('Stopwatch started');
      } else {
        clearInterval(timerId);
        running = false;
        startBtn.textContent = 'Resume';
        startBtn.className = 'start';
        console.log('Stopwatch paused at:', format(elapsed));
      }
    }

    function lap() {
      if (elapsed === 0) return;
      const li = document.createElement('li');
      li.innerHTML = '<span>Lap ' + (lapsEl.children.length + 1) + '</span><span>' + format(elapsed) + '</span>';
      lapsEl.prepend(li);
      console.log('Lap recorded:', format(elapsed));
    }

    function reset() {
      clearInterval(timerId);
      running = false;
      elapsed = 0;
      display.textContent = '00:00.000';
      startBtn.textContent = 'Start';
      startBtn.className = 'start';
      lapsEl.innerHTML = '';
      console.log('Stopwatch reset');
    }
  </script>
</body>
</html>`,
  },
];

export const JsTryItEditorModal = ({ isOpen, onClose }) => {
  const [code, setCode] = useState(() => {
    return localStorage.getItem('unblocked_tryit_code') || JS_PRESETS[0].code;
  });
  const [selectedPreset, setSelectedPreset] = useState(JS_PRESETS[0].name);
  const [logs, setLogs] = useState([]);
  const [isConsoleOpen, setIsConsoleOpen] = useState(true);
  const [layoutMode, setLayoutMode] = useState('columns'); // 'columns' | 'rows'
  const [viewMode, setViewMode] = useState('both'); // 'both' | 'result-only' | 'code-only'
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [runTrigger, setRunTrigger] = useState(0);

  const iframeRef = useRef(null);
  const textareaRef = useRef(null);

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('unblocked_tryit_code', code);
    } catch {}
  }, [code]);

  // Handle messages posted from iframe for console.log interception
  useEffect(() => {
    const handleWindowMessage = (e) => {
      if (!e.data || e.data.source !== 'w3-tryit-runner') return;
      const { type, message, timestamp } = e.data;
      setLogs((prev) => [
        ...prev.slice(-150),
        { type, message, time: timestamp || new Date().toLocaleTimeString() },
      ]);
    };
    window.addEventListener('message', handleWindowMessage);
    return () => window.removeEventListener('message', handleWindowMessage);
  }, []);

  // Compile the code with console hooks and security
  const generateSrcDoc = useCallback((sourceCode) => {
    // Injected bridge script that catches console.log, console.warn, console.error and uncaught errors
    const bridgeScript = `
      <script>
        (function() {
          function sendLog(type, args) {
            try {
              const formatted = Array.from(args).map(arg => {
                if (typeof arg === 'object') {
                  try { return JSON.stringify(arg); } catch(e) { return String(arg); }
                }
                return String(arg);
              }).join(' ');

              window.parent.postMessage({
                source: 'w3-tryit-runner',
                type: type,
                message: formatted,
                timestamp: new Date().toLocaleTimeString()
              }, '*');
            } catch(err) {}
          }

          const _log = console.log;
          const _warn = console.warn;
          const _error = console.error;

          console.log = function() { sendLog('log', arguments); _log.apply(console, arguments); };
          console.warn = function() { sendLog('warn', arguments); _warn.apply(console, arguments); };
          console.error = function() { sendLog('error', arguments); _error.apply(console, arguments); };

          window.onerror = function(msg, url, line, col, error) {
            sendLog('error', ['[Runtime Error: Line ' + line + ']: ' + msg]);
            return false;
          };
        })();
      </script>
    `;

    // Check if source code already has <html> or <head>
    if (sourceCode.includes('<html') || sourceCode.includes('<head>') || sourceCode.includes('<!DOCTYPE')) {
      // Inject bridge script right at top of document
      return bridgeScript + sourceCode;
    } else {
      // Pure JS or HTML fragment: wrap nicely
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: system-ui, sans-serif; padding: 16px; margin: 0; background: #0f172a; color: #f8fafc; }
          </style>
          ${bridgeScript}
        </head>
        <body>
          <div id="app"></div>
          <script>
            try {
              ${sourceCode}
            } catch (err) {
              console.error("[Script Error]: " + err.message);
            }
          </script>
        </body>
        </html>
      `;
    }
  }, []);

  // Run code
  const handleRun = () => {
    setLogs((prev) => [
      ...prev,
      { type: 'info', message: '▶ Executing JavaScript...', time: new Date().toLocaleTimeString() },
    ]);
    setRunTrigger((prev) => prev + 1);
  };

  // Keyboard shortcut: Ctrl+Enter or Cmd+Enter to Run
  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleRun();
    }
    // Tab key indentation support in textarea
    if (e.key === 'Tab') {
      e.preventDefault();
      const target = e.target;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const newCode = code.substring(0, start) + '  ' + code.substring(end);
      setCode(newCode);
      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + 2;
      }, 0);
    }
  };

  const handleSelectPreset = (presetName) => {
    const found = JS_PRESETS.find((p) => p.name === presetName);
    if (found) {
      setCode(found.code);
      setSelectedPreset(found.name);
      setLogs([]);
      setRunTrigger((prev) => prev + 1);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([code], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tryit_script.html';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClearLogs = () => {
    setLogs([]);
  };

  const handleResetCode = () => {
    const current = JS_PRESETS.find((p) => p.name === selectedPreset) || JS_PRESETS[0];
    setCode(current.code);
    setLogs([]);
    setRunTrigger((prev) => prev + 1);
  };

  if (!isOpen) return null;

  return (
    <div
      id="js-tryit-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xs p-2 sm:p-4 overflow-hidden"
    >
      <div
        className={`flex flex-col bg-zinc-900 border border-zinc-700/80 rounded-lg shadow-2xl overflow-hidden transition-all duration-200 ${
          isFullscreen
            ? 'w-full h-full rounded-none border-0'
            : 'w-full max-w-6xl h-[92vh] max-h-[950px]'
        }`}
      >
        {/* W3Schools Signature Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800 bg-zinc-950 px-3 py-2 shrink-0">
          {/* Brand / Title & Preset Select */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-[#04AA6D] text-white shadow-xs font-black text-xs">
                W3
              </div>
              <span className="font-bold text-xs sm:text-sm text-white tracking-tight">
                Tryit Editor <span className="text-[#04AA6D] font-mono text-[11px]">v4.0 JS</span>
              </span>
            </div>

            {/* Presets dropdown */}
            <div className="relative">
              <select
                id="tryit-preset-selector"
                value={selectedPreset}
                onChange={(e) => handleSelectPreset(e.target.value)}
                className="bg-zinc-800 hover:bg-zinc-750 text-zinc-200 text-xs rounded border border-zinc-700 px-2 py-1 font-mono focus:outline-none focus:border-[#04AA6D] cursor-pointer"
              >
                {JS_PRESETS.map((p) => (
                  <option key={p.name} value={p.name}>
                    {p.name} ({p.category})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Core Controls: Run » Button, View Mode (Hide Code / Show Code & vice versa), Layout, Fullscreen, Close */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* W3Schools Signature Green Run Button */}
            <button
              id="tryit-run-btn"
              onClick={handleRun}
              className="flex items-center gap-1.5 rounded bg-[#04AA6D] hover:bg-[#059862] text-white px-3.5 py-1.5 text-xs font-bold transition-transform active:scale-95 shadow-sm cursor-pointer"
              title="Execute JavaScript (Ctrl+Enter)"
            >
              <Play className="h-3.5 w-3.5 fill-white" />
              <span>Run »</span>
            </button>

            {/* Primary Toggle: Hide Code / Show Code */}
            <button
              id="tryit-toggle-code-btn"
              onClick={() => setViewMode((v) => (v === 'result-only' ? 'both' : 'result-only'))}
              className={`flex items-center gap-1.5 rounded px-2.5 py-1.5 text-xs font-mono font-semibold transition-all cursor-pointer ${
                viewMode === 'result-only'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 hover:bg-amber-500/30'
                  : 'bg-zinc-800 text-zinc-300 border border-zinc-700 hover:bg-zinc-750 hover:text-white'
              }`}
              title={viewMode === 'result-only' ? 'Show Code (Restore Code Editor)' : 'Hide Code (Show Result Only)'}
            >
              {viewMode === 'result-only' ? (
                <>
                  <Eye className="h-3.5 w-3.5 text-amber-400" />
                  <span>Show Code</span>
                </>
              ) : (
                <>
                  <EyeOff className="h-3.5 w-3.5 text-zinc-400" />
                  <span>Hide Code</span>
                </>
              )}
            </button>

            {/* Vice Versa: Hide Result / Show Result */}
            <button
              id="tryit-toggle-result-btn"
              onClick={() => setViewMode((v) => (v === 'code-only' ? 'both' : 'code-only'))}
              className={`hidden sm:flex items-center gap-1.5 rounded px-2.5 py-1.5 text-xs font-mono font-semibold transition-all cursor-pointer ${
                viewMode === 'code-only'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 hover:bg-amber-500/30'
                  : 'bg-zinc-800 text-zinc-300 border border-zinc-700 hover:bg-zinc-750 hover:text-white'
              }`}
              title={viewMode === 'code-only' ? 'Show Result (Restore Result Preview)' : 'Hide Result (Show Code Only)'}
            >
              {viewMode === 'code-only' ? (
                <>
                  <Eye className="h-3.5 w-3.5 text-amber-400" />
                  <span>Show Result</span>
                </>
              ) : (
                <>
                  <EyeOff className="h-3.5 w-3.5 text-zinc-400" />
                  <span>Hide Result</span>
                </>
              )}
            </button>

            {/* Segmented View Mode Switcher */}
            <div className="hidden lg:flex items-center rounded bg-zinc-900 border border-zinc-750 p-0.5 text-xs">
              <button
                id="tryit-view-both"
                onClick={() => setViewMode('both')}
                className={`px-2 py-1 rounded text-[10px] font-mono transition-colors cursor-pointer ${
                  viewMode === 'both'
                    ? 'bg-[#04AA6D] text-white font-bold'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
                title="Show both Code and Result"
              >
                Both
              </button>
              <button
                id="tryit-view-result"
                onClick={() => setViewMode('result-only')}
                className={`px-2 py-1 rounded text-[10px] font-mono transition-colors cursor-pointer ${
                  viewMode === 'result-only'
                    ? 'bg-[#04AA6D] text-white font-bold'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
                title="Hide code - Result Only"
              >
                Result Only
              </button>
              <button
                id="tryit-view-code"
                onClick={() => setViewMode('code-only')}
                className={`px-2 py-1 rounded text-[10px] font-mono transition-colors cursor-pointer ${
                  viewMode === 'code-only'
                    ? 'bg-[#04AA6D] text-white font-bold'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
                title="Hide result - Code Only"
              >
                Code Only
              </button>
            </div>

            {/* Layout switch: Columns / Rows (Only active when both panes visible) */}
            {viewMode === 'both' && (
              <button
                id="tryit-layout-toggle"
                onClick={() => setLayoutMode((m) => (m === 'columns' ? 'rows' : 'columns'))}
                className="hidden md:flex items-center gap-1 rounded bg-zinc-800 border border-zinc-700 px-2 py-1.5 text-xs font-mono text-zinc-300 hover:bg-zinc-750 hover:text-white transition-colors cursor-pointer"
                title={`Switch layout (Current: ${layoutMode})`}
              >
                {layoutMode === 'columns' ? <Rows className="h-3.5 w-3.5" /> : <Columns className="h-3.5 w-3.5" />}
                <span className="text-[10px]">{layoutMode === 'columns' ? 'Stacked' : 'Split'}</span>
              </button>
            )}

            {/* Console Terminal Toggle / Remove in header */}
            <button
              id="tryit-header-console-toggle-btn"
              onClick={() => setIsConsoleOpen((c) => !c)}
              className={`hidden md:flex items-center gap-1 rounded border px-2 py-1.5 text-xs font-mono transition-colors cursor-pointer ${
                isConsoleOpen
                  ? 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:text-rose-300 hover:bg-rose-950/40 hover:border-rose-800/60'
                  : 'bg-zinc-850 border-zinc-750 text-zinc-400 hover:text-emerald-300 hover:bg-zinc-800'
              }`}
              title={isConsoleOpen ? 'Remove console terminal' : 'Show console terminal'}
            >
              <Terminal className="h-3.5 w-3.5" />
              <span className="text-[10px]">{isConsoleOpen ? 'Remove Console' : 'Show Console'}</span>
            </button>

            {/* Reset */}
            <button
              id="tryit-reset-btn"
              onClick={handleResetCode}
              className="flex items-center gap-1 rounded bg-zinc-800 border border-zinc-700 px-2 py-1.5 text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-750 transition-colors cursor-pointer"
              title="Reset code to original preset"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>

            {/* Copy */}
            <button
              id="tryit-copy-btn"
              onClick={handleCopyCode}
              className="flex items-center gap-1 rounded bg-zinc-800 border border-zinc-700 px-2 py-1.5 text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-750 transition-colors cursor-pointer"
              title="Copy source code"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            </button>

            {/* Download */}
            <button
              id="tryit-download-btn"
              onClick={handleDownload}
              className="hidden md:flex items-center gap-1 rounded bg-zinc-800 border border-zinc-700 px-2 py-1.5 text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-750 transition-colors cursor-pointer"
              title="Download HTML file"
            >
              <Download className="h-3.5 w-3.5" />
            </button>

            {/* Fullscreen */}
            <button
              id="tryit-fullscreen-btn"
              onClick={() => setIsFullscreen((f) => !f)}
              className="flex items-center gap-1 rounded bg-zinc-800 border border-zinc-700 px-2 py-1.5 text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-750 transition-colors cursor-pointer"
              title="Toggle Fullscreen"
            >
              {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
            </button>

            {/* Close */}
            <button
              id="tryit-close-btn"
              onClick={onClose}
              className="flex h-7 w-7 items-center justify-center rounded bg-zinc-800 text-zinc-400 hover:bg-rose-950/60 hover:text-rose-400 transition-colors cursor-pointer"
              title="Close editor (Esc)"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Workbench Area */}
        <div
          className={`flex-1 flex overflow-hidden ${
            layoutMode === 'columns' ? 'flex-col md:flex-row' : 'flex-col'
          }`}
        >
          {/* Left / Top Pane: Code Editor */}
          <div
            className={`flex flex-col border-zinc-800 bg-zinc-950 overflow-hidden ${
              viewMode === 'result-only'
                ? 'hidden'
                : viewMode === 'code-only'
                ? 'w-full h-full'
                : layoutMode === 'columns'
                ? 'w-full md:w-1/2 border-b md:border-b-0 md:border-r h-1/2 md:h-full'
                : 'w-full h-1/2 border-b'
            }`}
          >
            {/* Editor Subheader */}
            <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs font-mono text-zinc-400 select-none shrink-0">
              <div className="flex items-center gap-2">
                <Code2 className="h-3.5 w-3.5 text-emerald-400" />
                <span className="font-bold text-zinc-300">Source Code:</span>
                <span className="text-[10px] text-zinc-500">HTML / JavaScript</span>
                {viewMode === 'code-only' && (
                  <span className="text-[10px] text-amber-400/90 bg-amber-950/40 border border-amber-800/50 px-1.5 py-0.5 rounded">
                    Result Hidden (Code Fullscreen)
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode(viewMode === 'code-only' ? 'both' : 'result-only')}
                  className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer bg-zinc-800/80 hover:bg-zinc-800 px-2 py-0.5 rounded border border-zinc-700/60"
                  title={viewMode === 'code-only' ? 'Show Result' : 'Hide Code (Show Result Only)'}
                >
                  {viewMode === 'code-only' ? <Eye className="h-3 w-3 text-emerald-400" /> : <EyeOff className="h-3 w-3" />}
                  <span>{viewMode === 'code-only' ? 'Show Result' : 'Hide Code'}</span>
                </button>
                <div className="text-[10px] text-zinc-500 hidden sm:block">
                  Press <kbd className="rounded bg-zinc-800 px-1 py-0.5 text-zinc-300">Ctrl+Enter</kbd> to Run
                </div>
              </div>
            </div>

            {/* Code Textarea with line numbers feeling */}
            <div className="relative flex-1 flex overflow-hidden">
              <textarea
                id="tryit-code-textarea"
                ref={textareaRef}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                onKeyDown={handleKeyDown}
                spellCheck={false}
                placeholder="Write your HTML and JavaScript here..."
                className="w-full h-full resize-none p-3 font-mono text-xs sm:text-[13px] leading-relaxed bg-[#0d1117] text-zinc-200 focus:outline-none selection:bg-[#04AA6D]/30 border-0"
              />
            </div>
          </div>

          {/* Right / Bottom Pane: Sandboxed Execution Result */}
          <div
            className={`flex flex-col bg-zinc-900 overflow-hidden ${
              viewMode === 'code-only'
                ? 'hidden'
                : viewMode === 'result-only'
                ? 'w-full h-full'
                : layoutMode === 'columns'
                ? 'w-full md:w-1/2 h-1/2 md:h-full'
                : 'w-full h-1/2'
            }`}
          >
            {/* Result Subheader */}
            <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs font-mono text-zinc-400 select-none shrink-0">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-bold text-zinc-300">Result:</span>
                <span className="text-[10px] text-zinc-500">Sandboxed Preview</span>
                {viewMode === 'result-only' && (
                  <span className="text-[10px] text-amber-400/90 bg-amber-950/40 border border-amber-800/50 px-1.5 py-0.5 rounded">
                    Code Hidden (Result Fullscreen)
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode(viewMode === 'result-only' ? 'both' : 'code-only')}
                  className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer bg-zinc-800/80 hover:bg-zinc-800 px-2 py-0.5 rounded border border-zinc-700/60"
                  title={viewMode === 'result-only' ? 'Show Code' : 'Hide Result (Show Code Only)'}
                >
                  {viewMode === 'result-only' ? <Eye className="h-3 w-3 text-emerald-400" /> : <EyeOff className="h-3 w-3" />}
                  <span>{viewMode === 'result-only' ? 'Show Code' : 'Hide Result'}</span>
                </button>

                {/* Console drawer toggle / remove button */}
                <button
                  id="tryit-toggle-console-btn"
                  onClick={() => setIsConsoleOpen((c) => !c)}
                  className={`flex items-center gap-1.5 text-[11px] rounded px-2 py-0.5 transition-colors cursor-pointer font-mono ${
                    isConsoleOpen
                      ? 'bg-rose-950/40 text-rose-300 hover:bg-rose-900/50 hover:text-white border border-rose-800/60'
                      : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-750 hover:text-white border border-zinc-700'
                  }`}
                  title={isConsoleOpen ? 'Remove console terminal' : 'Show console terminal'}
                >
                  {isConsoleOpen ? (
                    <>
                      <X className="h-3 w-3 text-rose-400" />
                      <span>Remove Console</span>
                    </>
                  ) : (
                    <>
                      <Terminal className="h-3 w-3 text-emerald-400" />
                      <span>Show Console ({logs.length})</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Main Result Iframe */}
            <div className="flex-1 bg-white relative overflow-hidden flex flex-col">
              <iframe
                key={runTrigger}
                ref={iframeRef}
                id="tryit-result-frame"
                title="W3Schools TryIt JS Preview"
                srcDoc={generateSrcDoc(code)}
                sandbox="allow-scripts allow-modals allow-forms allow-popups"
                className="w-full flex-1 border-0 block bg-white"
              />

              {/* Floating restore button when console is removed */}
              {!isConsoleOpen && (
                <button
                  id="tryit-restore-console-btn"
                  onClick={() => setIsConsoleOpen(true)}
                  className="absolute bottom-3 right-3 z-10 flex items-center gap-1.5 bg-zinc-900/90 hover:bg-zinc-850 text-zinc-300 hover:text-white border border-zinc-700/80 px-2.5 py-1 rounded-md shadow-lg text-[11px] font-mono transition-transform active:scale-95 cursor-pointer backdrop-blur-xs"
                  title="Open console terminal"
                >
                  <Terminal className="h-3 w-3 text-emerald-400" />
                  <span>Terminal</span>
                  {logs.length > 0 && (
                    <span className="bg-emerald-500/20 text-emerald-300 text-[10px] px-1 rounded font-bold">
                      {logs.length}
                    </span>
                  )}
                </button>
              )}

              {/* Live Console Terminal Drawer */}
              {isConsoleOpen && (
                <div
                  id="tryit-console-drawer"
                  className="h-36 sm:h-44 border-t border-zinc-800 bg-zinc-950 flex flex-col shrink-0 font-mono text-xs"
                >
                  <div className="flex items-center justify-between border-b border-zinc-800/80 bg-zinc-900/90 px-3 py-1 text-[11px] text-zinc-400">
                    <div className="flex items-center gap-2">
                      <Terminal className="h-3 w-3 text-emerald-400" />
                      <span className="font-bold text-zinc-300">Console Terminal</span>
                      <span className="text-[10px] text-zinc-500">Live output & errors</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={handleClearLogs}
                        className="text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer flex items-center gap-1 text-[10px] bg-zinc-800 hover:bg-zinc-750 px-2 py-0.5 rounded border border-zinc-700/60"
                        title="Clear console output"
                      >
                        <Trash2 className="h-3 w-3" />
                        <span>Clear</span>
                      </button>
                      <button
                        id="tryit-remove-console-drawer-btn"
                        onClick={() => setIsConsoleOpen(false)}
                        className="text-rose-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1 text-[10px] bg-rose-950/40 hover:bg-rose-900/60 px-2 py-0.5 rounded border border-rose-800/60 font-semibold"
                        title="Remove console terminal"
                      >
                        <X className="h-3 w-3 text-rose-400" />
                        <span>Remove Console</span>
                      </button>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-2 space-y-1 select-text">
                    {logs.length === 0 ? (
                      <div className="text-zinc-600 italic text-[11px] py-2 text-center">
                        No console logs yet. Use console.log() in your code or trigger actions to inspect output.
                      </div>
                    ) : (
                      logs.map((log, index) => {
                        let colorClass = 'text-zinc-300';
                        if (log.type === 'error') colorClass = 'text-rose-400 bg-rose-950/30 px-1 rounded';
                        if (log.type === 'warn') colorClass = 'text-amber-400 bg-amber-950/30 px-1 rounded';
                        if (log.type === 'info') colorClass = 'text-sky-400 font-bold';

                        return (
                          <div key={index} className={`flex items-start gap-2 text-[11px] ${colorClass}`}>
                            <span className="text-zinc-600 text-[10px] shrink-0">{log.time}</span>
                            <span className="shrink-0 font-bold">
                              {log.type === 'error' ? '✖' : log.type === 'warn' ? '⚠' : '›'}
                            </span>
                            <span className="break-all whitespace-pre-wrap">{log.message}</span>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Bar */}
        <div className="flex items-center justify-between border-t border-zinc-800 bg-zinc-950 px-3 py-1.5 text-[11px] font-mono text-zinc-500 shrink-0">
          <div>
            Tryit Editor • Interactive Sandboxed JavaScript Runner
          </div>
          <div className="flex items-center gap-3">
            <span>Lines: {code.split('\n').length}</span>
            <span>Chars: {code.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
