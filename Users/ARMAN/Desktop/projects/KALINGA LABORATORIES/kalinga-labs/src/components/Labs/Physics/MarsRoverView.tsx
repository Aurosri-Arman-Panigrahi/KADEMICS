// src/components/Labs/Physics/MarsRoverView.tsx
/**
 * Mars Rover VR Mode — immersive Mars surface experience.
 * Procedural terrain + NASA Mars Rover Photo API for real images as panorama.
 * Shows Earth as a bright blue star in the Mars sky.
 * In VR: full 360° immersive Mars surface with rover arm.
 */
import React, { useRef, useState, useEffect, Suspense } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Stars } from '@react-three/drei';
import * as THREE from 'three';

const NASA_API_KEY = 'DEMO_KEY'; // Works for ~30 req/hour

interface RoverPhoto {
  id: number;
  img_src: string;
  earth_date: string;
  camera: { name: string; full_name: string };
  rover: { name: string; status: string };
}

/* ── Fetch rover photos from NASA API ─── */
async function fetchRoverPhotos(): Promise<RoverPhoto[]> {
  try {
    // Curiosity latest photos — sol 4000+ (recent)
    const res = await fetch(
      `https://api.nasa.gov/mars-photos/api/v1/rovers/curiosity/latest_photos?api_key=${NASA_API_KEY}`
    );
    if (!res.ok) throw new Error('API error');
    const data = await res.json();
    return (data.latest_photos ?? []).slice(0, 6);
  } catch {
    return [];
  }
}

/* ─── Mars terrain (procedural red landscape) ─── */
function MarsTerrain() {
  const topoRef = useRef<THREE.Mesh>(null!);

  // Apply vertex displacement for terrain hills
  useEffect(() => {
    if (!topoRef.current) return;
    const geo = topoRef.current.geometry as THREE.PlaneGeometry;
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const noise =
        Math.sin(x * 0.8) * 0.2 +
        Math.sin(z * 1.1 + 1.2) * 0.15 +
        Math.sin(x * 2.1 + z * 1.7) * 0.08 +
        (Math.random() - 0.5) * 0.04;
      pos.setY(i, noise);
    }
    pos.needsUpdate = true;
    geo.computeVertexNormals();
  }, []);

  return (
    <group>
      {/* Main terrain plane */}
      <mesh ref={topoRef} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[60, 60, 80, 80]} />
        <meshStandardMaterial
          color="#c14a22"
          roughness={0.92}
          metalness={0.02}
        />
      </mesh>

      {/* Near surface detail (darker rocks/soil) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0]}>
        <planeGeometry args={[6, 6, 20, 20]} />
        <meshStandardMaterial color="#a83a18" roughness={0.95} />
      </mesh>

      {/* Rocks — random scattered boulders */}
      {Array.from({ length: 35 }, (_, i) => {
        const x = (Math.random() - 0.5) * 50;
        const z = (Math.random() - 0.5) * 50;
        const s = 0.08 + Math.random() * 0.55;
        const shape = i % 3; // 0=sphere, 1=box, 2=dodecahedron
        return (
          <group key={i} position={[x, s * 0.3, z]}>
            {shape === 0 && (
              <mesh castShadow>
                <sphereGeometry args={[s, 7, 6]} />
                <meshStandardMaterial color={`hsl(${10 + i * 3}, 40%, ${25 + (i % 5) * 4}%)`} roughness={0.95} />
              </mesh>
            )}
            {shape === 1 && (
              <mesh castShadow rotation={[Math.random(), Math.random(), Math.random()]}>
                <boxGeometry args={[s * 1.2, s * 0.7, s]} />
                <meshStandardMaterial color={`hsl(${15 + i * 2}, 38%, ${22 + (i % 6) * 3}%)`} roughness={0.95} />
              </mesh>
            )}
            {shape === 2 && (
              <mesh castShadow rotation={[Math.random(), Math.random(), Math.random()]}>
                <dodecahedronGeometry args={[s * 0.85, 0]} />
                <meshStandardMaterial color={`hsl(${8 + i * 4}, 42%, ${28 + (i % 4) * 4}%)`} roughness={0.9} />
              </mesh>
            )}
          </group>
        );
      })}

      {/* Olympus Mons silhouette on horizon */}
      <mesh position={[30, 3, -28]}>
        <coneGeometry args={[8, 7, 12]} />
        <meshStandardMaterial color="#aa3a14" roughness={0.98} />
      </mesh>

      {/* Dust storm haze at horizon */}
      {Array.from({ length: 6 }, (_, i) => (
        <mesh key={i} position={[
          Math.cos((i / 6) * Math.PI * 2) * 20,
          1.5,
          Math.sin((i / 6) * Math.PI * 2) * 20,
        ]}>
          <sphereGeometry args={[4, 10, 8]} />
          <meshStandardMaterial color="#c87040" transparent opacity={0.08} roughness={1} />
        </mesh>
      ))}
    </group>
  );
}

