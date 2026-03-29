// src/hooks/useRaycaster.ts
import { useCallback, useRef, useState } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface UseRaycasterOptions {
  objects: THREE.Object3D[];
}

interface RaycasterState {
  hoveredId: string | null;
  intersectionPoint: THREE.Vector3 | null;
}

/**
 * A hook that manages pointer-over raycasting for a list of 3D objects.
 * Returns the currently hovered object ID and intersection point.
 */
export function useRaycaster({ objects }: UseRaycasterOptions): RaycasterState {
  const { camera, gl } = useThree();
  const raycaster = useRef(new THREE.Raycaster());
  const pointer = useRef(new THREE.Vector2());
  const [state, setState] = useState<RaycasterState>({
    hoveredId: null,
    intersectionPoint: null,
  });

  const onPointerMove = useCallback(
    (e: MouseEvent) => {
      const rect = gl.domElement.getBoundingClientRect();
      pointer.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    },
    [gl]
  );

  // Attach event listener once
  const listenerAdded = useRef(false);
  if (!listenerAdded.current) {
    gl.domElement.addEventListener('mousemove', onPointerMove);
    listenerAdded.current = true;
  }

  useFrame(() => {
    if (objects.length === 0) return;
    raycaster.current.setFromCamera(pointer.current, camera);
    const intersects = raycaster.current.intersectObjects(objects, true);

    if (intersects.length > 0) {
      const hit = intersects[0];
      // Walk up to find the named object
      let obj: THREE.Object3D | null = hit.object;
      while (obj && !obj.userData['portalId']) {
        obj = obj.parent;
      }
      const id = obj?.userData['portalId'] ?? hit.object.uuid;
      if (state.hoveredId !== id) {
        gl.domElement.style.cursor = 'pointer';
        setState({ hoveredId: id, intersectionPoint: hit.point.clone() });
      }
    } else {
      if (state.hoveredId !== null) {
        gl.domElement.style.cursor = 'default';
        setState({ hoveredId: null, intersectionPoint: null });
      }
    }
  });

  return state;
}
