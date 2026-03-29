// src/components/Labs/Chemistry/VRChemistryLab.tsx
/**
 * Full immersive WebXR Chemistry Lab for Meta Quest 2 & 3.
 * Uses @react-three/xr v6 API:
 *   - createXRStore() with hand tracking + controller support
 *   - store.enterVR() for Quest 2 (immersive-vr)
 *   - store.enterAR() for Quest 3 (immersive-ar + passthrough)
 *   - Rapier physics for grabbing, dropping, collisions
 *   - Realistic procedural lab room
 *   - 8 types of interactive equipment
 *   - 60-reaction chemistry simulator
 */
import React, { useRef, useState, useCallback, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { XR, createXRStore, XROrigin, useXR } from '@react-three/xr';
import { OrbitControls, Text, Environment } from '@react-three/drei';
// FIX 3: Physics/RigidBody removed — Rapier WASM crashes inside XR on Quest
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';
import { GrabbableObject } from '@/components/XR/GrabbableObject';
import { LabRoom, BunsenBurner } from '@/components/XR/LabRoom';
import { VRHelpUI } from '@/components/XR/VRHelpUI';
import { findReaction, getChemicalById, CHEMICALS, type ChemicalInfo, type ReactionResult } from '@/data/chemistryReactions';
import { useLabStore } from '@/store/labStore';

/* ─── XR store (singleton per session) ─── */
const xrStore = createXRStore({
  hand: { left: true, right: true },
  controller: { left: true, right: true },
});

/* ─── Container state ─── */
interface ContainerState {
  id: string;
  contents: string[];      // chemical IDs inside
  fillLevel: number;       // 0-1
  color: string;
  position: [number, number, number];
}

/* ─── Beaker mesh ─── */
interface BeakerProps {
  initialPosition: [number, number, number];
  size?: 'small' | 'medium' | 'large';
  contents: string[];
  fillColor: string;
  fillLevel: number;
  onGrab: () => void;
  onRelease: (pos: THREE.Vector3) => void;
  onTilt?: (tilt: number) => void;
  label?: string;
}

function Beaker({ initialPosition, size = 'medium', contents, fillColor, fillLevel, onGrab, onRelease, onTilt, label }: BeakerProps) {
  const r = size === 'small' ? 0.04 : size === 'medium' ? 0.06 : 0.09;
  const h = size === 'small' ? 0.1 : size === 'medium' ? 0.14 : 0.2;
  const groupRef = useRef<THREE.Group>(null!);
  const prevY = useRef(new THREE.Euler());

  useFrame(() => {
    if (!groupRef.current) return;
    const rot = groupRef.current.getWorldQuaternion(new THREE.Quaternion());
    const euler = new THREE.Euler().setFromQuaternion(rot);
    const tilt = Math.abs(euler.z); // tilt in Z axis when held sideways
    onTilt?.(tilt);
  });

  return (
    <GrabbableObject onGrab={onGrab} onRelease={onRelease} grabColor="#1af0ff" id={`beaker-${label}`}>
      <group ref={groupRef} position={initialPosition}>
        {/* Beaker body (glass) */}
          <mesh castShadow>
            <cylinderGeometry args={[r, r * 0.9, h, 16, 1, true]} />
            <meshStandardMaterial color="#aaddff" transparent opacity={0.35} roughness={0.0} metalness={0.1} side={THREE.DoubleSide} />
          </mesh>
          {/* Beaker bottom */}
          <mesh position={[0, -h / 2 + 0.004, 0]}>
            <cylinderGeometry args={[r * 0.9, r * 0.9, 0.006, 16]} />
            <meshStandardMaterial color="#aaddff" transparent opacity={0.4} roughness={0.0} />
          </mesh>
          {/* Liquid fill */}
          {fillLevel > 0 && (
            <mesh position={[0, -h / 2 + h * fillLevel / 2 + 0.005, 0]}>
              <cylinderGeometry args={[r * 0.88, r * 0.88 * 0.95, h * fillLevel, 16]} />
              <meshStandardMaterial color={fillColor} transparent opacity={0.75} roughness={0.1} />
            </mesh>
          )}
          {/* Beaker lip */}
          <mesh position={[0, h / 2, 0]}>
            <torusGeometry args={[r, 0.004, 6, 20]} />
            <meshStandardMaterial color="#88bbcc" transparent opacity={0.6} />
          </mesh>
          {/* Graduation marks */}
          {[0.25, 0.5, 0.75].map((level) => (
            <mesh key={level} position={[r * 0.95, -h / 2 + h * level, 0]}>
              <boxGeometry args={[0.004, 0.001, 0.008]} />
              <meshBasicMaterial color="#88aabb" />
            </mesh>
          ))}
          {/* Contents label */}
          {contents.length > 0 && (
            <Text
              position={[0, 0, r + 0.005]}
              fontSize={0.018}
              color="#00f5c4"
              anchorX="center"
              anchorY="middle"
            >
              {contents.map((id) => getChemicalById(id)?.formula ?? id).join(' + ')}
            </Text>
          )}
      </group>
    </GrabbableObject>
  );
}

/* ─── Test tube ─── */
interface TestTubeProps {
  position: [number, number, number];
  contents: string[];
  fillColor: string;
  fillLevel: number;
  onGrab: () => void;
  onRelease: (pos: THREE.Vector3) => void;
}

function TestTube({ position, contents, fillColor, fillLevel, onGrab, onRelease }: TestTubeProps) {
  const groupRef = useRef<THREE.Group>(null!);
  const baseY = position[1];
  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.position.y = baseY + Math.sin(clock.elapsedTime * 1.1 + position[0]) * 0.008;
    }
  });
  return (
    <GrabbableObject onGrab={onGrab} onRelease={onRelease} grabColor="#00f5c4">
      <group ref={groupRef} position={position}>
        {/* Tube */}
        <mesh castShadow>
          <cylinderGeometry args={[0.016, 0.016, 0.12, 12, 1, true]} />
          <meshStandardMaterial color="#cceeff" transparent opacity={0.4} side={THREE.DoubleSide} />
        </mesh>
        {/* Rounded bottom */}
        <mesh position={[0, -0.062, 0]}>
          <sphereGeometry args={[0.016, 12, 6, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
          <meshStandardMaterial color="#cceeff" transparent opacity={0.4} />
        </mesh>
        {/* Liquid */}
        {fillLevel > 0 && (
          <mesh position={[0, -0.06 + 0.12 * fillLevel / 2, 0]}>
            <cylinderGeometry args={[0.014, 0.014, 0.12 * fillLevel, 10]} />
            <meshStandardMaterial color={fillColor} transparent opacity={0.8} />
          </mesh>
        )}
        {/* Rim */}
        <mesh position={[0, 0.06, 0]}>
          <torusGeometry args={[0.016, 0.002, 6, 16]} />
          <meshStandardMaterial color="#99bbcc" />
        </mesh>
        {/* Label */}
        {contents.length > 0 && (
          <Text position={[0, 0, 0.022]} fontSize={0.012} color="#00f5c4" anchorX="center">
            {getChemicalById(contents[0])?.formula ?? contents[0]}
          </Text>
        )}
      </group>
    </GrabbableObject>
  );
}

/* ─── Chemical bottle ─── */
interface ChemBottleProps {
  chemical: ChemicalInfo;
  position: [number, number, number];
  onPour: (chemId: string, pouringToId: string) => void;
}

function ChemBottle({ chemical, position, onPour }: ChemBottleProps) {
  const groupRef = useRef<THREE.Group>(null!);
  const baseY = position[1];
  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.position.y = baseY + Math.sin(clock.elapsedTime * 0.9 + position[2]) * 0.006;
    }
  });
  return (
    <GrabbableObject
      grabColor={chemical.glowColor}
      id={`chem-${chemical.id}`}
      onGrab={() => {}}
      onRelease={() => {}}
    >
      <group ref={groupRef} position={position}>
        {/* Label background */}
        <mesh position={[0, 0, 0.055]}>
          <planeGeometry args={[0.06, 0.07]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        {/* Bottle body */}
        <mesh castShadow>
          <cylinderGeometry args={[0.04, 0.045, 0.16, 14]} />
          <meshStandardMaterial color={chemical.color} transparent opacity={0.85} roughness={0.1} />
        </mesh>
        {/* Neck */}
        <mesh position={[0, 0.1, 0]}>
          <cylinderGeometry args={[0.018, 0.033, 0.055, 10]} />
          <meshStandardMaterial color={chemical.color} transparent opacity={0.9} />
        </mesh>
        {/* Cap */}
        <mesh position={[0, 0.135, 0]}>
          <cylinderGeometry args={[0.022, 0.022, 0.018, 10]} />
          <meshStandardMaterial color={chemical.hazard === 'high' ? '#ee2222' : chemical.hazard === 'medium' ? '#eeaa22' : '#22aa44'} />
        </mesh>
        {/* Formula label */}
        <Text position={[0, 0, 0.058]} fontSize={0.022} color="#111111" anchorX="center" anchorY="middle">
          {chemical.formula}
        </Text>
        <Text position={[0, -0.025, 0.058]} fontSize={0.012} color="#444444" anchorX="center" anchorY="middle">
          {chemical.name.substring(0, 12)}
        </Text>
        {/* Hazard band */}
        {chemical.hazard === 'high' && (
          <mesh position={[0, -0.05, 0]}>
            <torusGeometry args={[0.045, 0.003, 6, 16]} />
            <meshBasicMaterial color="#ff2222" />
          </mesh>
        )}
      </group>
    </GrabbableObject>
  );
}

