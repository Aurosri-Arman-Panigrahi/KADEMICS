// src/components/Lobby/DNAPortal.tsx
import React, { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Sphere } from '@react-three/drei';
import * as THREE from 'three';

interface DNAPortalProps {
  position: [number, number, number];
  onClick: () => void;
}

/**
 * Procedural double-helix DNA portal for the Biology Lab.
 * Built from instanced spheres tracing two sinusoidal helices.
 */
export const DNAPortal: React.FC<DNAPortalProps> = ({ position, onClick }) => {
  const groupRef = useRef<THREE.Group>(null!);
  const [hovered, setHovered] = useState(false);

  // Generate helix points
  const helixData = useMemo(() => {
    const points: { pos: THREE.Vector3; strand: 0 | 1 }[] = [];
    const count = 24;
    for (let i = 0; i < count; i++) {
      const t = (i / count) * Math.PI * 4;
      const y = (i / count) * 2.4 - 1.2;
      // Strand 1
      points.push({
        pos: new THREE.Vector3(Math.cos(t) * 0.5, y, Math.sin(t) * 0.5),
        strand: 0,
      });
      // Strand 2 (180° offset)
      points.push({
        pos: new THREE.Vector3(Math.cos(t + Math.PI) * 0.5, y, Math.sin(t + Math.PI) * 0.5),
        strand: 1,
      });
    }
    return points;
  }, []);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.6;
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
      userData={{ portalId: 'dna' }}
    >
      {/* Helix spheres */}
      {helixData.map((pt, i) => (
        <Sphere key={i} position={pt.pos.toArray()} args={[0.055, 8, 8]}>
          <meshStandardMaterial
            color={pt.strand === 0 ? '#00f5c4' : '#1af0ff'}
            emissive={pt.strand === 0 ? '#00f5c4' : '#1af0ff'}
            emissiveIntensity={hovered ? 1.0 : 0.5}
          />
        </Sphere>
      ))}

      {/* Connecting rungs every 4 points */}
      {Array.from({ length: 12 }).map((_, i) => {
        const s1 = helixData[i * 2];
        const s2 = helixData[i * 2 + 1];
        if (!s1 || !s2) return null;
        const mid = s1.pos.clone().lerp(s2.pos, 0.5);
        const dir = s2.pos.clone().sub(s1.pos);
        const len = dir.length();
        return (
          <mesh key={`rung-${i}`} position={mid.toArray()}>
            <cylinderGeometry args={[0.02, 0.02, len, 6]} />
            <meshStandardMaterial
              color="#00f5c4"
              emissive="#00f5c4"
              emissiveIntensity={hovered ? 0.8 : 0.2}
              transparent
              opacity={0.6}
            />
          </mesh>
        );
      })}

      {/* Glow sphere */}
      <Sphere args={[0.65, 16, 16]}>
        <meshStandardMaterial
          color="#00f5c4"
          transparent
          opacity={hovered ? 0.07 : 0.03}
          emissive="#00f5c4"
          emissiveIntensity={hovered ? 0.3 : 0.1}
          side={THREE.BackSide}
        />
      </Sphere>

      {/* Label */}
      <Text
        position={[0, -1.6, 0]}
        fontSize={0.22}
        color="#e0faff"
        font="https://fonts.gstatic.com/s/orbitron/v29/yMJMMIlzdpvBhQQL_SC3X9yhF25-T1nyGy6BoWgz.woff"
        anchorX="center"
        anchorY="middle"
      >
        BIO LAB
      </Text>

      {/* Point light for glow effect */}
      {hovered && (
        <pointLight color="#00f5c4" intensity={2} distance={3} decay={2} />
      )}
    </group>
  );
};
