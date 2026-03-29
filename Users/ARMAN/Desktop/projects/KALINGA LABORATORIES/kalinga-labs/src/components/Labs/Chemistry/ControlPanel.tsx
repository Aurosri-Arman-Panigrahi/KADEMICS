// src/components/Labs/Chemistry/ControlPanel.tsx
import React, { useState, useCallback } from 'react';
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

  const { addReactionLog, unlockAchievement, reactionLog } = useLabStore();

  const handleReact = useCallback(() => {
    const reaction = findReaction(elemA, elemB);
    if (!reaction) {
      setError(`No known reaction between ${elemA} and ${elemB}. Try H+O, Na+Cl, C+O.`);
      setCurrentReaction(null);
      onReact(elemA, elemB, null);
      return;
    }
    setError(null);
    setCurrentReaction(reaction);
    onReact(elemA, elemB, reaction);
    addReactionLog({
      elementA: elemA,
      elementB: elemB,
      result: reaction.name,
      formula: reaction.formula,
    });
    unlockAchievement('first-reaction');
    // Check all 4 reactions completed
    const completedIds = new Set([
      ...reactionLog.map((r) => findReaction(r.elementA, r.elementB)?.id).filter(Boolean),
      reaction.id,
    ]);
    if (completedIds.size >= 4) unlockAchievement('molecule-master');
  }, [elemA, elemB, addReactionLog, unlockAchievement, onReact, reactionLog]);

  const infoA = ELEMENT_INFO[elemA];
  const infoB = ELEMENT_INFO[elemB];

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
            <select
              className="cyber-select"
              value={elemA}
              onChange={(e) => setElemA(e.target.value as ElementSymbol)}
            >
              {ELEMENTS.map((el) => (
                <option key={el} value={el}>
                  {el} — {ELEMENT_INFO[el].name}
                </option>
              ))}
            </select>
          </div>
          <span style={{ color: '#00f5c4', fontFamily: 'Orbitron, sans-serif', fontSize: '1.1rem', paddingTop: 16 }}>+</span>
          <div style={{ flex: 1 }}>
            <label style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '0.65rem', color: '#4a7a8a', display: 'block', marginBottom: 4 }}>ELEMENT B</label>
            <select
              className="cyber-select"
              value={elemB}
              onChange={(e) => setElemB(e.target.value as ElementSymbol)}
            >
              {ELEMENTS.map((el) => (
                <option key={el} value={el}>
                  {el} — {ELEMENT_INFO[el].name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <button className="btn-teal" style={{ width: '100%', marginTop: 12 }} onClick={handleReact}>
          ⚡ INITIATE REACTION
        </button>
        {error && (
          <p style={{ color: '#b44fff', fontFamily: 'Share Tech Mono, monospace', fontSize: '0.7rem', marginTop: 8 }}>
            {error}
          </p>
        )}
      </GlassPanel>

      {/* Result display */}
      {currentReaction && (
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
      )}

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
        onClick={() => {
          onARToggle();
          unlockAchievement('ar-pioneer');
        }}
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

      {/* Available reactions list */}
      <GlassPanel glowColor="none" padding="0.75rem">
        <p style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '0.6rem', color: '#4a7a8a', letterSpacing: '0.1em', marginBottom: 6 }}>KNOWN REACTIONS</p>
        {REACTIONS.map((r) => (
          <div key={r.id} style={{ padding: '4px 0', borderBottom: '1px solid rgba(0,245,196,0.05)' }}>
            <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '0.7rem', color: '#00f5c4' }}>{r.formula}</span>
            <span style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '0.75rem', color: '#4a7a8a', marginLeft: 8 }}>{r.name}</span>
          </div>
        ))}
      </GlassPanel>
    </div>
  );
};
