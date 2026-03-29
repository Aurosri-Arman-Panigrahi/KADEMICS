// src/components/Labs/Physics/SolarCanvas.tsx
import React, { useRef, useState, Suspense } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, Line, Html } from '@react-three/drei';
import * as THREE from 'three';
import { PLANETS, PlanetInfo } from './PlanetData';
import { GlassPanel } from '@/components/Shared/GlassPanel';

/* ─── Orbit ring ─── */
function OrbitRing({ radius }: { radius: number }) {
  const points = Array.from({ length: 65 }, (_, i) => {
    const a = (i / 64) * Math.PI * 2;
    return new THREE.Vector3(Math.cos(a) * radius, 0, Math.sin(a) * radius);
  });
  return <Line points={points} color="#1a3a5a" lineWidth={0.6} transparent opacity={0.45} />;
}

/* ─── Planet mesh with real texture ─── */
interface PlanetMeshProps {
  planet: PlanetInfo;
  speed: number;
  onSelect: (p: PlanetInfo) => void;
  selected: boolean;
}

function PlanetMesh({ planet, speed, onSelect, selected }: PlanetMeshProps) {
  const ref = useRef<THREE.Group>(null!);
  const [hov, setHov] = useState(false);

  // Load real texture — fallback to color if CORS blocks
  let texture: THREE.Texture | null = null;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    texture = useLoader(THREE.TextureLoader, planet.textureUrl);
  } catch {
    texture = null;
  }

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    ref.current.position.x = Math.cos(t * planet.orbitSpeed * speed) * planet.orbitRadius;
    ref.current.position.z = Math.sin(t * planet.orbitSpeed * speed) * planet.orbitRadius;
    // Self-rotation
    const mesh = ref.current.children[0] as THREE.Mesh;
    if (mesh) mesh.rotation.y += 0.004;
  });

  const scale = selected ? 1.3 : hov ? 1.15 : 1;

  return (
    <group
      ref={ref}
      scale={scale}
      onClick={(e) => { e.stopPropagation(); onSelect(planet); }}
      onPointerOver={(e) => { e.stopPropagation(); setHov(true); document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { setHov(false); document.body.style.cursor = 'default'; }}
    >
      <mesh>
        <sphereGeometry args={[planet.radius, 32, 32]} />
        {texture ? (
          <meshStandardMaterial
            map={texture}
            emissive={new THREE.Color(planet.emissive)}
            emissiveIntensity={selected ? 0.4 : 0.1}
            roughness={0.8}
            metalness={0.1}
          />
        ) : (
          <meshStandardMaterial
            color={planet.color}
            emissive={planet.emissive}
            emissiveIntensity={selected ? 0.8 : 0.2}
          />
        )}
      </mesh>

      {/* Saturn ring */}
      {planet.name === 'Saturn' && (
        <mesh rotation={[Math.PI / 2.6, 0, 0]}>
          <ringGeometry args={[planet.radius * 1.5, planet.radius * 2.4, 64]} />
          <meshBasicMaterial color="#c89a60" transparent opacity={0.6} side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* Hover label */}
      {hov && !selected && (
        <Html center position={[0, planet.radius + 0.3, 0]} style={{ pointerEvents: 'none' }}>
          <div style={{
            fontFamily: 'Orbitron, sans-serif',
            fontSize: '0.55rem',
            color: '#00f5c4',
            whiteSpace: 'nowrap',
            textShadow: '0 0 6px #00f5c4',
            background: 'rgba(2,13,24,0.8)',
            padding: '2px 8px',
            borderRadius: 4,
            border: '1px solid rgba(0,245,196,0.2)',
          }}>
            {planet.name}
          </div>
        </Html>
      )}

      {/* Selected pulse ring */}
      {selected && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[planet.radius * 1.6, planet.radius * 1.8, 32]} />
          <meshBasicMaterial color="#00f5c4" transparent opacity={0.4} side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  );
}

/* ─── Sun with glow ─── */
function Sun({ onDeselect }: { onDeselect: () => void }) {
  const ref = useRef<THREE.Mesh>(null!);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    ref.current.material && ((ref.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 1.5 + Math.sin(t * 2) * 0.3);
  });
  return (
    <group onClick={onDeselect}>
      <mesh ref={ref}>
        <sphereGeometry args={[0.55, 32, 32]} />
        <meshStandardMaterial color="#ffcc22" emissive="#ff8800" emissiveIntensity={1.8} />
      </mesh>
      {/* Corona glow */}
      <mesh>
        <sphereGeometry args={[0.72, 16, 16]} />
        <meshBasicMaterial color="#ffcc22" transparent opacity={0.08} side={THREE.BackSide} />
      </mesh>
    </group>
  );
}

