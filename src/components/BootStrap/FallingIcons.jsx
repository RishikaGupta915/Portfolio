import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';

const retroSymbols = [
  '◆',
  '◇',
  '△',
  '▽',
  '◯',
  '◐',
  '◑',
  '◒',
  '◓',
  '▲',
  '▼',
  '◀',
  '▶',
  '■',
  '□',
  '●',
  '○',
  '★',
  '☆',
  '♦',
  '♢',
  '▬',
  '▭',
  '▮',
  '▯',
];
const techSymbols = [
  '⚡',
  '🔧',
  '⚙️',
  '💻',
  '📱',
  '🖥️',
  '⌨️',
  '🖱️',
  '💾',
  '🔌',
  '📡',
  '🛰️',
  '🔍',
  '📊',
  '📈',
  '💡',
  '🚀',
  '⭐',
  '✨',
  '🎯',
  '🔥',
  '💎',
  '🎨',
  '🎭',
];
const codeSymbols = [
  '{',
  '}',
  '[',
  ']',
  '<',
  '>',
  '(',
  ')',
  '/',
  '\\',
  '|',
  '&',
  '%',
  '#',
  '@',
  '$',
  '*',
  '+',
  '-',
  '=',
  '^',
  '~',
  '`',
  '"',
];
const retroColors = [
  '#ff00ff',
  '#00ffff',
  '#ff0080',
  '#8000ff',
  '#ff4080',
  '#40ff80',
  '#ff8040',
  '#80ff40',
  '#ff80ff',
  '#80ffff',
  '#ffff80',
  '#ff4040',
];

const allSymbols = [...retroSymbols, ...techSymbols, ...codeSymbols];

export function FallingIcons() {
  const [icons, setIcons] = useState([]);

  useEffect(() => {
    const generateIcon = () => ({
      id: Math.random().toString(36).substr(2, 9),
      symbol: allSymbols[Math.floor(Math.random() * allSymbols.length)],
      x: Math.random() * 100,
      delay: Math.random() * 1,
      duration: 2 + Math.random() * 5,
      size: 10 + Math.random() * 20,
      color: retroColors[Math.floor(Math.random() * retroColors.length)],
    });

    const initialIcons = Array.from({ length: 30 }, generateIcon);
    setIcons(initialIcons);

    const interval = setInterval(() => {
      setIcons((prev) => {
        const newIconsCount = 2 + Math.floor(Math.random() * 2);
        const newIcons = Array.from({ length: newIconsCount }, generateIcon);
        return [...prev.slice(-35), ...newIcons];
      });
    }, 400);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {icons.map((icon) => (
        <motion.div
          key={icon.id}
          initial={{ y: -50, opacity: 0, rotate: 0, scale: 0 }}
          animate={{
            y: window.innerHeight + 50,
            opacity: [0, 1, 1, 0],
            rotate: 360,
            scale: [0, 1, 1, 0],
          }}
          transition={{
            duration: icon.duration,
            delay: icon.delay,
            ease: 'linear',
          }}
          className="absolute"
          style={{
            left: `${icon.x}%`,
            fontSize: `${icon.size}px`,
            color: icon.color,
            textShadow: `0 0 10px ${icon.color}, 0 0 20px ${icon.color}40`,
          }}
        >
          {icon.symbol}
        </motion.div>
      ))}
    </div>
  );
}