/* ─── Reaction particle burst ─── */
interface ReactionParticlesProps {
  position: [number, number, number];
  color: string;
  type: ReactionResult['effect']['particles'];
  active: boolean;
}

function ReactionParticles({ position, color, type, active }: ReactionParticlesProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null!);
  const dummy = new THREE.Object3D();
  const count = type === 'bubbles' ? 30 : type === 'smoke' ? 20 : type === 'flash' ? 15 : 12;
  const particles = useRef(
    Array.from({ length: count }, () => ({
      pos: new THREE.Vector3(
        (Math.random() - 0.5) * 0.08,
        Math.random() * 0.12,
        (Math.random() - 0.5) * 0.08,
      ),
      vel: new THREE.Vector3(
        (Math.random() - 0.5) * 0.6,
        Math.random() * 0.8 + 0.2,
        (Math.random() - 0.5) * 0.6,
      ),
      life: Math.random(),
      speed: 0.3 + Math.random() * 0.5,
    }))
  );

  useFrame(({ clock }) => {
    if (!meshRef.current || !active) return;
    const dt = 0.016;
    particles.current.forEach((p, i) => {
      p.life += dt * p.speed;
      if (p.life > 1) { p.life = 0; p.pos.set((Math.random() - 0.5) * 0.06, 0, (Math.random() - 0.5) * 0.06); }
      p.pos.addScaledVector(p.vel, dt * 0.05);
      const s = type === 'bubbles' ? 0.006 + Math.sin(p.life * 4) * 0.002 :
                type === 'smoke' ? 0.012 * (1 - p.life * 0.4) :
                type === 'flash' ? 0.02 * (1 - p.life) : 0.007;
      dummy.position.set(position[0] + p.pos.x, position[1] + p.pos.y, position[2] + p.pos.z);
      dummy.scale.setScalar(s * (1 - p.life * 0.3));
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  if (!active) return null;

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 6, 6]} />
      <meshBasicMaterial color={color} transparent opacity={type === 'smoke' ? 0.35 : 0.75} />
    </instancedMesh>
  );
}

