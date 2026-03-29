// src/components/Labs/Biology/AnatomyCanvas.tsx
import React, { useRef, Suspense, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';
import { ORGANS, OrganInfo, BodySystem } from './organData';

/* ─── System colors ─── */
const SYSTEM_COLORS: Record<BodySystem, string> = {
  skeletal:       '#c0d8f0',
  muscular:       '#ff6655',
  cardiovascular: '#ff2244',
  nervous:        '#ffcc88',
  digestive:      '#88cc44',
};

/* ─── Body outline — stylized transparent torso ─── */
function BodyOutline({ activeSystem }: { activeSystem: BodySystem }) {
  const bodyColor = SYSTEM_COLORS[activeSystem];
  const ref = useRef<THREE.Group>(null!);
  useFrame(({ clock }) => {
    ref.current.rotation.y = Math.sin(clock.elapsedTime * 0.2) * 0.06;
  });

  const mat = (emissiveInt = 0.1) => (
    <meshStandardMaterial color={bodyColor} emissive={bodyColor} emissiveIntensity={emissiveInt} transparent opacity={0.12} wireframe={false} />
  );

  return (
    <group ref={ref}>
      {/* Head */}
      <mesh position={[0, 1.38, 0]}>
        <sphereGeometry args={[0.24, 24, 24]} />
        {mat(0.2)}
      </mesh>
      {/* Neck */}
      <mesh position={[0, 1.08, 0]}>
        <cylinderGeometry args={[0.085, 0.1, 0.22, 12]} />
        {mat()}
      </mesh>
      {/* Torso */}
      <mesh position={[0, 0.56, 0]}>
        <capsuleGeometry args={[0.27, 0.7, 6, 16]} />
        {mat(0.15)}
      </mesh>
      {/* Pelvis */}
      <mesh position={[0, -0.02, 0]}>
        <capsuleGeometry args={[0.22, 0.22, 6, 16]} />
        {mat()}
      </mesh>
      {/* Left arm */}
      <mesh position={[-0.46, 0.68, 0]} rotation={[0, 0, 0.35]}>
        <capsuleGeometry args={[0.075, 0.48, 6, 12]} />
        {mat()}
      </mesh>
      {/* Right arm */}
      <mesh position={[0.46, 0.68, 0]} rotation={[0, 0, -0.35]}>
        <capsuleGeometry args={[0.075, 0.48, 6, 12]} />
        {mat()}
      </mesh>
      {/* Left forearm */}
      <mesh position={[-0.62, 0.25, 0]} rotation={[0, 0, 0.15]}>
        <capsuleGeometry args={[0.055, 0.4, 6, 12]} />
        {mat()}
      </mesh>
      {/* Right forearm */}
      <mesh position={[0.62, 0.25, 0]} rotation={[0, 0, -0.15]}>
        <capsuleGeometry args={[0.055, 0.4, 6, 12]} />
        {mat()}
      </mesh>
      {/* Left thigh */}
      <mesh position={[-0.15, -0.54, 0]}>
        <capsuleGeometry args={[0.1, 0.4, 6, 12]} />
        {mat()}
      </mesh>
      {/* Right thigh */}
      <mesh position={[0.15, -0.54, 0]}>
        <capsuleGeometry args={[0.1, 0.4, 6, 12]} />
        {mat()}
      </mesh>
      {/* Left shin */}
      <mesh position={[-0.15, -1.05, 0]}>
        <capsuleGeometry args={[0.07, 0.4, 6, 12]} />
        {mat()}
      </mesh>
      {/* Right shin */}
      <mesh position={[0.15, -1.05, 0]}>
        <capsuleGeometry args={[0.07, 0.4, 6, 12]} />
        {mat()}
      </mesh>
    </group>
  );
}

/* ─── Organ sphere marker ─── */
interface OrganMarkerProps {
  organ: OrganInfo;
  explode: number;
  showLabels: boolean;
  selected: OrganInfo | null;
  onSelect: (o: OrganInfo | null) => void;
  activeSystem: BodySystem;
}

function OrganMarker({ organ, explode, showLabels, selected, onSelect, activeSystem }: OrganMarkerProps) {
  const ref = useRef<THREE.Mesh>(null!);
  const [hov, setHov] = useState(false);
  const isActive = organ.system === activeSystem;
  const isSel = selected?.id === organ.id;
  const basePos = new THREE.Vector3(...organ.position);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const explodeDir = basePos.clone().normalize().multiplyScalar(explode * 0.8);
    ref.current.position.lerp(basePos.clone().add(explodeDir), 0.05);

    // Pulse visible organs
    if (isActive && !isSel) {
      ref.current.scale.setScalar(1 + Math.sin(t * 2.5 + organ.position[0]) * 0.06);
    }
    // Glow selected
    const mat = ref.current.material as THREE.MeshStandardMaterial;
    if (isSel) {
      mat.emissiveIntensity = 1.2 + Math.sin(t * 4) * 0.3;
    } else {
      mat.emissiveIntensity = isActive ? (hov ? 0.8 : 0.3) : 0.05;
    }
  });

  const size = isSel ? 0.1 : hov ? 0.09 : 0.08;
  const color = new THREE.Color(organ.glowColor);

  return (
    <group>
      <mesh
        ref={ref}
        position={organ.position}
        scale={isActive ? 1 : 0.6}
        onClick={(e) => { e.stopPropagation(); onSelect(organ); }}
        onPointerOver={(e) => { e.stopPropagation(); setHov(true); document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { setHov(false); document.body.style.cursor = 'default'; }}
      >
        <sphereGeometry args={[size, 16, 16]} />
        <meshStandardMaterial
          color={isActive ? color : new THREE.Color('#1a3a4a')}
          emissive={isActive ? color : new THREE.Color('#001020')}
          emissiveIntensity={0.3}
          transparent
          opacity={isActive ? 0.92 : 0.3}
        />
      </mesh>
      {/* Label */}
      {showLabels && isActive && (
        <Html position={[organ.position[0] + 0.12, organ.position[1] + 0.12, organ.position[2]]} style={{ pointerEvents: 'none' }}>
          <div style={{
            fontFamily: 'Share Tech Mono, monospace',
            fontSize: '0.5rem',
            color: organ.glowColor,
            textShadow: `0 0 6px ${organ.glowColor}`,
            whiteSpace: 'nowrap',
            background: 'rgba(2,13,24,0.7)',
            padding: '1px 5px',
            borderRadius: 3,
            border: `1px solid ${organ.glowColor}30`,
          }}>
            {organ.emoji} {organ.name}
          </div>
        </Html>
      )}
    </group>
  );
}