/* ─── Mars sky + atmosphere ─── */
function MarsSky() {
  const skyRef = useRef<THREE.Mesh>(null!);
  useFrame(({ clock }) => {
    if (skyRef.current) {
      const mat = skyRef.current.material as THREE.MeshStandardMaterial;
      // Subtle dust opacity breathing
      mat.opacity = 0.6 + Math.sin(clock.elapsedTime * 0.1) * 0.04;
    }
  });

  return (
    <group>
      {/* Mars atmosphere (reddish-orange dome) */}
      <mesh ref={skyRef}>
        <sphereGeometry args={[55, 32, 24]} />
        <meshStandardMaterial
          color="#c8622a"
          transparent
          opacity={0.62}
          side={THREE.BackSide}
          roughness={1}
        />
      </mesh>

      {/* Earth visible in Mars sky — blue star */}
      <group position={[-8, 12, -30]}>
        <mesh>
          <sphereGeometry args={[0.14, 14, 10]} />
          <meshStandardMaterial color="#3388ff" emissive="#2266dd" emissiveIntensity={1.5} />
        </mesh>
        <pointLight color="#3388ff" intensity={0.5} distance={8} />
        <Text position={[0, 0.25, 0]} fontSize={0.18} color="#88bbff" anchorX="center">
          Earth
        </Text>
      </group>

      {/* Phobos — Mars' inner moon */}
      <group position={[5, 8, -20]}>
        <mesh>
          <sphereGeometry args={[0.06, 8, 6]} />
          <meshStandardMaterial color="#888880" roughness={0.95} />
        </mesh>
        <Text position={[0, 0.12, 0]} fontSize={0.1} color="#ccccaa" anchorX="center">
          Phobos
        </Text>
      </group>

      {/* Deimos — Mars' outer moon */}
      <group position={[12, 6, -15]}>
        <mesh>
          <sphereGeometry args={[0.04, 8, 6]} />
          <meshStandardMaterial color="#999990" roughness={0.95} />
        </mesh>
        <Text position={[0, 0.08, 0]} fontSize={0.08} color="#ccccaa" anchorX="center">
          Deimos
        </Text>
      </group>

      {/* Stars faintly visible through thin atmosphere */}
      <Stars radius={50} depth={5} count={2000} factor={1.5} saturation={0.1} fade />

      {/* Sunlight from correct direction */}
      <directionalLight color="#ffddaa" intensity={1.8} position={[10, 15, -10]} castShadow />
      <hemisphereLight args={['#c8622a', '#a83810', 0.4]} />
      <ambientLight color="#cc5522" intensity={0.25} />
    </group>
  );
}