/* ─── Lab Scene ─── */
interface LabSceneProps {
  containers: ContainerState[];
  bunsenActive: boolean;
  onBunsenToggle: () => void;
  onGrab: (id: string) => void;
  onRelease: (id: string, pos: THREE.Vector3) => void;
  helpMode: 'idle' | 'holding' | 'mixing' | 'reaction';
  reactionResult: ReactionResult | null;
  activeChemicals: ChemicalInfo[];
}

function LabScene({
  containers, bunsenActive, onBunsenToggle, onGrab, onRelease,
  helpMode, reactionResult, activeChemicals,
}: LabSceneProps) {
  return (
    <>
      {/* Environment — lab HDRI-like warm neutral */}
      <Environment preset="warehouse" />

      {/* Lab room */}
      <LabRoom />

      {/* Bunsen burner — interactive toggle */}
      <group
        onClick={onBunsenToggle}
        onPointerEnter={() => { document.body.style.cursor = 'pointer'; }}
        onPointerLeave={() => { document.body.style.cursor = 'default'; }}
      >
        <BunsenBurner position={[0.4, 0.98, -2.5]} active={bunsenActive} />
        <Text position={[0.4, 1.22, -2.5]} fontSize={0.022} color="#1af0ff" anchorX="center">
          {bunsenActive ? 'FLAME ON' : 'TAP TO LIGHT'}
        </Text>
      </group>

      {/* Second Bunsen burner */}
      <BunsenBurner position={[-0.3, 0.98, -2.5]} active={false} />

      {/* Containers */}
      {containers.slice(0, 3).map((c, i) => (
        <Beaker
          key={c.id}
          initialPosition={c.position}
          size={i === 0 ? 'large' : i === 1 ? 'medium' : 'small'}
          contents={c.contents}
          fillColor={c.color}
          fillLevel={c.fillLevel}
          onGrab={() => onGrab(c.id)}
          onRelease={(pos) => onRelease(c.id, pos)}
          label={c.id}
        />
      ))}

      {/* Test tubes */}
      {containers.slice(3, 7).map((c, i) => (
        <TestTube
          key={c.id}
          position={c.position}
          contents={c.contents}
          fillColor={c.color}
          fillLevel={c.fillLevel}
          onGrab={() => onGrab(c.id)}
          onRelease={(pos) => onRelease(c.id, pos)}
        />
      ))}

      {/* Chemical bottles on bench */}
      {activeChemicals.map((chem, i) => (
        <ChemBottle
          key={chem.id}
          chemical={chem}
          position={[-1.2 + i * 0.22, 1.01, -2.5]}
          onPour={() => {}}
        />
      ))}

      {/* Reaction particles at center beaker */}
      <ReactionParticles
        position={containers[0]?.position ?? [0, 1.05, -2.5]}
        color={reactionResult?.effect.colorAfter ?? '#00f5c4'}
        type={reactionResult?.effect.particles ?? 'none'}
        active={helpMode === 'reaction'}
      />

      {/* VR floating help panel */}
      <VRHelpUI
        mode={helpMode}
        reactionText={reactionResult ? `${reactionResult.equation}` : undefined}
        visible
      />

      {/* Floor indicator ring — where to stand */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 1.5]}>
        <ringGeometry args={[0.35, 0.38, 32]} />
        <meshBasicMaterial color="#00f5c4" transparent opacity={0.6} />
      </mesh>
      <Text
        position={[0, 0.01, 1.9]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.04}
        color="#00f5c4"
        anchorX="center"
      >
        STAND HERE
      </Text>

      <OrbitControls
        enablePan={false}
        minDistance={0.5}
        maxDistance={8}
        target={[0, 1.2, -2.5]}
        makeDefault={false}
      />
    </>
  );
}

