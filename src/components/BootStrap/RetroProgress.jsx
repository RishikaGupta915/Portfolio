import React from "react";
import { motion } from "motion/react";

export function RetroProgress({ value, className = "" }) {
  return (
    <div className={`w-full max-w-md mx-auto ${className}`}>
      <div className="relative h-8 bg-gray-900 border-2 border-pink-500 rounded-lg overflow-hidden shadow-lg">
        <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 to-cyan-500/10" />

        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400"
          style={{
            boxShadow:
              "0 0 20px #ff00ff, 0 0 40px #ff00ff80, inset 0 0 20px rgba(255,255,255,0.2)",
          }}
        >
          <motion.div
            animate={{ x: [-100, 300] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent w-20 skew-x-12"
          />
        </motion.div>

        <div className="absolute inset-0 opacity-30">
          <div className="h-full w-full bg-[linear-gradient(90deg,transparent_95%,rgba(255,0,255,0.3)_100%)] bg-[length:4px_4px]" />
          <div className="absolute inset-0 bg-[linear-gradient(0deg,transparent_95%,rgba(0,255,255,0.3)_100%)] bg-[length:4px_4px]" />
        </div>
      </div>

      <div className="mt-4 text-center">
        <motion.span
          animate={{
            textShadow: [
              "0 0 10px #ff00ff",
              "0 0 20px #ff00ff, 0 0 30px #ff00ff",
              "0 0 10px #ff00ff",
            ],
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="text-2xl font-mono text-pink-400"
        >
          {value}%
        </motion.span>
      </div>
    </div>
  );
}
