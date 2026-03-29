// src/components/HUD/HelpButton.tsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';

/* ─── Per-route help content ─── */
const HELP_CONTENT: Record<string, { icon: string; title: string; tips: string[]; ar?: string }> = {
  '/': {
    icon: '🏠',
    title: 'Welcome to Kalinga Labs',
    tips: [
      'Click any glowing 3D portal to enter a laboratory.',
      'DNA helix portal (left) → Biology Lab.',
      'Atom portal (center) → Chemistry Lab.',
      'Solar system portal (right) → Physics Lab.',
      'Drag and orbit the 3D space with your mouse.',
      'Use the right sidebar or bottom bar to navigate directly.',
      'Your achievements are tracked in the trophy badge (bottom-right).',
    ],
  },
  '/chemistry': {
    icon: '⚗️',
    title: 'Chemistry Lab',
    tips: [
      'Select Element A and Element B from the dropdowns.',
      'Click ⚡ INITIATE REACTION to start the simulation.',
      'Watch the 3D reaction chamber animate the result.',
      'Switch to the EQUIPMENT tab to explore lab tools.',
      'Switch to the ELEMENTS tab for the periodic table info.',
      'Your reaction log is saved automatically.',
      'Click 📡 ENABLE AR MODE and point your camera at a Hiro marker.',
      'Download the Hiro marker at: ar-js-org.github.io',
    ],
    ar: 'Print or display: https://ar-js-org.github.io/AR.js/three.js/examples/marker-training/examples/pattern-default.htm',
  },
  '/physics': {
    icon: '🌌',
    title: 'Physics Lab',
    tips: [
      'The NASA APOD (Astronomy Picture of the Day) loads at the top.',
      'Scroll down to see the interactive Solar System Simulator.',
      'Click any planet to see its real NASA data (mass, moons, diameter).',
      'Drag the ORBIT SPEED slider to accelerate or slow orbital motion.',
      'Drag to orbit the solar system · Scroll to zoom in/out.',
      'The NEO table shows real Near Earth Objects from NASA today.',
      'Scroll further to see Mars Curiosity rover photos (live feed).',
      'The Exoplanet spotlight shows a real planet beyond our solar system.',
    ],
  },
  '/biology': {
    icon: '🧬',
    title: 'Biology Lab',
    tips: [
      'Select a body system using the tabs: Skeletal, Muscular, Cardiovascular, Nervous, Digestive.',
      'Click any glowing organ marker in the 3D viewer to learn about it.',
      'The info panel shows real organ images, weight, size, and function.',
      'Use the EXPLODE VIEW slider to spread organs apart for study.',
      'Toggle 🏷️ LABELS to show/hide organ names in the 3D view.',
      'Click QUIZ MODE → START to identify organs by clicking them.',
      'Identify 10 organs to unlock the "Organ Hunter" achievement.',
      'Click 📡 AR MODE to view anatomy over a real Hiro marker.',
    ],
    ar: 'Print Hiro marker from: ar-js-org.github.io',
  },
  '/profile': {
    icon: '👤',
    title: 'Scientist Profile',
    tips: [
      'Click ✏️ EDIT PROFILE to change your scientist name.',
      'Choose an avatar from the emoji grid.',
      'Your XP bar fills as you complete experiments and unlock achievements.',
      'The Skill Radar chart visualizes your progress across all labs.',
      'Lab History shows your last 10 chemical reactions.',
      'Level up by completing experiments, visiting labs, and identifying organs.',
    ],
  },
  '/achievements': {
    icon: '🏆',
    title: 'Achievements',
    tips: [
      'There are 12 achievements total to unlock.',
      'Each achievement grants XP that raises your scientist level.',
      'Locked achievements show "???" until discovered.',
      'All achievements are unlocked by using the labs naturally.',
      'Try: running reactions, clicking all planets, visiting all labs.',
      '"Kalinga Scholar" unlocks when all 12 are complete.',
    ],
  },
};

const GLOBAL_SHORTCUTS = [
  ['H', 'Toggle this help menu'],
  ['←', 'Go back in browser history'],
  ['1', 'Navigate to Chemistry Lab'],
  ['2', 'Navigate to Physics Lab'],
  ['3', 'Navigate to Biology Lab'],
];

