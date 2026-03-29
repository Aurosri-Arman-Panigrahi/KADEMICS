// src/components/Labs/Biology/OrganAnimations.tsx
/**
 * Animated organ meshes — each one uses useFrame for realistic physiological motion.
 * PulsingHeart: beats at 72bpm
 * BreathingLungs: expand/contract breathing cycle  
 * SparkingBrain: electric ripple emissive pulse
 * SqueezingStomach: peristaltic muscle contraction
 * FilteringKidney: gentle Y-scale filter wave
 * FlowingAorta: pulsed color wave of blood
 */
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/* ─── Heart: 72bpm contractile pump ─── */
export function PulsingHeart({ position = [0, 0, 0] as [number, number, number], scale = 1 }) {
  const groupRef = useRef<THREE.Group>(null!);
  const lightRef = useRef<THREE.PointLight>(null!);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    // 72 bpm = 1.2 beats/sec, period = 0.833s
    const t = clock.elapsedTime;
    const bpm = 72;
    const period = 60 / bpm;
    const phase = (t % period) / period; // 0→1 per beat

    // Systole (quick squeeze) and diastole (slow expansion)
    let beatScale: number;
    if (phase < 0.15) {
      // Systole — fast contraction
      beatScale = 1.0 - 0.14 * Math.sin((phase / 0.15) * Math.PI);
    } else if (phase < 0.5) {
      // Early diastole — rapid expansion
      beatScale = 0.86 + 0.16 * ((phase - 0.15) / 0.35);
    } else {
      // Late diastole — slow fill
      beatScale = 1.02 - 0.02 * ((phase - 0.5) / 0.5);
    }

    const s = scale * beatScale;
    groupRef.current.scale.set(s, s * 1.05, s);

    // Glow pulses with each beat
    if (lightRef.current) {
      lightRef.current.intensity = phase < 0.2 ? 3.5 - phase * 8 : 0.3;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Main heart body */}
      <mesh castShadow>
        <sphereGeometry args={[0.08, 16, 12]} />
        <meshStandardMaterial
          color="#cc1133"
          emissive="#ff0033"
          emissiveIntensity={0.4}
          roughness={0.3}
          metalness={0.05}
        />
      </mesh>
      {/* Left ventricle bulge */}
      <mesh position={[-0.04, -0.02, 0.04]} castShadow>
        <sphereGeometry args={[0.056, 12, 10]} />
        <meshStandardMaterial color="#bb1128" emissive="#ee0022" emissiveIntensity={0.3} roughness={0.35} />
      </mesh>
      {/* Right ventricle bulge */}
      <mesh position={[0.04, -0.02, 0.035]} castShadow>
        <sphereGeometry args={[0.048, 12, 10]} />
        <meshStandardMaterial color="#cc1a30" emissive="#dd0020" emissiveIntensity={0.3} roughness={0.35} />
      </mesh>
      {/* Aorta stub */}
      <mesh position={[0, 0.09, 0.02]} castShadow>
        <cylinderGeometry args={[0.018, 0.026, 0.06, 10]} />
        <meshStandardMaterial color="#aa0022" emissive="#cc0011" emissiveIntensity={0.2} />
      </mesh>
      {/* Pulmonary artery stub */}
      <mesh position={[0.035, 0.08, 0.02]} rotation={[0.4, 0, 0.5]} castShadow>
        <cylinderGeometry args={[0.013, 0.02, 0.04, 8]} />
        <meshStandardMaterial color="#4466cc" emissive="#2244aa" emissiveIntensity={0.2} />
      </mesh>
      {/* Beat glow */}
      <pointLight ref={lightRef} color="#ff1133" intensity={0.8} distance={0.4} decay={2} />
    </group>
  );
}

