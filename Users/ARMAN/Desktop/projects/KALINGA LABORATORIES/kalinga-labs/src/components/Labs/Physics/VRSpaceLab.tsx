// src/components/Labs/Physics/VRSpaceLab.tsx
/**
 * WebXR Planetarium — Quest 3 Mixed Reality (Option A: real room + holographic planets).
 *
 * FIX SUMMARY (black screen on Quest 3):
 *  1. Canvas gl.alpha:true + setClearColor(0,0,0,0) → transparent → AR passthrough shows through
 *  2. Removed gl.xr.enabled from onCreated → <XR> v6 handles it automatically
 *  3. Removed <Physics>/<RigidBody> → Rapier WASM crashes inside XR on Quest browser
 *  4. OrbitControls disabled inside XR sessions via useXR(state=>state.isPresenting)
 *  5. Added <XROrigin> → anchors world origin to Quest floor tracking origin
 */
import React, { useRef, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { XR, createXRStore, XROrigin, useXR } from '@react-three/xr';
import { OrbitControls, Stars, Text, useTexture } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';
import { TextureLoader } from 'three';
import { GrabbableObject } from '@/components/XR/GrabbableObject';
import { PLANETS, type PlanetInfo, type MoonInfo } from './PlanetData';
import { VRHelpUI } from '@/components/XR/VRHelpUI';
import { MarsRoverScene, MarsRoverHUD } from './MarsRoverView';

/* ─── XR store ─── */
const xrStore = createXRStore({
  hand: { left: true, right: true },
  controller: { left: true, right: true },
});

/* ─── VR error handling ─── */
async function tryEnterXR(store: ReturnType<typeof createXRStore>, mode: 'vr' | 'ar') {
  try {
    if (mode === 'vr') await store.enterVR();
    else await store.enterAR();
  } catch (err: any) {
    const msg = String(err?.message ?? err).toLowerCase();
    if (msg.includes('https') || msg.includes('secure')) {
      alert('⚠️ WebXR requires HTTPS.\n\nOpen: https://localhost:5173\nAccept the certificate warning.');
    } else if (msg.includes('not support') || msg.includes('xr-spatial')) {
      alert('🥽 VR not available.\nOpen this page in the Meta Quest browser on your Quest 3.');
    } else {
      alert(`XR error: ${err?.message ?? err}`);
    }
  }
}

/* ─── Smart OrbitControls — disabled during XR session ─── */
function SmartOrbitControls() {
  const [presenting, setPresenting] = React.useState(() => !!xrStore.getState().session);
  React.useEffect(() =>
    xrStore.subscribe((s) => setPresenting(!!s.session))
  , []);
  if (presenting) return null;
  return (
    <OrbitControls
      enablePan={false}
      minDistance={0.5}
      maxDistance={18}
      target={[0, 1.5, 0]}
    />
  );
}

/* ─── Planet mesh with texture + fallback ─── */
function PlanetMesh({ planet, isSelected }: { planet: PlanetInfo; isSelected: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const [texture, setTexture] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    const loader = new TextureLoader();
    loader.load(
      planet.textureUrl,
      (tex) => setTexture(tex),
      undefined,
      () => setTexture(null), // fallback to color on error
    );
  }, [planet.textureUrl]);

  useFrame(() => {
    if (meshRef.current) meshRef.current.rotation.y += 0.003;
  });

  return (
    <mesh ref={meshRef} castShadow>
      <sphereGeometry args={[planet.radius, 48, 32]} />
      <meshStandardMaterial
        map={texture ?? undefined}
        color={texture ? '#ffffff' : planet.color}
        emissive={planet.emissive}
        emissiveIntensity={isSelected ? 0.35 : 0.1}
        roughness={0.75}
        metalness={0.1}
      />
    </mesh>
  );
}