/* ─── Rover arm (procedural mesh) ─── */
function RoverArm() {
  const armRef = useRef<THREE.Group>(null!);
  useFrame(({ clock }) => {
    if (armRef.current) {
      // Gentle idle swing
      armRef.current.rotation.x = -0.3 + Math.sin(clock.elapsedTime * 0.4) * 0.05;
    }
  });

  return (
    <group position={[0.55, 0.4, -0.5]} ref={armRef}>
      {/* Rover body */}
      <mesh>
        <boxGeometry args={[0.5, 0.18, 0.7]} />
        <meshStandardMaterial color="#888880" metalness={0.4} roughness={0.6} />
      </mesh>
      {/* Solar panels */}
      <mesh position={[0, 0.12, 0]}>
        <boxGeometry args={[0.7, 0.02, 0.35]} />
        <meshStandardMaterial color="#334466" metalness={0.3} roughness={0.5} />
      </mesh>
      {/* Arm */}
      <group position={[0.15, 0.1, -0.3]}>
        <mesh rotation={[-0.6, 0, 0]}>
          <cylinderGeometry args={[0.012, 0.012, 0.35, 8]} />
          <meshStandardMaterial color="#aaaaaa" metalness={0.5} roughness={0.5} />
        </mesh>
        {/* Drill head */}
        <mesh position={[0, -0.2, 0.12]}>
          <cylinderGeometry args={[0.018, 0.01, 0.08, 8]} />
          <meshStandardMaterial color="#cccccc" metalness={0.7} roughness={0.3} />
        </mesh>
      </group>
      {/* Camera mast */}
      <mesh position={[0, 0.28, 0.2]}>
        <cylinderGeometry args={[0.01, 0.01, 0.3, 8]} />
        <meshStandardMaterial color="#aaaaaa" metalness={0.5} />
      </mesh>
      <mesh position={[0, 0.42, 0.2]}>
        <boxGeometry args={[0.06, 0.05, 0.04]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
      {/* Wheels */}
      {[-0.22, 0.22].map((x) =>
        [-0.28, 0, 0.28].map((z) => (
          <mesh key={`${x}${z}`} position={[x, -0.12, z]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.08, 0.08, 0.04, 16]} />
            <meshStandardMaterial color="#555550" metalness={0.2} roughness={0.9} />
          </mesh>
        ))
      )}
    </group>
  );
}