/* ─── Lungs: breathing expansion/contraction ─── */
export function BreathingLungs({ position = [0, 0, 0] as [number, number, number], scale = 1 }) {
  const leftRef = useRef<THREE.Group>(null!);
  const rightRef = useRef<THREE.Group>(null!);

  useFrame(({ clock }) => {
    // 15 breaths/min  = 0.25 Hz, period = 4s
    const t = clock.elapsedTime;
    const breathCycle = (Math.sin(t * 0.5 * Math.PI) + 1) / 2; // 0 → 1 → 0 smoothly
    // Inhale: expand; exhale: contract
    const xScale = scale * (0.88 + breathCycle * 0.18);
    const yScale = scale * (0.9 + breathCycle * 0.12);
    const zScale = scale * (0.9 + breathCycle * 0.16);

    if (leftRef.current) leftRef.current.scale.set(xScale, yScale, zScale);
    if (rightRef.current) rightRef.current.scale.set(xScale, yScale, zScale);
  });

  return (
    <group position={position}>
      {/* Left lung */}
      <group ref={leftRef} position={[-0.07, 0, 0]}>
        <mesh castShadow>
          <sphereGeometry args={[0.07, 14, 10]} />
          <meshStandardMaterial color="#ffaaaa" emissive="#ff8888" emissiveIntensity={0.15} roughness={0.5} transparent opacity={0.88} />
        </mesh>
        {/* Lobe detail */}
        <mesh position={[0, -0.05, 0.02]}>
          <sphereGeometry args={[0.052, 10, 8]} />
          <meshStandardMaterial color="#ff9999" emissive="#ff7777" emissiveIntensity={0.1} roughness={0.5} transparent opacity={0.8} />
        </mesh>
        {/* Bronchus */}
        <mesh position={[0.06, 0.06, 0]}>
          <cylinderGeometry args={[0.01, 0.016, 0.06, 8]} />
          <meshStandardMaterial color="#cc6666" />
        </mesh>
      </group>

      {/* Right lung (slightly larger) */}
      <group ref={rightRef} position={[0.075, 0, 0]}>
        <mesh castShadow>
          <sphereGeometry args={[0.075, 14, 10]} />
          <meshStandardMaterial color="#ffaaaa" emissive="#ff8888" emissiveIntensity={0.15} roughness={0.5} transparent opacity={0.88} />
        </mesh>
        <mesh position={[0, -0.05, 0.02]}>
          <sphereGeometry args={[0.055, 10, 8]} />
          <meshStandardMaterial color="#ff9999" emissive="#ff7777" emissiveIntensity={0.1} roughness={0.5} transparent opacity={0.8} />
        </mesh>
        {/* Extra lobe (right has 3) */}
        <mesh position={[0, -0.1, 0.01]}>
          <sphereGeometry args={[0.044, 10, 8]} />
          <meshStandardMaterial color="#ff9999" transparent opacity={0.75} roughness={0.5} />
        </mesh>
        <mesh position={[-0.06, 0.06, 0]}>
          <cylinderGeometry args={[0.01, 0.016, 0.06, 8]} />
          <meshStandardMaterial color="#cc6666" />
        </mesh>
      </group>
      {/* Trachea */}
      <mesh position={[0.005, 0.1, 0]}>
        <cylinderGeometry args={[0.013, 0.013, 0.08, 10]} />
        <meshStandardMaterial color="#ddccbb" />
      </mesh>
    </group>
  );
}

/* ─── Brain: slow electric ripple emissive ─── */
export function SparkingBrain({ position = [0, 0, 0] as [number, number, number], scale = 1 }) {
  const matRef = useRef<THREE.MeshStandardMaterial>(null!);
  const lightRef = useRef<THREE.PointLight>(null!);
  const sparks = useRef<THREE.Group>(null!);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (matRef.current) {
      // Multi-frequency ripple for complex electrical activity
      const wave = Math.sin(t * 3.1) * 0.5
                 + Math.sin(t * 7.3 + 1.5) * 0.25
                 + Math.sin(t * 13.7 + 3.0) * 0.15;
      matRef.current.emissiveIntensity = 0.18 + Math.max(0, wave) * 0.22;
    }
    if (lightRef.current) {
      lightRef.current.intensity = 0.2 + Math.abs(Math.sin(t * 5.5)) * 0.4;
    }
    // Rotate spark group slowly
    if (sparks.current) {
      sparks.current.rotation.y += 0.008;
    }
  });

  return (
    <group position={position} scale={scale}>
      {/* Brain hemispheres */}
      <mesh castShadow>
        <sphereGeometry args={[0.1, 20, 14]} />
        <meshStandardMaterial
          ref={matRef}
          color="#ffccaa"
          emissive="#ffaa88"
          emissiveIntensity={0.2}
          roughness={0.7}
          metalness={0}
        />
      </mesh>
      {/* Cerebellum */}
      <mesh position={[0, -0.06, -0.07]}>
        <sphereGeometry args={[0.056, 12, 10]} />
        <meshStandardMaterial color="#ffbbaa" emissive="#ff9977" emissiveIntensity={0.15} roughness={0.75} />
      </mesh>
      {/* Brainstem */}
      <mesh position={[0, -0.1, -0.04]}>
        <cylinderGeometry args={[0.022, 0.028, 0.06, 8]} />
        <meshStandardMaterial color="#eeaa88" roughness={0.6} />
      </mesh>
      {/* Central dividing fissure */}
      <mesh position={[0, 0.01, 0.01]}>
        <boxGeometry args={[0.004, 0.12, 0.15]} />
        <meshStandardMaterial color="#cc9966" roughness={0.9} />
      </mesh>
      {/* Spark bursts */}
      <group ref={sparks}>
        {Array.from({ length: 8 }, (_, i) => {
          const a = (i / 8) * Math.PI * 2;
          const r = 0.08;
          return (
            <mesh key={i} position={[Math.cos(a) * r, Math.sin(a) * 0.04, Math.sin(a) * r]}>
              <sphereGeometry args={[0.006, 6, 6]} />
              <meshBasicMaterial color={i % 2 === 0 ? '#ffee88' : '#88ddff'} />
            </mesh>
          );
        })}
      </group>
      <pointLight ref={lightRef} color="#ffcc88" intensity={0.5} distance={0.5} decay={2} />
    </group>
  );
}

