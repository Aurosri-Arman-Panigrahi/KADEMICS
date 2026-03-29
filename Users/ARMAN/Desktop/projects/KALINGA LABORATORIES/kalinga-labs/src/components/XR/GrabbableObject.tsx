// src/components/XR/GrabbableObject.tsx
/**
 * Reusable grab component for Meta Quest hand tracking + controllers.
 * Uses @react-three/xr v6 pointer capture API:
 *   - onPointerDown → setPointerCapture → attach to hand group
 *   - onPointerUp   → releasePointerCapture → detach (drop with physics)
 *   - Haptic pulse on pick-up and drop
 *   - Highlight outline on hover
 */
import React, { useRef, useState, useCallback, ReactNode } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export interface GrabbableObjectProps {
  children: ReactNode;
  onGrab?: () => void;
  onRelease?: (position: THREE.Vector3) => void;
  onHover?: (hovered: boolean) => void;
  grabColor?: string;       // Highlight color when hovered
  disabled?: boolean;
  id?: string;
}

/**
 * Trigger haptic feedback on the controller that grabbed the object.
 * Works on Meta Quest 2 & 3.
 */
function pulseHaptic(intensity = 0.5, duration = 100) {
  try {
    const gamepads = navigator.getGamepads?.() ?? [];
    for (const gp of gamepads) {
      if (!gp) continue;
      const actuators = (gp as Gamepad & { hapticActuators?: GamepadHapticActuator[] }).hapticActuators;
      if (actuators && actuators.length > 0) {
        actuators[0].pulse?.(intensity, duration);
      }
    }
  } catch {
    // Haptics not available (desktop)
  }
}

export const GrabbableObject: React.FC<GrabbableObjectProps> = ({
  children,
  onGrab,
  onRelease,
  onHover,
  grabColor = '#00f5c4',
  disabled = false,
  id,
}) => {
  const groupRef = useRef<THREE.Group>(null!);
  const [hovered, setHovered] = useState(false);
  const [grabbed, setGrabbed] = useState(false);
  const parentBeforeGrab = useRef<THREE.Object3D | null>(null);

  // Outline emissive intensity
  useFrame(() => {
    if (!groupRef.current) return;
    groupRef.current.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const mat = child.material as THREE.MeshStandardMaterial;
        if (mat && mat.emissive) {
          const targetIntensity = grabbed ? 0.6 : hovered ? 0.35 : 0.05;
          mat.emissiveIntensity = THREE.MathUtils.lerp(mat.emissiveIntensity, targetIntensity, 0.12);
        }
      }
    });
  });

  const handlePointerDown = useCallback((e: any) => {
    if (disabled) return;
    e.stopPropagation();
    // Capture pointer so we get move+up events even when hand moves off object
    e.target.setPointerCapture(e.pointerId);

    // Attach this group to the pointer's object (hand/controller)
    const hand = e.pointerObject as THREE.Object3D | undefined;
    if (hand && groupRef.current) {
      parentBeforeGrab.current = groupRef.current.parent;
      hand.attach(groupRef.current);
    }

    setGrabbed(true);
    pulseHaptic(0.5, 80);
    onGrab?.();
  }, [disabled, onGrab]);

  const handlePointerUp = useCallback((e: any) => {
    e.stopPropagation();
    e.target.releasePointerCapture(e.pointerId);

    // Restore to original parent (scene) — physics will take over from here
    if (parentBeforeGrab.current && groupRef.current) {
      const worldPos = new THREE.Vector3();
      const worldQuat = new THREE.Quaternion();
      groupRef.current.getWorldPosition(worldPos);
      groupRef.current.getWorldQuaternion(worldQuat);
      parentBeforeGrab.current.attach(groupRef.current);
      // Keep world transform after re-parenting
      groupRef.current.position.copy(worldPos);
      groupRef.current.quaternion.copy(worldQuat);
      onRelease?.(worldPos);
    }

    setGrabbed(false);
    pulseHaptic(0.3, 50);
  }, [onRelease]);

  const handlePointerEnter = useCallback((e: any) => {
    e.stopPropagation();
    if (!disabled) {
      setHovered(true);
      onHover?.(true);
      pulseHaptic(0.15, 30);
      document.body.style.cursor = 'grab';
    }
  }, [disabled, onHover]);

  const handlePointerLeave = useCallback(() => {
    setHovered(false);
    onHover?.(false);
    document.body.style.cursor = 'default';
  }, [onHover]);

  return (
    <group
      ref={groupRef}
      data-grab-id={id}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
    >
      {children}
      {/* Hover outline sphere — scales with children bounding box */}
      {hovered && !grabbed && (
        <mesh>
          <sphereGeometry args={[0.065, 8, 8]} />
          <meshBasicMaterial color={grabColor} transparent opacity={0.18} wireframe />
        </mesh>
      )}
    </group>
  );
};