/* ─── Result overlay UI (DOM, shown over VR canvas) ─── */
function ResultOverlay({
  result,
  onClose,
}: {
  result: ReactionResult | null;
  onClose: () => void;
}) {
  if (!result) return null;
  return (
    <React.Fragment>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        style={{
          position: 'fixed',
          bottom: 80,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 200,
          background: 'rgba(0,15,10,0.95)',
          border: '1px solid #00f5c4',
          borderRadius: 12,
          padding: '16px 24px',
          maxWidth: '90vw',
          backdropFilter: 'blur(20px)',
        }}
      >
        <p style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '0.7rem', color: '#00f5c4', marginBottom: 6 }}>
          {result.effect.emoji} REACTION DETECTED
        </p>
        <p style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '0.85rem', color: '#e0faff', marginBottom: 8 }}>
          {result.equation}
        </p>
        <p style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '0.95rem', color: '#e0faff', marginBottom: 4 }}>
          ✅ Products: {result.products}
        </p>
        <p style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '0.8rem', color: '#4a7a8a' }}>
          {result.description}
        </p>
        {result.realWorldExample && (
          <p style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '0.65rem', color: '#4a7a8a', marginTop: 4 }}>
            🌍 {result.realWorldExample}
          </p>
        )}
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <span style={{
            fontFamily: 'Orbitron, sans-serif', fontSize: '0.5rem',
            padding: '2px 8px', borderRadius: 4,
            background: 'rgba(0,245,196,0.1)', border: '1px solid rgba(0,245,196,0.3)',
            color: '#00f5c4',
          }}>
            Grade {result.grade}
          </span>
          <span style={{
            fontFamily: 'Orbitron, sans-serif', fontSize: '0.5rem', textTransform: 'uppercase',
            padding: '2px 8px', borderRadius: 4,
            background: 'rgba(26,240,255,0.1)', border: '1px solid rgba(26,240,255,0.3)',
            color: '#1af0ff',
          }}>
            {result.type.replace('_', ' ')}
          </span>
          <span style={{
            fontFamily: 'Orbitron, sans-serif', fontSize: '0.5rem',
            padding: '2px 8px', borderRadius: 4,
            background: result.effect.temperature === 'exothermic' ? 'rgba(255,100,50,0.15)' : 'rgba(50,100,255,0.15)',
            border: `1px solid ${result.effect.temperature === 'exothermic' ? '#ff6432' : '#3264ff'}`,
            color: result.effect.temperature === 'exothermic' ? '#ff8844' : '#64aaff',
          }}>
            {result.effect.temperature}
          </span>
        </div>
        <button
          className="btn-teal"
          style={{ marginTop: 12, width: '100%', fontSize: '0.55rem' }}
          onClick={onClose}
        >
          CONTINUE EXPERIMENT
        </button>
      </motion.div>
    </React.Fragment>
  );
}

