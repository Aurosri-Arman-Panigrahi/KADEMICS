// src/components/HUD/Sidebar.tsx
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  FlaskConical,
  Globe,
  Dna,
  User,
  Trophy,
} from 'lucide-react';

interface NavItem {
  label: string;
  route: string;
  icon: React.ReactNode;
  color: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Home', route: '/', icon: <Home size={18} />, color: '#00f5c4' },
  { label: 'Chemistry', route: '/chemistry', icon: <FlaskConical size={18} />, color: '#1af0ff' },
  { label: 'Physics', route: '/physics', icon: <Globe size={18} />, color: '#b44fff' },
  { label: 'Biology', route: '/biology', icon: <Dna size={18} />, color: '#00f5c4' },
  { label: 'Profile', route: '/profile', icon: <User size={18} />, color: '#1af0ff' },
  { label: 'Achievements', route: '/achievements', icon: <Trophy size={18} />, color: '#b44fff' },
];

/**
 * Floating right-rail navigation sidebar.
 * Expands on hover to reveal labels.
 * Collapses to bottom bar on mobile (< 768px).
 */
export const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      {/* ── Desktop Sidebar (right rail) ── */}
      <motion.nav
        onHoverStart={() => setExpanded(true)}
        onHoverEnd={() => setExpanded(false)}
        animate={{ width: expanded ? 190 : 56 }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
        style={{
          position: 'fixed',
          right: 16,
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 100,
          background: 'rgba(0,245,196,0.05)',
          border: '1px solid rgba(0,245,196,0.2)',
          backdropFilter: 'blur(16px) saturate(180%)',
          WebkitBackdropFilter: 'blur(16px) saturate(180%)',
          borderRadius: 12,
          boxShadow: '0 0 30px rgba(0,245,196,0.08), inset 0 1px 0 rgba(255,255,255,0.05)',
          padding: '8px 0',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
        className="hidden md:flex"
      >
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.route;
          return (
            <motion.button
              key={item.route}
              onClick={() => navigate(item.route)}
              whileHover={{ x: 4 }}
              transition={{ duration: 0.15 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 18px',
                background: isActive ? 'rgba(0,245,196,0.1)' : 'transparent',
                border: 'none',
                borderLeft: isActive ? `2px solid ${item.color}` : '2px solid transparent',
                cursor: 'pointer',
                color: isActive ? item.color : '#4a7a8a',
                transition: 'color 0.2s, background 0.2s',
                whiteSpace: 'nowrap',
                width: '100%',
                textAlign: 'left',
              }}
            >
              <span
                style={{
                  color: isActive ? item.color : '#4a7a8a',
                  flexShrink: 0,
                  filter: isActive ? `drop-shadow(0 0 4px ${item.color})` : 'none',
                }}
              >
                {item.icon}
              </span>
              <AnimatePresence>
                {expanded && (
                  <motion.span
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    transition={{ duration: 0.15 }}
                    style={{
                      fontFamily: 'Orbitron, sans-serif',
                      fontSize: '0.6rem',
                      letterSpacing: '0.1em',
                      color: isActive ? item.color : '#4a7a8a',
                      textShadow: isActive ? `0 0 8px ${item.color}` : 'none',
                    }}
                  >
                    {item.label.toUpperCase()}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}

        {/* SYS ONLINE indicator */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 18px',
            marginTop: 4,
            borderTop: '1px solid rgba(0,245,196,0.1)',
          }}
        >
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <div
              style={{
                width: 8,
                height: 8,
                background: '#00f5c4',
                borderRadius: '50%',
                boxShadow: '0 0 6px #00f5c4',
              }}
            />
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: '#00f5c4',
                borderRadius: '50%',
                opacity: 0.4,
                animation: 'pulseRing 1.5s ease-out infinite',
              }}
            />
          </div>
          <AnimatePresence>
            {expanded && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                  fontFamily: 'Share Tech Mono, monospace',
                  fontSize: '0.6rem',
                  color: '#00f5c4',
                  letterSpacing: '0.08em',
                  whiteSpace: 'nowrap',
                }}
              >
                SYS ONLINE
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </motion.nav>

      {/* ── Mobile Bottom Bar ── */}
      <nav
        className="flex md:hidden"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          background: 'rgba(2,13,24,0.95)',
          borderTop: '1px solid rgba(0,245,196,0.2)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          display: 'flex',
          justifyContent: 'space-around',
          padding: '8px 0',
        }}
      >
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.route;
          return (
            <button
              key={item.route}
              onClick={() => navigate(item.route)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 3,
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: isActive ? item.color : '#4a7a8a',
                padding: '4px 8px',
                borderRadius: 8,
                transition: 'color 0.2s',
              }}
            >
              <span style={{ filter: isActive ? `drop-shadow(0 0 4px ${item.color})` : 'none' }}>
                {item.icon}
              </span>
              <span
                style={{
                  fontFamily: 'Orbitron, sans-serif',
                  fontSize: '0.45rem',
                  letterSpacing: '0.06em',
                  color: isActive ? item.color : '#4a7a8a',
                }}
              >
                {item.label.toUpperCase()}
              </span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