/* ─── Scene ─── */
interface SolarSceneProps {
  speed: number;
  onSelect: (p: PlanetInfo | null) => void;
  selected: PlanetInfo | null;
}

function SolarScene({ speed, onSelect, selected }: SolarSceneProps) {
  return (
    <>
      <ambientLight intensity={0.05} />
      <pointLight color="#ffe8a0" intensity={5} distance={40} decay={2} position={[0, 0, 0]} />
      <pointLight color="#4455ff" intensity={0.3} distance={30} position={[0, 8, 0]} />

      <Sun onDeselect={() => onSelect(null)} />

      {PLANETS.map((p) => (
        <OrbitRing key={`orbit-${p.name}`} radius={p.orbitRadius} />
      ))}

      {PLANETS.map((p) => (
        <PlanetMesh
          key={p.name}
          planet={p}
          speed={speed}
          onSelect={onSelect}
          selected={selected?.name === p.name}
        />
      ))}

      <OrbitControls enablePan={false} minDistance={3} maxDistance={22} />
    </>
  );
}

/* ─── Planet info panel ─── */
function PlanetInfoCard({ planet, onClose }: { planet: PlanetInfo; onClose: () => void }) {
  return (
    <div style={{ position: 'absolute', top: 12, right: 12, width: 240, zIndex: 10 }}>
      <GlassPanel glowColor="teal" padding="0">
        {/* Real planet image */}
        <div style={{ position: 'relative', height: 120, overflow: 'hidden', borderRadius: '10px 10px 0 0' }}>
          <img
            src={planet.textureUrl}
            alt={planet.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', filter: 'saturate(1.3) brightness(0.85)' }}
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to top, rgba(2,13,24,0.8) 0%, transparent 60%)',
          }} />
          <p style={{
            position: 'absolute', bottom: 8, left: 10,
            fontFamily: 'Orbitron, sans-serif', fontSize: '1rem', color: '#e0faff',
            textShadow: '0 0 10px rgba(0,245,196,0.5)',
          }}>
            {planet.name.toUpperCase()}
          </p>
        </div>
        {/* Stats */}
        <div style={{ padding: '0.75rem' }}>
          <p style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '0.8rem', color: '#4a7a8a', marginBottom: 8, lineHeight: 1.5 }}>
            {planet.description}
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            {[
              ['Diameter', `${planet.diameterKm.toLocaleString()} km`],
              ['Mass', planet.massKg],
              ['Distance', `${planet.distanceAU} AU`],
              ['Moons', `${planet.moons}`],
            ].map(([label, value]) => (
              <div key={label as string}>
                <p style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '0.48rem', color: '#4a7a8a' }}>{label}</p>
                <p style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '0.68rem', color: '#00f5c4' }}>{value}</p>
              </div>
            ))}
          </div>
          <button
            className="btn-teal"
            style={{ marginTop: 10, width: '100%', fontSize: '0.55rem', padding: '4px' }}
            onClick={onClose}
          >
            CLOSE
          </button>
        </div>
      </GlassPanel>
    </div>
  );
}

/* ─── Main component ─── */
export const SolarCanvas: React.FC<{ speed: number }> = ({ speed }) => {
  const [selected, setSelected] = useState<PlanetInfo | null>(null);

  return (
    <div style={{ position: 'relative', width: '100%', height: 440 }}>
      <Canvas
        camera={{ position: [0, 10, 20], fov: 52 }}
        frameloop="always"
        dpr={Math.min(typeof window !== 'undefined' ? window.devicePixelRatio : 1, 2)}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        style={{ background: '#020d18', borderRadius: 12, border: '1px solid rgba(0,245,196,0.08)' }}
        onCreated={({ gl }) => gl.setClearColor(new THREE.Color('#020d18'))}
      >
        <Suspense fallback={null}>
          <SolarScene speed={speed} onSelect={setSelected} selected={selected} />
        </Suspense>
      </Canvas>

      {selected && (
        <PlanetInfoCard planet={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
};
