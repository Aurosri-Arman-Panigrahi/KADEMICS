// src/components/Labs/Chemistry/ReactionCanvas.tsx
import React, { useRef, useMemo, useEffect, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere } from '@react-three/drei';
import * as THREE from 'three';
import type { ReactionDef } from './reactions';
import { ELEMENT_COLORS, ELEMENT_INFO, ElementSymbol } from './reactions';

/* ─── Particle system ─── */
const PARTICLE_COUNT = 120;

interface ParticleSystemProps {
  active: boolean;
  reaction: ReactionDef | null;
}

function ParticleSystem({ active, reaction }: ParticleSystemProps) {
  const pointsRef = useRef<THREE.Points>(null!);
  const velocities = useRef<Float32Array>(new Float32Array(PARTICLE_COUNT * 3));
  const positions = useRef<Float32Array>(new Float32Array(PARTICLE_COUNT * 3));

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(PARTICLE_COUNT * 3);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 0.6;
      pos[i * 3 + 1] = -0.8 + Math.random() * 1.6;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 0.6;
    }
    positions.current = pos;
    geo.setAttribute('position', new THREE.BufferAttribute(pos.slice(), 3));
    return geo;
  }, []);

  useEffect(() => {
    if (active) {
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        velocities.current[i * 3] = (Math.random() - 0.5) * 0.04;
        velocities.current[i * 3 + 1] = Math.random() * 0.06 + 0.01;
        velocities.current[i * 3 + 2] = (Math.random() - 0.5) * 0.04;
      }
    }
  }, [active]);

  useFrame(() => {
    if (!pointsRef.current) return;
    const posAttr = pointsRef.current.geometry.attributes['position'] as THREE.BufferAttribute;
    const arr = posAttr.array as Float32Array;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      if (active) {
        arr[i * 3] += velocities.current[i * 3];
        arr[i * 3 + 1] += velocities.current[i * 3 + 1];
        arr[i * 3 + 2] += velocities.current[i * 3 + 2];
        if (arr[i * 3 + 1] > 1.5) {
          arr[i * 3 + 1] = -0.8;
          arr[i * 3] = (Math.random() - 0.5) * 0.6;
          arr[i * 3 + 2] = (Math.random() - 0.5) * 0.6;
        }
      }
    }
    posAttr.needsUpdate = true;
  });

  const color = reaction ? reaction.particleColor : '#44aaff';

  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial color={color} size={0.04} transparent opacity={0.75} sizeAttenuation />
    </points>
  );
}

/* ─── Beaker ─── */
function Beaker() {
  return (
    <group position={[0, 0, 0]}>
      <mesh>
        <cylinderGeometry args={[0.7, 0.6, 2, 32, 1, true]} />
        <meshStandardMaterial
          color="#1af0ff"
          transparent
          opacity={0.12}
          side={THREE.DoubleSide}
          emissive="#1af0ff"
          emissiveIntensity={0.1}
        />
      </mesh>
      {/* Bottom */}
      <mesh position={[0, -1, 0]}>
        <circleGeometry args={[0.6, 32]} />
        <meshStandardMaterial color="#1af0ff" transparent opacity={0.08} />
      </mesh>
      {/* Rim glow */}
      <mesh position={[0, 1, 0]}>
        <torusGeometry args={[0.7, 0.015, 8, 48]} />
        <meshStandardMaterial color="#1af0ff" emissive="#1af0ff" emissiveIntensity={0.6} />
      </mesh>
    </group>
  );
}

/* ─── Element atoms display ─── */
interface ElementAtomsProps {
  elementA: ElementSymbol | null;
  elementB: ElementSymbol | null;
  reacting: boolean;
}

function ElementAtoms({ elementA, elementB, reacting }: ElementAtomsProps) {
  const aRef = useRef<THREE.Group>(null!);
  const bRef = useRef<THREE.Group>(null!);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (aRef.current) {
      aRef.current.position.x = reacting
        ? Math.sin(t * 4) * 0.05 - 0.35
        : -0.35;
    }
    if (bRef.current) {
      bRef.current.position.x = reacting
        ? Math.sin(t * 4 + Math.PI) * 0.05 + 0.35
        : 0.35;
    }
  });

  if (!elementA && !elementB) return null;

  const aColor = elementA ? ELEMENT_COLORS[elementA] : '#ffffff';
  const bColor = elementB ? ELEMENT_COLORS[elementB] : '#ffffff';
  const aSize = elementA ? ELEMENT_INFO[elementA].radius : 0.1;
  const bSize = elementB ? ELEMENT_INFO[elementB].radius : 0.1;

  return (
    <>
      {elementA && (
        <group ref={aRef} position={[-0.35, 0.2, 0]}>
          <Sphere args={[aSize * 1.5, 16, 16]}>
            <meshStandardMaterial color={aColor} emissive={aColor} emissiveIntensity={0.8} />
          </Sphere>
        </group>
      )}
      {elementB && (
        <group ref={bRef} position={[0.35, 0.2, 0]}>
          <Sphere args={[bSize * 1.5, 16, 16]}>
            <meshStandardMaterial color={bColor} emissive={bColor} emissiveIntensity={0.8} />
          </Sphere>
        </group>
      )}
      {/* Bond cylinder */}
      {elementA && elementB && reacting && (
        <mesh position={[0, 0.2, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.025, 0.025, 0.7, 8]} />
          <meshStandardMaterial color="#e0faff" emissive="#ffffff" emissiveIntensity={1} />
        </mesh>
      )}
    </>
  );
}

/* ─── Main Canvas ─── */
interface ReactionCanvasProps {
  elementA: ElementSymbol | null;
  elementB: ElementSymbol | null;
  reaction: ReactionDef | null;
  reacting: boolean;
}

export const ReactionCanvas: React.FC<ReactionCanvasProps> = ({
  elementA,
  elementB,
  reaction,
  reacting,
}) => {
  return (
    <Canvas
      camera={{ position: [0, 0.5, 3.5], fov: 50 }}
      gl={{ antialias: true }}
      style={{ background: '#020d18' }}
      onCreated={({ gl }) => gl.setClearColor('#020d18')}
    >
      <ambientLight intensity={0.3} />
      <pointLight position={[2, 3, 2]} color="#1af0ff" intensity={1.5} />
      <pointLight position={[-2, -1, 1]} color="#00f5c4" intensity={0.8} />

      <Suspense fallback={null}>
        <Beaker />
        <ParticleSystem active={reacting} reaction={reaction} />
        <ElementAtoms elementA={elementA} elementB={elementB} reacting={reacting} />

        {reaction && reacting && (
          <pointLight
            color={reaction.glowColor}
            intensity={3}
            position={[0, 0.2, 0]}
            distance={4}
            decay={2}
          />
        )}
      </Suspense>
    </Canvas>
  );
};
