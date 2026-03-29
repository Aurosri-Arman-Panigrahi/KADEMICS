// src/components/Labs/ChemistryLab.tsx
import React, { useState, useCallback, lazy, Suspense } from 'react';
import type { ComponentType } from 'react';

import { motion } from 'framer-motion';
import { NeonText } from '@/components/Shared/NeonText';
import { ReactionCanvas } from './Chemistry/ReactionCanvas';
import { ControlPanel } from './Chemistry/ControlPanel';
import type { ReactionDef } from './Chemistry/reactions';
import { ElementSymbol } from './Chemistry/reactions';
import { useLabStore } from '@/store/labStore';

const VRChemistryLab = lazy(() =>
  import('./Chemistry/VRChemistryLab').then((m) => ({ default: m.VRChemistryLab as ComponentType<{ onExit: () => void }> }))
);


/**
 * Chemistry Lab — two-column layout with 3D beaker canvas + control panel.
 * AR mode opens an iframe-based AR.js experience.
 */
const ChemistryLab: React.FC = () => {
  const [elemA, setElemA] = useState<ElementSymbol | null>(null);
  const [elemB, setElemB] = useState<ElementSymbol | null>(null);
  const [reaction, setReaction] = useState<ReactionDef | null>(null);
  const [reacting, setReacting] = useState(false);
  const [arActive, setArActive] = useState(false);
  const [vrActive, setVrActive] = useState(false);

  const { completeExperiment } = useLabStore();

  const handleReact = useCallback(
    (a: ElementSymbol, b: ElementSymbol, r: ReactionDef | null) => {
      setElemA(a);
      setElemB(b);
      setReaction(r);
      setReacting(false);
      // Small delay before animation
      setTimeout(() => {
        setReacting(true);
        if (r) completeExperiment('chemistry');
        setTimeout(() => setReacting(false), 4000);
      }, 100);
    },
    [completeExperiment]
  );

  const handleARToggle = useCallback(() => {
    setArActive((prev) => !prev);
  }, []);

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
        style={{ opacity: 0.04 }}
        onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')}
      />

      {/* ── Left: 3D Canvas ── */}
      <div
        style={{
          flex: '0 0 60%',
          height: '100vh',
          position: 'relative',
          borderRight: '1px solid rgba(0,245,196,0.1)',
        }}
      >
        {/* Lab label + VR button */}
        <div style={{ position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)', zIndex: 10, display: 'flex', alignItems: 'center', gap: 16 }}>
          <NeonText as="h1" glow="blue" size="0.75rem" tracking="0.25em">
            CHEM LAB — REACTION CHAMBER
          </NeonText>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setVrActive(true)}
            style={{
              fontFamily: 'Orbitron, sans-serif', fontSize: '0.55rem',
              padding: '6px 16px', borderRadius: 8, cursor: 'pointer',
              background: 'linear-gradient(135deg, rgba(0,245,196,0.2), rgba(26,240,255,0.1))',
              border: '1px solid rgba(0,245,196,0.5)', color: '#00f5c4',
              letterSpacing: '0.08em', whiteSpace: 'nowrap',
              boxShadow: '0 0 16px rgba(0,245,196,0.25)',
            }}
          >
            🥽 ENTER VR LAB
          </motion.button>
        </div>

        <ReactionCanvas
          elementA={elemA}
          elementB={elemB}
          reaction={reaction}
          reacting={reacting}
        />

        {/* Reaction flash overlay */}
        {reacting && reaction && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.15, 0] }}
            transition={{ duration: 0.8 }}
            style={{
              position: 'absolute',
              inset: 0,
              background: reaction.glowColor,
              pointerEvents: 'none',
              zIndex: 5,
            }}
          />
        )}
      </div>

      {/* ── Right: Control Panel ── */}
      <div
        style={{
          flex: '0 0 40%',
          height: '100vh',
          overflowY: 'auto',
          background: 'rgba(2,13,24,0.8)',
          borderLeft: '1px solid rgba(0,245,196,0.1)',
          paddingTop: 64,
        }}
      >
        <ControlPanel
          onReact={handleReact}
          onARToggle={handleARToggle}
          arActive={arActive}
        />
      </div>

      {/* ── VR Lab (full-screen WebXR) ── */}
      {vrActive && (
        <Suspense fallback={<div style={{ position: 'fixed', inset: 0, zIndex: 210, background: '#020d18', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ fontFamily: 'Orbitron, sans-serif', color: '#00f5c4', fontSize: '0.8rem' }}>LOADING VR LAB...</p>
        </div>}>
          <VRChemistryLab onExit={() => setVrActive(false)} />
        </Suspense>
      )}

      {/* ── AR Modal (iframe) ── */}
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
              src="/ar-chemistry.html"
              style={{ width: '100%', height: '100%', border: 'none', background: '#000' }}
              allow="camera"
              title="AR Chemistry Lab"
            />
          </div>
          <button
            className="btn-teal"
            style={{ marginTop: 16 }}
            onClick={() => setArActive(false)}
          >
            CLOSE AR MODE
          </button>
          <p style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '0.8rem', color: '#4a7a8a', marginTop: 8, textAlign: 'center' }}>
            Point your camera at a Hiro marker to see the AR overlay.
            <br />
            Download Hiro marker at ar-js-org.github.io
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default ChemistryLab;
