// src/components/Labs/BiologyLab.tsx
import React, { useState, useCallback, lazy, Suspense } from 'react';
import type { ComponentType } from 'react';
import { motion } from 'framer-motion';
import { NeonText } from '@/components/Shared/NeonText';
import { AnatomyCanvas } from './Biology/AnatomyCanvas';
import { InfoPanel } from './Biology/InfoPanel';
import { BodySystem, OrganInfo } from './Biology/organData';
import { useLabStore } from '@/store/labStore';

const VRAnatomyLab = lazy(() =>
  import('./Biology/VRAnatomyLab').then((m) => ({ default: m.VRAnatomyLab as ComponentType<{ onExit: () => void }> }))
);

/**
 * Biology Lab — 3D anatomy viewer + info panel with quiz and AR modes.
 */
const BiologyLab: React.FC = () => {
  const [activeSystem, setActiveSystem] = useState<BodySystem>('skeletal');
  const [selectedOrgan, setSelectedOrgan] = useState<OrganInfo | null>(null);
  const [studyMode, setStudyMode] = useState(false);
  const [arActive, setArActive] = useState(false);
  const [vrActive, setVrActive] = useState(false);
  const [explodeAmount, setExplodeAmount] = useState(0);
  const [quizTarget, setQuizTarget] = useState<OrganInfo | null>(null);

  const { unlockAchievement } = useLabStore();

  const handleARToggle = useCallback(() => {
    setArActive((prev) => !prev);
    if (!arActive) unlockAchievement('ar-pioneer');
  }, [arActive, unlockAchievement]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.02 }}
      transition={{ duration: 0.4, ease: 'easeInOut' }}
      className="lab-container page-wrapper"
      style={{ display: 'flex', flexDirection: 'row', height: '100vh' }}
    >
      {/* Background watermark */}
      <img
        src="/logo.png"
        alt=""
        className="logo-watermark"
        onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')}
      />

      {/* ── Left: 3D Anatomy Viewer ── */}
      <div
        style={{
          flex: '0 0 60%',
          height: '100vh',
          position: 'relative',
          borderRight: '1px solid rgba(0,245,196,0.1)',
        }}
      >
        <div style={{ position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)', zIndex: 10, display: 'flex', alignItems: 'center', gap: 14 }}>
          <NeonText as="h1" glow="teal" size="0.7rem" tracking="0.25em">
            BIO LAB — ANATOMY VIEWER
          </NeonText>
          <motion.button
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setVrActive(true)}
            style={{
              fontFamily: 'Orbitron, sans-serif', fontSize: '0.52rem',
              padding: '5px 14px', borderRadius: 8, cursor: 'pointer',
              background: 'linear-gradient(135deg, rgba(0,200,160,0.2), rgba(0,245,196,0.1))',
              border: '1px solid rgba(0,200,160,0.5)', color: '#00cc99',
              letterSpacing: '0.08em', whiteSpace: 'nowrap',
              boxShadow: '0 0 14px rgba(0,200,160,0.25)',
            }}
          >
            🥽 ENTER VR ANATOMY
          </motion.button>
        </div>

        <AnatomyCanvas
          system={activeSystem}
          showLabels={studyMode}
          onOrganSelect={setSelectedOrgan}
          explode={explodeAmount}
        />

        {/* Instructions overlay */}
        <div
          style={{
            position: 'absolute',
            bottom: 16,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 10,
            pointerEvents: 'none',
          }}
        >
          <p style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '0.6rem', color: '#4a7a8a', textAlign: 'center' }}>
            DRAG TO ROTATE · SCROLL TO ZOOM · CLICK ORGAN TO SELECT
          </p>
        </div>
      </div>

      {/* ── Right: Info Panel ── */}
      <div
        style={{
          flex: '0 0 40%',
          height: '100vh',
          overflowY: 'auto',
          background: 'rgba(2,13,24,0.85)',
          paddingTop: 64,
        }}
      >
        <InfoPanel
          activeSystem={activeSystem}
          onSystemChange={setActiveSystem}
          selectedOrgan={selectedOrgan}
          studyMode={studyMode}
          onStudyToggle={() => setStudyMode((p) => !p)}
          onARToggle={handleARToggle}
          arActive={arActive}
          explodeAmount={explodeAmount}
          onExplodeChange={setExplodeAmount}
          onQuizTarget={setQuizTarget}
        />
      </div>

      {/* VR Anatomy */}
      {vrActive && (
        <Suspense fallback={<div style={{ position: 'fixed', inset: 0, zIndex: 210, background: '#f0f4f4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ fontFamily: 'Orbitron, sans-serif', color: '#00aa88', fontSize: '0.8rem' }}>LOADING ANATOMY LAB...</p>
        </div>}>
          <VRAnatomyLab onExit={() => setVrActive(false)} />
        </Suspense>
      )}

      {/* AR Modal */}
      {arActive && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 200,
            background: 'rgba(0,0,0,0.92)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div style={{ position: 'relative', width: '80vw', height: '80vh', borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(0,245,196,0.3)' }}>
            <iframe
              src="/ar-biology.html"
              style={{ width: '100%', height: '100%', border: 'none', background: '#000' }}
              allow="camera"
              title="AR Biology Lab"
            />
          </div>
          <button
            className="btn-teal"
            style={{ marginTop: 16 }}
            onClick={() => setArActive(false)}
          >
            CLOSE AR MODE
          </button>
          <p style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '0.8rem', color: '#4a7a8a', marginTop: 8 }}>
            Point your camera at a Hiro marker to view AR anatomy overlay.
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default BiologyLab;
