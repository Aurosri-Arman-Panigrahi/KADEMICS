// src/components/Lobby/AtomPortal.tsx
import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Sphere, Torus } from '@react-three/drei';
import * as THREE from 'three';

interface AtomPortalProps {
  position: [number, number, number];
  onClick: () => void;
}

/**
 * Atom portal — nucleus + 3 orbital rings for the Chemistry Lab.
 * Each ring rotates on a different axis continuously.
 */
export const AtomPortal: React.FC<AtomPortalProps> = ({ position, onClick }) => {
  const groupRef = useRef<THREE.Group>(null!);
  const ring1 = useRef<THREE.Mesh>(null!);
  const ring2 = useRef<THREE.Mesh>(null!);
  const ring3 = useRef<THREE.Mesh>(null!);
  const e1 = useRef<THREE.Mesh>(null!);
  const e2 = useRef<THREE.Mesh>(null!);
  const e3 = useRef<THREE.Mesh>(null!);
  const [hovered, setHovered] = useState(false);

  useFrame((state, delta) => {
    if (ring1.current) ring1.current.rotation.z += delta * 1.2;
    if (ring2.current) ring2.current.rotation.y += delta * 0.9;
    if (ring3.current) {
      ring3.current.rotation.x += delta * 0.7;
      ring3.current.rotation.z += delta * 0.3;
    }

    // Orbit electrons
    const t = state.clock.elapsedTime;
    if (e1.current) {
      e1.current.position.x = Math.cos(t * 1.2) * 0.75;
      e1.current.position.y = Math.sin(t * 1.2) * 0.75;
    }
    if (e2.current) {
      e2.current.position.x = Math.cos(t * 0.9) * 0.75;
      e2.current.position.z = Math.sin(t * 0.9) * 0.75;
    }
    if (e3.current) {
      e3.current.position.x = Math.cos(t * 0.7 + 1) * 0.75;
      e3.current.position.y = Math.sin(t * 0.7 + 1) * 0.4;
      e3.current.position.z = Math.sin(t * 0.7 + 1) * 0.6;
    }

    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.15;
      const targetScale = hovered ? 1.15 : 1;
      groupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
    }
  });

  const emissiveInt = hovered ? 1.0 : 0.5;

  return (
    <group
      ref={groupRef}
      position={position}
      onClick={onClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      userData={{ portalId: 'atom' }}
    >
      {/* Nucleus */}
      <Sphere args={[0.28, 16, 16]}>
        <meshStandardMaterial
          color="#1af0ff"
          emissive="#1af0ff"
          emissiveIntensity={emissiveInt}
        />
      </Sphere>

      {/* Orbital ring 1 — Z axis */}
      <Torus ref={ring1} args={[0.75, 0.02, 8, 64]} rotation={[Math.PI / 2, 0, 0]}>
        <meshStandardMaterial
          color="#1af0ff"
          emissive="#1af0ff"
          emissiveIntensity={emissiveInt * 0.7}
          transparent
          opacity={0.85}
        />
      </Torus>

      {/* Orbital ring 2 — Y axis */}
      <Torus ref={ring2} args={[0.75, 0.02, 8, 64]} rotation={[0, 0, Math.PI / 4]}>
        <meshStandardMaterial
          color="#00f5c4"
          emissive="#00f5c4"
          emissiveIntensity={emissiveInt * 0.7}
          transparent
          opacity={0.7}
        />
      </Torus>

      {/* Orbital ring 3 — diagonal */}
      <Torus ref={ring3} args={[0.75, 0.02, 8, 64]} rotation={[Math.PI / 3, Math.PI / 6, 0]}>
        <meshStandardMaterial
          color="#b44fff"
          emissive="#b44fff"
          emissiveIntensity={emissiveInt * 0.7}
          transparent
          opacity={0.6}
        />
      </Torus>

      {/* Electrons */}
      <Sphere ref={e1} args={[0.07, 8, 8]}>
        <meshStandardMaterial color="#e0faff" emissive="#1af0ff" emissiveIntensity={2} />
      </Sphere>
      <Sphere ref={e2} args={[0.07, 8, 8]}>
        <meshStandardMaterial color="#e0faff" emissive="#00f5c4" emissiveIntensity={2} />
      </Sphere>
      <Sphere ref={e3} args={[0.07, 8, 8]}>
        <meshStandardMaterial color="#e0faff" emissive="#b44fff" emissiveIntensity={2} />
      </Sphere>

      {/* Glow sphere */}
      <Sphere args={[0.9, 16, 16]}>
        <meshStandardMaterial
          color="#1af0ff"
          transparent
          opacity={hovered ? 0.07 : 0.025}
          emissive="#1af0ff"
          emissiveIntensity={hovered ? 0.3 : 0.08}
          side={THREE.BackSide}
        />
      </Sphere>

      {/* Label */}
      <Text
        position={[0, -1.3, 0]}
        fontSize={0.22}
        color="#e0faff"
        anchorX="center"
        anchorY="middle"
      >
        CHEM LAB
      </Text>

      {hovered && <pointLight color="#1af0ff" intensity={2} distance={3} decay={2} />}
    </group>
  );
};
