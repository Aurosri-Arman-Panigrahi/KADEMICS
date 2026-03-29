// src/components/XR/LabRoom.tsx
/**
 * Procedural 3D chemistry lab room — no external models needed.
 * Uses only Three.js primitives. Environment:
 *   - White tile floor, grey walls, white ceiling
 *   - Lab bench (long wooden top + steel frame)
 *   - Wall chemical shelf with coloured bottles
 *   - Fume hood on back wall
 *   - Fluorescent ceiling lights
 *   - Windows (frosted glass) on left wall
 *   - Blackboard on right wall with chalk text geometry
 *   - Room scale: 8m × 10m × 3.2m
 */
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Text } from '@react-three/drei';

/* ── Tile material helper ── */
function FloorTile() {
  const gridRef = useRef<THREE.GridHelper>(null!);
  return (
    <group>
      {/* Main white floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[10, 12]} />
        <meshStandardMaterial color="#e8eeee" roughness={0.3} metalness={0.05} />
      </mesh>
      {/* Tile grid overlay */}
      <gridHelper ref={gridRef} args={[10, 20, '#ccdddd', '#ccdddd']} position={[0, 0.001, 0]} />
    </group>
  );
}

function Walls() {
  const wallMat = (
    <meshStandardMaterial color="#d8e0e4" roughness={0.8} metalness={0.0} />
  );
  return (
    <group>
      {/* Back wall */}
      <mesh position={[0, 1.6, -6]} receiveShadow>
        <planeGeometry args={[10, 3.2]} />
        {wallMat}
      </mesh>
      {/* Front wall */}
      <mesh position={[0, 1.6, 6]} rotation={[0, Math.PI, 0]} receiveShadow>
        <planeGeometry args={[10, 3.2]} />
        {wallMat}
      </mesh>
      {/* Left wall */}
      <mesh position={[-5, 1.6, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[12, 3.2]} />
        {wallMat}
      </mesh>
      {/* Right wall */}
      <mesh position={[5, 1.6, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[12, 3.2]} />
        {wallMat}
      </mesh>
      {/* Ceiling */}
      <mesh position={[0, 3.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[10, 12]} />
        <meshStandardMaterial color="#f0f4f4" />
      </mesh>
      {/* Floor skirting board */}
      <mesh position={[0, 0.06, -5.98]}>
        <boxGeometry args={[10, 0.12, 0.04]} />
        <meshStandardMaterial color="#c0c8cc" />
      </mesh>
      <mesh position={[0, 0.06, 5.98]}>
        <boxGeometry args={[10, 0.12, 0.04]} />
        <meshStandardMaterial color="#c0c8cc" />
      </mesh>
    </group>
  );
}

function FluorescentLight({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Tube housing */}
      <mesh>
        <boxGeometry args={[2.2, 0.06, 0.14]} />
        <meshStandardMaterial color="#f0f8ff" emissive="#ffffff" emissiveIntensity={0.6} />
      </mesh>
      {/* Light source */}
      <pointLight color="#fff8e8" intensity={3} distance={8} decay={2} position={[0, -0.1, 0]} />
    </group>
  );
}

function LabBench({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Bench top */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.2, 0.06, 0.85]} />
        <meshStandardMaterial color="#8b5e3c" roughness={0.7} metalness={0.05} />
      </mesh>
      {/* Surface highlight (grey lab mat) */}
      <mesh position={[0, 0.035, 0]}>
        <boxGeometry args={[3.0, 0.004, 0.75]} />
        <meshStandardMaterial color="#b0c4c4" roughness={0.4} />
      </mesh>
      {/* Four legs */}
      {([[-1.5, 0.35, -0.3], [1.5, -0.35, 0.3], [-1.5, 0.35, 0.3], [1.5, -0.35, -0.3]] as [number, number, number][]).map(([lx, , lz], i) => {
        const x = Math.sign(lx) * 1.45;
        const z = Math.sign(lz) * 0.35;
        return (
          <mesh key={i} position={[x, -0.4, z]} castShadow>
            <boxGeometry args={[0.05, 0.8, 0.05]} />
            <meshStandardMaterial color="#606060" metalness={0.6} roughness={0.4} />
          </mesh>
        );
      })}
      {/* Under-bench shelf */}
      <mesh position={[0, -0.68, 0]}>
        <boxGeometry args={[3.0, 0.03, 0.75]} />
        <meshStandardMaterial color="#8b5e3c" roughness={0.7} />
      </mesh>
    </group>
  );
}

