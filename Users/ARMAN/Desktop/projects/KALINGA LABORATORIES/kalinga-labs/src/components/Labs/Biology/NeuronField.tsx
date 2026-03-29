// src/components/Labs/Biology/NeuronField.tsx
/**
 * Neural cell network rendered at the cellular zoom level.
 * Shows ~50 procedurally placed neurons with soma, axons, dendrites.
 * Animated signal pulses travel along axon lines.
 */
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface Neuron {
  id: number;
  pos: THREE.Vector3;
  connections: number[]; // indices into neurons array
  phase: number;         // signal timing offset
}

function generateNeurons(count: number, spread: number): Neuron[] {
  const neurons: Neuron[] = [];
  for (let i = 0; i < count; i++) {
    neurons.push({
      id: i,
      pos: new THREE.Vector3(
        (Math.random() - 0.5) * spread,
        (Math.random() - 0.5) * spread * 0.8,
        (Math.random() - 0.5) * spread,
      ),
      connections: [],
      phase: Math.random() * Math.PI * 2,
    });
  }
  // Connect each neuron to 2-4 nearest neighbors
  for (let i = 0; i < count; i++) {
    const distances = neurons
      .map((n, j) => ({ j, d: neurons[i].pos.distanceTo(n.pos) }))
      .filter(({ j }) => j !== i)
      .sort((a, b) => a.d - b.d)
      .slice(0, 3 + Math.floor(Math.random() * 2));
    neurons[i].connections = distances.map(({ j }) => j);
  }
  return neurons;
}

/* ─── Signal pulse along an axon line ─── */
interface SignalPulseProps {
  start: THREE.Vector3;
  end: THREE.Vector3;
  phase: number;
  speed: number;
}

function SignalPulse({ start, end, phase, speed }: SignalPulseProps) {
  const meshRef = useRef<THREE.Mesh>(null!);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = (clock.elapsedTime * speed + phase) % (Math.PI * 2);
    const progress = (Math.sin(t) + 1) / 2; // 0 → 1 → 0
    meshRef.current.position.lerpVectors(start, end, progress);
    const mat = meshRef.current.material as THREE.MeshBasicMaterial;
    mat.opacity = 0.2 + progress * 0.7;
  });

  return (
    <mesh ref={meshRef} position={start.clone()}>
      <sphereGeometry args={[0.004, 6, 6]} />
      <meshBasicMaterial color="#ffee44" transparent opacity={0.5} />
    </mesh>
  );
}

/* ─── Axon line geometry ─── */
function AxonLine({ start, end, color }: { start: THREE.Vector3; end: THREE.Vector3; color: string }) {
  const points = useMemo(() => [start, end], [start, end]);
  const geometry = useMemo(() => new THREE.BufferGeometry().setFromPoints(points), [points]);

  return (
    <line>
      <bufferGeometry attach="geometry" {...geometry} />
      <lineBasicMaterial color={color} transparent opacity={0.3} />
    </line>
  );
}

/* ─── Dendrite branches ─── */
function Dendrites({ pos, color }: { pos: THREE.Vector3; color: string }) {
  const branches = useMemo(() => {
    return Array.from({ length: 4 + Math.floor(Math.random() * 3) }, (_, i) => {
      const angle = (i / 5) * Math.PI * 2 + Math.random() * 0.8;
      const len = 0.018 + Math.random() * 0.022;
      const elev = (Math.random() - 0.5) * Math.PI;
      const end = new THREE.Vector3(
        pos.x + Math.cos(angle) * Math.cos(elev) * len,
        pos.y + Math.sin(elev) * len,
        pos.z + Math.sin(angle) * Math.cos(elev) * len,
      );
      return { start: pos.clone(), end };
    });
  }, [pos]);

  return (
    <>
      {branches.map((b, i) => (
        <AxonLine key={i} start={b.start} end={b.end} color={color} />
      ))}
    </>
  );
}

/* ─── Single neuron ─── */
function NeuronCell({ neuron, neurons, glowRef }: { neuron: Neuron; neurons: Neuron[]; glowRef: React.MutableRefObject<THREE.Mesh[]> }) {
  const somaRef = useRef<THREE.Mesh>(null!);
  const matRef = useRef<THREE.MeshStandardMaterial>(null!);

  useFrame(({ clock }) => {
    if (!matRef.current) return;
    const t = clock.elapsedTime;
    // Each neuron fires at different rates
    const fireRate = 1.5 + Math.sin(neuron.phase) * 0.8;
    const spike = Math.max(0, Math.sin(t * fireRate + neuron.phase));
    matRef.current.emissiveIntensity = 0.15 + spike * 0.55;
  });

  const isExcitatory = neuron.id % 4 !== 0; // 75% excitatory (yellow), 25% inhibitory (blue)
  const somaColor = isExcitatory ? '#ffdd88' : '#88bbff';
  const glowColor = isExcitatory ? '#ffcc44' : '#6699ff';

  return (
    <group>
      {/* Soma */}
      <mesh ref={somaRef} position={neuron.pos} castShadow>
        <sphereGeometry args={[0.011, 10, 8]} />
        <meshStandardMaterial
          ref={matRef}
          color={somaColor}
          emissive={glowColor}
          emissiveIntensity={0.2}
          roughness={0.3}
        />
      </mesh>

      {/* Dendrites */}
      <Dendrites pos={neuron.pos} color={glowColor} />

      {/* Axons + signal pulses to connected neurons */}
      {neuron.connections.map((j) => {
        const target = neurons[j];
        if (!target) return null;
        return (
          <group key={j}>
            <AxonLine start={neuron.pos} end={target.pos} color={glowColor} />
            <SignalPulse
              start={neuron.pos}
              end={target.pos}
              phase={neuron.phase + j * 0.5}
              speed={0.6 + Math.abs(Math.sin(neuron.id)) * 0.4}
            />
          </group>
        );
      })}
    </group>
  );
}

/* ─── Full Neuron Field ─── */
interface NeuronFieldProps {
  count?: number;
  spread?: number;
  centerY?: number;
}

export function NeuronField({ count = 40, spread = 0.8, centerY = 0 }: NeuronFieldProps) {
  const neurons = useMemo(() => generateNeurons(count, spread), [count, spread]);
  const glowRefs = useRef<THREE.Mesh[]>([]);

  // Ambient blue fog for cellular environment
  const fogMeshRef = useRef<THREE.Mesh>(null!);
  useFrame(({ clock }) => {
    if (fogMeshRef.current) {
      const mat = fogMeshRef.current.material as THREE.MeshStandardMaterial;
      mat.opacity = 0.06 + Math.sin(clock.elapsedTime * 0.5) * 0.02;
    }
  });

  return (
    <group position={[0, centerY, 0]}>
      {/* Ambient cellular "cytoplasm" glow */}
      <mesh ref={fogMeshRef}>
        <sphereGeometry args={[spread * 0.85, 16, 16]} />
        <meshStandardMaterial
          color="#002244"
          transparent
          opacity={0.07}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Neurons */}
      {neurons.map((neuron) => (
        <NeuronCell key={neuron.id} neuron={neuron} neurons={neurons} glowRef={glowRefs} />
      ))}

      {/* Ambient electrical glow */}
      <pointLight color="#6688ff" intensity={0.4} distance={spread * 2} decay={2} />
      <pointLight color="#ffcc44" intensity={0.2} distance={spread} decay={2} position={[spread * 0.3, 0, 0]} />
    </group>
  );
}