/* ─── Stomach: peristaltic squeeze ─── */
export function SqueezingStomach({ position = [0, 0, 0] as [number, number, number], scale = 1 }) {
  const ref = useRef<THREE.Group>(null!);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.elapsedTime;
    // Peristalsis: travelling wave of contraction ~3 waves/min
    const wave = Math.sin(t * 0.8);
    const xS = scale * (1 + wave * 0.06);
    const yS = scale * (1 - wave * 0.04);
    ref.current.scale.set(xS, yS, scale);
  });

  return (
    <group ref={ref} position={position}>
      {/* Stomach body — J-shaped approximation */}
      <mesh castShadow>
        <sphereGeometry args={[0.072, 14, 10]} />
        <meshStandardMaterial color="#88dd44" emissive="#55aa22" emissiveIntensity={0.15} roughness={0.5} />
      </mesh>
      <mesh position={[0.04, -0.06, 0]} rotation={[0, 0, 0.5]}>
        <capsuleGeometry args={[0.042, 0.06, 8, 12]} />
        <meshStandardMaterial color="#77cc33" emissive="#449911" emissiveIntensity={0.12} roughness={0.55} />
      </mesh>
      {/* Pylorus */}
      <mesh position={[0.06, -0.1, 0]}>
        <cylinderGeometry args={[0.018, 0.022, 0.035, 8]} />
        <meshStandardMaterial color="#66bb22" roughness={0.6} />
      </mesh>
    </group>
  );
}

/* ─── Liver: colour-shift detox cycle ─── */
export function PulsingLiver({ position = [0, 0, 0] as [number, number, number], scale = 1 }) {
  const matRef = useRef<THREE.MeshStandardMaterial>(null!);

  useFrame(({ clock }) => {
    if (!matRef.current) return;
    const t = clock.elapsedTime;
    // Slow 0.2Hz detox cycle
    const cycle = (Math.sin(t * 0.4 * Math.PI) + 1) / 2;
    // Shifts from deep brown (toxin-rich) to lighter (filtered)
    const r = THREE.MathUtils.lerp(0.6, 0.75, cycle);
    const g = THREE.MathUtils.lerp(0.26, 0.32, cycle);
    const b = THREE.MathUtils.lerp(0.16, 0.2, cycle);
    matRef.current.color.setRGB(r, g, b);
    matRef.current.emissiveIntensity = 0.04 + cycle * 0.08;
  });

  return (
    <group position={position} scale={scale}>
      {/* Main lobes */}
      <mesh castShadow>
        <sphereGeometry args={[0.09, 14, 10]} />
        <meshStandardMaterial ref={matRef} color="#994422" emissive="#663311" emissiveIntensity={0.06} roughness={0.6} />
      </mesh>
      <mesh position={[-0.04, 0.01, 0.01]}>
        <sphereGeometry args={[0.065, 12, 10]} />
        <meshStandardMaterial color="#8a3d1e" emissive="#5a2910" emissiveIntensity={0.05} roughness={0.6} />
      </mesh>
      {/* Gallbladder */}
      <mesh position={[0.06, -0.06, 0.04]}>
        <sphereGeometry args={[0.025, 10, 8]} />
        <meshStandardMaterial color="#8aaa22" emissive="#557700" emissiveIntensity={0.1} roughness={0.5} />
      </mesh>
    </group>
  );
}

/* ─── Kidney: filter wave Y-scale ─── */
export function FilteringKidney({ position = [0, 0, 0] as [number, number, number], side = 'left', scale = 1 }) {
  const ref = useRef<THREE.Group>(null!);
  const matRef = useRef<THREE.MeshStandardMaterial>(null!);
  const offset = side === 'right' ? 0.6 : 0;

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.elapsedTime + offset;
    const wave = Math.sin(t * 1.2);
    if (ref.current) ref.current.scale.y = scale * (1 + wave * 0.04);
    if (matRef.current) {
      matRef.current.emissiveIntensity = 0.1 + Math.abs(wave) * 0.12;
    }
  });

  return (
    <group ref={ref} position={position}>
      {/* Kidney body */}
      <mesh castShadow>
        <capsuleGeometry args={[0.04, 0.05, 8, 12]} />
        <meshStandardMaterial ref={matRef} color="#aa6633" emissive="#884422" emissiveIntensity={0.1} roughness={0.55} />
      </mesh>
      {/* Renal pelvis */}
      <mesh position={[side === 'left' ? 0.025 : -0.025, 0, 0]}>
        <sphereGeometry args={[0.022, 8, 8]} />
        <meshStandardMaterial color="#cc8844" roughness={0.5} />
      </mesh>
    </group>
  );
}
