import React from "react";
import { motion } from "motion/react";

export function TerminalProgress({ value, className = "" }) {
  const progressChars = Math.floor((value / 100) * 50);
  const emptyChars = 50 - progressChars;

  return (
    <div className={`font-mono ${className}`}>
      <div className="flex items-center text-green-400">
        <span className="mr-2">[</span>
        <div className="flex">
          {Array.from({ length: progressChars }, (_, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.02 }}
              className="text-green-400"
            >
              ═
            </motion.span>
          ))}
          {Array.from({ length: emptyChars }, (_, i) => (
            <span key={i + progressChars} className="text-gray-700">
              ─
            </span>
          ))}
        </div>
        <span className="ml-2">]</span>
        <span className="ml-3 text-cyan-400">{value}%</span>
      </div>
    </div>
  );
}
