import React from 'react';
import { motion } from 'motion/react';
import sudokuIcon from '../../assets/sudoku.png';

export default function Desktop({ wallpaper, onOpenSettings, onOpenSudoku }) {
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
          <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center text-white text-xl font-bold mb-1 hidden">
            S
          </div>
          <span className="text-white text-xs font-medium text-center drop-shadow-lg">
            Sudoku
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