function ChemicalShelf() {
  const BOTTLE_COLORS = ['#2255cc', '#cc2244', '#22aa44', '#eecc00', '#aa22aa', '#ff7722', '#44aacc', '#cc4422'];
  return (
    <group position={[0, 1.5, -5.7]}>
      {/* Shelf boards */}
      {[0, 0.5, 1.0].map((y, i) => (
        <mesh key={i} position={[0, y, 0]}>
          <boxGeometry args={[4.0, 0.03, 0.3]} />
          <meshStandardMaterial color="#8b5e3c" roughness={0.7} />
        </mesh>
      ))}
      {/* Bottle columns */}
      {BOTTLE_COLORS.map((color, i) => {
        const x = (i - BOTTLE_COLORS.length / 2 + 0.5) * 0.44;
        const row = i < 4 ? 0 : 1;
        return (
          <group key={i} position={[x, 0.08 + row * 0.5, 0.06]}>
            {/* Bottle body */}
            <mesh>
              <cylinderGeometry args={[0.038, 0.044, 0.16, 12]} />
              <meshStandardMaterial color={color} transparent opacity={0.82} roughness={0.1} metalness={0.0} />
            </mesh>
            {/* Bottle neck */}
            <mesh position={[0, 0.1, 0]}>
              <cylinderGeometry args={[0.016, 0.032, 0.06, 10]} />
              <meshStandardMaterial color={color} transparent opacity={0.9} />
            </mesh>
            {/* White cap */}
            <mesh position={[0, 0.14, 0]}>
              <cylinderGeometry args={[0.02, 0.02, 0.02, 8]} />
              <meshStandardMaterial color="#eeeeee" />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

function FumeHood() {
  return (
    <group position={[-3.5, 0.9, -5.5]}>
      {/* Hood frame */}
      <mesh>
        <boxGeometry args={[1.4, 1.6, 0.7]} />
        <meshStandardMaterial color="#c8d8d8" transparent opacity={0.15} />
      </mesh>
      {/* Glass front */}
      <mesh position={[0, 0, 0.35]}>
        <planeGeometry args={[1.3, 1.5]} />
        <meshStandardMaterial color="#aaddee" transparent opacity={0.22} metalness={0.1} />
      </mesh>
      {/* Hood interior light */}
      <pointLight color="#aaffee" intensity={0.5} distance={2} position={[0, 0.6, 0]} />
      {/* Duct */}
      <mesh position={[0, 1.0, 0]}>
        <boxGeometry args={[0.25, 0.8, 0.25]} />
        <meshStandardMaterial color="#8899aa" metalness={0.4} />
      </mesh>
    </group>
  );
}

function Windows() {
  return (
    <group position={[-4.99, 1.6, -1]}>
      {[-1.5, 1.5].map((z, i) => (
        <group key={i} position={[0, 0, z]}>
          {/* Frame */}
          <mesh>
            <boxGeometry args={[0.06, 1.2, 0.9]} />
            <meshStandardMaterial color="#aaaaaa" metalness={0.3} />
          </mesh>
          {/* Glass pane */}
          <mesh position={[0.04, 0, 0]}>
            <planeGeometry args={[0.8, 1.1]} />
            <meshStandardMaterial color="#ddeeff" transparent opacity={0.25} metalness={0.1} />
          </mesh>
          {/* Outside glow */}
          <pointLight color="#ffe8c0" intensity={2} distance={4} position={[1, 0, 0]} />
        </group>
      ))}
    </group>
  );
}

function Blackboard() {
  return (
    <group position={[4.9, 1.6, 0]} rotation={[0, -Math.PI / 2, 0]}>
      {/* Board surface */}
      <mesh>
        <planeGeometry args={[3.5, 2.2]} />
        <meshStandardMaterial color="#1a3a2a" roughness={0.95} />
      </mesh>
      {/* Frame */}
      <mesh position={[0, 0, -0.02]}>
        <boxGeometry args={[3.7, 2.4, 0.04]} />
        <meshStandardMaterial color="#5a3a2a" />
      </mesh>
      {/* Chalk tray */}
      <mesh position={[0, -1.25, 0.05]}>
        <boxGeometry args={[3.5, 0.06, 0.12]} />
        <meshStandardMaterial color="#886655" />
      </mesh>
    </group>
  );
}

function Wastebin() {
  return (
    <group position={[4.0, 0, 5.3]}>
      <mesh position={[0, 0.22, 0]}>
        <cylinderGeometry args={[0.16, 0.13, 0.44, 12]} />
        <meshStandardMaterial color="#5a7a5a" roughness={0.7} />
      </mesh>
      {/* lid */}
      <mesh position={[0, 0.46, 0]}>
        <cylinderGeometry args={[0.17, 0.17, 0.04, 12]} />
        <meshStandardMaterial color="#446044" />
      </mesh>
    </group>
  );
}

function SafetyEquipment() {
  return (
    <group position={[-4.6, 0.9, 5.0]}>
      {/* Eye wash station */}
      <mesh position={[0, 0.2, 0]}>
        <boxGeometry args={[0.25, 0.4, 0.15]} />
        <meshStandardMaterial color="#22aacc" />
      </mesh>
      <mesh position={[0, 0.44, 0]}>
        <sphereGeometry args={[0.08, 10, 10]} />
        <meshStandardMaterial color="#55ddff" transparent opacity={0.6} />
      </mesh>
      {/* Fire extinguisher */}
      <group position={[0.5, 0, 0]}>
        <mesh position={[0, 0.3, 0]}>
          <cylinderGeometry args={[0.07, 0.08, 0.6, 10]} />
          <meshStandardMaterial color="#cc2222" />
        </mesh>
        <mesh position={[0, 0.65, 0]}>
          <cylinderGeometry args={[0.03, 0.04, 0.12, 8]} />
          <meshStandardMaterial color="#885500" />
        </mesh>
      </group>
    </group>
  );
}

/* ── Animated Bunsen burner flame ── */
export function BunsenBurner({ position, active }: { position: [number, number, number]; active: boolean }) {
  const flameRef = useRef<THREE.Mesh>(null!);
  useFrame(({ clock }) => {
    if (flameRef.current && active) {
      const t = clock.elapsedTime;
      flameRef.current.scale.y = 1 + Math.sin(t * 12) * 0.12;
      flameRef.current.scale.x = 1 + Math.cos(t * 10) * 0.06;
      flameRef.current.position.y = 0.14 + Math.sin(t * 8) * 0.005;
    }
  });
  return (
    <group position={position}>
      {/* Base */}
      <mesh>
        <cylinderGeometry args={[0.055, 0.07, 0.06, 12]} />
        <meshStandardMaterial color="#999999" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Barrel */}
      <mesh position={[0, 0.12, 0]}>
        <cylinderGeometry args={[0.022, 0.028, 0.18, 10]} />
        <meshStandardMaterial color="#777777" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Gas valve */}
      <mesh position={[0.06, 0.05, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.01, 0.01, 0.08, 6]} />
        <meshStandardMaterial color="#555555" metalness={0.8} />
      </mesh>
      {/* Flame */}
      {active && (
        <mesh ref={flameRef} position={[0, 0.24, 0]}>
          <coneGeometry args={[0.025, 0.1, 8]} />
          <meshStandardMaterial color="#0088ff" emissive="#0044cc" emissiveIntensity={2} transparent opacity={0.85} />
        </mesh>
      )}
      {/* Flame outer */}
      {active && (
        <mesh position={[0, 0.27, 0]}>
          <coneGeometry args={[0.015, 0.07, 8]} />
          <meshStandardMaterial color="#00aaff" emissive="#88ddff" emissiveIntensity={3} transparent opacity={0.5} />
        </mesh>
      )}
      {/* Flame light */}
      {active && (
        <pointLight position={[0, 0.3, 0]} color="#4488ff" intensity={1.5} distance={1.2} decay={2} />
      )}
    </group>
  );
}

function TestTubeRack({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Rack base */}
      <mesh>
        <boxGeometry args={[0.35, 0.025, 0.1]} />
        <meshStandardMaterial color="#666666" metalness={0.6} roughness={0.4} />
      </mesh>
      {/* Hole separators */}
      {[-0.12, -0.04, 0.04, 0.12].map((x, i) => (
        <mesh key={i} position={[x, 0.03, 0]}>
          <cylinderGeometry args={[0.016, 0.016, 0.06, 8]} />
          <meshStandardMaterial color="#555555" metalness={0.7} />
        </mesh>
      ))}
    </group>
  );
}

/* ── Main Lab Room ── */
export const LabRoom: React.FC = () => {
  return (
    <group name="lab-room">
      <FloorTile />
      <Walls />
      <FumeHood />
      <Windows />
      <Blackboard />
      <ChemicalShelf />
      <Wastebin />
      <SafetyEquipment />

      {/* Lab benches */}
      <LabBench position={[0, 0.92, -2.5]} />
      <LabBench position={[0, 0.92, 1.2]} />
      <LabBench position={[-2.5, 0.92, 0]} />

      {/* Test tube racks on bench */}
      <TestTubeRack position={[-0.8, 0.965, -2.5]} />
      <TestTubeRack position={[0.6, 0.965, -2.5]} />

      {/* Fluorescent ceiling lights */}
      <FluorescentLight position={[-2, 3.15, -3]} />
      <FluorescentLight position={[2, 3.15, -3]} />
      <FluorescentLight position={[-2, 3.15, 1]} />
      <FluorescentLight position={[2, 3.15, 1]} />
      <FluorescentLight position={[0, 3.15, 4]} />

      {/* Ambient fill */}
      <ambientLight intensity={0.4} color="#f0f8ff" />
      <pointLight position={[0, 3, 0]} color="#fff8f0" intensity={1} distance={15} decay={2} />
    </group>
  );
};
