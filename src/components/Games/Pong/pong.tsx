import React, { useRef, useEffect, useState } from 'react';

interface PongProps {
  width?: number;
  height?: number;
  onClose?: () => void;
}

interface GameState {
  running: boolean;
  paused: boolean;
  lastTime: number;
  leftScore: number;
  rightScore: number;
  ball: { x: number; y: number; vx: number; vy: number; r: number };
  leftPaddle: {
    x: number;
    y: number;
    w: number;
    h: number;
    speed: number;
    growUntil: number;
  };
  rightPaddle: {
    x: number;
    y: number;
    w: number;
    h: number;
    speed: number;
    growUntil: number;
  };
  keys: Record<string, boolean>;
  powerup: {
    x: number;
    y: number;
    type: string;
    ttl: number;
    created: number;
  } | null;
  canvasW: number;
  canvasH: number;
}

export default function Pong({
  width = 900,
  height = 520,
  onClose,
}: PongProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const stateRef = useRef<GameState>({
    running: false,
    paused: false,
    lastTime: 0,
    leftScore: 0,
    rightScore: 0,
    ball: { x: 0, y: 0, vx: 0, vy: 0, r: 8 },
    leftPaddle: { x: 20, y: 0, w: 12, h: 90, speed: 420, growUntil: 0 },
    rightPaddle: { x: 0, y: 0, w: 12, h: 90, speed: 420, growUntil: 0 },
    keys: {},
    powerup: null, // {x,y,type,ttl}
    canvasW: 0,
    canvasH: 0,
  });

  const [ui, setUi] = useState({
    running: false,
    paused: false,
    leftScore: 0,
    rightScore: 0,
    soundOn: true,
  });

  // Create audio context lazily
  function getAudioCtx() {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
    }
    return audioCtxRef.current;
  }

  // Simple beep
  function beep(freq = 440, dur = 0.06, type = 'sine', gain = 0.15) {
    if (!ui.soundOn) return;
    const ctx = getAudioCtx();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type as OscillatorType;
    o.frequency.value = freq;
    g.gain.value = gain;
    o.connect(g);
    g.connect(ctx.destination);
    o.start();
    g.gain.setValueAtTime(gain, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
    o.stop(ctx.currentTime + dur + 0.02);
  }

  // reset ball to center with random direction
  function resetBall(state, startRight = Math.random() > 0.5) {
    const { canvasW, canvasH } = state;
    state.ball.x = canvasW / 2;
    state.ball.y = canvasH / 2;
    const speed = 300 + Math.random() * 60;
    const angle = Math.random() * 0.6 - 0.3; // slight vertical
    state.ball.vx = (startRight ? 1 : -1) * (speed * Math.cos(angle));
    state.ball.vy = speed * Math.sin(angle);
  }

  // spawn a powerup occasionally
  function maybeSpawnPowerup(state) {
    if (state.powerup) return;
    if (Math.random() < 0.006) {
      state.powerup = {
        x: 80 + Math.random() * (state.canvasW - 160),
        y: 60 + Math.random() * (state.canvasH - 120),
        type: 'mushroom',
        ttl: 6000 + Math.random() * 7000,
        created: performance.now(),
      };
    }
  }

  // apply powerup effect
  function applyPowerup(state, which) {
    beep(880, 0.08, 'sawtooth', 0.18);
    const p = state.powerup;
    if (!p) return;
    const now = performance.now();
    const until = now + 8000;
    if (which === 'left') {
      state.leftPaddle.h = Math.min(160, state.leftPaddle.h + 50);
      state.leftPaddle.growUntil = until;
    } else {
      state.rightPaddle.h = Math.min(160, state.rightPaddle.h + 50);
      state.rightPaddle.growUntil = until;
    }
    state.powerup = null;
  }

  // handle scoring
  function score(state, who) {
    if (who === 'left') state.leftScore++;
    else state.rightScore++;
    beep(220, 0.14, 'sine', 0.22);
    // shorten paddles back and reset ball
    state.leftPaddle.h = 90;
    state.rightPaddle.h = 90;
    state.leftPaddle.growUntil = 0;
    state.rightPaddle.growUntil = 0;
    resetBall(state, who === 'left' ? false : true);
    setUi((u) => ({
      ...u,
      leftScore: state.leftScore,
      rightScore: state.rightScore,
    }));
  }

  // init/resume game
  function startGame() {
    const state = stateRef.current;
    const canvas = canvasRef.current;
    if (!canvas) return;
    state.canvasW = canvas.width;
    state.canvasH = canvas.height;
    state.leftPaddle.y = (state.canvasH - state.leftPaddle.h) / 2;
    state.rightPaddle.x = state.canvasW - 20 - state.rightPaddle.w;
    state.rightPaddle.y = (state.canvasH - state.rightPaddle.h) / 2;
    state.leftScore = 0;
    state.rightScore = 0;
    resetBall(state, Math.random() > 0.5);
    state.running = true;
    state.paused = false;
    state.lastTime = performance.now();
    setUi((u) => ({
      ...u,
      running: true,
      paused: false,
      leftScore: 0,
      rightScore: 0,
    }));
    loop(state.lastTime);
  }

  function pauseResume() {
    const s = stateRef.current;
    s.paused = !s.paused;
    setUi((u) => ({ ...u, paused: s.paused }));
    if (!s.paused) {
      s.lastTime = performance.now();
      loop(s.lastTime);
    }
  }

  function resetAll() {
    const s = stateRef.current;
    s.running = false;
    s.paused = false;
    s.leftScore = 0;
    s.rightScore = 0;
    s.powerup = null;
    s.keys = {};
    setUi({
      running: false,
      paused: false,
      leftScore: 0,
      rightScore: 0,
      soundOn: ui.soundOn,
    });
    // redraw a cleared canvas
    drawOnce();
  }

  // main loop
  function loop(ts) {
    const state = stateRef.current;
    if (!state.running || state.paused) return;
    const dt = Math.min(40, ts - state.lastTime) / 1000; // clamp dt
    state.lastTime = ts;

    // handle inputs
    const upL = state.keys['KeyW'] || state.keys['ArrowUpLeft']; // alias
    const downL = state.keys['KeyS'] || state.keys['ArrowDownLeft'];
    const upR = state.keys['ArrowUp'];
    const downR = state.keys['ArrowDown'];

    // move paddles with delta
    if (upL) state.leftPaddle.y -= state.leftPaddle.speed * dt;
    if (downL) state.leftPaddle.y += state.leftPaddle.speed * dt;
    if (upR) state.rightPaddle.y -= state.rightPaddle.speed * dt;
    if (downR) state.rightPaddle.y += state.rightPaddle.speed * dt;

    // bounds
    state.leftPaddle.y = Math.max(
      6,
      Math.min(state.canvasH - state.leftPaddle.h - 6, state.leftPaddle.y)
    );
    state.rightPaddle.y = Math.max(
      6,
      Math.min(state.canvasH - state.rightPaddle.h - 6, state.rightPaddle.y)
    );

    // ball movement
    state.ball.x += state.ball.vx * dt;
    state.ball.y += state.ball.vy * dt;

    // top/bottom bounce
    if (state.ball.y - state.ball.r <= 4) {
      state.ball.y = state.ball.r + 4;
      state.ball.vy *= -1;
      beep(900, 0.03, 'triangle', 0.06);
    }
    if (state.ball.y + state.ball.r >= state.canvasH - 4) {
      state.ball.y = state.canvasH - 4 - state.ball.r;
      state.ball.vy *= -1;
      beep(900, 0.03, 'triangle', 0.06);
    }

    // paddle collisions (left)
    if (
      state.ball.x - state.ball.r <=
      state.leftPaddle.x + state.leftPaddle.w
    ) {
      if (
        state.ball.y >= state.leftPaddle.y &&
        state.ball.y <= state.leftPaddle.y + state.leftPaddle.h
      ) {
        state.ball.x = state.leftPaddle.x + state.leftPaddle.w + state.ball.r;
        state.ball.vx *= -1.06; // speed up slightly
        // deflection based on hit position
        const rel =
          (state.ball.y - (state.leftPaddle.y + state.leftPaddle.h / 2)) /
          (state.leftPaddle.h / 2);
        state.ball.vy += rel * 280;
        beep(1200, 0.04, 'sawtooth', 0.12);
      } else {
        // right scores
        score(state, 'right');
      }
    }

    // paddle collisions (right)
    if (state.ball.x + state.ball.r >= state.rightPaddle.x) {
      if (
        state.ball.y >= state.rightPaddle.y &&
        state.ball.y <= state.rightPaddle.y + state.rightPaddle.h
      ) {
        state.ball.x = state.rightPaddle.x - state.ball.r;
        state.ball.vx *= -1.06;
        const rel =
          (state.ball.y - (state.rightPaddle.y + state.rightPaddle.h / 2)) /
          (state.rightPaddle.h / 2);
        state.ball.vy += rel * 280;
        beep(1200, 0.04, 'sawtooth', 0.12);
      } else {
        // left scores
        score(state, 'left');
      }
    }

    // power-up lifecycle
    maybeSpawnPowerup(state);
    if (state.powerup) {
      if (performance.now() - state.powerup.created > state.powerup.ttl)
        state.powerup = null;
      else {
        // collision with ball -> give to whichever paddle is nearer horizontally
        const dxL = Math.abs(state.powerup.x - state.leftPaddle.x);
        const dxR = Math.abs(state.powerup.x - state.rightPaddle.x);
        if (
          Math.hypot(
            state.ball.x - state.powerup.x,
            state.ball.y - state.powerup.y
          ) < 22
        ) {
          const which = dxL < dxR ? 'left' : 'right';
          applyPowerup(state, which);
        }
      }
    }

    // reverse grow after timeout
    const now = performance.now();
    if (state.leftPaddle.growUntil && now > state.leftPaddle.growUntil) {
      state.leftPaddle.h = 90;
      state.leftPaddle.growUntil = 0;
    }
    if (state.rightPaddle.growUntil && now > state.rightPaddle.growUntil) {
      state.rightPaddle.h = 90;
      state.rightPaddle.growUntil = 0;
    }

    // draw
    render(state);

    // request next frame
    rafRef.current = requestAnimationFrame((t) => loop(t));
  }

  // Draw once (clears) - used for reset
  function drawOnce() {
    const state = stateRef.current;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear
    ctx.fillStyle = '#07030b';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw center title
    ctx.fillStyle = '#ff77ff';
    ctx.font = '18px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('PONG — Night Retro', canvas.width / 2, 42);

    // Scores
    ctx.fillStyle = '#fbdafc';
    ctx.font = '26px monospace';
    ctx.fillText(`${state.leftScore}`, canvas.width * 0.25, 70);
    ctx.fillText(`${state.rightScore}`, canvas.width * 0.75, 70);
  }

  // rendering
  function render(state: GameState) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const W = canvas.width;
    const H = canvas.height;

    // background
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#0b0220');
    g.addColorStop(1, '#180016');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    // subtle grid / scanlines
    ctx.globalAlpha = 0.07;
    ctx.fillStyle = '#ff78ff';
    for (let y = 0; y < H; y += 18) {
      ctx.fillRect(0, y, W, 2);
    }
    ctx.globalAlpha = 1;

    // neon center line
    ctx.strokeStyle = 'rgba(255, 0, 255, 0.06)';
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 12]);
    ctx.beginPath();
    ctx.moveTo(W / 2, 40);
    ctx.lineTo(W / 2, H - 40);
    ctx.stroke();
    ctx.setLineDash([]);

    // scores
    ctx.fillStyle = '#ffd7ff';
    ctx.font = `${Math.max(18, Math.floor(W / 36))}px monospace`;
    ctx.textAlign = 'center';
    ctx.fillText(state.leftScore.toString(), W * 0.25, 66);
    ctx.fillText(state.rightScore.toString(), W * 0.75, 66);

    // paddles
    // left
    drawRoundedRect(
      ctx,
      state.leftPaddle.x,
      state.leftPaddle.y,
      state.leftPaddle.w,
      state.leftPaddle.h,
      8,
      '#ff86ff',
      '#a64dff'
    );
    // right
    drawRoundedRect(
      ctx,
      state.rightPaddle.x,
      state.rightPaddle.y,
      state.rightPaddle.w,
      state.rightPaddle.h,
      8,
      '#ff86ff',
      '#a64dff'
    );

    // ball
    drawBall(ctx, state.ball.x, state.ball.y, state.ball.r, '#fff', '#ff7bff');

    // powerup (mushroom)
    if (state.powerup) {
      drawPowerup(ctx, state.powerup.x, state.powerup.y);
    }

    // top label
    ctx.fillStyle = 'rgba(255,200,255,0.06)';
    ctx.font = '12px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('Mario-Pong Mode', 12, 18);

    // bottom hint
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(255,180,255,0.12)';
    ctx.font = '12px monospace';
    ctx.fillText(
      'W/S ←  Arrow ↑/↓ → | Space = Pause | R = Reset',
      W / 2,
      H - 12
    );
  }

  // helper: rounded rectangle with neon gradient
  function drawRoundedRect(ctx, x, y, w, h, r, color1, color2) {
    const grad = ctx.createLinearGradient(x, y, x + w, y + h);
    grad.addColorStop(0, color1);
    grad.addColorStop(1, color2);
    ctx.fillStyle = grad;
    roundRect(ctx, x, y, w, h, r);
    ctx.fill();
    // glow
    ctx.shadowColor = color1;
    ctx.shadowBlur = 18;
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    roundRect(ctx, x - 0.25, y - 0.25, w + 0.5, h + 0.5, r);
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  function drawBall(ctx, x, y, r, color1, color2) {
    const grad = ctx.createRadialGradient(
      x - r * 0.4,
      y - r * 0.6,
      r * 0.2,
      x,
      y,
      r * 1.4
    );
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.3, color1);
    grad.addColorStop(1, color2);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    // small glow
    ctx.shadowColor = color2;
    ctx.shadowBlur = 18;
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  function drawPowerup(ctx, x, y) {
    // simple mushroom icon: cap + stem
    // cap
    ctx.beginPath();
    ctx.fillStyle = '#ff78ff';
    ctx.arc(x, y, 12, Math.PI, 0);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(x - 6, y - 3, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + 6, y - 3, 2.5, 0, Math.PI * 2);
    ctx.fill();
    // stem
    ctx.fillStyle = '#ffdfe8';
    ctx.fillRect(x - 5, y, 10, 10);
    // glow
    ctx.shadowColor = '#ff78ff';
    ctx.shadowBlur = 18;
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  // small canvas utility
  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  // Input handlers
  useEffect(() => {
    const handleKeyDown = (e) => {
      const s = stateRef.current;
      s.keys[e.code] = true;

      // shortcuts
      if (e.code === 'Space') {
        // resume audio context on user gesture
        if (audioCtxRef.current && audioCtxRef.current.state === 'suspended')
          audioCtxRef.current.resume();
        if (!s.running) startGame();
        else pauseResume();
      }
      if (e.key === 'r' || e.key === 'R') {
        resetAll();
      }
      // allow W/S and Arrow keys to also set for left paddle using KeyW/KeyS
    };
    const handleKeyUp = (e) => {
      const s = stateRef.current;
      delete s.keys[e.code];
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ui.soundOn]);

  // pointer/touch controls to drag paddles
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let dragging: string | null = null; // "left" or "right"
    const getRect = () => canvas.getBoundingClientRect();

    function pointerDown(e) {
      const rect = getRect();
      const cx = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
      const cy = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;
      const state = stateRef.current;
      // determine left or right half
      if (cx < rect.width / 2) {
        dragging = 'left';
        state.leftPaddle.y = Math.max(
          6,
          Math.min(
            state.canvasH - state.leftPaddle.h - 6,
            cy - state.leftPaddle.h / 2
          )
        );
      } else {
        dragging = 'right';
        state.rightPaddle.y = Math.max(
          6,
          Math.min(
            state.canvasH - state.rightPaddle.h - 6,
            cy - state.rightPaddle.h / 2
          )
        );
      }
    }
    function pointerMove(e) {
      if (!dragging) return;
      const rect = getRect();
      const cy = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;
      const state = stateRef.current;
      if (dragging === 'left') {
        state.leftPaddle.y = Math.max(
          6,
          Math.min(
            state.canvasH - state.leftPaddle.h - 6,
            cy - state.leftPaddle.h / 2
          )
        );
      } else {
        state.rightPaddle.y = Math.max(
          6,
          Math.min(
            state.canvasH - state.rightPaddle.h - 6,
            cy - state.rightPaddle.h / 2
          )
        );
      }
    }
    function pointerUp() {
      dragging = null;
    }
    canvas.addEventListener('pointerdown', pointerDown);
    window.addEventListener('pointermove', pointerMove);
    window.addEventListener('pointerup', pointerUp);
    canvas.addEventListener('touchstart', pointerDown, { passive: false });
    window.addEventListener('touchmove', pointerMove, { passive: false });
    window.addEventListener('touchend', pointerUp, { passive: false });

    return () => {
      canvas.removeEventListener('pointerdown', pointerDown);
      window.removeEventListener('pointermove', pointerMove);
      window.removeEventListener('pointerup', pointerUp);
      canvas.removeEventListener('touchstart', pointerDown);
      window.removeEventListener('touchmove', pointerMove);
      window.removeEventListener('touchend', pointerUp);
    };
  }, []);

  // initialize canvas size and initial drawing
  useEffect(() => {
    const canvas = canvasRef.current;
    function resize() {
      // keep device pixel ratio in mind
      const ratio = window.devicePixelRatio || 1;
      const containerW = Math.min(width, window.innerWidth - 40);
      const containerH = Math.min(height, window.innerHeight - 160);
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.style.width = `${containerW}px`;
      canvas.style.height = `${containerH}px`;
      canvas.width = Math.floor(containerW * ratio);
      canvas.height = Math.floor(containerH * ratio);
      // scale context
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

      // store pixel dims in stateRef
      const state = stateRef.current;
      state.canvasW = containerW;
      state.canvasH = containerH;
      // reset positions a bit
      state.leftPaddle.x = 20;
      state.rightPaddle.x = containerW - 20 - state.rightPaddle.w;
      if (!state.running) drawOnce();
    }
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // cleanup on unmount
  useEffect(() => {
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        try {
          audioCtxRef.current.close();
        } catch (e) {}
      }
    };
  }, []);

  // small control handlers for UI
  function toggleSound() {
    setUi((u) => ({ ...u, soundOn: !u.soundOn }));
  }

  // simple control UI rendering plus canvas
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-40">
      <div className="bg-gray-900/95 backdrop-blur-md border border-white/20 rounded-xl shadow-2xl max-w-[980px] w-full p-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-pink-300 font-mono text-xl">
              🌙 Mario-Pong — Night Retro
            </div>
            <div className="text-xs text-pink-200/60">
              Theme: neon pink & purple | power-ups enabled
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (!stateRef.current.running) startGame();
                else pauseResume();
              }}
              className="px-3 py-1 rounded-md bg-pink-500/20 hover:bg-pink-500/30 text-pink-100"
            >
              {stateRef.current.running && !stateRef.current.paused
                ? 'Pause'
                : 'Start'}
            </button>
            <button
              onClick={() => resetAll()}
              className="px-3 py-1 rounded-md border border-pink-500/30 text-pink-100"
            >
              Reset
            </button>
            <button
              onClick={() => setUi((u) => ({ ...u, soundOn: !u.soundOn }))}
              className={`px-3 py-1 rounded-md ${
                ui.soundOn ? 'bg-cyan-600/20' : 'bg-gray-800/40'
              } text-pink-100`}
            >
              {ui.soundOn ? 'Sound: On' : 'Sound: Off'}
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="text-white/60 hover:text-white text-xl font-bold w-8 h-8 flex items-center justify-center rounded hover:bg-white/10 transition-colors"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* canvas container */}
        <div
          className="rounded-xl overflow-hidden shadow-[0_10px_40px_rgba(144,38,255,0.12)]"
          style={{ border: '1px solid rgba(255,100,255,0.06)' }}
        >
          <canvas
            ref={canvasRef}
            style={{ display: 'block', background: '#07030b' }}
          />
        </div>

        {/* footer */}
        <div className="flex items-center justify-between mt-3 text-xs text-pink-200/60">
          <div>Controls: W/S (left), ↑/↓ (right) • Space pause • R reset</div>
          <div>
            Score:{' '}
            <span className="font-mono text-pink-100">{ui.leftScore}</span> —{' '}
            <span className="font-mono text-pink-100">{ui.rightScore}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
