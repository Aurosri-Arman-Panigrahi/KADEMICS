// src/components/XR/VRHelpUI.tsx
/**
 * Floating 3D UI panel inside the VR scene.
 * Stays at eye level 1m in front of user (world space, not head-locked).
 * Shows context-sensitive instructions for Meta Quest users.
 */
import React, { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Text, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';

interface VRHelpUIProps {
  mode: 'idle' | 'holding' | 'mixing' | 'reaction';
  reactionText?: string;
  visible?: boolean;
}

const INSTRUCTIONS: Record<VRHelpUIProps['mode'], string[]> = {
  idle: [
    '🥼 PINCH/GRAB to pick up equipment',
    '🧪 Grab chemical bottle → pour into beaker',
    '⚗️  Tilt beaker >45° to start pour',
    '🔥 Touch Bunsen burner to toggle flame',
    '🧫 Bring 2 filled containers close to mix',
  ],
  holding: [
    '✋ You are holding an item',
    '⚗️  Tilt >45° to pour liquid',
    '🧫 Bring close to another container',
    '👐 Release grip to drop item',
    '🔄 Shake to stir contents',
  ],
  mixing: [
    '🔬 Mixing in progress...',
    '👁️ Watch for color change',
    '💨 Bubbles = gas is produced',
    '🌡️ Glow = exothermic reaction',
    '⬇️ Precipitate = insoluble product',
  ],
  reaction: [
    '✅ Reaction complete!',
    '📚 Check the reaction panel',
    '🏆 Experiment logged!',
    '🔮 Try another combination',
    '📝 Grade 10-12 curriculum covered',
  ],
};

export const VRHelpUI: React.FC<VRHelpUIProps> = ({
  mode,
  reactionText,
  visible = true,
}) => {
  const groupRef = useRef<THREE.Group>(null!);
  const panelRef = useRef<THREE.Group>(null!);
  const { camera } = useThree();
  const targetPos = useRef(new THREE.Vector3());
  const targetQuat = useRef(new THREE.Quaternion());

  useFrame(() => {
    if (!groupRef.current || !visible) return;

    // Place panel ~1.4m in front of camera, at eye level
    const dir = new THREE.Vector3(0, 0, -1.4);
    dir.applyQuaternion(camera.quaternion);
    targetPos.current.copy(camera.position).add(dir);
    targetPos.current.y = camera.position.y - 0.1; // slightly below eye

    // Smooth follow (not head-locked, drifts naturally)
    groupRef.current.position.lerp(targetPos.current, 0.03);

    // Face camera
    targetQuat.current.copy(camera.quaternion);
    groupRef.current.quaternion.slerp(targetQuat.current, 0.03);
  });

  if (!visible) return null;

  const instructions = INSTRUCTIONS[mode as keyof typeof INSTRUCTIONS] ?? INSTRUCTIONS.idle;
  const panelColor = mode === 'reaction' ? '#00f5c4' : mode === 'mixing' ? '#1af0ff' : '#b44fff';
  const panelBg = mode === 'reaction' ? '#00150f' : mode === 'mixing' ? '#000f15' : '#0a0010';

  return (
    <group ref={groupRef} name="vr-help-ui">
      {/* Panel background */}
      <RoundedBox args={[0.5, 0.4, 0.015]} radius={0.012} position={[0, 0, 0]}>
        <meshStandardMaterial color={panelBg} emissive={panelBg} emissiveIntensity={0.15} transparent opacity={0.92} />
      </RoundedBox>

      {/* Border glow line (top) */}
      <mesh position={[0, 0.19, 0.008]}>
        <planeGeometry args={[0.48, 0.003]} />
        <meshBasicMaterial color={panelColor} />
      </mesh>

      {/* Title */}
      <Text
        position={[0, 0.155, 0.012]}
        fontSize={0.025}
        color={panelColor}
        font="/fonts/orbitron-bold.woff"
        letterSpacing={0.08}
        anchorX="center"
        anchorY="middle"
      >
        {mode === 'idle' ? '🥽 KALINGA VR LAB' :
         mode === 'holding' ? '✋ ITEM HELD' :
         mode === 'mixing' ? '🔬 MIXING...' : '✅ REACTION COMPLETE'}
      </Text>

      {/* Divider */}
      <mesh position={[0, 0.132, 0.01]}>
        <planeGeometry args={[0.44, 0.001]} />
        <meshBasicMaterial color={panelColor} transparent opacity={0.4} />
      </mesh>

      {/* Instructions */}
      {instructions.map((text, i) => (
        <Text
          key={i}
          position={[-0.21, 0.1 - i * 0.05, 0.012]}
          fontSize={0.018}
          color="#e0faff"
          anchorX="left"
          anchorY="middle"
          maxWidth={0.44}
        >
          {text}
        </Text>
      ))}

      {/* Reaction result */}
      {reactionText && mode === 'reaction' && (
        <Text
          position={[0, -0.16, 0.012]}
          fontSize={0.02}
          color={panelColor}
          anchorX="center"
          anchorY="middle"
          maxWidth={0.44}
        >
          {reactionText}
        </Text>
      )}

      {/* Mode indicator dots */}
      <group position={[0, -0.185, 0.01]}>
        {(['idle', 'holding', 'mixing', 'reaction'] as const).map((m, i) => (
          <mesh key={m} position={[(i - 1.5) * 0.04, 0, 0]}>
            <sphereGeometry args={[0.005, 6, 6]} />
            <meshBasicMaterial color={m === mode ? panelColor : '#2a3a4a'} />
          </mesh>
        ))}
      </group>
    </group>
  );
};
