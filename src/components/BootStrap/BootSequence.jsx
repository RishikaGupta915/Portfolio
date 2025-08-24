import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

function BootSequence({ onComplete }) {
  const [bootProgress, setBootProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setBootProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setTimeout(() => setIsComplete(true), 2000); // Stay longer before showing completion
          return 100;
        }
        return prev + 2;
      });
    }, 100);
    return () => clearInterval(progressInterval);
  }, []);

  useEffect(() => {
    if (isComplete && onComplete) {
      // Show completion message for 10 seconds, then call onComplete
      const timer = setTimeout(() => {
        onComplete();
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [isComplete, onComplete]);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(135deg, #581c87, #000000, #be185d)',
        color: 'white',
        fontFamily: 'monospace',
        overflow: 'hidden',
      }}
    >
      {/* Background Grid */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.2,
          backgroundImage: `
            linear-gradient(90deg, transparent 95%, rgba(255,0,255,0.3) 100%),
            linear-gradient(0deg, transparent 95%, rgba(0,255,255,0.3) 100%)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Falling Icons - Simple version */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: 'none',
          overflow: 'hidden',
        }}
      >
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: window.innerHeight + 50, opacity: [0, 1, 0] }}
            transition={{
              duration: 3 + Math.random() * 2,
              delay: Math.random() * 2,
              repeat: Infinity,
            }}
            style={{
              position: 'absolute',
              left: `${Math.random() * 100}%`,
              fontSize: `${12 + Math.random() * 8}px`,
              textShadow: '0 0 10px #00ffff',
              color: '#00ffff',
            }}
          >
            {
              ['⚡', '🔧', '⚙️', '💻', '🚀', '✨', '💎'][
                Math.floor(Math.random() * 7)
              ]
            }
          </motion.div>
        ))}
      </div>

      {/* Main Content */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10,
          padding: '2rem',
          gap: '2rem',
        }}
      >
        {/* ASCII Title */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 2 }}
          style={{ textAlign: 'center' }}
        >
          <motion.pre
            animate={{
              textShadow: [
                '0 0 20px #ff00ff',
                '0 0 30px #ff00ff, 0 0 40px #00ffff',
                '0 0 20px #ff00ff',
              ],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              color: '#ff1493',
              fontSize: window.innerWidth > 768 ? '16px' : '12px',
              lineHeight: 1.2,
              margin: 0,
            }}
          >
            {`
██╗      ██████╗  █████╗ ██████╗ ██╗███╗   ██╗ ██████╗ 
██║     ██╔═══██╗██╔══██╗██╔══██╗██║████╗  ██║██╔════╝ 
██║     ██║   ██║███████║██║  ██║██║██╔██╗ ██║██║  ███╗
██║     ██║   ██║██╔══██║██║  ██║██║██║╚██╗██║██║   ██║
███████╗╚██████╔╝██║  ██║██████╔╝██║██║ ╚████║╚██████╔╝
╚══════╝ ╚═════╝ ╚═╝  ╚═╝╚═════╝ ╚═╝╚═╝  ╚═══╝ ╚═════╝ 
`}
          </motion.pre>
        </motion.div>

        {/* Simple Progress Bar */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1, duration: 1 }}
          style={{ width: '100%', maxWidth: '500px' }}
        >
          <div
            style={{
              width: '100%',
              height: '32px',
              backgroundColor: '#1f2937',
              borderRadius: '8px',
              border: '2px solid #ec4899',
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${bootProgress}%` }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              style={{
                height: '100%',
                background: 'linear-gradient(90deg, #ec4899, #8b5cf6, #06b6d4)',
                boxShadow: '0 0 20px #ff00ff, 0 0 40px rgba(255,0,255,0.5)',
              }}
            />
          </div>
          <div style={{ marginTop: '1rem', textAlign: 'center' }}>
            <motion.span
              animate={{
                textShadow: [
                  '0 0 10px #ff00ff',
                  '0 0 20px #ff00ff, 0 0 30px #ff00ff',
                  '0 0 10px #ff00ff',
                ],
              }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                fontSize: '2rem',
                fontFamily: 'monospace',
                color: '#ff1493',
              }}
            >
              {bootProgress}%
            </motion.span>
          </div>
        </motion.div>

        {/* Loading Text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
          style={{ textAlign: 'center' }}
        >
          <motion.p
            animate={{
              opacity: [0.5, 1, 0.5],
            }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              color: '#00ffff',
              fontSize: '1.25rem',
              letterSpacing: '0.15em',
              textShadow: '0 0 15px #00ffff, 0 0 30px #00ffff',
              margin: 0,
            }}
          >
            INITIALIZING PORTFOLIO MATRIX...
          </motion.p>
        </motion.div>
      </div>

      {/* Boot Complete Overlay */}
      <AnimatePresence>
        {isComplete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2, exit: { duration: 3 } }}
            onClick={() => onComplete && onComplete()}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, #581c87, #000000, #be185d)',
              zIndex: 50,
              cursor: 'pointer',
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.5, duration: 1, type: 'spring' }}
                style={{
                  fontSize: '8rem',
                  textShadow:
                    '0 0 30px #00ffff, 0 0 60px #00ffff, 0 0 90px #00ffff',
                  marginBottom: '1.5rem',
                }}
              >
                <span style={{ color: '#00ffff' }}>✨</span>
              </motion.div>

              <motion.h2
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1, duration: 1 }}
                style={{
                  fontSize: '3rem',
                  color: '#ff1493',
                  fontWeight: 'bold',
                  textShadow: '0 0 20px #ff00ff, 0 0 40px #ff00ff',
                  margin: 0,
                }}
              >
                System Ready
              </motion.h2>

              <motion.p
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 2, duration: 1 }}
                style={{
                  fontSize: '1.5rem',
                  color: '#00ffff',
                  letterSpacing: '0.05em',
                  textShadow: '0 0 15px #00ffff',
                  margin: 0,
                  marginTop: '1rem',
                }}
              >
                Welcome to my Portfolio
              </motion.p>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0] }}
                transition={{
                  delay: 4,
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                style={{
                  fontSize: '1rem',
                  color: '#ffffff',
                  opacity: 0.7,
                  marginTop: '3rem',
                  letterSpacing: '0.1em',
                  textShadow: '0 0 10px rgba(255,255,255,0.5)',
                }}
              >
                Click anywhere to continue
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default BootSequence;