export const HelpButton: React.FC = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const content = HELP_CONTENT[location.pathname] ?? HELP_CONTENT['/'];

  // Keyboard shortcut
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'h' || e.key === 'H') {
        if ((e.target as HTMLElement).tagName === 'INPUT') return;
        setOpen((p) => !p);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <>
      {/* Floating ? button */}
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
        whileHover={{ scale: 1.1, boxShadow: '0 0 20px rgba(180,79,255,0.5)' }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen((p) => !p)}
        style={{
          position: 'fixed',
          top: 16,
          right: open ? 340 : 16,
          zIndex: 110,
          width: 44,
          height: 44,
          borderRadius: '50%',
          background: 'rgba(180,79,255,0.15)',
          border: '1px solid rgba(180,79,255,0.4)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          color: '#b44fff',
          fontFamily: 'Orbitron, sans-serif',
          fontSize: '1.1rem',
          fontWeight: 700,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'right 0.3s ease',
          boxShadow: '0 0 12px rgba(180,79,255,0.2)',
        }}
        aria-label="Open Help Guide"
      >
        ?
      </motion.button>

      {/* Help Modal Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 40 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              width: 340,
              height: '100vh',
              zIndex: 105,
              background: 'rgba(2,13,24,0.96)',
              borderLeft: '1px solid rgba(180,79,255,0.25)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              display: 'flex',
              flexDirection: 'column',
              overflowY: 'auto',
              boxShadow: '-8px 0 30px rgba(180,79,255,0.1)',
            }}
          >
            {/* Header */}
            <div style={{
              padding: '20px 16px 14px',
              borderBottom: '1px solid rgba(180,79,255,0.15)',
              background: 'rgba(180,79,255,0.05)',
              flexShrink: 0,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <p style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '0.55rem', color: '#b44fff', letterSpacing: '0.2em', marginBottom: 4 }}>
                    AI GUIDE
                  </p>
                  <p style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '0.9rem', color: '#e0faff' }}>
                    {content.icon} {content.title}
                  </p>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  style={{
                    background: 'none', border: 'none', color: '#4a7a8a', fontSize: '1.2rem',
                    cursor: 'pointer', lineHeight: 1, padding: '2px 6px',
                  }}
                >
                  ✕
                </button>
              </div>
              <p style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '0.6rem', color: '#4a7a8a', marginTop: 6 }}>
                Press H to toggle · Route-aware tips
              </p>
            </div>

            {/* Tips */}
            <div style={{ padding: '14px 16px', flex: 1 }}>
              <p style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '0.55rem', color: '#b44fff', letterSpacing: '0.15em', marginBottom: 10 }}>
                HOW TO USE
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {content.tips.map((tip, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    style={{
                      display: 'flex',
                      gap: 10,
                      padding: '8px 10px',
                      background: 'rgba(180,79,255,0.04)',
                      border: '1px solid rgba(180,79,255,0.08)',
                      borderRadius: 6,
                    }}
                  >
                    <span style={{ color: '#b44fff', fontFamily: 'Share Tech Mono, monospace', fontSize: '0.7rem', flexShrink: 0, marginTop: 1 }}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <p style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '0.85rem', color: '#e0faff', lineHeight: 1.5 }}>
                      {tip}
                    </p>
                  </motion.div>
                ))}
              </div>

              {/* AR tip */}
              {content.ar && (
                <div style={{
                  marginTop: 12,
                  padding: '10px',
                  background: 'rgba(0,245,196,0.04)',
                  border: '1px solid rgba(0,245,196,0.15)',
                  borderRadius: 6,
                }}>
                  <p style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '0.55rem', color: '#00f5c4', marginBottom: 4 }}>📡 AR SETUP</p>
                  <p style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '0.8rem', color: '#4a7a8a', lineHeight: 1.5 }}>
                    {content.ar}
                  </p>
                </div>
              )}

              {/* Shortcuts */}
              <div style={{ marginTop: 16 }}>
                <p style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '0.55rem', color: '#b44fff', letterSpacing: '0.15em', marginBottom: 8 }}>
                  KEYBOARD SHORTCUTS
                </p>
                {GLOBAL_SHORTCUTS.map(([key, desc]) => (
                  <div key={key} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '5px 0', borderBottom: '1px solid rgba(180,79,255,0.06)',
                  }}>
                    <span style={{
                      fontFamily: 'Share Tech Mono, monospace', fontSize: '0.7rem',
                      color: '#e0faff', background: 'rgba(180,79,255,0.1)',
                      padding: '2px 8px', borderRadius: 4, border: '1px solid rgba(180,79,255,0.2)',
                    }}>
                      {key}
                    </span>
                    <span style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '0.8rem', color: '#4a7a8a' }}>
                      {desc}
                    </span>
                  </div>
                ))}
              </div>

              {/* About section */}
              <div style={{ marginTop: 16, padding: '10px', background: 'rgba(2,13,24,0.5)', borderRadius: 6 }}>
                <p style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '0.55rem', color: '#4a7a8a', marginBottom: 6 }}>ABOUT</p>
                <p style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '0.8rem', color: '#4a7a8a', lineHeight: 1.6 }}>
                  Kalinga Laboratories is a Sci-Fi AR Educational Ecosystem built on Vite + React + Three.js.
                  Inspired by Odishan Kalinga temple architecture fused with a futuristic cyber aesthetic.
                </p>
                <p style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '0.6rem', color: '#4a7a8a', marginTop: 6 }}>
                  v1.0.0 · Cyber-Odisha Design System
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
