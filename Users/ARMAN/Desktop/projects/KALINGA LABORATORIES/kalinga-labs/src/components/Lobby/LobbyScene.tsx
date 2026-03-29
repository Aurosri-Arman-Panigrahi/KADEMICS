// src/components/Lobby/LobbyScene.tsx
import React, { useRef, Suspense, useCallback } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { Stars, Html } from '@react-three/drei';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import * as THREE from 'three';
import { DNAPortal } from './DNAPortal';
import { AtomPortal } from './AtomPortal';
import { SolarPortal } from './SolarPortal';
import { useLabStore } from '@/store/labStore';
import { motion } from 'framer-motion';

/* ─── Slowly rotating outer ring ─── */
function Rotunda() {
  const ref = useRef<THREE.Mesh>(null!);
  useFrame(({ clock }) => {
    ref.current.rotation.z = clock.elapsedTime * 0.08;
  });
  return (
    <mesh ref={ref} rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[5, 0.03, 8, 120]} />
      <meshStandardMaterial color="#00f5c4" emissive="#00f5c4" emissiveIntensity={0.4} transparent opacity={0.6} />
    </mesh>
  );
}

function InnerRing() {
  const ref = useRef<THREE.Mesh>(null!);
  useFrame(({ clock }) => {
    ref.current.rotation.y = -clock.elapsedTime * 0.11;
  });
  return (
    <mesh ref={ref}>
      <torusGeometry args={[3.2, 0.015, 8, 90]} />
      <meshStandardMaterial color="#1af0ff" emissive="#1af0ff" emissiveIntensity={0.3} transparent opacity={0.4} />
    </mesh>
  );
}

/* ─── Camera transition via GSAP ─── */
interface CameraControllerProps {
  cameraTarget: React.MutableRefObject<{ x: number; y: number; z: number } | null>;
  navCallback: React.MutableRefObject<(() => void) | null>;
}

function CameraController({ cameraTarget, navCallback }: CameraControllerProps) {
  const { camera } = useThree();
  const animating = useRef(false);

  useFrame(() => {
    if (cameraTarget.current && !animating.current) {
      animating.current = true;
      const t = cameraTarget.current;
      gsap.to(camera.position, {
        x: t.x,
        y: t.y,
        z: t.z + 2.5,
        duration: 1.1,
        ease: 'power3.inOut',
        onComplete: () => {
          if (navCallback.current) navCallback.current();
          cameraTarget.current = null;
          animating.current = false;
        },
      });
      cameraTarget.current = null;
    }
  });
  return null;
}

function FloorGrid() {
  return <gridHelper args={[24, 24, '#00f5c430', '#0d1b2a']} position={[0, -2.5, 0]} />;
}

/* ─── Portal label shown on hover ─── */
function PortalLabel({ text, color }: { text: string; color: string }) {
  return (
    <Html center style={{ pointerEvents: 'none', userSelect: 'none' }}>
      <div style={{
        fontFamily: 'Orbitron, sans-serif',
        fontSize: '0.6rem',
        color,
        letterSpacing: '0.15em',
        whiteSpace: 'nowrap',
        textShadow: `0 0 8px ${color}`,
        background: 'rgba(2,13,24,0.7)',
        padding: '3px 10px',
        borderRadius: 4,
        border: `1px solid ${color}40`,
      }}>
        {text}
      </div>
    </Html>
  );
}

/* ─── Scene ─── */
interface SceneProps {
  cameraTarget: React.MutableRefObject<{ x: number; y: number; z: number } | null>;
  navCallback: React.MutableRefObject<(() => void) | null>;
}

