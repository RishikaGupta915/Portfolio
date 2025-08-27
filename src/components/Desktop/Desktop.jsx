import React from 'react';
import { motion } from 'motion/react';
import sudokuIcon from '../../assets/sudoku.png';
import ticTacToeIcon from '../../assets/tictactoe.png';
import pongIcon from '../../assets/pong.png';
import snakeIcon from '../../assets/snake.png';

export default function Desktop({
  wallpaper,
  onOpenSettings,
  onOpenSudoku,
  onOpenTicTacToe,
  onOpenPong,
  onOpenSnake,
}) {
  return (
    <div
      className="relative h-full w-full bg-cover bg-center"
      style={{ backgroundImage: `url(${wallpaper})` }}
    >
      {/* Desktop Icons */}
      <div className="absolute top-4 left-4 flex flex-col space-y-4">
        {/* Sudoku Game Icon */}
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={onOpenSudoku}
          className="flex flex-col items-center cursor-pointer p-2 rounded-lg hover:bg-white/20 transition-colors"
        >
          <img
            src={sudokuIcon}
            alt="Sudoku"
            className="w-12 h-12 mb-1"
            onError={(e) => {
              // Fallback if icon doesn't exist
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'block';
            }}
          />
          <div className="w-12 h-12 bg-blue-500 rounded-lg items-center justify-center text-white text-xl font-bold mb-1 hidden">
            S
          </div>
          <span className="text-white text-xs font-medium text-center drop-shadow-lg">
            Sudoku
          </span>
        </motion.div>

        {/* TicTacToe Game Icon */}
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={onOpenTicTacToe}
          className="flex flex-col items-center cursor-pointer p-2 rounded-lg hover:bg-white/20 transition-colors"
        >
          <img
            src={ticTacToeIcon}
            alt="Tic Tac Toe"
            className="w-12 h-12 mb-1"
            onError={(e) => {
              // Fallback if icon doesn't exist
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'block';
            }}
          />
          <div className="w-12 h-12 bg-red-500 rounded-lg items-center justify-center text-white text-xl font-bold mb-1 hidden">
            ⚡
          </div>
          <span className="text-white text-xs font-medium text-center drop-shadow-lg">
            Tic Tac Toe
          </span>
        </motion.div>

        {/* Pong Game Icon */}
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={onOpenPong}
          className="flex flex-col items-center cursor-pointer p-2 rounded-lg hover:bg-white/20 transition-colors"
        >
          <img
            src={pongIcon}
            alt="Pong"
            className="w-12 h-12 mb-1"
            onError={(e) => {
              // Fallback if icon doesn't exist
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'block';
            }}
          />
          <div className="w-12 h-12 bg-green-500 rounded-lg items-center justify-center text-white text-xl font-bold mb-1 hidden">
            P
          </div>
          <span className="text-white text-xs font-medium text-center drop-shadow-lg">
            Pong
          </span>
        </motion.div>

        {/* Snake Game Icon */}
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={onOpenSnake}
          className="flex flex-col items-center cursor-pointer p-2 rounded-lg hover:bg-white/20 transition-colors"
        >
          <img
            src={snakeIcon}
            alt="Snake"
            className="w-12 h-12 mb-1"
            onError={(e) => {
              // Fallback if icon doesn't exist
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'block';
            }}
          />
          <div className="w-12 h-12 bg-yellow-500 rounded-lg items-center justify-center text-white text-xl font-bold mb-1 hidden">
          </div>
          <span className="text-white text-xs font-medium text-center drop-shadow-lg">
            Snake
          </span>
        </motion.div>
      </div>

      {/* Settings button */}
      <motion.button
        onClick={onOpenSettings}
        whileHover={{ scale: 1.1 }}
        className="absolute bottom-4 left-4 bg-white/80 text-black px-4 py-2 rounded-lg shadow-lg"
      >
        ⚙️ Settings
      </motion.button>
    </div>
  );
}
