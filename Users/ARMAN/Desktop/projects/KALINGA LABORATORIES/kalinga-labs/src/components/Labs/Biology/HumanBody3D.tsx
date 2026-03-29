// src/components/Labs/Biology/HumanBody3D.tsx
/**
 * Procedural 3D human body silhouette with transparent skin shell.
 * Organs positioned anatomically inside the body using OrganAnimations.
 * Supports zoom levels: room → skin → tissue → cellular → organ
 */
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import {
  PulsingHeart,
  BreathingLungs,
  SparkingBrain,
  SqueezingStomach,
  PulsingLiver,
  FilteringKidney,
} from './OrganAnimations';

export type ZoomLevel = 'room' | 'skin' | 'tissue' | 'cellular' | 'organ';

interface HumanBody3DProps {
  zoomLevel: ZoomLevel;
  activeSystem: string;
  onClickSkin?: () => void;
}

/* ─── Skin surface (translucent outer shell) ─── */
function SkinSurface({ onClick }: { onClick?: () => void }) {
  const ref = useRef<THREE.Group>(null!);
  useFrame(({ clock }) => {
    if (ref.current) {
      // Subtle subsurface scattering shimmer
      ref.current.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          const mat = child.material as THREE.MeshPhysicalMaterial;
          if (mat.transmission !== undefined) {
            mat.opacity = 0.18 + Math.sin(clock.elapsedTime * 0.4) * 0.02;
          }
        }
      });
    }
  });

  return (
    <group ref={ref}
      onClick={onClick}
      onPointerEnter={() => { document.body.style.cursor = 'zoom-in'; }}
      onPointerLeave={() => { document.body.style.cursor = 'default'; }}
    >
      {/* Head */}
      <mesh position={[0, 1.7, 0]} castShadow>
        <sphereGeometry args={[0.14, 24, 18]} />
        <meshPhysicalMaterial color="#f5c9a0" transparent opacity={0.22}
          roughness={0.3} metalness={0} side={THREE.FrontSide}
          emissive="#ff8866" emissiveIntensity={0.03}
        />
      </mesh>
      {/* Torso */}
      <mesh position={[0, 1.1, 0]} castShadow>
        <capsuleGeometry args={[0.18, 0.55, 10, 18]} />
        <meshPhysicalMaterial color="#f0c090" transparent opacity={0.2}
          roughness={0.4} metalness={0}
          emissive="#ff7755" emissiveIntensity={0.02}
        />
      </mesh>
      {/* Pelvis */}
      <mesh position={[0, 0.6, 0]} castShadow>
        <capsuleGeometry args={[0.16, 0.18, 8, 14]} />
        <meshPhysicalMaterial color="#f0c090" transparent opacity={0.2} roughness={0.45} />
      </mesh>
      {/* Left arm */}
      <mesh position={[-0.32, 1.1, 0]} rotation={[0, 0, 0.25]} castShadow>
        <capsuleGeometry args={[0.055, 0.5, 8, 12]} />
        <meshPhysicalMaterial color="#f2c298" transparent opacity={0.18} roughness={0.4} />
      </mesh>
      {/* Right arm */}
      <mesh position={[0.32, 1.1, 0]} rotation={[0, 0, -0.25]} castShadow>
        <capsuleGeometry args={[0.055, 0.5, 8, 12]} />
        <meshPhysicalMaterial color="#f2c298" transparent opacity={0.18} roughness={0.4} />
      </mesh>
      {/* Left leg */}
      <mesh position={[-0.1, 0.15, 0]} castShadow>
        <capsuleGeometry args={[0.068, 0.6, 8, 12]} />
        <meshPhysicalMaterial color="#f0c090" transparent opacity={0.18} roughness={0.4} />
      </mesh>
      {/* Right leg */}
      <mesh position={[0.1, 0.15, 0]} castShadow>
        <capsuleGeometry args={[0.068, 0.6, 8, 12]} />
        <meshPhysicalMaterial color="#f0c090" transparent opacity={0.18} roughness={0.4} />
      </mesh>
      {/* Click hint label */}
      <Text position={[0, 2.1, 0]} fontSize={0.04} color="#00f5c4" anchorX="center">
        CLICK SKIN TO ZOOM IN →
      </Text>
    </group>
  );
}

