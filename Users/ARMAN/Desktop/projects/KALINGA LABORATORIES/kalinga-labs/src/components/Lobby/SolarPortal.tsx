// src/components/Lobby/SolarPortal.tsx
import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Sphere } from '@react-three/drei';
import * as THREE from 'three';

interface SolarPortalProps {
  position: [number, number, number];
  onClick: () => void;
}

const PLANETS = [
  { radius: 0.7, size: 0.07, speed: 2.0, color: '#aaa0ff', name: 'p1' },
  { radius: 1.0, size: 0.09, speed: 1.3, color: '#ff9955', name: 'p2' },
  { radius: 1.35, size: 0.06, speed: 0.8, color: '#55ddff', name: 'p3' },
];

/**
 * Miniature solar system portal for the Physics Lab.
 * Sun at center with 3 orbiting planets.
 */
export const SolarPortal: React.FC<SolarPortalProps> = ({ position, onClick }) => {
  const groupRef = useRef<THREE.Group>(null!);
  const p1Ref = useRef<THREE.Mesh>(null!);
  const p2Ref = useRef<THREE.Mesh>(null!);
  const p3Ref = useRef<THREE.Mesh>(null!);
  const refs = [p1Ref, p2Ref, p3Ref];
  const [hovered, setHovered] = useState(false);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    PLANETS.forEach((p, i) => {
      const ref = refs[i];
      if (ref.current) {
        ref.current.position.x = Math.cos(t * p.speed) * p.radius;
        ref.current.position.z = Math.sin(t * p.speed) * p.radius;
      }
    });

    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.1;
      const targetScale = hovered ? 1.15 : 1;
      groupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
    }
  });

  return (
    <group
      ref={groupRef}
      position={position}
      onClick={onClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      userData={{ portalId: 'solar' }}
    >
      {/* Sun */}
      <Sphere args={[0.3, 16, 16]}>
        <meshStandardMaterial
          color="#ffcc44"
          emissive="#ff8800"
          emissiveIntensity={hovered ? 2.5 : 1.5}
        />
      </Sphere>
      <pointLight color="#ffaa22" intensity={hovered ? 4 : 2} distance={4} decay={2} />

      {/* Orbit rings */}
      {PLANETS.map((p) => (
        <mesh key={`orbit-${p.name}`} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[p.radius, 0.007, 4, 80]} />
          <meshStandardMaterial
            color="#b44fff"
            emissive="#b44fff"
            emissiveIntensity={0.3}
            transparent
            opacity={0.35}
          />
        </mesh>
      ))}

      {/* Planets */}
      <Sphere ref={p1Ref} args={[PLANETS[0].size, 10, 10]}>
        <meshStandardMaterial
          color={PLANETS[0].color}
          emissive={PLANETS[0].color}
          emissiveIntensity={0.4}
        />
      </Sphere>
      <Sphere ref={p2Ref} args={[PLANETS[1].size, 10, 10]}>
        <meshStandardMaterial
          color={PLANETS[1].color}
          emissive={PLANETS[1].color}
          emissiveIntensity={0.4}
        />
      </Sphere>
      <Sphere ref={p3Ref} args={[PLANETS[2].size, 10, 10]}>
        <meshStandardMaterial
          color={PLANETS[2].color}
          emissive={PLANETS[2].color}
          emissiveIntensity={0.4}
        />
      </Sphere>

      {/* Glow sphere */}
      <Sphere args={[1.55, 16, 16]}>
        <meshStandardMaterial
          color="#b44fff"
          transparent
          opacity={hovered ? 0.06 : 0.02}
          emissive="#b44fff"
          emissiveIntensity={0.2}
          side={THREE.BackSide}
        />
      </Sphere>

      {/* Label */}
      <Text
        position={[0, -1.8, 0]}
        fontSize={0.22}
        color="#e0faff"
        anchorX="center"
        anchorY="middle"
      >
        PHYS LAB
      </Text>

      {hovered && (
        <pointLight color="#b44fff" intensity={1.5} distance={3} decay={2} position={[0, 0, 0]} />
      )}
    </group>
  );
};
