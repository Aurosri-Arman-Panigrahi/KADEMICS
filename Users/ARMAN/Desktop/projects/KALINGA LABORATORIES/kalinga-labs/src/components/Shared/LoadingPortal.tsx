// src/components/Shared/LoadingPortal.tsx
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface LoadingPortalProps {
  message?: string;
}

/**
 * Sci-fi loading animation with rotating rings and percentage counter.
 */
export const LoadingPortal: React.FC<LoadingPortalProps> = ({
  message = 'INITIALIZING SYSTEM',
}) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          return 100;
        }
        return p + Math.random() * 8;
      });
    }, 80);
    return () => clearInterval(interval);
  }, []);

  const pct = Math.min(Math.floor(progress), 100);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: '#020d18',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
      }}
    >
      {/* Ring stack */}
      <div style={{ position: 'relative', width: 120, height: 120 }}>
        {/* Outer rotating ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          style={{
            position: 'absolute',
            inset: 0,
            border: '2px solid transparent',
            borderTopColor: '#00f5c4',
            borderRightColor: '#00f5c4',
            borderRadius: '50%',
          }}
        />
        {/* Middle ring (reverse) */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          style={{
            position: 'absolute',
            inset: 16,
            border: '2px solid transparent',
            borderTopColor: '#1af0ff',
            borderRadius: '50%',
          }}
        />
        {/* Inner ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
          style={{
            position: 'absolute',
            inset: 32,
            border: '1.5px solid transparent',
            borderTopColor: '#b44fff',
            borderRadius: '50%',
          }}
        />
        {/* Center core */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          style={{
            position: 'absolute',
            inset: 46,
            background: 'radial-gradient(circle, #00f5c4, transparent)',
            borderRadius: '50%',
          }}
        />
        {/* Percentage */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'Share Tech Mono, monospace',
            fontSize: '0.75rem',
            color: '#00f5c4',
          }}
        >
          {pct}%
        </div>
      </div>

      {/* Message */}
      <motion.p
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.8, repeat: Infinity }}
        style={{
          marginTop: 32,
          fontFamily: 'Orbitron, sans-serif',
          fontSize: '0.7rem',
          color: '#4a7a8a',
          letterSpacing: '0.2em',
        }}
      >
        {message}
      </motion.p>

      {/* Progress bar */}
      <div
        style={{
          marginTop: 16,
          width: 200,
          height: 2,
          background: 'rgba(0,245,196,0.1)',
          borderRadius: 1,
          overflow: 'hidden',
        }}
      >
        <motion.div
          style={{
            height: '100%',
            background: 'linear-gradient(90deg, #00f5c4, #1af0ff)',
            boxShadow: '0 0 8px #00f5c4',
          }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.1 }}
        />
      </div>
    </div>
  );
};
