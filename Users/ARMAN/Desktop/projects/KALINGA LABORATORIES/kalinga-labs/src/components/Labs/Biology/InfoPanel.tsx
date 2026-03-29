// src/components/Labs/Biology/InfoPanel.tsx
import React, { useState, useCallback } from 'react';
import { GlassPanel } from '@/components/Shared/GlassPanel';
import { NeonText } from '@/components/Shared/NeonText';
import { BODY_SYSTEMS, ORGANS, getOrgansBySystem, BodySystem, OrganInfo } from './organData';
import { useLabStore } from '@/store/labStore';
import { motion, AnimatePresence } from 'framer-motion';

interface InfoPanelProps {
  activeSystem: BodySystem;
  onSystemChange: (s: BodySystem) => void;
  selectedOrgan: OrganInfo | null;
  studyMode: boolean;
  onStudyToggle: () => void;
  onARToggle: () => void;
  arActive: boolean;
  explodeAmount: number;
  onExplodeChange: (v: number) => void;
  onQuizTarget: (organ: OrganInfo | null) => void;
}

export const InfoPanel: React.FC<InfoPanelProps> = ({
  activeSystem,
  onSystemChange,
  selectedOrgan,
  studyMode,
  onStudyToggle,
  onARToggle,
  arActive,
  explodeAmount,
  onExplodeChange,
  onQuizTarget,
}) => {
  const [quizMode, setQuizMode] = useState(false);
  const [quizOrgan, setQuizOrgan] = useState<OrganInfo | null>(null);
  const [quizFeedback, setQuizFeedback] = useState<string | null>(null);
  const { unlockAchievement, incrementOrgans, scientist } = useLabStore();

  // Watched systems for achievement
  const systemsVisited = React.useRef(new Set<BodySystem>());

  const handleSystemChange = useCallback(
    (s: BodySystem) => {
      onSystemChange(s);
      systemsVisited.current.add(s);
      if (systemsVisited.current.size >= 5) unlockAchievement('anatomist');
    },
    [onSystemChange, unlockAchievement]
  );

  const startQuiz = useCallback(() => {
    const organs = getOrgansBySystem(activeSystem);
    const target = organs[Math.floor(Math.random() * organs.length)];
    setQuizOrgan(target);
    onQuizTarget(target);
    setQuizFeedback(null);
    setQuizMode(true);
  }, [activeSystem, onQuizTarget]);

  const handleQuizAnswer = useCallback(
    (organ: OrganInfo) => {
      if (!quizOrgan) return;
      if (organ.id === quizOrgan.id) {
        setQuizFeedback('✓ CORRECT!');
        incrementOrgans();
        if (scientist.organsIdentified + 1 >= 10) unlockAchievement('organ-hunter');
        setTimeout(() => {
          startQuiz();
        }, 1200);
      } else {
        setQuizFeedback(`✗ That was ${organ.name}. Try again!`);
      }
    },
    [quizOrgan, incrementOrgans, unlockAchievement, scientist.organsIdentified, startQuiz]
  );

  const systemOrgans = getOrgansBySystem(activeSystem);
  const sysInfo = BODY_SYSTEMS.find((s) => s.id === activeSystem)!;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', height: '100%', overflowY: 'auto', padding: '0.75rem' }}>
      <NeonText as="h2" glow="teal" size="0.9rem" tracking="0.15em">BIO LAB</NeonText>
      <div className="teal-divider" />

      {/* System tabs */}
      <GlassPanel glowColor="teal" padding="0.6rem">
        <p style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '0.55rem', color: '#4a7a8a', letterSpacing: '0.1em', marginBottom: 6 }}>BODY SYSTEM</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {BODY_SYSTEMS.map((sys) => (
            <button
              key={sys.id}
              onClick={() => handleSystemChange(sys.id)}
              className="btn-teal"
              style={{
                padding: '4px 8px',
                fontSize: '0.55rem',
                background: activeSystem === sys.id ? 'rgba(0,245,196,0.2)' : undefined,
                borderColor: activeSystem === sys.id ? sys.color : undefined,
                color: activeSystem === sys.id ? sys.color : undefined,
              }}
            >
              {sys.icon} {sys.label}
            </button>
          ))}
        </div>
      </GlassPanel>

      {/* Explode view slider */}
      <GlassPanel glowColor="none" padding="0.6rem">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
          <p style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '0.55rem', color: '#4a7a8a', letterSpacing: '0.1em' }}>EXPLODE VIEW</p>
          <span className="data-value" style={{ fontSize: '0.65rem' }}>{(explodeAmount * 100).toFixed(0)}%</span>
        </div>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={explodeAmount}
          onChange={(e) => onExplodeChange(parseFloat(e.target.value))}
          style={{ width: '100%' }}
        />
      </GlassPanel>

      {/* Selected organ info */}
      <AnimatePresence mode="wait">
        {selectedOrgan && (
          <motion.div
            key={selectedOrgan.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            <GlassPanel glowColor="teal" padding="0.75rem">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: '1.4rem' }}>{selectedOrgan.emoji}</span>
                <div>
                  <p style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '0.85rem', color: sysInfo.color }}>{selectedOrgan.name}</p>
                  <p style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '0.55rem', color: '#4a7a8a' }}>{sysInfo.label.toUpperCase()} SYSTEM</p>
                </div>
              </div>
              <p style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '0.85rem', color: '#e0faff', marginBottom: 8, lineHeight: 1.5 }}>
                {selectedOrgan.function}
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
                {[
                  ['WEIGHT', selectedOrgan.weight],
                  ['SIZE', selectedOrgan.size],
                  ['COMPOSITION', selectedOrgan.composition],
                ].map(([k, v]) => (
                  <div key={k} style={{ gridColumn: k === 'COMPOSITION' ? '1 / -1' : undefined }}>
                    <p style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '0.5rem', color: '#4a7a8a' }}>{k}</p>
                    <p className="data-value" style={{ fontSize: '0.68rem' }}>{v}</p>
                  </div>
                ))}
              </div>
            </GlassPanel>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
        <button
          className="btn-teal"
          style={{ background: studyMode ? 'rgba(0,245,196,0.2)' : undefined }}
          onClick={onStudyToggle}
        >
          {studyMode ? '🏷️ LABELS ON' : '🏷️ LABELS OFF'}
        </button>
        <button
          className="btn-teal"
          style={{ background: arActive ? 'rgba(180,79,255,0.15)' : undefined, color: arActive ? '#b44fff' : undefined }}
          onClick={onARToggle}
        >
          📡 AR MODE
        </button>
      </div>

      {/* Quiz mode */}
      <GlassPanel glowColor={quizMode ? 'purple' : 'none'} padding="0.75rem">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <p style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '0.6rem', color: '#b44fff', letterSpacing: '0.1em' }}>
            QUIZ MODE
          </p>
          <button
            className="btn-teal"
            style={{ padding: '2px 8px', fontSize: '0.55rem', color: '#b44fff', borderColor: '#b44fff' }}
            onClick={quizMode ? () => { setQuizMode(false); onQuizTarget(null); } : startQuiz}
          >
            {quizMode ? 'STOP' : 'START'}
          </button>
        </div>
        {quizMode && quizOrgan && (
          <div>
            <p style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '0.9rem', color: '#e0faff', marginBottom: 8 }}>
              Click the <strong style={{ color: '#b44fff' }}>{quizOrgan.name}</strong>
            </p>
            <AnimatePresence mode="wait">
              {quizFeedback && (
                <motion.p
                  key={quizFeedback}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  style={{
                    fontFamily: 'Share Tech Mono, monospace',
                    fontSize: '0.8rem',
                    color: quizFeedback.startsWith('✓') ? '#00f5c4' : '#b44fff',
                  }}
                >
                  {quizFeedback}
                </motion.p>
              )}
            </AnimatePresence>
            <p style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '0.6rem', color: '#4a7a8a', marginTop: 4 }}>
              Identified: {scientist.organsIdentified}/10
            </p>
          </div>
        )}
        {!quizMode && (
          <p style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '0.8rem', color: '#4a7a8a' }}>
            Identify organs in the 3D viewer to unlock the "Organ Hunter" achievement!
          </p>
        )}
      </GlassPanel>

      {/* Organ list */}
      <GlassPanel glowColor="none" padding="0.6rem">
        <p style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '0.55rem', color: '#4a7a8a', letterSpacing: '0.1em', marginBottom: 6 }}>
          {sysInfo.label.toUpperCase()} — {systemOrgans.length} ORGANS
        </p>
        {systemOrgans.map((org) => (
          <div
            key={org.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '4px 0',
              borderBottom: '1px solid rgba(0,245,196,0.05)',
              cursor: 'pointer',
            }}
          >
            <span style={{ fontSize: '0.9rem' }}>{org.emoji}</span>
            <div>
              <p style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '0.85rem', color: '#e0faff' }}>{org.name}</p>
              <p style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '0.7rem', color: '#4a7a8a' }}>{org.weight}</p>
            </div>
          </div>
        ))}
      </GlassPanel>
    </div>
  );
};
