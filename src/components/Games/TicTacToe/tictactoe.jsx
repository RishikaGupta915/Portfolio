// components/Games/TicTacToe.jsx
import React, { useState } from 'react';
import DraggableWindow from '../../Dragable/dragable';

export default function TicTacToe({ onClose }) {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);

  const winner = calculateWinner(board);

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
      <DraggableWindow className="bg-gray-900/95 backdrop-blur-md border border-white/20 rounded-xl shadow-2xl p-6 max-w-md w-full select-none">
        {/* Title bar for dragging */}
        <div
          data-drag-handle
          className="flex justify-between items-center mb-4 p-2 rounded bg-gray-800 bg-opacity-50 cursor-move select-none"
        >
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
      </DraggableWindow>
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