/* ─── Scene ─── */
interface AnatomySceneProps {
  system: BodySystem;
  explode: number;
  showLabels: boolean;
  selected: OrganInfo | null;
  onSelect: (o: OrganInfo | null) => void;
}

function AnatomyScene({ system, explode, showLabels, selected, onSelect }: AnatomySceneProps) {
  const sysColor = SYSTEM_COLORS[system];
  return (
    <>
      <ambientLight intensity={0.2} />
      <pointLight position={[0, 3, 4]} color={sysColor} intensity={2} distance={12} decay={2} />
      <pointLight position={[0, -2, 3]} color="#1af0ff" intensity={0.5} distance={8} decay={2} />
      <pointLight position={[-3, 1, 2]} color="#4455ff" intensity={0.4} distance={10} decay={2} />

      <BodyOutline activeSystem={system} />

      {ORGANS.map((organ) => (
        <OrganMarker
          key={organ.id}
          organ={organ}
          explode={explode}
          showLabels={showLabels}
          selected={selected}
          onSelect={onSelect}
          activeSystem={system}
        />
      ))}

      <OrbitControls enablePan={false} minDistance={2.5} maxDistance={6} target={[0, 0.2, 0]} />
    </>
  );
}

/* ─── Main export ─── */
interface AnatomyCanvasProps {
  system: BodySystem;
  explode: number;
  showLabels: boolean;
  onOrganSelect: (o: OrganInfo | null) => void;
}

export const AnatomyCanvas: React.FC<AnatomyCanvasProps> = ({ system, explode, showLabels, onOrganSelect }) => {
  const [selected, setSelected] = useState<OrganInfo | null>(null);

  const handleSelect = (o: OrganInfo) => {
    const next = selected?.id === o.id ? null : o;
    setSelected(next);
    onOrganSelect(next);
  };

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', minHeight: 480 }}>
      <Canvas
        camera={{ position: [0, 0.3, 4.5], fov: 50 }}
        frameloop="always"
        dpr={Math.min(typeof window !== 'undefined' ? window.devicePixelRatio : 1, 2)}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
        onCreated={({ gl }) => {
          gl.setClearColor(new THREE.Color('#020d18'), 0);
        }}
      >
        <Suspense fallback={null}>
          <AnatomyScene
            system={system}
            explode={explode}
            showLabels={showLabels}
            selected={selected}
            onSelect={handleSelect}
          />
        </Suspense>
      </Canvas>

      {/* Deselect hint */}
      {selected && (
        <button
          onClick={() => { setSelected(null); onOrganSelect(null); }}
          style={{
            position: 'absolute', top: 8, left: '50%', transform: 'translateX(-50%)',
            background: 'rgba(0,245,196,0.08)', border: '1px solid rgba(0,245,196,0.2)',
            borderRadius: 4, padding: '3px 12px', color: '#00f5c4',
            fontFamily: 'Orbitron, sans-serif', fontSize: '0.5rem',
            cursor: 'pointer', letterSpacing: '0.1em',
          }}
        >
          CLICK AGAIN TO DESELECT
        </button>
      )}
    </div>
  );
};
