import React from 'react';
import { motion } from 'motion/react';

export default function Desktop({ wallpaper, onOpenSettings }) {
  return (
    <div
      className="relative h-full w-full bg-cover bg-center"
      style={{ backgroundImage: `url(${wallpaper})` }}
    >
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