/* ─── Main VR Chemistry Lab Component ─── */
interface VRChemistryLabProps {
  onExit: () => void;
}

// Default containers configuration
function makeDefaultContainers(): ContainerState[] {
  return [
    { id: 'beaker-A',  contents: [],       fillLevel: 0,   color: '#88ccff', position: [-0.3, 0.97, -2.5] },
    { id: 'beaker-B',  contents: [],       fillLevel: 0,   color: '#88ccff', position: [0.3,  0.97, -2.5] },
    { id: 'beaker-C',  contents: [],       fillLevel: 0,   color: '#88ccff', position: [0.0,  0.97, -2.0] },
    { id: 'tube-1',    contents: [],       fillLevel: 0,   color: '#88ccff', position: [-0.72, 0.985, -2.5] },
    { id: 'tube-2',    contents: [],       fillLevel: 0,   color: '#88ccff', position: [-0.64, 0.985, -2.5] },
    { id: 'tube-3',    contents: [],       fillLevel: 0,   color: '#88ccff', position: [-0.56, 0.985, -2.5] },
    { id: 'tube-4',    contents: [],       fillLevel: 0,   color: '#88ccff', position: [-0.48, 0.985, -2.5] },
  ];
}

// Default active chemicals (first 6 on bench)
const DEFAULT_CHEMICALS = CHEMICALS.slice(0, 6);