/* ─── Orbiting moon (uses useFrame, no physics) ─── */
function OrbitingMoon({ moon, planetRadius, index }: { moon: MoonInfo; planetRadius: number; index: number }) {
  const groupRef = useRef<THREE.Group>(null!);
  const meshRef = useRef<THREE.Mesh>(null!);
  const initialAngle = (index / 4) * Math.PI * 2;

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.elapsedTime;
    const dir = moon.orbitSpeed < 0 ? -1 : 1;
    const angle = initialAngle + t * Math.abs(moon.orbitSpeed) * dir * 0.5;
    groupRef.current.position.set(
      Math.cos(angle) * moon.orbitRadius,
      Math.sin(angle * 0.3) * 0.05,
      Math.sin(angle) * moon.orbitRadius,
    );
    if (meshRef.current) meshRef.current.rotation.y += 0.01;
  });

  const moonR = planetRadius * moon.radiusFactor;
  return (
    <group ref={groupRef}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[moonR, 14, 10]} />
        <meshStandardMaterial color={moon.textureColor} roughness={0.9} metalness={0.05} />
      </mesh>
      <Text position={[0, moonR + 0.06, 0]} fontSize={Math.max(0.04, moonR * 0.8)} color="#ccddee" anchorX="center" anchorY="bottom">
        {moon.name}
      </Text>
    </group>
  );
}

/* ─── Moon orbit ring ─── */
function MoonOrbitRing({ radius }: { radius: number }) {
  return (
    <mesh rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[radius, 0.004, 6, 64]} />
      <meshBasicMaterial color="#334455" transparent opacity={0.3} />
    </mesh>
  );
}

/* ─── ISS ─── */
function ISSSatellite({ orbitRadius, speed }: { orbitRadius: number; speed: number }) {
  const groupRef = useRef<THREE.Group>(null!);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime * speed;
    groupRef.current.position.set(Math.cos(t) * orbitRadius, 0.04, Math.sin(t) * orbitRadius);
    groupRef.current.rotation.y -= 0.02;
  });
  return (
    <group ref={groupRef}>
      <mesh><boxGeometry args={[0.08, 0.025, 0.025]} /><meshStandardMaterial color="#cccccc" metalness={0.6} /></mesh>
      <mesh position={[0, 0, 0.055]}><boxGeometry args={[0.12, 0.003, 0.04]} /><meshStandardMaterial color="#334488" /></mesh>
      <mesh position={[0, 0, -0.055]}><boxGeometry args={[0.12, 0.003, 0.04]} /><meshStandardMaterial color="#334488" /></mesh>
      <Text position={[0, 0.04, 0]} fontSize={0.035} color="#88aacc" anchorX="center">ISS</Text>
    </group>
  );
}

/* ─── Hubble ─── */
function HubbleSatellite({ orbitRadius, speed }: { orbitRadius: number; speed: number }) {
  const groupRef = useRef<THREE.Group>(null!);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime * speed + Math.PI;
    groupRef.current.position.set(Math.cos(t) * orbitRadius, 0.08, Math.sin(t) * orbitRadius);
  });
  return (
    <group ref={groupRef}>
      <mesh><cylinderGeometry args={[0.02, 0.02, 0.1, 12]} /><meshStandardMaterial color="#aaaaaa" metalness={0.5} /></mesh>
      <mesh position={[0.05, 0, 0]}><boxGeometry args={[0.04, 0.003, 0.06]} /><meshStandardMaterial color="#223366" /></mesh>
      <mesh position={[-0.05, 0, 0]}><boxGeometry args={[0.04, 0.003, 0.06]} /><meshStandardMaterial color="#223366" /></mesh>
      <Text position={[0, 0.04, 0]} fontSize={0.03} color="#aaccff" anchorX="center">Hubble</Text>
    </group>
  );
}

/* ─── Saturn rings ─── */
function SaturnRings({ radius }: { radius: number }) {
  return (
    <group>
      <mesh rotation={[Math.PI / 2.5, 0, 0]}><ringGeometry args={[radius * 1.3, radius * 1.8, 80]} /><meshBasicMaterial color="#d4a44a" transparent opacity={0.7} side={THREE.DoubleSide} /></mesh>
      <mesh rotation={[Math.PI / 2.5, 0, 0]}><ringGeometry args={[radius * 1.85, radius * 2.3, 80]} /><meshBasicMaterial color="#c49040" transparent opacity={0.45} side={THREE.DoubleSide} /></mesh>
      <mesh rotation={[Math.PI / 2.5, 0, 0]}><ringGeometry args={[radius * 1.78, radius * 1.85, 80]} /><meshBasicMaterial color="#050505" transparent opacity={0.5} side={THREE.DoubleSide} /></mesh>
    </group>
  );
}