/* ─── Rover HUD overlay (DOM) ─── */
function RoverHUD({ photos, loading }: { photos: RoverPhoto[]; loading: boolean }) {
  return (
    <>
      {/* Crosshair */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 215,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        pointerEvents: 'none',
      }}>
        <svg width="60" height="60" viewBox="0 0 60 60">
          <circle cx="30" cy="30" r="15" stroke="#ff4422" strokeWidth="1" fill="none" opacity="0.7" />
          <line x1="30" y1="0" x2="30" y2="22" stroke="#ff4422" strokeWidth="1" opacity="0.7" />
          <line x1="30" y1="38" x2="30" y2="60" stroke="#ff4422" strokeWidth="1" opacity="0.7" />
          <line x1="0" y1="30" x2="22" y2="30" stroke="#ff4422" strokeWidth="1" opacity="0.7" />
          <line x1="38" y1="30" x2="60" y2="30" stroke="#ff4422" strokeWidth="1" opacity="0.7" />
        </svg>
      </div>

      {/* Telemetry HUD */}
      <div style={{
        position: 'absolute', top: 56, left: 0, zIndex: 215,
        padding: '8px 12px', background: 'rgba(20,5,0,0.85)',
        borderRight: '1px solid rgba(255,100,50,0.3)', borderBottom: '1px solid rgba(255,100,50,0.2)',
        backdropFilter: 'blur(8px)',
      }}>
        {[
          ['SOL', '4089'],
          ['TEMP', '-63°C'],
          ['PRESSURE', '845 Pa'],
          ['STATUS', 'NOMINAL'],
          ['POWER', '94%'],
          ['DIST', '28.4 km'],
        ].map(([label, val]) => (
          <div key={label} style={{ marginBottom: 3, display: 'flex', justifyContent: 'space-between', gap: 16 }}>
            <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '0.5rem', color: '#ff8844' }}>{label}</span>
            <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '0.55rem', color: '#ffcc88' }}>{val}</span>
          </div>
        ))}
      </div>

      {/* Compass */}
      <div style={{
        position: 'absolute', bottom: 60, left: '50%', transform: 'translateX(-50%)',
        zIndex: 215, fontFamily: 'Share Tech Mono, monospace', fontSize: '0.6rem',
        color: '#ff8844', background: 'rgba(20,5,0,0.7)', padding: '3px 16px',
        borderRadius: 20, border: '1px solid rgba(255,100,50,0.3)',
        letterSpacing: '0.15em',
      }}>
        N ·· NE ·· E ·· SE ·&gt; S &lt;· SW ·· W ·· NW ·· N
      </div>

      {/* NASA Rover photos panel */}
      <div style={{
        position: 'absolute', top: 56, right: 0, zIndex: 215,
        width: 190, background: 'rgba(20,5,0,0.92)',
        borderLeft: '1px solid rgba(255,100,50,0.25)',
        padding: 10, backdropFilter: 'blur(10px)',
      }}>
        <p style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '0.48rem', color: '#ff8844', marginBottom: 8, letterSpacing: '0.1em' }}>
          📸 CURIOSITY LIVE FEED
        </p>
        {loading && (
          <p style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '0.5rem', color: '#ff6633' }}>
            RECEIVING SIGNAL...
          </p>
        )}
        {photos.slice(0, 3).map((photo) => (
          <div key={photo.id} style={{ marginBottom: 8 }}>
            <img
              src={photo.img_src}
              alt={photo.camera.full_name}
              style={{ width: '100%', height: 70, objectFit: 'cover', borderRadius: 4,
                border: '1px solid rgba(255,100,50,0.3)' }}
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
            <p style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '0.42rem', color: '#ff9966', marginTop: 2 }}>
              {photo.camera.name} · {photo.earth_date}
            </p>
          </div>
        ))}
        {photos.length === 0 && !loading && (
          <p style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '0.45rem', color: '#884422' }}>
            NO SIGNAL — CHECK INTERNET
          </p>
        )}
      </div>
    </>
  );
}

/* ─── Full Mars Surface Scene ─── */
export function MarsRoverScene() {
  const [photos, setPhotos] = useState<RoverPhoto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRoverPhotos().then((p) => {
      setPhotos(p);
      setLoading(false);
    });
  }, []);

  return (
    <>
      <MarsSky />
      <MarsTerrain />
      <RoverArm />
      {/* Stand-here ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 2]}>
        <ringGeometry args={[0.3, 0.35, 24]} />
        <meshBasicMaterial color="#ff4422" transparent opacity={0.6} />
      </mesh>
      <Text position={[0, 0.02, 2.5]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.06} color="#ff6633" anchorX="center">
        STAND HERE
      </Text>
      {/* DOM HUD overlay */}
      {/* Note: HUD is rendered in the parent component to avoid XR context issues */}
      <RoverHUDPortal photos={photos} loading={loading} />
    </>
  );
}

/* Portal for DOM HUD inside Three.js scene (trick using portals) */
function RoverHUDPortal({ photos, loading }: { photos: RoverPhoto[]; loading: boolean }) {
  // We cant render DOM inside Canvas directly so we use a fixed div via useEffect + event
  useEffect(() => {
    const event = new CustomEvent('mars-hud-data', { detail: { photos, loading } });
    window.dispatchEvent(event);
  }, [photos, loading]);
  return null;
}

/* ─── Standalone DOM HUD (rendered outside canvas) ─── */
export function MarsRoverHUD() {
  const [data, setData] = useState<{ photos: RoverPhoto[]; loading: boolean }>({ photos: [], loading: true });

  useEffect(() => {
    const handler = (e: Event) => {
      setData((e as CustomEvent).detail);
    };
    window.addEventListener('mars-hud-data', handler);
    return () => window.removeEventListener('mars-hud-data', handler);
  }, []);

  return <RoverHUD photos={data.photos} loading={data.loading} />;
}