/* ─── Tissue layer (visible at 'skin' zoom) ─── */
function TissueLayer({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <group>
      {/* Fibrous tissue mesh */}
      {Array.from({ length: 6 }, (_, i) => (
        <mesh key={i} position={[
          (Math.random() - 0.5) * 0.3,
          0.9 + (Math.random() - 0.5) * 0.5,
          (Math.random() - 0.5) * 0.2,
        ]} rotation={[Math.random() * Math.PI, Math.random() * Math.PI, 0]}>
          <planeGeometry args={[0.25, 0.25, 4, 4]} />
          <meshStandardMaterial color="#ff9988" transparent opacity={0.3}
            wireframe={false} roughness={0.8} side={THREE.DoubleSide}
          />
        </mesh>
      ))}
      {/* Capillaries */}
      {Array.from({ length: 8 }, (_, i) => {
        const x = (Math.random() - 0.5) * 0.4;
        const y = 0.7 + Math.random() * 0.8;
        const z = (Math.random() - 0.5) * 0.15;
        return (
          <mesh key={`cap-${i}`} position={[x, y, z]} rotation={[Math.random() * Math.PI, 0, Math.random() * Math.PI]}>
            <cylinderGeometry args={[0.003, 0.003, 0.1 + Math.random() * 0.12, 6]} />
            <meshStandardMaterial color="#cc3333" transparent opacity={0.6} />
          </mesh>
        );
      })}
      {/* Connective tissue cells */}
      {Array.from({ length: 20 }, (_, i) => (
        <mesh key={`ct-${i}`} position={[
          (Math.random() - 0.5) * 0.35,
          0.8 + Math.random() * 0.7,
          (Math.random() - 0.5) * 0.2,
        ]}>
          <sphereGeometry args={[0.008 + Math.random() * 0.006, 6, 6]} />
          <meshStandardMaterial color={Math.random() > 0.5 ? '#ffddcc' : '#ffbbaa'} transparent opacity={0.7} />
        </mesh>
      ))}
    </group>
  );
}

/* ─── Main component ─── */
export function HumanBody3D({ zoomLevel, activeSystem, onClickSkin }: HumanBody3DProps) {
  const showOrgans = zoomLevel === 'organ' || zoomLevel === 'room';
  const showTissue = zoomLevel === 'tissue' || zoomLevel === 'skin';
  const showSkin = zoomLevel !== 'cellular';

  // Body scale based on zoom
  const bodyScaleMap: Record<ZoomLevel, number> = {
    room: 1,
    skin: 0.85,
    tissue: 0.6,
    cellular: 0.3,
    organ: 0.9,
  };
  const bodyScale = bodyScaleMap[zoomLevel];

  return (
    <group scale={bodyScale}>
      {/* Skin shell */}
      {showSkin && <SkinSurface onClick={onClickSkin} />}

      {/* Tissue layer */}
      <TissueLayer visible={showTissue} />

      {/* Animated Organs — shown in room and organ zoom */}
      {showOrgans && (
        <group>
          {/* Heart */}
          <PulsingHeart position={[-0.1, 1.08, 0.12]} scale={0.9} />

          {/* Lungs */}
          <BreathingLungs position={[0, 1.15, 0.05]} scale={0.85} />

          {/* Brain */}
          <SparkingBrain position={[0, 1.66, 0.05]} scale={0.85} />

          {/* Stomach */}
          <SqueezingStomach position={[0.06, 0.78, 0.12]} scale={0.8} />

          {/* Liver */}
          <PulsingLiver position={[0.22, 0.9, 0.1]} scale={0.75} />

          {/* Kidneys */}
          <FilteringKidney position={[-0.14, 0.82, -0.06]} side="left" scale={0.7} />
          <FilteringKidney position={[0.16, 0.82, -0.06]} side="right" scale={0.7} />

          {/* Spine guide line */}
          <mesh position={[0, 0.9, -0.04]}>
            <cylinderGeometry args={[0.01, 0.01, 1.1, 8]} />
            <meshStandardMaterial color="#c0d8e8" roughness={0.5} />
          </mesh>
          {/* Vertebrae bumps */}
          {Array.from({ length: 9 }, (_, i) => (
            <mesh key={i} position={[0, 0.38 + i * 0.1, -0.04]}>
              <sphereGeometry args={[0.016, 8, 6]} />
              <meshStandardMaterial color="#c8dce8" roughness={0.4} />
            </mesh>
          ))}
        </group>
      )}

      {/* Skeleton visible in room view (thin wireframe bones) */}
      {zoomLevel === 'room' && (
        <group>
          {/* Ribcage wireframe */}
          {Array.from({ length: 6 }, (_, i) => (
            <mesh key={i} position={[0, 1.1 - i * 0.05, 0.05]} rotation={[0.2, 0, 0]}>
              <torusGeometry args={[0.14 - i * 0.008, 0.007, 6, 24, Math.PI * 1.7]} />
              <meshStandardMaterial color="#c0d8e8" transparent opacity={0.4} roughness={0.5} />
            </mesh>
          ))}
        </group>
      )}
    </group>
  );
}
