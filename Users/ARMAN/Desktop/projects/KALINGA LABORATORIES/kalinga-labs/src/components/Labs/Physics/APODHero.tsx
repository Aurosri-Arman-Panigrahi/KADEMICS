// src/components/Labs/Physics/APODHero.tsx
import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAPOD } from '@/hooks/useNASA';
import { useLabStore } from '@/store/labStore';

/**
 * Full-width APOD hero section with Ken Burns animation.
 */
export const APODHero: React.FC = () => {
  const { data: apod, isLoading, error } = useAPOD();
  const { unlockAchievement } = useLabStore();

  useEffect(() => {
    if (apod) unlockAchievement('stargazer');
  }, [apod, unlockAchievement]);

  if (isLoading) {
    return (
      <div style={{
        height: 340,
        background: 'linear-gradient(135deg, #020d18, #0d1b2a)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderBottom: '1px solid rgba(0,245,196,0.1)',
      }}>
        <motion.p
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          style={{ fontFamily: 'Orbitron, sans-serif', color: '#4a7a8a', fontSize: '0.7rem', letterSpacing: '0.2em' }}
        >
          FETCHING APOD FROM NASA…
        </motion.p>
      </div>
    );
  }

  if (error || !apod) {
    return (
      <div style={{
        height: 340,
        background: '#0d1b2a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderBottom: '1px solid rgba(180,79,255,0.1)',
      }}>
        <p style={{ fontFamily: 'Share Tech Mono, monospace', color: '#b44fff', fontSize: '0.8rem' }}>
          APOD API UNAVAILABLE — CHECK NETWORK OR API KEY
        </p>
      </div>
    );
  }

  const imgSrc = apod.media_type === 'image' ? apod.url : undefined;

  return (
    <div style={{ position: 'relative', height: 340, overflow: 'hidden', borderBottom: '1px solid rgba(0,245,196,0.1)' }}>
      {/* Background image with Ken Burns */}
      {imgSrc && (
        <motion.div
          animate={{ scale: [1, 1.08] }}
          transition={{ duration: 20, repeat: Infinity, repeatType: 'reverse', ease: 'linear' }}
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${imgSrc})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'brightness(0.45)',
          }}
        />
      )}

      {/* Gradient overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(to right, rgba(2,13,24,0.7) 0%, transparent 50%, rgba(2,13,24,0.4) 100%)',
      }} />
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 80,
        background: 'linear-gradient(to top, #020d18, transparent)',
      }} />

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 2, padding: '2rem', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
        <div style={{
          display: 'inline-block',
          padding: '2px 8px',
          background: 'rgba(0,245,196,0.1)',
          border: '1px solid rgba(0,245,196,0.2)',
          borderRadius: 4,
          marginBottom: 8,
          width: 'fit-content',
        }}>
          <span style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '0.55rem', color: '#00f5c4', letterSpacing: '0.15em' }}>
            NASA ASTRONOMY PICTURE OF THE DAY — {apod.date}
          </span>
        </div>
        <h2 style={{
          fontFamily: 'Orbitron, sans-serif',
          fontSize: 'clamp(1rem, 2.5vw, 1.6rem)',
          color: '#e0faff',
          textShadow: '0 0 20px rgba(0,245,196,0.3)',
          marginBottom: 8,
          maxWidth: 700,
          lineHeight: 1.3,
        }}>
          {apod.title}
        </h2>
        <p style={{
          fontFamily: 'Rajdhani, sans-serif',
          fontSize: '0.9rem',
          color: '#4a7a8a',
          maxWidth: 600,
          lineHeight: 1.5,
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>
          {apod.explanation}
        </p>
        {apod.copyright && (
          <p style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '0.6rem', color: '#4a7a8a', marginTop: 6 }}>
            © {apod.copyright}
          </p>
        )}
      </div>

      {/* Video embed fallback */}
      {apod.media_type === 'video' && (
        <iframe
          src={apod.url}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none', opacity: 0.5 }}
          title={apod.title}
          allow="autoplay"
        />
      )}
    </div>
  );
};
