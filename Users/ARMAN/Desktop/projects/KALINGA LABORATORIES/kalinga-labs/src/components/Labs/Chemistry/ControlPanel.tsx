// src/components/Labs/Chemistry/ControlPanel.tsx
import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassPanel } from '@/components/Shared/GlassPanel';
import { NeonText } from '@/components/Shared/NeonText';
import { ELEMENTS, REACTIONS, findReaction, ELEMENT_INFO, ElementSymbol } from './reactions';
import type { ReactionDef } from './reactions';
import { useLabStore } from '@/store/labStore';

interface ControlPanelProps {
  onReact: (elemA: ElementSymbol, elemB: ElementSymbol, reaction: ReactionDef | null) => void;
  onARToggle: () => void;
  arActive: boolean;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({ onReact, onARToggle, arActive }) => {
  const [elemA, setElemA] = useState<ElementSymbol>('H');
  const [elemB, setElemB] = useState<ElementSymbol>('O');
  const [currentReaction, setCurrentReaction] = useState<ReactionDef | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reacting, setReacting] = useState(false);

  const { addReactionLog, unlockAchievement, reactionLog } = useLabStore();

  const fireReaction = useCallback((a: ElementSymbol, b: ElementSymbol) => {
    const reaction = findReaction(a, b);
    if (!reaction) {
      setError(`No known reaction between ${a} and ${b}. Try H+O, Na+Cl, C+O.`);
      setCurrentReaction(null);
      onReact(a, b, null);
      return;
    }
    setError(null);
    setCurrentReaction(reaction);
    setReacting(true);
    onReact(a, b, reaction);
    addReactionLog({ elementA: a, elementB: b, result: reaction.name, formula: reaction.formula });
    unlockAchievement('first-reaction');
    const completedIds = new Set([
      ...reactionLog.map((r) => findReaction(r.elementA, r.elementB)?.id).filter(Boolean),
      reaction.id,
    ]);
    if (completedIds.size >= 4) unlockAchievement('molecule-master');
    setTimeout(() => setReacting(false), 2000);
  }, [addReactionLog, unlockAchievement, onReact, reactionLog]);

  const handleReact = useCallback(() => fireReaction(elemA, elemB), [elemA, elemB, fireReaction]);

  // Quick-react a reaction from the known list
  const quickReact = useCallback((r: ReactionDef) => {
    // Use first two reactant elements
    const parts = r.formula.split('→')[0].replace(/\d/g,'').split('+').map(s => s.trim());
    const a = (parts[0] || elemA) as ElementSymbol;
    const b = (parts[1] || elemB) as ElementSymbol;
    setElemA(a);
    setElemB(b);
    setError(null);
    setCurrentReaction(r);
    setReacting(true);
    onReact(a, b, r);
    addReactionLog({ elementA: a, elementB: b, result: r.name, formula: r.formula });
    unlockAchievement('first-reaction');
    setTimeout(() => setReacting(false), 2000);
  }, [onReact, addReactionLog, unlockAchievement, elemA, elemB]);

