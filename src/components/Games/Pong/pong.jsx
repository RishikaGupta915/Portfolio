import React, { useRef, useEffect, useState } from 'react';

export default function PongGame({ onClose }) {
  const canvasRef = useRef(null);
  const canvasWrapRef = useRef(null);
  const modalRef = useRef(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [canvasCssSize, setCanvasCssSize] = useState({ w: 480, h: 320 });

  const BASE_W = 480;
  const BASE_H = 320;

  const renderScaleRef = useRef({ sx: 1, sy: 1 });
  const rafRef = useRef(0);

  const paddleXRef = useRef((BASE_W - 100) / 2);
  const ballRef = useRef({ x: BASE_W / 2, y: BASE_H - 30, dx: 2, dy: -2 });
  const pressedRef = useRef({ left: false, right: false });

  // Dragging states
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const restartGame = () => {
    setScore(0);
    setGameOver(false);
    setGameStarted(true);
    playSound(600, 100); // Game start sound
  };

  const updateCanvasSize = () => {
    const canvas = canvasRef.current;
    const wrap = canvasWrapRef.current;
    if (!canvas || !wrap) return;

    const wrapWidth = wrap.clientWidth;
    const maxHeight = Math.max(180, Math.floor(window.innerHeight * 0.45));
    const aspect = BASE_H / BASE_W;

    let cssW = wrapWidth;
    let cssH = Math.floor(wrapWidth * aspect);
    if (cssH > maxHeight) {
      cssH = maxHeight;
      cssW = Math.floor(cssH / aspect);
    }

    // Keep sane minimums.
    cssW = Math.max(240, Math.floor(cssW));
    cssH = Math.max(160, Math.floor(cssH));

    const dpr = Math.max(1, window.devicePixelRatio || 1);
    canvas.width = Math.floor(cssW * dpr);
    canvas.height = Math.floor(cssH * dpr);
    renderScaleRef.current = {
      sx: canvas.width / BASE_W,
      sy: canvas.height / BASE_H,
    };

    setCanvasCssSize({ w: cssW, h: cssH });
  };

  useEffect(() => {
    updateCanvasSize();
    const wrap = canvasWrapRef.current;
    if (!wrap) return;

    const ro = new ResizeObserver(() => updateCanvasSize());
    ro.observe(wrap);

    const onWinResize = () => updateCanvasSize();
    window.addEventListener('resize', onWinResize);

    return () => {
      ro.disconnect();
      window.removeEventListener('resize', onWinResize);
    };
  }, []);

  // Drag functionality
  const handleMouseDown = (e) => {
    if (e.target.closest('.no-drag')) return;
    setIsDragging(true);
    const rect = modalRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const newX = e.clientX - dragOffset.x;
    const newY = e.clientY - dragOffset.y;
    const modal = modalRef.current;
    if (modal) {
      const modalRect = modal.getBoundingClientRect();
      const maxX = window.innerWidth - modalRect.width;
      const maxY = window.innerHeight - modalRect.height;
      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY)),
      });
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

  // Simple beep function for sound effects
  const playSound = (frequency, duration = 100) => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const audioContext = new AudioCtx();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = 'square';

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + duration / 1000
      );

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration / 1000);
    } catch (_) {
      // Ignore audio errors
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const paddleWidth = 100;
    const paddleHeight = 10;
    const ballRadius = 8;

    function keyDownHandler(e) {
      if (e.key === 'Right' || e.key === 'ArrowRight')
        pressedRef.current.right = true;
      else if (e.key === 'Left' || e.key === 'ArrowLeft')
        pressedRef.current.left = true;
    }

    function keyUpHandler(e) {
      if (e.key === 'Right' || e.key === 'ArrowRight')
        pressedRef.current.right = false;
      else if (e.key === 'Left' || e.key === 'ArrowLeft')
        pressedRef.current.left = false;
    }

    document.addEventListener('keydown', keyDownHandler);
    document.addEventListener('keyup', keyUpHandler);

    function drawPaddle() {
      const paddleX = paddleXRef.current;
      ctx.beginPath();
      ctx.rect(paddleX, BASE_H - paddleHeight - 10, paddleWidth, paddleHeight);
      ctx.fillStyle = '#ff4de3';
      ctx.fill();
      ctx.closePath();
    }

    function drawBall() {
      const { x, y } = ballRef.current;
      ctx.beginPath();
      ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
      ctx.fillStyle = '#ffb3ff';
      ctx.fill();
      ctx.closePath();
    }

    function drawBackground() {
      const gradient = ctx.createLinearGradient(0, 0, BASE_W, BASE_H);
      gradient.addColorStop(0, '#1a001a');
      gradient.addColorStop(1, '#330033');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, BASE_W, BASE_H);
    }

    function draw() {
      if (!canvas || gameOver) return;

      const { sx, sy } = renderScaleRef.current;
      ctx.setTransform(sx, 0, 0, sy, 0, 0);

      drawBackground();
      drawBall();
      drawPaddle();

      const ball = ballRef.current;
      let paddleX = paddleXRef.current;

      const x = ball.x;
      const y = ball.y;
      const dx = ball.dx;
      const dy = ball.dy;

      if (x + dx > BASE_W - ballRadius || x + dx < ballRadius) {
        ball.dx = -dx;
        playSound(800, 50);
      }
      if (y + dy < ballRadius) {
        ball.dy = -dy;
        playSound(800, 50);
      } else if (y + dy > BASE_H - ballRadius - 10) {
        if (x > paddleX && x < paddleX + paddleWidth) {
          ball.dy = -dy;
          playSound(400, 100);
          setScore((prev) => prev + 1);
        } else if (y + dy > BASE_H - ballRadius) {
          setGameOver(true);
          playSound(200, 200);
          return;
        }
      }

      ball.x += ball.dx;
      ball.y += ball.dy;

      const { left, right } = pressedRef.current;
      if (right && paddleX < BASE_W - paddleWidth) paddleX += 7;
      else if (left && paddleX > 0) paddleX -= 7;
      paddleXRef.current = paddleX;

      if (!gameOver) rafRef.current = requestAnimationFrame(draw);
    }

    if (gameStarted && !gameOver) {
      // Initialize positions only when (re)starting.
      if (score === 0) {
        paddleXRef.current = (BASE_W - paddleWidth) / 2;
        ballRef.current = { x: BASE_W / 2, y: BASE_H - 30, dx: 2, dy: -2 };
      }
      draw();
    }

    return () => {
      document.removeEventListener('keydown', keyDownHandler);
      document.removeEventListener('keyup', keyUpHandler);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = 0;
      }
    };
  }, [gameStarted, gameOver, score]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 backdrop-blur-sm">
      <div
        ref={modalRef}
        className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-lg p-4 max-w-lg w-full mx-4 relative shadow-2xl border border-gray-700 select-none"
        style={{
          position: 'fixed',
          left:
            position.x === 0 && position.y === 0 ? '50%' : `${position.x}px`,
          top: position.y === 0 && position.y === 0 ? '50%' : `${position.y}px`,
          transform:
            position.x === 0 && position.y === 0
              ? 'translate(-50%, -50%)'
              : 'none',
        }}
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center justify-between mb-3 p-2 rounded bg-gray-800 bg-opacity-50">
          <h2 className="text-white text-lg font-bold">⚾ Pong</h2>
          <button
            onClick={onClose}
            className="no-drag text-gray-400 hover:text-red-400 text-sm font-bold transition-colors duration-200 px-2 py-1 hover:bg-gray-700 rounded"
          >
            ×
          </button>
        </div>

        <div className="flex flex-col items-center">
          <p className="text-gray-300 text-sm mb-3 text-center">
            Use arrow keys to move the paddle. Keep the ball alive!
          </p>

          <div ref={canvasWrapRef} className="w-full">
            <canvas
              ref={canvasRef}
              style={{
                width: `${canvasCssSize.w}px`,
                height: `${canvasCssSize.h}px`,
                border: '2px solid #ff66cc',
                borderRadius: '10px',
                display: 'block',
                margin: '0 auto',
              }}
              className="no-drag"
            />
          </div>

          <div className="mt-3 text-center">
            <p className="text-pink-300 text-lg">Score: {score}</p>

            {!gameStarted && !gameOver && (
              <button
                onClick={() => setGameStarted(true)}
                className="no-drag mt-2 px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg"
              >
                Start Game
              </button>
            )}

            {gameOver && (
              <div className="mt-2 no-drag">
                <p className="text-red-400 text-lg font-bold">Game Over!</p>
                <p className="text-gray-300">Final Score: {score}</p>
                <button
                  onClick={restartGame}
                  className="mt-2 px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg"
                >
                  Play Again
                </button>
              </div>
            )}

            <p className="text-gray-400 text-sm mt-2">← → Arrow keys to move</p>
          </div>
        </div>
      </div>
    </div>
  );
}
