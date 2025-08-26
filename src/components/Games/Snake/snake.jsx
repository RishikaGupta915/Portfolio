import React, { useState, useEffect, useRef } from 'react';

const gridSize = 20;
const tileCount = 20;

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
  const [background, setBackground] = useState(
    'linear-gradient(135deg, #0f0c29, #302b63, #ff0080)'
  );

  const canvasRef = useRef(null);

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
          return currentSnake;
        }

        newSnake.unshift(head);

        if (head.x === fruit.x && head.y === fruit.y) {
          setScore((prevScore) => prevScore + 1);
          setFruit({
            x: Math.floor(Math.random() * tileCount),
            y: Math.floor(Math.random() * tileCount),
          });
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    }, 150);

    return () => clearInterval(interval);
  }, [direction, gameOver, gameStarted, fruit]);

  // Drawing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // background
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // draw snake
    ctx.fillStyle = snakeColor;
    snake.forEach((segment) => {
      ctx.fillRect(
        segment.x * gridSize,
        segment.y * gridSize,
        gridSize,
        gridSize
      );
    });

    // draw fruit
    ctx.font = '20px Arial';
    ctx.fillText(fruitType, fruit.x * gridSize, fruit.y * gridSize + 18);
  }, [snake, fruit, snakeColor, fruitType]);

  useEffect(() => {
    const handleKeyDownWrapper = (e) => handleKeyDown(e);
    window.addEventListener('keydown', handleKeyDownWrapper);
    return () => window.removeEventListener('keydown', handleKeyDownWrapper);
  }, [direction, gameStarted]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg p-6 max-w-2xl w-full mx-4 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white hover:text-red-400 text-xl font-bold"
        >
          ×
        </button>

        <div
          className="flex flex-col items-center justify-center text-white"
          style={{ background }}
        >
          <h1 className="text-2xl mb-4 font-bold">Retro Snake 🐍</h1>
          <p className="mb-2">Score: {score}</p>

          <canvas
            ref={canvasRef}
            width={gridSize * tileCount}
            height={gridSize * tileCount}
            className="border-4 border-pink-500 rounded-lg"
          />

          {!gameStarted && !gameOver && (
            <div className="mt-4 text-center">
              <button
                className="px-6 py-3 bg-green-600 rounded-lg hover:bg-green-700 text-white font-bold"
                onClick={() => {
                  setGameStarted(true);
                  setDirection({ x: 1, y: 0 }); // Start moving right
                }}
              >
                Start Game
              </button>
              <p className="mt-2 text-sm text-gray-300">
                Use arrow keys or WASD to move
              </p>
            </div>
          )}

          {gameOver && (
            <div className="mt-4 text-center">
              <h2 className="text-xl text-pink-400">Game Over!</h2>
              <button
                className="mt-2 px-4 py-2 bg-pink-600 rounded-lg hover:bg-pink-700"
                onClick={() => {
                  setSnake([{ x: 10, y: 10 }]);
                  setFruit({ x: 15, y: 15 });
                  setDirection({ x: 0, y: 0 });
                  setScore(0);
                  setGameOver(false);
                  setGameStarted(false);
                }}
              >
                Restart
              </button>
            </div>
          )}

          {/* Customization options */}
          <div className="mt-6 flex gap-6">
            <div>
              <h3 className="mb-2 font-semibold">Snake Color</h3>
              <input
                type="color"
                value={snakeColor}
                onChange={(e) => setSnakeColor(e.target.value)}
              />
            </div>

            <div>
              <h3 className="mb-2 font-semibold">Fruit</h3>
              <select
                value={fruitType}
                onChange={(e) => setFruitType(e.target.value)}
                className="text-black"
              >
                <option value="🍎">Apple</option>
                <option value="🍒">Cherry</option>
                <option value="🍩">Donut</option>
                <option value="⭐">Star</option>
              </select>
            </div>

            <div>
              <h3 className="mb-2 font-semibold">Background</h3>
              <select
                value={background}
                onChange={(e) => setBackground(e.target.value)}
                className="text-black"
              >
                <option value="linear-gradient(135deg, #0f0c29, #302b63, #ff0080)">
                  Retro Purple
                </option>
                <option value="linear-gradient(135deg, #1a2a6c, #b21f1f, #fdbb2d)">
                  Sunset
                </option>
                <option value="linear-gradient(135deg, #3a1c71, #d76d77, #ffaf7b)">
                  Neon Pink
                </option>
                <option value="black">Classic Black</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SnakeGame;