  const infoA = ELEMENT_INFO[elemA] ?? { name: elemA, mass: '—' };
  const infoB = ELEMENT_INFO[elemB] ?? { name: elemB, mass: '—' };
  const reactionExists = !!findReaction(elemA, elemB);

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        overflowY: 'auto',
        padding: '1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
      }}
    >
      {/* Title */}
      <NeonText as="h2" glow="blue" size="1rem" tracking="0.15em">
        REACTION CHAMBER
      </NeonText>
      <div className="teal-divider" />

      {/* Element selectors */}
      <GlassPanel glowColor="teal" padding="0.75rem">
        <p style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '0.6rem', color: '#4a7a8a', letterSpacing: '0.1em', marginBottom: 8 }}>
          SELECT REACTANTS
        </p>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '0.65rem', color: '#4a7a8a', display: 'block', marginBottom: 4 }}>ELEMENT A</label>
            <select className="cyber-select" value={elemA} onChange={(e) => setElemA(e.target.value as ElementSymbol)}>
              {ELEMENTS.map((el) => (
                <option key={el} value={el}>{el} — {ELEMENT_INFO[el]?.name ?? el}</option>
              ))}
            </select>
          </div>
          <span style={{ color: '#00f5c4', fontFamily: 'Orbitron, sans-serif', fontSize: '1.1rem', paddingTop: 16 }}>+</span>
          <div style={{ flex: 1 }}>
            <label style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '0.65rem', color: '#4a7a8a', display: 'block', marginBottom: 4 }}>ELEMENT B</label>
            <select className="cyber-select" value={elemB} onChange={(e) => setElemB(e.target.value as ElementSymbol)}>
              {ELEMENTS.map((el) => (
                <option key={el} value={el}>{el} — {ELEMENT_INFO[el]?.name ?? el}</option>
              ))}
            </select>
          </div>
        </div>

        {/* REACT button — smart color based on whether reaction exists */}
        <motion.button
          className="btn-teal"
          style={{
            width: '100%',
            marginTop: 12,
            fontSize: '0.9rem',
            fontWeight: 700,
            letterSpacing: '0.15em',
            background: reacting
              ? 'linear-gradient(135deg, rgba(0,245,196,0.5), rgba(26,240,255,0.4))'
              : reactionExists
              ? 'linear-gradient(135deg, rgba(0,245,196,0.25), rgba(26,240,255,0.15))'
              : 'rgba(255,80,80,0.1)',
            borderColor: reacting ? '#00f5c4' : reactionExists ? '#00f5c4' : '#ff5050',
            color: reacting ? '#fff' : reactionExists ? '#00f5c4' : '#ff5050',
            boxShadow: reacting ? '0 0 24px rgba(0,245,196,0.6)' : '0 0 12px rgba(0,245,196,0.2)',
            transition: 'all 0.3s ease',
          }}
          animate={reacting ? { scale: [1, 1.03, 1] } : {}}
          transition={{ repeat: reacting ? Infinity : 0, duration: 0.4 }}
          onClick={handleReact}
        >
          {reacting ? '💥 REACTING...' : reactionExists ? '⚗️ REACT!' : '⚡ INITIATE REACTION'}
        </motion.button>

        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{ color: '#ff5050', fontFamily: 'Share Tech Mono, monospace', fontSize: '0.7rem', marginTop: 8 }}
            >
              ⚠ {error}
            </motion.p>
          )}
        </AnimatePresence>
      </GlassPanel>

      {/* Result display */}
      <AnimatePresence mode="wait">
        {currentReaction && (
          <motion.div
            key={currentReaction.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <GlassPanel glowColor="teal" padding="0.75rem">
              <p style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '0.6rem', color: '#00f5c4', letterSpacing: '0.1em', marginBottom: 6 }}>REACTION RESULT</p>
              <p style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '0.9rem', color: '#e0faff', marginBottom: 4 }}>{currentReaction.formula}</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginTop: 8 }}>
                {[
                  ['TYPE', currentReaction.type],
                  ['ENERGY', `${currentReaction.energyKJ} kJ/mol`],
                  ['STATE', currentReaction.state.toUpperCase()],
                  ['MOLAR MASS', `${currentReaction.molarMass} g/mol`],
                ].map(([label, value]) => (
                  <div key={label}>
                    <p style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '0.5rem', color: '#4a7a8a', letterSpacing: '0.1em' }}>{label}</p>
                    <p className="data-value">{value}</p>
                  </div>
                ))}
              </div>
              <p style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '0.85rem', color: '#4a7a8a', marginTop: 8, lineHeight: 1.5 }}>
                {currentReaction.description}
              </p>
            </GlassPanel>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Element info cards */}
      <GlassPanel glowColor="none" padding="0.75rem">
        <p style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '0.6rem', color: '#4a7a8a', letterSpacing: '0.1em', marginBottom: 6 }}>ELEMENT INFO</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {[{ sym: elemA, info: infoA }, { sym: elemB, info: infoB }].map(({ sym, info }) => (
            <div key={sym} style={{ background: 'rgba(0,245,196,0.03)', borderRadius: 8, padding: '8px 10px', border: '1px solid rgba(0,245,196,0.1)' }}>
              <p style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '1rem', color: '#00f5c4' }}>{sym}</p>
              <p style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '0.8rem', color: '#e0faff' }}>{info.name}</p>
              <p className="data-value" style={{ fontSize: '0.7rem' }}>{info.mass} g/mol</p>
            </div>
          ))}
        </div>
      </GlassPanel>

      {/* AR toggle */}
      <button
        className="btn-teal"
        style={{ width: '100%', background: arActive ? 'rgba(180,79,255,0.15)' : undefined, borderColor: arActive ? '#b44fff' : undefined, color: arActive ? '#b44fff' : undefined }}
        onClick={() => { onARToggle(); unlockAchievement('ar-pioneer'); }}
      >
        {arActive ? '📡 AR MODE ACTIVE' : '📡 ENABLE AR MODE'}
      </button>

      {/* Reaction Log */}
      {reactionLog.length > 0 && (
        <GlassPanel glowColor="none" padding="0.75rem">
          <p style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '0.6rem', color: '#4a7a8a', letterSpacing: '0.1em', marginBottom: 6 }}>REACTION LOG</p>
          <div style={{ maxHeight: 140, overflowY: 'auto' }}>
            {reactionLog.slice(0, 8).map((entry) => (
              <div key={entry.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid rgba(0,245,196,0.05)' }}>
                <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '0.7rem', color: '#e0faff' }}>{entry.formula}</span>
                <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '0.65rem', color: '#4a7a8a' }}>
                  {new Date(entry.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </GlassPanel>
      )}

      {/* Clickable Known Reactions — CLICK ANY TO REACT INSTANTLY */}
      <GlassPanel glowColor="none" padding="0.75rem">
        <p style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '0.6rem', color: '#4a7a8a', letterSpacing: '0.1em', marginBottom: 8 }}>
          KNOWN REACTIONS — <span style={{ color: '#00f5c4' }}>CLICK TO REACT</span>
        </p>
        {REACTIONS.map((r) => (
          <motion.div
            key={r.id}
            whileHover={{ x: 4, backgroundColor: 'rgba(0,245,196,0.08)' }}
            whileTap={{ scale: 0.97 }}
            onClick={() => quickReact(r)}
            style={{
              padding: '8px 10px',
              borderBottom: '1px solid rgba(0,245,196,0.06)',
              cursor: 'pointer',
              borderRadius: 6,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 8,
              transition: 'background 0.2s',
            }}
          >
            <div>
              <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '0.75rem', color: '#00f5c4' }}>{r.formula}</span>
              <span style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '0.75rem', color: '#4a7a8a', marginLeft: 8 }}>{r.name}</span>
            </div>
            <motion.span
              whileHover={{ scale: 1.1 }}
              style={{
                fontFamily: 'Orbitron, sans-serif', fontSize: '0.5rem',
                color: '#00f5c4', border: '1px solid rgba(0,245,196,0.35)',
                borderRadius: 4, padding: '2px 6px', whiteSpace: 'nowrap',
                background: 'rgba(0,245,196,0.05)',
              }}
            >
              ⚗️ REACT
            </motion.span>
          </motion.div>
        ))}
      </GlassPanel>
    </div>
  );
};