export const VRChemistryLab: React.FC<VRChemistryLabProps> = ({ onExit }) => {
  const [containers, setContainers] = useState<ContainerState[]>(makeDefaultContainers());
  const [bunsenActive, setBunsenActive] = useState(false);
  const [helpMode, setHelpMode] = useState<'idle' | 'holding' | 'mixing' | 'reaction'>('idle');
  const [reactionResult, setReactionResult] = useState<ReactionResult | null>(null);
  const [heldId, setHeldId] = useState<string | null>(null);
  const [selectedGrade, setSelectedGrade] = useState<10 | 11 | 12>(10);
  const [activeChemicals, setActiveChemicals] = useState<ChemicalInfo[]>(DEFAULT_CHEMICALS);
  const { unlockAchievement, addReactionLog, completeExperiment } = useLabStore();

  // Grab handler — track which container is held
  const handleGrab = useCallback((id: string) => {
    setHeldId(id);
    setHelpMode('holding');
  }, []);

  // Release handler — check proximity to other containers and simulate mixing
  const handleRelease = useCallback((id: string, pos: THREE.Vector3) => {
    setHeldId(null);
    setHelpMode('idle');

    // Find if this container was dropped near another → mix
    setContainers((prev) => {
      const releasedContainer = prev.find((c) => c.id === id);
      if (!releasedContainer || releasedContainer.contents.length === 0) return prev;

      for (const other of prev) {
        if (other.id === id) continue;
        if (other.contents.length === 0) continue;
        // Distance check (rough — use fixed positions)
        const dx = pos.x - other.position[0];
        const dz = pos.z - other.position[2];
        const dist = Math.sqrt(dx * dx + dz * dz);
        if (dist < 0.25) {
          // Simulate mixing
          const result = findReaction(releasedContainer.contents, other.contents);
          if (result) {
            setTimeout(() => {
              setReactionResult(result);
              setHelpMode('reaction');
              unlockAchievement('first-reaction');
              completeExperiment('chemistry');
              addReactionLog({
                elementA: releasedContainer.contents[0] ?? '',
                elementB: other.contents[0] ?? '',
                result: result.products,
                formula: result.equation,
              });
            }, 400);

            // Update mixed container color + contents
            return prev.map((c) => {
              if (c.id === other.id) {
                return {
                  ...c,
                  contents: [...c.contents, ...releasedContainer.contents],
                  color: result.effect.colorAfter,
                  fillLevel: Math.min(1, c.fillLevel + releasedContainer.fillLevel),
                };
              }
              if (c.id === id) {
                return { ...c, contents: [], fillLevel: 0, color: '#88ccff' };
              }
              return c;
            });
          }
        }
      }
      return prev;
    });
  }, [unlockAchievement, completeExperiment, addReactionLog]);

  // Close reaction result
  const handleCloseResult = () => {
    setReactionResult(null);
    setHelpMode('idle');
  };

  // Reset all containers
  const handleReset = () => {
    setContainers(makeDefaultContainers());
    setReactionResult(null);
    setHelpMode('idle');
    setHeldId(null);
  };

  // Add chemical to focused container
  const handleAddChemical = (chemId: string, containerId: string) => {
    const chem = CHEMICALS.find((c) => c.id === chemId);
    if (!chem) return;
    setContainers((prev) =>
      prev.map((c) => {
        if (c.id !== containerId) return c;
        const newContents = [...c.contents, chemId];
        return {
          ...c,
          contents: newContents,
          fillLevel: Math.min(1, c.fillLevel + 0.25),
          color: chem.color,
        };
      })
    );
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: '#020d18' }}>
      {/* ── Top HUD bar ── */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0,
        zIndex: 210,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 16px',
        background: 'rgba(2,13,24,0.9)',
        borderBottom: '1px solid rgba(0,245,196,0.15)',
        backdropFilter: 'blur(12px)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={onExit}
            style={{
              fontFamily: 'Orbitron, sans-serif', fontSize: '0.55rem',
              padding: '5px 14px', borderRadius: 6, cursor: 'pointer',
              background: 'rgba(255,50,80,0.1)', border: '1px solid rgba(255,50,80,0.3)',
              color: '#ff6655', letterSpacing: '0.1em',
            }}
          >
            ← EXIT LAB
          </button>
          <span style={{
            fontFamily: 'Orbitron, sans-serif', fontSize: '0.65rem',
            color: '#00f5c4', letterSpacing: '0.15em',
          }}>
            ⚗️ CHEMISTRY VR LAB
          </span>
          <span style={{
            fontFamily: 'Share Tech Mono, monospace', fontSize: '0.55rem',
            color: '#4a7a8a', padding: '3px 8px',
            background: 'rgba(0,245,196,0.05)', borderRadius: 4, border: '1px solid rgba(0,245,196,0.1)',
          }}>
            {helpMode.toUpperCase()}
          </span>
        </div>

        {/* XR entry buttons */}
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={handleReset}
            style={{
              fontFamily: 'Orbitron, sans-serif', fontSize: '0.5rem',
              padding: '5px 12px', borderRadius: 6, cursor: 'pointer',
              background: 'rgba(80,80,80,0.2)', border: '1px solid rgba(120,120,120,0.3)',
              color: '#aaaaaa', letterSpacing: '0.08em',
            }}
          >
            🔄 RESET
          </button>
          <button
            onClick={() => xrStore.enterVR()}
            style={{
              fontFamily: 'Orbitron, sans-serif', fontSize: '0.55rem',
              padding: '5px 16px', borderRadius: 6, cursor: 'pointer',
              background: 'linear-gradient(135deg, rgba(0,245,196,0.15), rgba(26,240,255,0.1))',
              border: '1px solid rgba(0,245,196,0.4)', color: '#00f5c4', letterSpacing: '0.08em',
              boxShadow: '0 0 12px rgba(0,245,196,0.2)',
            }}
          >
            🥽 ENTER VR (Quest 2)
          </button>
          <button
            onClick={() => xrStore.enterAR()}
            style={{
              fontFamily: 'Orbitron, sans-serif', fontSize: '0.55rem',
              padding: '5px 16px', borderRadius: 6, cursor: 'pointer',
              background: 'linear-gradient(135deg, rgba(180,79,255,0.15), rgba(100,50,255,0.1))',
              border: '1px solid rgba(180,79,255,0.4)', color: '#b44fff', letterSpacing: '0.08em',
              boxShadow: '0 0 12px rgba(180,79,255,0.2)',
            }}
          >
            🌐 ENTER AR (Quest 3)
          </button>
        </div>
      </div>

      {/* ── Grade Picker + Chemical Adder ── */}
      <div style={{
        position: 'absolute',
        bottom: 0, left: 0,
        zIndex: 210,
        width: 300,
        maxHeight: '60vh',
        background: 'rgba(2,13,24,0.92)',
        borderTop: '1px solid rgba(0,245,196,0.12)',
        borderRight: '1px solid rgba(0,245,196,0.12)',
        backdropFilter: 'blur(16px)',
        padding: 12,
        overflowY: 'auto',
      }}>
        <p style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '0.55rem', color: '#00f5c4', marginBottom: 8, letterSpacing: '0.12em' }}>
          ADD CHEMICALS TO CONTAINERS
        </p>
        {/* Grade filter */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 10 }}>
          {([10, 11, 12] as const).map((g) => (
            <button key={g}
              onClick={() => setSelectedGrade(g)}
              style={{
                fontFamily: 'Orbitron, sans-serif', fontSize: '0.5rem', padding: '3px 8px', borderRadius: 4, cursor: 'pointer',
                background: selectedGrade === g ? 'rgba(0,245,196,0.2)' : 'transparent',
                border: `1px solid ${selectedGrade === g ? 'rgba(0,245,196,0.5)' : 'rgba(0,245,196,0.1)'}`,
                color: selectedGrade === g ? '#00f5c4' : '#4a7a8a',
              }}
            >
              Grade {g}
            </button>
          ))}
        </div>

        {/* Chemical list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {CHEMICALS.slice(0, 12).map((chem) => (
            <div key={chem.id} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '4px 8px', background: 'rgba(0,245,196,0.03)',
              border: '1px solid rgba(0,245,196,0.08)', borderRadius: 4,
            }}>
              <div>
                <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '0.65rem', color: chem.glowColor }}>
                  {chem.formula}
                </span>
                <span style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '0.7rem', color: '#4a7a8a', marginLeft: 6 }}>
                  {chem.name}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 3 }}>
                {['beaker-A', 'beaker-B', 'beaker-C'].map((bid, i) => (
                  <button
                    key={bid}
                    onClick={() => handleAddChemical(chem.id, bid)}
                    style={{
                      fontFamily: 'Orbitron, sans-serif', fontSize: '0.4rem',
                      padding: '2px 5px', borderRadius: 3, cursor: 'pointer',
                      background: 'rgba(0,245,196,0.08)', border: '1px solid rgba(0,245,196,0.2)',
                      color: '#00f5c4',
                    }}
                  >
                    {['A', 'B', 'C'][i]}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Container info panel (right) ── */}
      <div style={{
        position: 'absolute',
        top: 56, right: 0,
        zIndex: 210,
        width: 240,
        background: 'rgba(2,13,24,0.92)',
        borderLeft: '1px solid rgba(0,245,196,0.12)',
        backdropFilter: 'blur(16px)',
        padding: 12,
      }}>
        <p style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '0.55rem', color: '#1af0ff', marginBottom: 10 }}>
          CONTAINER STATUS
        </p>
        {containers.slice(0, 3).map((c) => (
          <div key={c.id} style={{
            marginBottom: 8, padding: '6px 8px',
            background: c.contents.length > 0 ? 'rgba(0,245,196,0.05)' : 'rgba(0,0,0,0.2)',
            border: `1px solid ${c.contents.length > 0 ? 'rgba(0,245,196,0.2)' : 'rgba(0,245,196,0.05)'}`,
            borderRadius: 6,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '0.55rem', color: '#00f5c4' }}>
                {c.id.toUpperCase()}
              </span>
              {/* Fill bar */}
              <div style={{ width: 60, height: 4, background: 'rgba(0,245,196,0.1)', borderRadius: 2 }}>
                <div style={{ width: `${c.fillLevel * 100}%`, height: '100%', background: c.color, borderRadius: 2 }} />
              </div>
            </div>
            <p style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '0.6rem', color: '#e0faff', marginTop: 3 }}>
              {c.contents.length === 0
                ? 'empty'
                : c.contents.map((id) => getChemicalById(id)?.formula ?? id).join(' + ')}
            </p>
          </div>
        ))}

        {/* Quick actions */}
        <div style={{ borderTop: '1px solid rgba(0,245,196,0.08)', paddingTop: 8, marginTop: 4 }}>
          <p style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '0.48rem', color: '#4a7a8a', marginBottom: 6 }}>
            QUICK MIX
          </p>
          <button
            onClick={() => {
              if (containers[0].contents.length > 0 && containers[1].contents.length > 0) {
                const result = findReaction(containers[0].contents, containers[1].contents);
                if (result) {
                  setReactionResult(result);
                  setHelpMode('reaction');
                  unlockAchievement('first-reaction');
                  setContainers((prev) =>
                    prev.map((c) => {
                      if (c.id === 'beaker-A') return { ...c, color: result.effect.colorAfter };
                      if (c.id === 'beaker-B') return { ...c, contents: [], fillLevel: 0, color: '#88ccff' };
                      return c;
                    })
                  );
                }
              }
            }}
            className="btn-teal"
            style={{ width: '100%', fontSize: '0.5rem', padding: '5px' }}
          >
            ⚗️ MIX A + B
          </button>
        </div>
      </div>

      {/* ── 3D Canvas ── */}
      <Canvas
        camera={{ position: [0, 1.6, 2.5], fov: 75, near: 0.01, far: 100 }}
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
          // FIX 2: DO NOT set gl.xr.enabled — <XR> v6 handles this
          gl.setClearColor(0x000000, 0); // transparent = AR passthrough on Quest 3
        }}
      >
        <XR store={xrStore}>
          <Suspense fallback={null}>
            {/* FIX 3: No Physics wrapper */}
            <LabScene
              containers={containers}
              bunsenActive={bunsenActive}
              onBunsenToggle={() => setBunsenActive((v) => !v)}
              onGrab={handleGrab}
              onRelease={handleRelease}
              helpMode={helpMode}
              reactionResult={reactionResult}
              activeChemicals={activeChemicals}
            />
          </Suspense>
        </XR>
      </Canvas>

      {/* ── Reaction result DOM overlay ── */}
      <AnimatePresence>
        {reactionResult && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            style={{
              position: 'absolute',
              bottom: 20,
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 215,
              background: 'rgba(0,15,10,0.96)',
              border: '1px solid #00f5c4',
              borderRadius: 12,
              padding: '16px 24px',
              minWidth: 340,
              maxWidth: '85vw',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 0 40px rgba(0,245,196,0.2)',
            }}
          >
            <p style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '0.65rem', color: '#00f5c4', marginBottom: 6 }}>
              {reactionResult.effect.emoji} REACTION DETECTED — GRADE {reactionResult.grade}
            </p>
            <p style={{
              fontFamily: 'Share Tech Mono, monospace', fontSize: '0.9rem',
              color: '#e0faff', marginBottom: 8,
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>
              {reactionResult.equation}
            </p>
            <p style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '0.95rem', color: '#e0faff' }}>
              Products: <strong>{reactionResult.products}</strong>
            </p>
            <p style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '0.82rem', color: '#4a7a8a', marginTop: 4 }}>
              {reactionResult.description}
            </p>
            {reactionResult.realWorldExample && (
              <p style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '0.6rem', color: '#4a7a8a', marginTop: 4 }}>
                🌍 {reactionResult.realWorldExample}
              </p>
            )}
            <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
              <span style={{
                fontFamily: 'Orbitron, sans-serif', fontSize: '0.48rem', padding: '2px 8px', borderRadius: 4,
                background: reactionResult.effect.temperature === 'exothermic' ? 'rgba(255,100,50,0.15)' : 'rgba(50,100,255,0.15)',
                border: `1px solid ${reactionResult.effect.temperature === 'exothermic' ? '#ff6432' : '#3264ff'}`,
                color: reactionResult.effect.temperature === 'exothermic' ? '#ff8844' : '#64aaff',
                textTransform: 'uppercase',
              }}>
                {reactionResult.effect.temperature}
              </span>
              <span style={{
                fontFamily: 'Orbitron, sans-serif', fontSize: '0.48rem', padding: '2px 8px', borderRadius: 4,
                background: 'rgba(0,245,196,0.08)', border: '1px solid rgba(0,245,196,0.2)',
                color: '#00f5c4', textTransform: 'uppercase',
              }}>
                {reactionResult.type.replace('_', ' ')}
              </span>
            </div>
            <button
              className="btn-teal"
              style={{ marginTop: 12, width: '100%', fontSize: '0.55rem' }}
              onClick={handleCloseResult}
            >
              CONTINUE EXPERIMENT
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
