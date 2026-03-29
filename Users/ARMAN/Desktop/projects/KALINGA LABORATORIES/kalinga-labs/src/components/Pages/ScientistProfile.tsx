// src/components/Pages/ScientistProfile.tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { GlassPanel } from '@/components/Shared/GlassPanel';
import { NeonText } from '@/components/Shared/NeonText';
import { useLabStore, ACHIEVEMENTS } from '@/store/labStore';

const AVATARS = ['🔬', '🧪', '🌌', '🧬', '⚗️', '🪐', '🧠', '🫀', '☄️', '🔭'];

/**
 * Scientist Profile page — editable name/avatar, XP bar, radar chart, lab history.
 */
const ScientistProfile: React.FC = () => {
  const { scientist, updateScientist, unlockedAchievements, reactionLog } = useLabStore();
  const [editing, setEditing] = useState(false);
  const [nameInput, setNameInput] = useState(scientist.name);

  const xpToNextLevel = (scientist.level ** 2) * 100;
  const xpProgress = Math.min((scientist.xp / xpToNextLevel) * 100, 100);

  const skillData = [
    {
      subject: 'Chemistry',
      value: Math.min(100, reactionLog.length * 20),
    },
    {
      subject: 'Physics',
      value: Math.min(100, scientist.planetsViewed.length * 12),
    },
    {
      subject: 'Biology',
      value: Math.min(100, scientist.organsIdentified * 10),
    },
    {
      subject: 'Exploration',
      value: Math.min(100, scientist.visitedLabs.length * 33),
    },
    {
      subject: 'Research',
      value: Math.min(100, unlockedAchievements.length * 8),
    },
  ];

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
      <NeonText as="h1" glow="teal" size="1.2rem" tracking="0.2em" style={{ marginBottom: '1.5rem' }}>
        SCIENTIST PROFILE
      </NeonText>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        {/* Identity card */}
        <GlassPanel glowColor="teal" padding="1.25rem">
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
            {/* Avatar */}
            <div style={{
              width: 70, height: 70, borderRadius: '50%',
              background: 'rgba(0,245,196,0.1)',
              border: '2px solid rgba(0,245,196,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '2rem',
            }}>
              {scientist.avatar}
            </div>
            <div>
              {editing ? (
                <input
                  className="cyber-input"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  style={{ marginBottom: 6, fontSize: '0.9rem' }}
                />
              ) : (
                <p style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '1rem', color: '#e0faff', marginBottom: 4 }}>
                  {scientist.name}
                </p>
              )}
              <div style={{ display: 'flex', gap: 6 }}>
                <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '0.65rem', color: '#00f5c4', background: 'rgba(0,245,196,0.1)', padding: '2px 8px', borderRadius: 4 }}>
                  LVL {scientist.level}
                </span>
                <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '0.65rem', color: '#4a7a8a' }}>
                  {scientist.xp.toLocaleString()} XP
                </span>
              </div>
            </div>
          </div>

          {/* XP bar */}
          <p style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '0.55rem', color: '#4a7a8a', letterSpacing: '0.1em', marginBottom: 4 }}>
            EXPERIENCE — LEVEL {scientist.level} → {scientist.level + 1}
          </p>
          <div style={{ height: 6, background: 'rgba(0,245,196,0.1)', borderRadius: 3, overflow: 'hidden', marginBottom: 12 }}>
            <motion.div
              style={{ height: '100%', background: 'linear-gradient(90deg, #00f5c4, #1af0ff)', boxShadow: '0 0 8px #00f5c4' }}
              animate={{ width: `${xpProgress}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>
          <p style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '0.6rem', color: '#4a7a8a', marginBottom: 16 }}>
            {scientist.xp.toLocaleString()} / {xpToNextLevel.toLocaleString()} XP
          </p>

          {/* Stats grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
            {[
              ['Experiments', scientist.experimentsCompleted],
              ['Achievements', `${unlockedAchievements.length}/${ACHIEVEMENTS.length}`],
              ['Labs Visited', `${scientist.visitedLabs.length}/3`],
              ['Planets Seen', `${scientist.planetsViewed.length}/8`],
              ['Organs ID\'d', scientist.organsIdentified],
              ['Reactions', reactionLog.length],
            ].map(([label, value]) => (
              <div key={String(label)}>
                <p style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '0.5rem', color: '#4a7a8a', letterSpacing: '0.08em' }}>{label}</p>
                <p className="data-value" style={{ fontSize: '0.85rem' }}>{value}</p>
              </div>
            ))}
          </div>

          {/* Edit / Avatar */}
          <div style={{ marginTop: 12, display: 'flex', gap: 6 }}>
            {editing ? (
              <>
                <button className="btn-teal" style={{ flex: 1 }} onClick={() => {
                  updateScientist({ name: nameInput });
                  setEditing(false);
                }}>
                  SAVE
                </button>
                <button className="btn-teal" style={{ flex: 1, color: '#4a7a8a' }} onClick={() => setEditing(false)}>
                  CANCEL
                </button>
              </>
            ) : (
              <button className="btn-teal" style={{ flex: 1 }} onClick={() => setEditing(true)}>
                ✏️ EDIT PROFILE
              </button>
            )}
          </div>

          {/* Avatar picker */}
          {editing && (
            <div style={{ marginTop: 10 }}>
              <p style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '0.55rem', color: '#4a7a8a', marginBottom: 6 }}>CHOOSE AVATAR</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {AVATARS.map((av) => (
                  <button
                    key={av}
                    onClick={() => updateScientist({ avatar: av })}
                    style={{
                      fontSize: '1.4rem',
                      background: scientist.avatar === av ? 'rgba(0,245,196,0.15)' : 'rgba(0,245,196,0.03)',
                      border: `1px solid ${scientist.avatar === av ? '#00f5c4' : 'rgba(0,245,196,0.1)'}`,
                      borderRadius: 8,
                      padding: '4px 8px',
                      cursor: 'pointer',
                    }}
                  >
                    {av}
                  </button>
                ))}
              </div>
            </div>
          )}
        </GlassPanel>

        {/* Radar chart */}
        <GlassPanel glowColor="blue" padding="1rem">
          <p style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '0.6rem', color: '#4a7a8a', letterSpacing: '0.12em', marginBottom: 8 }}>SKILL RADAR</p>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={skillData}>
              <PolarGrid stroke="rgba(0,245,196,0.15)" />
              <PolarAngleAxis
                dataKey="subject"
                tick={{ fontFamily: 'Orbitron, sans-serif', fontSize: 9, fill: '#4a7a8a' }}
              />
              <Radar
                dataKey="value"
                stroke="#00f5c4"
                fill="#00f5c4"
                fillOpacity={0.15}
                dot={{ fill: '#00f5c4', r: 3 }}
              />
              <Tooltip
                contentStyle={{ background: '#0d1b2a', border: '1px solid rgba(0,245,196,0.2)', borderRadius: 8, fontFamily: 'Share Tech Mono, monospace', fontSize: '0.7rem' }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </GlassPanel>
      </div>

      {/* Lab History */}
      {reactionLog.length > 0 && (
        <div style={{ marginTop: '1rem' }}>
          <GlassPanel glowColor="none" padding="1rem">
            <NeonText as="h3" glow="teal" size="0.65rem" tracking="0.15em" style={{ marginBottom: 10 }}>LAB HISTORY</NeonText>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {reactionLog.slice(0, 10).map((entry) => (
                <div key={entry.id} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '6px 8px', borderRadius: 6,
                  background: 'rgba(0,245,196,0.03)', border: '1px solid rgba(0,245,196,0.06)',
                }}>
                  <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '0.75rem', color: '#00f5c4' }}>
                    ⚗️ {entry.formula}
                  </span>
                  <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '0.6rem', color: '#4a7a8a' }}>
                    {new Date(entry.timestamp).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </GlassPanel>
        </div>
      )}
    </motion.div>
  );
};

export default ScientistProfile;
