// src/components/HUD/Logo.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

/**
 * Persistent top-left HUD logo — full-fit logo image in glassmorphism box.
 * Logo fills the container completely with object-fit: contain.
 */
export const Logo: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.5, duration: 0.8, ease: 'easeOut' }}
      style={{
        position: 'fixed',
        top: 16,
        left: 16,
        zIndex: 100,
      }}
    >
      <Link to="/" style={{ textDecoration: 'none' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            background: 'rgba(0,245,196,0.05)',
            border: '1px solid rgba(0,245,196,0.2)',
            backdropFilter: 'blur(16px) saturate(180%)',
            WebkitBackdropFilter: 'blur(16px) saturate(180%)',
            borderRadius: 10,
            padding: '8px 12px',
            boxShadow: '0 0 20px rgba(0,245,196,0.08), inset 0 1px 0 rgba(255,255,255,0.05)',
            transition: 'box-shadow 0.3s ease',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLDivElement).style.boxShadow =
              '0 0 30px rgba(0,245,196,0.2), inset 0 1px 0 rgba(255,255,255,0.08)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLDivElement).style.boxShadow =
              '0 0 20px rgba(0,245,196,0.08), inset 0 1px 0 rgba(255,255,255,0.05)';
          }}
        >
          {/* Logo image — full-fit in 48×48 container */}
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 8,
              overflow: 'hidden',
              flexShrink: 0,
              background: 'rgba(0,245,196,0.06)',
              border: '1px solid rgba(0,245,196,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <img
              src="/logo.png"
              alt="Kalinga Laboratories"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                display: 'block',
                padding: 2,
              }}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent) {
                  parent.innerHTML =
                    '<span style="font-family:Orbitron,sans-serif;font-size:16px;color:#00f5c4;font-weight:900;">KL</span>';
                }
              }}
            />
          </div>

          {/* Brand text */}
          <div>
            <div
              style={{
                fontFamily: 'Orbitron, sans-serif',
                fontSize: 9,
                letterSpacing: '0.2em',
                color: '#00f5c4',
                textShadow: '0 0 8px rgba(0,245,196,0.5)',
                lineHeight: 1.4,
                whiteSpace: 'nowrap',
              }}
            >
              KALINGA
            </div>
            <div
              style={{
                fontFamily: 'Orbitron, sans-serif',
                fontSize: 9,
                letterSpacing: '0.2em',
                color: '#00f5c4',
                textShadow: '0 0 8px rgba(0,245,196,0.5)',
                lineHeight: 1.4,
                whiteSpace: 'nowrap',
              }}
            >
              LABORATORIES
            </div>
          </div>

          {/* Corner accent */}
          <div style={{
            position: 'absolute',
            bottom: 4,
            right: 8,
            width: 10,
            height: 10,
            borderRight: '1px solid rgba(0,245,196,0.3)',
            borderBottom: '1px solid rgba(0,245,196,0.3)',
          }} />
        </div>
      </Link>
    </motion.div>
  );
};
