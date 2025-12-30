import React, { useState, useEffect, useRef } from 'react';
import DraggableWindow from '../../Dragable/dragable';

const gridSize = 15;
const tileCount = 16;

const SnakeGame = ({ onClose }) => {
  const [snake, setSnake] = useState([{ x: 10, y: 10 }]);
  const [fruit, setFruit] = useState({ x: 15, y: 15 });
  const [direction, setDirection] = useState({ x: 0, y: 0 });
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  // Customization states
  const [snakeColor, setSnakeColor] = useState('#ff66cc'); // default pink
  const [fruitType, setFruitType] = useState('🍒');
  const [background, setBackground] = useState();

  const canvasRef = useRef(null);

  // Sound effect function
  const playSound = (frequency, duration = 100) => {
    try {
      const audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
      oscillator.type = 'square';

      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + duration / 1000
      );

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration / 1000);
    } catch (error) {
      // Silently handle browsers that don't support audio
    }
  };

  // Handle keyboard input
  const handleKeyDown = (e) => {
    if (!gameStarted) return;

    switch (e.key) {
      case 'ArrowUp':
      case 'w':
        if (direction.y === 0) setDirection({ x: 0, y: -1 });
        break;
      case 'ArrowDown':
      case 's':
        if (direction.y === 0) setDirection({ x: 0, y: 1 });
        break;
      case 'ArrowLeft':
      case 'a':
        if (direction.x === 0) setDirection({ x: -1, y: 0 });
        break;
      case 'ArrowRight':
      case 'd':
        if (direction.x === 0) setDirection({ x: 1, y: 0 });
        break;
      default:
        break;
    }
  };

  // Game loop
  useEffect(() => {
    if (gameOver || !gameStarted || (direction.x === 0 && direction.y === 0))
      return;

    const interval = setInterval(() => {
      setSnake((currentSnake) => {
        const newSnake = [...currentSnake];
        const head = {
          x: newSnake[0].x + direction.x,
          y: newSnake[0].y + direction.y,
        };

        // Check collision
        if (
          head.x < 0 ||
          head.y < 0 ||
          head.x >= tileCount ||
          head.y >= tileCount ||
          newSnake.some(
            (segment) => segment.x === head.x && segment.y === head.y
          )
        ) {
          setGameOver(true);
          playSound(200, 300); // Game over sound
          return currentSnake;
        }

        newSnake.unshift(head);

        if (head.x === fruit.x && head.y === fruit.y) {
          setScore((prevScore) => prevScore + 1);
          playSound(800, 150); // Fruit eaten sound
          setFruit({
            x: Math.floor(Math.random() * tileCount),
            y: Math.floor(Math.random() * tileCount),
          });
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    }, 200); // Slowed down from 150ms to 200ms

    return () => clearInterval(interval);
  }, [direction, gameOver, gameStarted, fruit]);

  // Drawing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas with gradient background
    const gradient = ctx.createLinearGradient(
      0,
      0,
      canvas.width,
      canvas.height
    );
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(0.5, '#16213e');
    gradient.addColorStop(1, '#0f0c29');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid pattern
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= tileCount; i++) {
      ctx.beginPath();
      ctx.moveTo(i * gridSize, 0);
      ctx.lineTo(i * gridSize, canvas.height);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, i * gridSize);
      ctx.lineTo(canvas.width, i * gridSize);
      ctx.stroke();
    }

    // Draw snake
    snake.forEach((segment, index) => {
      const x = segment.x * gridSize;
      const y = segment.y * gridSize;

      // Create gradient for each segment
      const segmentGradient = ctx.createRadialGradient(
        x + gridSize / 2,
        y + gridSize / 2,
        0,
        x + gridSize / 2,
        y + gridSize / 2,
        gridSize / 2
      );

      if (index === 0) {
        // Head - brighter and more prominent
        segmentGradient.addColorStop(0, snakeColor);
        segmentGradient.addColorStop(0.7, snakeColor + 'CC');
        segmentGradient.addColorStop(1, snakeColor + '66');

        // Draw head with glow effect
        ctx.shadowColor = snakeColor;
        ctx.shadowBlur = 10;
        ctx.fillStyle = segmentGradient;
        ctx.fillRect(x + 2, y + 2, gridSize - 4, gridSize - 4);

        // Draw eyes
        ctx.shadowBlur = 0;
        ctx.fillStyle = 'white';
        ctx.fillRect(x + 4, y + 4, 3, 3);
        ctx.fillRect(x + gridSize - 7, y + 4, 3, 3);
        ctx.fillStyle = 'black';
        ctx.fillRect(x + 5, y + 5, 1, 1);
        ctx.fillRect(x + gridSize - 6, y + 5, 1, 1);
      } else {
        // Body segments
        const opacity = Math.max(0.3, 1 - index * 0.05);
        segmentGradient.addColorStop(
          0,
          snakeColor +
            Math.floor(opacity * 255)
              .toString(16)
              .padStart(2, '0')
        );
        segmentGradient.addColorStop(
          0.7,
          snakeColor +
            Math.floor(opacity * 200)
              .toString(16)
              .padStart(2, '0')
        );
        segmentGradient.addColorStop(
          1,
          snakeColor +
            Math.floor(opacity * 100)
              .toString(16)
              .padStart(2, '0')
        );

        ctx.shadowColor = snakeColor;
        ctx.shadowBlur = 5;
        ctx.fillStyle = segmentGradient;

        // Rounded rectangles for body segments
        const radius = 3;
        ctx.beginPath();
        ctx.roundRect(x + 1, y + 1, gridSize - 2, gridSize - 2, radius);
        ctx.fill();
      }

      // Add border to each segment
      ctx.shadowBlur = 0;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 1;
      ctx.strokeRect(x + 1, y + 1, gridSize - 2, gridSize - 2);
    });

    // Draw fruit
    const fruitX = fruit.x * gridSize;
    const fruitY = fruit.y * gridSize;

    // Draw fruit background circle
    ctx.fillStyle = 'rgba(255, 255, 0, 0.3)';
    ctx.beginPath();
    ctx.arc(
      fruitX + gridSize / 2,
      fruitY + gridSize / 2,
      gridSize / 2,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Draw the emoji fruit
    ctx.shadowBlur = 0;
    ctx.font = `${gridSize - 2}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(fruitType, fruitX + gridSize / 2, fruitY + gridSize / 2);
  }, [snake, fruit, snakeColor, fruitType]);

  useEffect(() => {
    const handleKeyDownWrapper = (e) => handleKeyDown(e);
    window.addEventListener('keydown', handleKeyDownWrapper);
    return () => window.removeEventListener('keydown', handleKeyDownWrapper);
  }, [direction, gameStarted]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 backdrop-blur-sm">
      <DraggableWindow className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-lg p-3 max-w-sm w-full mx-4 relative shadow-2xl border border-gray-700 select-none">
        {/* Title bar for dragging */}
        <div
          data-drag-handle
          className="flex items-center justify-between mb-2 p-1 rounded bg-gray-800 bg-opacity-50 cursor-move select-none"
        >
          <h1 className="text-sm font-bold bg-gradient-to-r from-pink-400 to-purple-600 bg-clip-text text-transparent">
            Snake
          </h1>
          <button
            onClick={onClose}
            className="no-drag text-gray-400 hover:text-red-400 text-sm font-bold transition-colors duration-200 px-2 py-1 hover:bg-gray-700 rounded"
          >
            ×
          </button>
        </div>

        <div className="flex flex-col items-center justify-center text-white">
          {/* Score display */}
          <div className="flex items-center justify-center gap-3 text-xs mb-2">
            <div className="bg-gray-800 px-2 py-1 rounded border border-gray-600">
              <span className="text-gray-300">Score: </span>
              <span className="text-pink-400 font-bold">{score}</span>
            </div>
            <div className="bg-gray-800 px-2 py-1 rounded border border-gray-600">
              <span className="text-gray-300">Length: </span>
              <span className="text-green-400 font-bold">{snake.length}</span>
            </div>
          </div>

          {/* Game Canvas */}
          <div className="relative mb-3 no-drag">
            <canvas
              ref={canvasRef}
              width={gridSize * tileCount}
              height={gridSize * tileCount}
              className="border border-pink-500 rounded shadow-lg bg-gray-900"
            />
            {/* Game overlay effects */}
            {gameStarted && !gameOver && (
              <div className="absolute top-1 right-1 text-xs text-gray-400 bg-black bg-opacity-50 px-1 py-0.5 rounded">
                WASD
              </div>
            )}
          </div>

          {/* Game Controls */}
          {!gameStarted && !gameOver && (
            <div className="text-center no-drag">
              <button
                className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 rounded hover:from-green-700 hover:to-green-800 text-white font-bold text-sm transition-all duration-200"
                onClick={() => {
                  setGameStarted(true);
                  setDirection({ x: 1, y: 0 }); // Start moving right
                  playSound(600, 100); // Game start sound
                }}
              >
                Start
              </button>
              <div className="mt-2 p-2 bg-gray-800 rounded border border-gray-600 max-w-xs">
                <p className="text-xs text-gray-300 mb-1">
                  <span className="text-pink-400 font-semibold">Controls:</span>
                </p>
                <div className="grid grid-cols-2 gap-1 text-xs text-gray-400">
                  <div>↑ W</div>
                  <div>↓ S</div>
                  <div>← A</div>
                  <div>→ D</div>
                </div>
              </div>
            </div>
          )}

          {gameOver && (
            <div className="text-center no-drag">
              <div className="bg-red-900 bg-opacity-30 border border-red-500 rounded p-3 mb-2">
                <h2 className="text-lg text-red-400 font-bold mb-1">
                  Game Over!
                </h2>
                <p className="text-xs text-gray-300">
                  Score:{' '}
                  <span className="text-pink-400 font-bold">{score}</span> |
                  Length:{' '}
                  <span className="text-green-400 font-bold">
                    {snake.length}
                  </span>
                </p>
              </div>
              <button
                className="px-4 py-2 bg-gradient-to-r from-pink-600 to-pink-700 rounded hover:from-pink-700 hover:to-pink-800 text-white font-bold text-sm transition-all duration-200"
                onClick={() => {
                  setSnake([{ x: 10, y: 10 }]);
                  setFruit({ x: 15, y: 15 });
                  setDirection({ x: 0, y: 0 });
                  setScore(0);
                  setGameOver(false);
                  setGameStarted(false);
                  playSound(600, 100); // Restart sound
                }}
              >
                Restart
              </button>
            </div>
          )}

          {/* Customization options */}
          <div className="mt-3 w-full no-drag">
            <h3 className="text-sm font-bold text-center mb-2 text-gray-200">
              Customize
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-800 p-2 rounded border border-gray-600">
                <h4 className="mb-1 font-semibold text-pink-400 text-center text-xs">
                  Color
                </h4>
                <div className="flex justify-center">
                  <input
                    type="color"
                    value={snakeColor}
                    onChange={(e) => setSnakeColor(e.target.value)}
                    className="w-8 h-8 rounded border border-gray-600 cursor-pointer"
                  />
                </div>
              </div>

              <div className="bg-gray-800 p-2 rounded border border-gray-600">
                <h4 className="mb-1 font-semibold text-green-400 text-center text-xs">
                  Fruit
                </h4>
                <select
                  value={fruitType}
                  onChange={(e) => setFruitType(e.target.value)}
                  className="w-full p-0.5 bg-gray-700 text-white rounded border border-gray-600 text-center text-xs"
                >
                  <option value="🍎">🍎</option>
                  <option value="🍒">🍒</option>
                  <option value="🍩">🍩</option>
                  <option value="⭐">⭐</option>
                  <option value="🍓">🍓</option>
                  <option value="🥕">🥕</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </DraggableWindow>
    </div>
  );
};

export default SnakeGame;