function Scene({ cameraTarget, navCallback }: SceneProps) {
  const navigate = useNavigate();
  const { setActiveLab, visitLab, unlockAchievement } = useLabStore();

  const handlePortalClick = useCallback(
    (portalPos: [number, number, number], route: string, lab: 'chemistry' | 'physics' | 'biology') => {
      cameraTarget.current = { x: portalPos[0], y: portalPos[1], z: portalPos[2] };
      navCallback.current = () => {
        setActiveLab(lab);
        visitLab(lab);
        const store = useLabStore.getState();
        const visited = new Set([...store.scientist.visitedLabs, lab]);
        if (visited.size >= 3) unlockAchievement('lab-director');
        navigate(route);
      };
    },
    [navigate, setActiveLab, visitLab, unlockAchievement, cameraTarget, navCallback]
  );

  return (
    <>
      {/* Lighter fog so stars are visible */}
      <fogExp2 color="#020d18" density={0.018} />
      <ambientLight intensity={0.3} />
      <pointLight position={[0, 6, 6]} color="#1af0ff" intensity={3} decay={2} distance={30} />
      <pointLight position={[0, -2, 0]} color="#00f5c4" intensity={1} decay={2} distance={20} />
      <pointLight position={[-4, 2, 0]} color="#b44fff" intensity={0.8} decay={2} distance={15} />

      <Stars radius={180} depth={50} count={6000} factor={4} saturation={0.3} fade speed={0.5} />
      <Rotunda />
      <InnerRing />
      <FloorGrid />
      <CameraController cameraTarget={cameraTarget} navCallback={navCallback} />

      {/* Biology Portal — DNA */}
      <group position={[-3.2, 0, 0]}>
        <DNAPortal position={[0, 0, 0]} onClick={() => handlePortalClick([-3.2, 0, 0], '/biology', 'biology')} />
        <group position={[0, -1.6, 0]}>
          <PortalLabel text="BIOLOGY LAB" color="#00f5c4" />
        </group>
      </group>

      {/* Chemistry Portal — Atom */}
      <group position={[0, 0, -3.8]}>
        <AtomPortal position={[0, 0, 0]} onClick={() => handlePortalClick([0, 0, -3.8], '/chemistry', 'chemistry')} />
        <group position={[0, -1.6, 0]}>
          <PortalLabel text="CHEMISTRY LAB" color="#1af0ff" />
        </group>
      </group>

      {/* Physics Portal — Solar */}
      <group position={[3.2, 0, 0]}>
        <SolarPortal position={[0, 0, 0]} onClick={() => handlePortalClick([3.2, 0, 0], '/physics', 'physics')} />
        <group position={[0, -1.6, 0]}>
          <PortalLabel text="PHYSICS LAB" color="#b44fff" />
        </group>
      </group>
    </>
  );
}

/* ─── Lobby hint overlay ─── */
function LobbyOverlay() {
  return (
    <>
      {/* YISL VR Hub button — top right */}
      <motion.a
        href="/yisl/index.html"
        target="_blank"
        rel="noreferrer"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.8, duration: 0.6 }}
        whileHover={{ scale: 1.06, boxShadow: '0 0 28px rgba(0,245,196,0.5)' }}
        whileTap={{ scale: 0.96 }}
        style={{
          position: 'absolute',
          top: 18,
          right: 18,
          zIndex: 20,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 18px',
          background: 'rgba(0,245,196,0.08)',
          border: '1px solid rgba(0,245,196,0.4)',
          borderRadius: 8,
          color: '#00f5c4',
          fontFamily: 'Orbitron, sans-serif',
          fontSize: '0.6rem',
          letterSpacing: '0.15em',
          textDecoration: 'none',
          cursor: 'pointer',
          backdropFilter: 'blur(8px)',
        }}
      >
        🥽 YISL VR HUB
      </motion.a>

      {/* Bottom hint text */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 0.8 }}
        style={{
          position: 'absolute',
          bottom: '8%',
          left: '50%',
          transform: 'translateX(-50%)',
          textAlign: 'center',
          zIndex: 10,
          pointerEvents: 'none',
        }}
      >
        <p style={{
          fontFamily: 'Orbitron, sans-serif',
          fontSize: '0.65rem',
          color: '#4a7a8a',
          letterSpacing: '0.25em',
          animation: 'glowPulse 3s ease-in-out infinite',
        }}>
          ✦ CLICK A PORTAL TO ENTER THE LAB ✦
        </p>
        <p style={{
          fontFamily: 'Share Tech Mono, monospace',
          fontSize: '0.55rem',
          color: '#2a4a5a',
          letterSpacing: '0.1em',
          marginTop: 4,
        }}>
          DRAG TO ORBIT · SCROLL TO ZOOM · PRESS H FOR HELP
        </p>
      </motion.div>
    </>
  );
}

