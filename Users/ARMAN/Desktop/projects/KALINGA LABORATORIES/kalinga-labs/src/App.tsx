// src/App.tsx
import React, { Suspense } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Logo } from '@/components/HUD/Logo';
import { Sidebar } from '@/components/HUD/Sidebar';
import { AchievementsBadge } from '@/components/HUD/AchievementsBadge';
import { HelpButton } from '@/components/HUD/HelpButton';
import { LoadingPortal } from '@/components/Shared/LoadingPortal';
import { LobbyScene } from '@/components/Lobby/LobbyScene';

const ChemistryLab   = React.lazy(() => import('@/components/Labs/ChemistryLab'));
const PhysicsLab     = React.lazy(() => import('@/components/Labs/PhysicsLab'));
const BiologyLab     = React.lazy(() => import('@/components/Labs/BiologyLab'));
const ScientistProfile = React.lazy(() => import('@/components/Pages/ScientistProfile'));
const Achievements   = React.lazy(() => import('@/components/Pages/Achievements'));

function App() {
  const location = useLocation();

  return (
    <>
      {/* Global background logo watermark — fixed, behind everything */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'none',
          backgroundImage: 'url(/logo.png)',
          backgroundRepeat: 'no-repeat',
          backgroundSize: '380px',
          backgroundPosition: 'center center',
          opacity: 0.055,
          filter: 'grayscale(20%) brightness(1.2)',
        }}
      />

      {/* Scan-line overlay for sci-fi feel */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'none',
          backgroundImage:
            'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,245,196,0.012) 2px, rgba(0,245,196,0.012) 4px)',
        }}
      />

      {/* Persistent HUD — above everything */}
      <Logo />
      <Sidebar />
      <AchievementsBadge />
      <HelpButton />

      {/* Page routes */}
      <AnimatePresence mode="wait">
        <Suspense fallback={<LoadingPortal message="LOADING MODULE..." />}>
          <Routes location={location} key={location.pathname}>
            <Route path="/"             element={<LobbyScene />} />
            <Route path="/chemistry"    element={<ChemistryLab />} />
            <Route path="/physics"      element={<PhysicsLab />} />
            <Route path="/biology"      element={<BiologyLab />} />
            <Route path="/profile"      element={<ScientistProfile />} />
            <Route path="/achievements" element={<Achievements />} />
            <Route
              path="*"
              element={
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  height: '100vh', flexDirection: 'column', gap: 16,
                  fontFamily: 'Orbitron, sans-serif', color: '#4a7a8a',
                }}>
                  <p style={{ fontSize: '1rem', letterSpacing: '0.2em' }}>404 — SECTOR NOT FOUND</p>
                  <a href="/" style={{ color: '#00f5c4', fontSize: '0.7rem', letterSpacing: '0.15em', textDecoration: 'none' }}>
                    ← RETURN TO LOBBY
                  </a>
                </div>
              }
            />
          </Routes>
        </Suspense>
      </AnimatePresence>
    </>
  );
}

export default App;