/* ─── Earth atmosphere + satellites ─── */
function EarthExtras({ earth }: { earth: PlanetInfo }) {
  return (
    <group>
      <mesh><sphereGeometry args={[earth.radius * 1.06, 32, 24]} /><meshStandardMaterial color="#2266cc" transparent opacity={0.1} side={THREE.BackSide} /></mesh>
      <ISSSatellite orbitRadius={earth.radius * 1.7} speed={1.4} />
      <HubbleSatellite orbitRadius={earth.radius * 2.1} speed={0.9} />
    </group>
  );
}

/* ─── Grabbable Planet (no physics — float animation) ─── */
function VRPlanet({ planet, index, onSelect, selected }: {
  planet: PlanetInfo;
  index: number;
  onSelect: (p: PlanetInfo | null) => void;
  selected: PlanetInfo | null;
}) {
  const groupRef = useRef<THREE.Group>(null!);
  const isSelected = selected?.name === planet.name;

  // Arc layout — planets fan out at eye level
  const angle = (index / (PLANETS.length - 1)) * Math.PI - Math.PI / 2;
  const orbitR = 3.8;
  const baseY = 1.5;
  const baseX = Math.cos(angle) * orbitR;
  const baseZ = Math.sin(angle) * orbitR - 1;

  // Gentle float animation (replaces RigidBody physics)
  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.elapsedTime;
    groupRef.current.position.y = baseY + Math.sin(t * 0.35 + index * 1.1) * 0.09;
  });

  return (
    <group ref={groupRef} position={[baseX, baseY, baseZ]}>
      <GrabbableObject
        id={`planet-${planet.name}`}
        grabColor={isSelected ? '#00f5c4' : '#b44fff'}
        onGrab={() => onSelect(planet)}
        onRelease={() => {}}
      >
        {/* Planet body */}
        <PlanetMesh planet={planet} isSelected={isSelected} />

        {/* Saturn special case */}
        {planet.name === 'Saturn' && <SaturnRings radius={planet.radius} />}

        {/* Earth special case */}
        {planet.name === 'Earth' && <EarthExtras earth={planet} />}

        {/* Orbiting moons when selected */}
        {isSelected && planet.moonsData.map((moon, i) => (
          <React.Fragment key={moon.name}>
            <MoonOrbitRing radius={moon.orbitRadius} />
            <OrbitingMoon moon={moon} planetRadius={planet.radius} index={i} />
          </React.Fragment>
        ))}

        {/* Axis tilt indicator */}
        {isSelected && (
          <mesh rotation={[0, 0, planet.axisTilt * Math.PI / 180]}>
            <cylinderGeometry args={[0.003, 0.003, planet.radius * 3.2, 6]} />
            <meshBasicMaterial color="#ffee44" transparent opacity={0.55} />
          </mesh>
        )}

        {/* Planet name */}
        <Text
          position={[0, planet.radius + 0.16, 0]}
          fontSize={Math.max(0.08, planet.radius * 0.38)}
          color={isSelected ? '#00f5c4' : '#e0faff'}
          anchorX="center"
          anchorY="bottom"
        >
          {planet.name}
        </Text>

        {/* Distance / moons */}
        <Text
          position={[0, planet.radius + 0.065, 0]}
          fontSize={Math.max(0.045, planet.radius * 0.22)}
          color="#4a7a8a"
          anchorX="center"
          anchorY="bottom"
        >
          {planet.distanceAU} AU · {planet.moons} moon{planet.moons !== 1 ? 's' : ''}
        </Text>

        {/* Selection ring */}
        {isSelected && (
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[planet.radius * 1.3, planet.radius * 1.42, 32]} />
            <meshBasicMaterial color="#00f5c4" transparent opacity={0.55} side={THREE.DoubleSide} />
          </mesh>
        )}
      </GrabbableObject>
    </group>
  );
}

