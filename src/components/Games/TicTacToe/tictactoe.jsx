// components/Games/TicTacToe.jsx
import React, { useState, useRef, useEffect } from 'react';

export default function TicTacToe({ onClose }) {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const modalRef = useRef(null);

  // Dragging states
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const winner = calculateWinner(board);

  // Drag functionality
  const handleMouseDown = (e) => {
    if (e.target.closest('.no-drag')) return;

    setIsDragging(true);
    const rect = modalRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
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

  const handleMouseUp = () => {
    setIsDragging(false);
  };

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

  function handleClick(index) {
    if (board[index] || winner) return;
    const newBoard = [...board];
    newBoard[index] = isXNext ? 'X' : 'O';
    setBoard(newBoard);
    setIsXNext(!isXNext);
  }

  function restartGame() {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-40">
      <div
        ref={modalRef}
        className="bg-gray-900/95 backdrop-blur-md border border-white/20 rounded-xl shadow-2xl p-6 max-w-md w-full select-none"
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
        {/* Title bar for dragging */}
        <div className="flex justify-between items-center mb-4 p-2 rounded bg-gray-800 bg-opacity-50">
          <h1 className="text-2xl font-bold text-pink-400 neon-pink">
            Tic Tac Toe
          </h1>
          {onClose && (
            <button
              onClick={onClose}
              className="no-drag text-white/60 hover:text-white text-xl font-bold w-8 h-8 flex items-center justify-center rounded hover:bg-white/10 transition-colors cursor-pointer"
            >
              ×
            </button>
          )}
        </div>

        {/* Game Board */}
        <div className="flex flex-col items-center no-drag">
          <div className="grid grid-cols-3 gap-2 mb-4">
            {board.map((cell, index) => (
              <button
                key={index}
                onClick={() => handleClick(index)}
                className="w-16 h-16 text-2xl font-bold border-2 border-pink-500 
                           bg-black hover:bg-pink-800/40 transition-all duration-200 
                           rounded-lg shadow-[0_0_10px_#ff00ff] no-drag cursor-pointer"
              >
                {cell}
              </button>
            ))}
          </div>

          {/* Game Status */}
          <div className="mb-4 text-center">
            {winner ? (
              <h2 className="text-xl font-bold text-green-400">
                Winner: {winner} 🎉
              </h2>
            ) : (
              <h2 className="text-lg font-bold text-cyan-300">
                Next Player: {isXNext ? 'X' : 'O'}
              </h2>
            )}
          </div>

          {/* Restart Button */}
          <button
            onClick={restartGame}
            className="px-4 py-2 bg-pink-600 text-white font-semibold 
                       rounded-lg hover:bg-pink-700 transition-all duration-200
                       shadow-[0_0_10px_#ff00ff] no-drag cursor-pointer"
          >
            Restart Game
          </button>
        </div>
      </div>
    </div>
  );
}

// Helper function to check winner
function calculateWinner(board) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let [a, b, c] of lines) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  return null;
}
