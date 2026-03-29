// src/components/Pages/Achievements.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { GlassPanel } from '@/components/Shared/GlassPanel';
import { NeonText } from '@/components/Shared/NeonText';
import { useLabStore, ACHIEVEMENTS } from '@/store/labStore';

/**
 * Achievements page — grid of all achievement cards with stagger animation.
 */
const Achievements: React.FC = () => {
  const { unlockedAchievements, unlockedAt } = useLabStore();

  const total = ACHIEVEMENTS.length;
  const unlocked = unlockedAchievements.length;
  const progress = Math.round((unlocked / total) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.02 }}
      transition={{ duration: 0.4 }}
      className="lab-container page-wrapper bg-grid"
      style={{ overflowY: 'auto', padding: '80px 1rem 80px', maxWidth: 900, margin: '0 auto' }}
    >
      <img
        src="/logo.png"
        alt=""
        className="logo-watermark"
        onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')}
      />

      {/* Header */}
      <NeonText as="h1" glow="teal" size="1.2rem" tracking="0.2em" style={{ marginBottom: '0.5rem' }}>
        ACHIEVEMENTS
      </NeonText>
      <p style={{ fontFamily: 'Rajdhani, sans-serif', color: '#4a7a8a', fontSize: '1rem', marginBottom: '1.25rem' }}>
        Unlock achievements by exploring the Kalinga Laboratories ecosystem.
      </p>

      {/* Progress bar */}
      <GlassPanel glowColor="teal" padding="1rem" style={{ marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <p style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '0.6rem', color: '#4a7a8a', letterSpacing: '0.12em' }}>OVERALL PROGRESS</p>
          <p style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '0.7rem', color: '#00f5c4' }}>
            {unlocked}/{total} — {progress}%
          </p>
        </div>
        <div style={{ height: 8, background: 'rgba(0,245,196,0.1)', borderRadius: 4, overflow: 'hidden' }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            style={{
              height: '100%',
              background: 'linear-gradient(90deg, #00f5c4, #1af0ff)',
              boxShadow: '0 0 8px #00f5c4',
            }}
          />
        </div>
      </GlassPanel>

      {/* Achievement grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '0.75rem' }}>
        {ACHIEVEMENTS.map((achievement, idx) => {
          const isUnlocked = unlockedAchievements.includes(achievement.id);
          const unlockedDate = unlockedAt[achievement.id];

          return (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.06, duration: 0.4 }}
            >
              <GlassPanel
                glowColor={isUnlocked ? 'teal' : 'none'}
                padding="1rem"
                style={{
                  filter: isUnlocked ? 'none' : 'saturate(0.3)',
                  opacity: isUnlocked ? 1 : 0.55,
                  boxShadow: isUnlocked
                    ? '0 0 20px rgba(0,245,196,0.15), 0 0 40px rgba(0,245,196,0.05), inset 0 1px 0 rgba(255,255,255,0.05)'
                    : '0 0 10px rgba(0,0,0,0.3)',
                  transition: 'all 0.3s ease',
                  cursor: 'default',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  {/* Icon */}
                  <div style={{
                    width: 44,
                    height: 44,
                    borderRadius: '50%',
                    background: isUnlocked ? 'rgba(0,245,196,0.12)' : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${isUnlocked ? 'rgba(0,245,196,0.3)' : 'rgba(255,255,255,0.06)'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: isUnlocked ? '1.4rem' : '0.8rem',
                    flexShrink: 0,
                  }}>
                    {isUnlocked ? achievement.icon : '?'}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      fontFamily: 'Orbitron, sans-serif',
                      fontSize: '0.72rem',
                      color: isUnlocked ? '#00f5c4' : '#4a7a8a',
                      marginBottom: 3,
                      textShadow: isUnlocked ? '0 0 8px rgba(0,245,196,0.4)' : 'none',
                    }}>
                      {isUnlocked ? achievement.title : '???'}
                    </p>
                    <p style={{
                      fontFamily: 'Rajdhani, sans-serif',
                      fontSize: '0.8rem',
                      color: isUnlocked ? '#e0faff' : '#2a3a4a',
                      lineHeight: 1.4,
                    }}>
                      {isUnlocked ? achievement.description : 'Complete actions to unlock this achievement.'}
                    </p>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, alignItems: 'center' }}>
                      <span style={{
                        fontFamily: 'Share Tech Mono, monospace',
                        fontSize: '0.6rem',
                        color: isUnlocked ? '#00f5c4' : '#2a3a4a',
                      }}>
                        +{achievement.xpReward} XP
                      </span>
                      {isUnlocked && unlockedDate && (
                        <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '0.55rem', color: '#4a7a8a' }}>
                          {new Date(unlockedDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Unlocked glow pulse */}
                {isUnlocked && (
                  <div style={{
                    position: 'absolute',
                    top: 0, left: 0, right: 0,
                    height: 2,
                    background: 'linear-gradient(90deg, transparent, #00f5c4, transparent)',
                    opacity: 0.5,
                    borderRadius: '12px 12px 0 0',
                  }} />
                )}
              </GlassPanel>
            </motion.div>
          );
        })}
      </div>

      {/* Completion message */}
      {unlocked === total && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          style={{ marginTop: '1.5rem', textAlign: 'center' }}
        >
          <GlassPanel glowColor="teal" padding="1.5rem">
            <p style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '1rem', color: '#00f5c4', marginBottom: 6 }}>
              🏆 KALINGA SCHOLAR ACHIEVED!
            </p>
            <p style={{ fontFamily: 'Rajdhani, sans-serif', color: '#e0faff' }}>
              You have unlocked every achievement in Kalinga Laboratories. Outstanding scientific dedication!
            </p>
          </GlassPanel>
        </motion.div>
      )}
    </motion.div>
  );
};

export default Achievements;
