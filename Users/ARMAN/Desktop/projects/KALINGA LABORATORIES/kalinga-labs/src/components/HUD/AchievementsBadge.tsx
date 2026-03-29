// src/components/HUD/AchievementsBadge.tsx
import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Trophy } from 'lucide-react';
import { useLabStore, ACHIEVEMENTS } from '@/store/labStore';

/**
 * Fixed bottom-right achievement counter badge.
 * Pulses when a new achievement is unlocked.
 */
export const AchievementsBadge: React.FC = () => {
  const navigate = useNavigate();
  const unlockedAchievements = useLabStore((s) => s.unlockedAchievements);
  const prevCount = useRef(unlockedAchievements.length);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    if (unlockedAchievements.length > prevCount.current) {
      setPulse(true);
      setTimeout(() => setPulse(false), 1500);
    }
    prevCount.current = unlockedAchievements.length;
  }, [unlockedAchievements.length]);

  const count = unlockedAchievements.length;
  const total = ACHIEVEMENTS.length;

  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1, duration: 0.6 }}
      onClick={() => navigate('/achievements')}
      style={{
        position: 'fixed',
        bottom: 80,
        right: 16,
        zIndex: 100,
        background: 'rgba(0,245,196,0.05)',
        border: '1px solid rgba(0,245,196,0.2)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderRadius: 10,
        padding: '8px 12px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        color: '#00f5c4',
        boxShadow: pulse
          ? '0 0 20px rgba(0,245,196,0.4), 0 0 40px rgba(0,245,196,0.15)'
          : '0 0 10px rgba(0,245,196,0.08)',
        transition: 'box-shadow 0.3s ease',
      }}
      className="hidden md:flex"
    >
      {/* Pulse wrapper */}
      <AnimatePresence>
        {pulse && (
          <motion.div
            initial={{ scale: 1, opacity: 0.6 }}
            animate={{ scale: 2, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: 10,
              background: 'rgba(0,245,196,0.2)',
              pointerEvents: 'none',
            }}
          />
        )}
      </AnimatePresence>

      <Trophy size={14} />
      <span
        style={{
          fontFamily: 'Share Tech Mono, monospace',
          fontSize: '0.7rem',
          color: '#00f5c4',
        }}
      >
        {count}/{total}
      </span>
    </motion.button>
  );
};
