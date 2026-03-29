// src/components/Labs/PhysicsLab.tsx
import React, { useState, lazy, Suspense } from 'react';
import type { ComponentType } from 'react';
import { motion } from 'framer-motion';
import { NeonText } from '@/components/Shared/NeonText';
import { APODHero } from './Physics/APODHero';
import { SolarCanvas } from './Physics/SolarCanvas';
import { DataDashboard } from './Physics/DataDashboard';
import { useLabStore } from '@/store/labStore';

const VRSpaceLab = lazy(() =>
  import('./Physics/VRSpaceLab').then((m) => ({ default: m.VRSpaceLab as ComponentType<{ onExit: () => void }> }))
);

/**
 * Physics Lab — APOD hero + solar system simulator + NASA data dashboard
 */
const PhysicsLab: React.FC = () => {
  const [speed, setSpeed] = useState(1);
  const [vrActive, setVrActive] = useState(false);
  const { unlockAchievement } = useLabStore();

  const handleSpeedChange = (val: number) => {
    setSpeed(val);
    if (val > 1) unlockAchievement('orbital-mechanic');
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.02 }}
      transition={{ duration: 0.4, ease: 'easeInOut' }}
      className="lab-container page-wrapper"
      style={{ overflowY: 'auto', paddingBottom: 80 }}
    >
      {/* Background watermark */}
      <img
        src="/logo.png"
        alt=""
        className="logo-watermark"
        onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')}
      />

      {/* APOD Hero */}
      <APODHero />

      {/* Solar System */}
      <div style={{ padding: '1.5rem 1rem 0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <NeonText as="h2" glow="purple" size="0.8rem" tracking="0.2em">
              SOLAR SYSTEM SIMULATOR
            </NeonText>
            <motion.button
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setVrActive(true)}
              style={{
                fontFamily: 'Orbitron, sans-serif', fontSize: '0.52rem',
                padding: '5px 14px', borderRadius: 8, cursor: 'pointer',
                background: 'linear-gradient(135deg, rgba(180,79,255,0.2), rgba(100,50,255,0.1))',
                border: '1px solid rgba(180,79,255,0.5)', color: '#b44fff',
                letterSpacing: '0.08em', whiteSpace: 'nowrap',
                boxShadow: '0 0 14px rgba(180,79,255,0.25)',
              }}
            >
              🥽 ENTER VR SPACE
            </motion.button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '0.65rem', color: '#4a7a8a' }}>
              ORBIT SPEED
            </span>
            <input
              type="range"
              min={0.2}
              max={10}
              step={0.2}
              value={speed}
              onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
              style={{ width: 130 }}
            />
            <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '0.65rem', color: '#00f5c4', minWidth: 36 }}>
              {speed.toFixed(1)}×
            </span>
          </div>
        </div>
        <SolarCanvas speed={speed} />
        <p style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '0.75rem', color: '#4a7a8a', marginTop: 8, textAlign: 'center' }}>
          Click any planet for details · Drag to orbit · Scroll to zoom
        </p>
      </div>

      <div className="teal-divider" style={{ margin: '1rem' }} />

      {/* Data Dashboard */}
      <div>
        <div style={{ padding: '0 1rem 0.5rem' }}>
          <NeonText as="h2" glow="teal" size="0.8rem" tracking="0.2em">
            LIVE NASA DATA FEEDS
          </NeonText>
        </div>
        <DataDashboard />
      </div>

      {/* VR Planetarium */}
      {vrActive && (
        <Suspense fallback={<div style={{ position: 'fixed', inset: 0, zIndex: 210, background: '#020814', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ fontFamily: 'Orbitron, sans-serif', color: '#1af0ff', fontSize: '0.8rem' }}>LOADING PLANETARIUM...</p>
        </div>}>
          <VRSpaceLab onExit={() => setVrActive(false)} />
        </Suspense>
      )}
    </motion.div>
  );
};

export default PhysicsLab;