/* ─── Star field + Milky Way ─── */
function SpaceBackground() {
  return (
    <>
      <Stars radius={80} depth={8} count={12000} factor={4} saturation={0.3} fade speed={0.2} />
      {/* Milky Way band */}
      <mesh rotation={[Math.PI / 5, 0, 0]}>
        <torusGeometry args={[14, 1.8, 8, 80]} />
        <meshBasicMaterial color="#441155" transparent opacity={0.1} side={THREE.DoubleSide} />
      </mesh>
      {/* Ambient space light */}
      <ambientLight intensity={0.12} color="#334466" />
      {/* Sun */}
      <group position={[0, 2.5, -6]}>
        <mesh>
          <sphereGeometry args={[0.55, 24, 24]} />
          <meshStandardMaterial color="#ffcc22" emissive="#ff8800" emissiveIntensity={2.5} />
        </mesh>
        <pointLight color="#ffe880" intensity={12} distance={40} decay={2} />
        <mesh>
          <sphereGeometry args={[0.72, 20, 20]} />
          <meshBasicMaterial color="#ff8800" transparent opacity={0.07} />
        </mesh>
        <Text position={[0, 0.8, 0]} fontSize={0.12} color="#ffee88" anchorX="center">☀ Sun</Text>
      </group>
    </>
  );
}

/* ─── Full VR/AR scene ─── */
function VRSpaceScene({
  onSelect,
  selected,
  viewMode,
}: {
  onSelect: (p: PlanetInfo | null) => void;
  selected: PlanetInfo | null;
  viewMode: 'space' | 'mars';
}) {
  return (
    <>
      {/* XROrigin: anchors Three.js world to Quest floor tracking */}
      <XROrigin position={[0, 0, 0]} />

      {/* Stars + background — always rendered */}
      <SpaceBackground />

      {viewMode === 'space' ? (
        <>
          {PLANETS.map((p, i) => (
            <VRPlanet key={p.name} planet={p} index={i} onSelect={onSelect} selected={selected} />
          ))}
          <VRHelpUI mode="idle" visible />
        </>
      ) : (
        <MarsRoverScene />
      )}

      {/* OrbitControls — auto-disabled in XR */}
      <SmartOrbitControls />
    </>
  );
}

/* ─── Main Component ─── */
interface VRSpaceLabProps {
  onExit: () => void;
}