/**
 * Main 3D Lobby Scene.
 * Full-screen R3F canvas with 3 interactive portals, stars, and Kalinga rotunda rings.
 * Includes sci-fi logo title overlay and YISL VR Hub button.
 */
export const LobbyScene: React.FC = () => {
  const cameraTarget = useRef<{ x: number; y: number; z: number } | null>(null);
  const navCallback = useRef<(() => void) | null>(null);

  const handleContextLost = useCallback((e: Event) => {
    e.preventDefault();
    console.warn('WebGL context lost — will restore automatically.');
  }, []);

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', background: '#020d18' }}>
      <Canvas
        camera={{ position: [0, 1.5, 9], fov: 58 }}
        frameloop="always"
        dpr={Math.min(typeof window !== 'undefined' ? window.devicePixelRatio : 1, 2)}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance',
          preserveDrawingBuffer: false,
        }}
        onCreated={({ gl }) => {
          gl.setClearColor(new THREE.Color('#020d18'));
          gl.domElement.addEventListener('webglcontextlost', handleContextLost, false);
        }}
        style={{ position: 'absolute', inset: 0 }}
      >
        <Suspense fallback={null}>
          <Scene cameraTarget={cameraTarget} navCallback={navCallback} />
        </Suspense>
      </Canvas>

      {/* Sci-fi Logo + Title — centered top */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: 'easeOut' }}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 15,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          paddingTop: 20,
          gap: 8,
          pointerEvents: 'none',
        }}
      >
        {/* Logo image */}
        <motion.img
          src="/logo.png"
          alt="Kalinga Labs"
          style={{
            width: 64,
            height: 64,
            objectFit: 'contain',
            filter: 'drop-shadow(0 0 18px rgba(0,245,196,0.8)) drop-shadow(0 0 40px rgba(26,240,255,0.4))',
          }}
          animate={{
            filter: [
              'drop-shadow(0 0 14px rgba(0,245,196,0.6)) drop-shadow(0 0 30px rgba(26,240,255,0.2))',
              'drop-shadow(0 0 26px rgba(0,245,196,1.0)) drop-shadow(0 0 60px rgba(26,240,255,0.5))',
              'drop-shadow(0 0 14px rgba(0,245,196,0.6)) drop-shadow(0 0 30px rgba(26,240,255,0.2))',
            ],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')}
        />

        {/* Lab name in Orbitron */}
        <div style={{ textAlign: 'center' }}>
          <motion.h1
            style={{
              fontFamily: 'Orbitron, sans-serif',
              fontSize: 'clamp(1rem, 2.5vw, 1.6rem)',
              fontWeight: 900,
              letterSpacing: '0.35em',
              margin: 0,
              background: 'linear-gradient(135deg, #00f5c4, #1af0ff, #b44fff)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: 'none',
            }}
            animate={{
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
            }}
            transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
          >
            KALINGA LABORATORIES
          </motion.h1>
          <motion.p
            style={{
              fontFamily: 'Share Tech Mono, monospace',
              fontSize: '0.5rem',
              color: '#4a7a8a',
              letterSpacing: '0.3em',
              margin: '4px 0 0',
            }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          >
            HERITAGE IN HEART · INNOVATION IN SIGHT
          </motion.p>
        </div>
      </motion.div>

      <LobbyOverlay />
    </div>
  );
};