export const VRSpaceLab: React.FC<VRSpaceLabProps> = ({ onExit }) => {
  const [selected, setSelected] = useState<PlanetInfo | null>(null);
  const [viewMode, setViewMode] = useState<'space' | 'mars'>('space');

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: '#020814' }}>

      {/* ── Header ── */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 210,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 16px', background: 'rgba(0,8,20,0.92)',
        borderBottom: '1px solid rgba(26,240,255,0.15)', backdropFilter: 'blur(12px)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button onClick={onExit} style={{
            fontFamily: 'Orbitron, sans-serif', fontSize: '0.55rem', padding: '5px 14px',
            borderRadius: 6, cursor: 'pointer', background: 'rgba(255,50,80,0.1)',
            border: '1px solid rgba(255,50,80,0.3)', color: '#ff6655',
          }}>← EXIT</button>

          <span style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '0.65rem', color: '#1af0ff' }}>
            {viewMode === 'mars' ? '🔴 MARS SURFACE' : '🌌 PLANETARIUM VR'}
          </span>

          <button
            onClick={() => setViewMode(v => v === 'space' ? 'mars' : 'space')}
            style={{
              fontFamily: 'Orbitron, sans-serif', fontSize: '0.5rem', padding: '5px 12px',
              borderRadius: 6, cursor: 'pointer',
              background: viewMode === 'mars' ? 'rgba(200,80,30,0.25)' : 'rgba(200,80,30,0.1)',
              border: `1px solid rgba(200,80,30,${viewMode === 'mars' ? '0.6' : '0.3'})`,
              color: '#ff7744',
            }}
          >
            {viewMode === 'mars' ? '🌌 BACK TO SPACE' : '🔴 MARS ROVER VIEW'}
          </button>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          {/* Quest 3 Mixed Reality (primary) */}
          <button onClick={() => tryEnterXR(xrStore, 'ar')} style={{
            fontFamily: 'Orbitron, sans-serif', fontSize: '0.55rem', padding: '5px 16px',
            borderRadius: 6, cursor: 'pointer',
            background: 'linear-gradient(135deg, rgba(0,245,196,0.2), rgba(26,240,255,0.15))',
            border: '1px solid rgba(0,245,196,0.5)', color: '#00f5c4',
            boxShadow: '0 0 14px rgba(0,245,196,0.25)',
          }}>🥽 ENTER MR (Quest 3)</button>

          {/* Quest 2 full VR */}
          <button onClick={() => tryEnterXR(xrStore, 'vr')} style={{
            fontFamily: 'Orbitron, sans-serif', fontSize: '0.55rem', padding: '5px 16px',
            borderRadius: 6, cursor: 'pointer',
            background: 'rgba(26,240,255,0.1)',
            border: '1px solid rgba(26,240,255,0.3)', color: '#1af0ff',
          }}>🌐 ENTER VR (Quest 2)</button>
        </div>
      </div>

      {/* Mars rover HUD (DOM — outside canvas) */}
      {viewMode === 'mars' && <MarsRoverHUD />}

      {/* ── Planet info panel ── */}
      <AnimatePresence>
        {selected && viewMode === 'space' && (
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 40 }}
            style={{
              position: 'absolute', top: 56, right: 0, bottom: 0, width: 290, zIndex: 210,
              background: 'rgba(2,8,22,0.96)', borderLeft: '1px solid rgba(26,240,255,0.15)',
              padding: 16, backdropFilter: 'blur(20px)', overflowY: 'auto',
            }}
          >
            <div style={{ height: 150, overflow: 'hidden', borderRadius: 8, marginBottom: 12, background: '#020814' }}>
              <img src={selected.textureUrl} alt={selected.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            </div>
            <p style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '0.9rem', color: '#e0faff', marginBottom: 6 }}>
              {selected.name.toUpperCase()}
            </p>
            <p style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '0.8rem', color: '#4a7a8a', lineHeight: 1.5, marginBottom: 12 }}>
              {selected.description}
            </p>
            {[
              ['Diameter', `${selected.diameterKm.toLocaleString()} km`],
              ['Mass', selected.massKg],
              ['Distance', `${selected.distanceAU} AU`],
              ['Moons', `${selected.moons}`],
              ['Day Length', selected.dayLength],
              ['Year Length', selected.yearLength],
              ['Axis Tilt', `${selected.axisTilt}°`],
            ].map(([label, value]) => (
              <div key={label} style={{ marginBottom: 8, display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '0.48rem', color: '#4a7a8a' }}>{label}</span>
                <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '0.65rem', color: '#1af0ff' }}>{value}</span>
              </div>
            ))}
            {selected.moonsData.length > 0 && (
              <div style={{ marginTop: 10, borderTop: '1px solid rgba(26,240,255,0.1)', paddingTop: 8 }}>
                <p style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '0.48rem', color: '#4a7a8a', marginBottom: 6 }}>MAJOR MOONS</p>
                {selected.moonsData.map(m => (
                  <span key={m.name} style={{
                    display: 'inline-block', margin: '2px 3px', padding: '2px 7px',
                    background: 'rgba(26,240,255,0.08)', border: '1px solid rgba(26,240,255,0.2)',
                    borderRadius: 12, fontFamily: 'Share Tech Mono, monospace', fontSize: '0.52rem', color: '#88ccdd',
                  }}>{m.name}</span>
                ))}
              </div>
            )}
            <button onClick={() => setSelected(null)} className="btn-teal"
              style={{ width: '100%', fontSize: '0.55rem', marginTop: 14 }}>
              RELEASE PLANET
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 3D Canvas ── */}
      <Canvas
        camera={{ position: [0, 1.6, 5], fov: 80, near: 0.01, far: 200 }}
        frameloop="always"
        dpr={[1, 1.5]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
          xrCompatible: true,
        } as any}
        style={{ position: 'absolute', inset: 0, zIndex: 205 }}
        onCreated={({ gl }: any) => {
          // FIX 2: DO NOT set gl.xr.enabled — <XR> v6 manages this automatically
          // For AR passthrough: alpha=0 lets the real-world camera show through
          gl.setClearColor(0x000000, 0);
        }}
      >
        <XR store={xrStore}>
          <Suspense fallback={null}>
            {/* FIX 3: NO <Physics> wrapper — Rapier WASM unreliable in XR on Quest */}
            <VRSpaceScene onSelect={setSelected} selected={selected} viewMode={viewMode} />
          </Suspense>
        </XR>
      </Canvas>
    </div>
  );
};
