// src/components/Labs/Biology/VRAnatomyLab.tsx
/**
 * WebXR Anatomy Lab — Quest 3 Mixed Reality (passthrough).
 *
 * BLACK SCREEN FIX:
 *  1. Canvas alpha:true + clear alpha=0 → AR passthrough shows through
 *  2. Removed gl.xr.enabled → <XR> v6 handles automatically  
 *  3. Removed <Physics>/<RigidBody> → Rapier WASM crashes in XR on Quest
 *  4. OrbitControls disabled inside XR via useXR hook
 *  5. Added <XROrigin> for correct floor-level positioning
 *  6. ZoomCamera guarded — doesn't run during XR (headset controls camera)
 */
import React, { useRef, useState, useCallback, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { XR, createXRStore, XROrigin, useXR } from '@react-three/xr';
import { OrbitControls, Text } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';
import { GrabbableObject } from '@/components/XR/GrabbableObject';
import { ORGANS, BODY_SYSTEMS, type OrganInfo, type BodySystem } from './organData';
import { VRHelpUI } from '@/components/XR/VRHelpUI';
import { useLabStore } from '@/store/labStore';
import { HumanBody3D, type ZoomLevel } from './HumanBody3D';
import { NeuronField } from './NeuronField';

const xrStore = createXRStore({
  hand: { left: true, right: true },
  controller: { left: true, right: true },
});

/* ─── VR error handler ─── */
async function tryEnterXR(store: ReturnType<typeof createXRStore>, mode: 'vr' | 'ar') {
  try {
    if (mode === 'vr') await store.enterVR();
    else await store.enterAR();
  } catch (err: any) {
    const msg = String(err?.message ?? err).toLowerCase();
    if (msg.includes('https') || msg.includes('secure')) {
      alert('⚠️ WebXR requires HTTPS.\n\nOpen: https://localhost:5173\nAccept the certificate warning.');
    } else {
      alert(`XR error: ${err?.message ?? err}\n\nMake sure you are opening this in the Meta Quest browser.`);
    }
  }
}

/* ─── Smart OrbitControls — off in XR ─── */
function SmartOrbitControls() {
  const [presenting, setPresenting] = React.useState(() => !!xrStore.getState().session);
  React.useEffect(() =>
    xrStore.subscribe((s) => setPresenting(!!s.session))
  , []);
  if (presenting) return null;
  return <OrbitControls enablePan={false} minDistance={0.08} maxDistance={6} target={[0, 1.1, 0]} />;
}

/* ─── Zoom camera (desktop only — XR headset controls camera) ─── */
function ZoomCamera({ zoomLevel }: { zoomLevel: ZoomLevel }) {
  const { camera } = useThree();
  const [presenting, setPresenting] = React.useState(() => !!xrStore.getState().session);
  React.useEffect(() =>
    xrStore.subscribe((s) => setPresenting(!!s.session))
  , []);

  const TARGETS: Record<ZoomLevel, { pos: THREE.Vector3; fov: number }> = {
    room:     { pos: new THREE.Vector3(0, 1.6, 3.5), fov: 75 },
    skin:     { pos: new THREE.Vector3(0, 1.2, 0.6), fov: 60 },
    tissue:   { pos: new THREE.Vector3(0, 1.1, 0.25), fov: 45 },
    cellular: { pos: new THREE.Vector3(0, 1.05, 0.12), fov: 35 },
    organ:    { pos: new THREE.Vector3(0, 1.15, 0.8), fov: 60 },
  };

  useFrame(() => {
    // In XR: headset controls camera — don't override it
    if (presenting) return;
    camera.position.lerp(TARGETS[zoomLevel].pos, 0.04);
    (camera as THREE.PerspectiveCamera).fov = THREE.MathUtils.lerp(
      (camera as THREE.PerspectiveCamera).fov,
      TARGETS[zoomLevel].fov,
      0.04,
    );
    (camera as THREE.PerspectiveCamera).updateProjectionMatrix();
  });

  return null;
}

/* ─── Skin pore detail ─── */
function SkinPoreDetail() {
  return (
    <group position={[0, 1.15, 0.19]}>
      {Array.from({ length: 30 }, (_, i) => (
        <mesh key={i} position={[
          (Math.random() - 0.5) * 0.2,
          (Math.random() - 0.5) * 0.2,
          (Math.random() - 0.5) * 0.01,
        ]}>
          <circleGeometry args={[0.003 + Math.random() * 0.002, 8]} />
          <meshStandardMaterial color="#e8a888" roughness={0.9} />
        </mesh>
      ))}
      {Array.from({ length: 12 }, (_, i) => (
        <mesh key={`h-${i}`} position={[
          (Math.random() - 0.5) * 0.18,
          (Math.random() - 0.5) * 0.18,
          0.01,
        ]}>
          <cylinderGeometry args={[0.001, 0.001, 0.02 + Math.random() * 0.03, 4]} />
          <meshStandardMaterial color="#8a6050" />
        </mesh>
      ))}
      <Text position={[0, 0.15, 0]} fontSize={0.02} color="#ff8866" anchorX="center">
        ← EPIDERMIS LAYER →
      </Text>
    </group>
  );
}

/* ─── Medical room ─── */
function MedicalRoom() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[8, 10]} />
        <meshStandardMaterial color="#f0f4f4" roughness={0.3} />
      </mesh>
      {[
        { pos: [0, 1.5, -5] as [number,number,number], rot: [0,0,0] as [number,number,number] },
        { pos: [0, 1.5, 5]  as [number,number,number], rot: [0,Math.PI,0] as [number,number,number] },
        { pos: [-4,1.5, 0]  as [number,number,number], rot: [0,Math.PI/2,0] as [number,number,number] },
        { pos: [4, 1.5, 0]  as [number,number,number], rot: [0,-Math.PI/2,0] as [number,number,number] },
      ].map(({ pos, rot }, i) => (
        <mesh key={i} position={pos} rotation={rot}>
          <planeGeometry args={[8, 3]} />
          <meshStandardMaterial color="#e8ecec" roughness={0.8} />
        </mesh>
      ))}
      <mesh position={[0, 3, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[8, 10]} />
        <meshStandardMaterial color="#f4f8f8" roughness={0.9} />
      </mesh>
      {[
        { x: -3.9, z: -1.5, label: 'SKELETAL SYSTEM' },
        { x: -3.9, z: 0,    label: 'CARDIOVASCULAR' },
        { x: -3.9, z: 1.5,  label: 'NERVOUS SYSTEM' },
      ].map(({ x, z, label }) => (
        <group key={label} position={[x, 1.5, z]} rotation={[0, Math.PI / 2, 0]}>
          <mesh><planeGeometry args={[0.7, 0.9]} /><meshStandardMaterial color="#fff8f0" /></mesh>
          <Text position={[0, 0.3, 0.01]} fontSize={0.04} color="#333333" anchorX="center">{label}</Text>
        </group>
      ))}
      <pointLight position={[0, 2.8, -0.5]} color="#fff8d0" intensity={4} distance={5} decay={2} />
      <pointLight position={[-2, 2.8, 2]} color="#f0f8ff" intensity={2} distance={8} decay={2} />
      <pointLight position={[2, 2.8, -2]} color="#f0f8ff" intensity={2} distance={8} decay={2} />
      <ambientLight intensity={0.6} color="#f0f8ff" />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 2.5]}>
        <ringGeometry args={[0.3, 0.35, 32]} />
        <meshBasicMaterial color="#00f5c4" transparent opacity={0.5} />
      </mesh>
      <Text position={[0, 0.01, 2.9]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.04} color="#00f5c4" anchorX="center">
        STAND HERE
      </Text>
    </group>
  );
}

/* ─── Floating organ (replaces RigidBody with useFrame float) ─── */
function FloatingOrgan({ organ, index, onGrab }: {
  organ: OrganInfo;
  index: number;
  onGrab: (o: OrganInfo) => void;
}) {
  const groupRef = useRef<THREE.Group>(null!);
  const matRef = useRef<THREE.MeshStandardMaterial>(null!);
  const baseY = 0.72 + organ.position[1] * 0.25;

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.elapsedTime;
    // Gentle float
    groupRef.current.position.y = baseY + Math.sin(t * 1.2 + index * 0.8) * 0.018;
    // Pulse glow
    if (matRef.current) {
      matRef.current.emissiveIntensity = 0.25 + Math.sin(t * 2.5 + organ.position[0]) * 0.1;
    }
  });

  return (
    <GrabbableObject
      id={`organ-${organ.id}`}
      grabColor={organ.glowColor}
      onGrab={() => onGrab(organ)}
      onRelease={() => {}}
    >
      <group
        ref={groupRef}
        position={[organ.position[0] * 0.28, baseY, organ.position[2] * 0.28 + 0.15]}
      >
        <mesh>
          <sphereGeometry args={[0.042, 14, 10]} />
          <meshStandardMaterial
            ref={matRef}
            color={organ.glowColor}
            emissive={organ.glowColor}
            emissiveIntensity={0.3}
            roughness={0.4}
            transparent
            opacity={0.85}
          />
        </mesh>
        <Text position={[0, 0.065, 0]} fontSize={0.025} color={organ.glowColor} anchorX="center">
          {organ.emoji} {organ.name}
        </Text>
      </group>
    </GrabbableObject>
  );
}

/* ─── Zoom info panel ─── */
function ZoomInfoPanel({ zoomLevel }: { zoomLevel: ZoomLevel }) {
  const INFO: Record<ZoomLevel, { title: string; desc: string; color: string }> = {
    room:     { title: '', desc: '', color: '#00f5c4' },
    skin:     { title: '⬤ EPIDERMIS', desc: '0.1–0.3mm thick. Keratinocytes, melanocytes, pores, hair follicles.', color: '#ffaa88' },
    tissue:   { title: '⬤ DERMIS', desc: 'Collagen fibres, capillaries, nerve endings, sebaceous glands.', color: '#ff8866' },
    cellular: { title: '⬤ NEURAL NETWORK', desc: '86 billion neurons. Signals at 120 m/s. ~7,000 synapses each.', color: '#88ccff' },
    organ:    { title: '⬤ ORGANS', desc: 'Grab any organ to inspect its function, weight and composition.', color: '#00f5c4' },
  };
  const info = INFO[zoomLevel];
  if (!info.title) return null;
  return (
    <group position={[-1.2, 1.8, -1]}>
      <mesh>
        <planeGeometry args={[0.75, 0.28]} />
        <meshBasicMaterial color="#000a08" transparent opacity={0.85} />
      </mesh>
      <Text position={[0, 0.08, 0.01]} fontSize={0.038} color={info.color} anchorX="center">{info.title}</Text>
      <Text position={[0, -0.02, 0.01]} fontSize={0.022} color="#e0faff" anchorX="center" maxWidth={0.7} textAlign="center">
        {info.desc}
      </Text>
    </group>
  );
}

/* ─── Main scene ─── */
function VRAnatomyScene({
  activeSystem, zoomLevel, onClickSkin, onGrab, heldOrgan,
}: {
  activeSystem: BodySystem;
  zoomLevel: ZoomLevel;
  onClickSkin: () => void;
  onGrab: (o: OrganInfo) => void;
  heldOrgan: OrganInfo | null;
}) {
  return (
    <>
      {/* FIX 5: XROrigin — anchors world to Quest floor */}
      <XROrigin position={[0, 0, 0]} />

      {/* FIX 6: ZoomCamera only runs on desktop */}
      <ZoomCamera zoomLevel={zoomLevel} />

      <MedicalRoom />

      {/* 3D body with animated organs */}
      <HumanBody3D zoomLevel={zoomLevel} activeSystem={activeSystem} onClickSkin={onClickSkin} />

      {zoomLevel === 'skin' && <SkinPoreDetail />}

      {zoomLevel === 'cellular' && (
        <group position={[0, 1.1, 0.15]}>
          <NeuronField count={40} spread={0.5} centerY={0} />
        </group>
      )}

      <ZoomInfoPanel zoomLevel={zoomLevel} />

      {/* Floating grabbable organs at organ zoom */}
      {zoomLevel === 'organ' && ORGANS.filter(o => o.system === activeSystem).map((organ, i) => (
        <FloatingOrgan key={organ.id} organ={organ} index={i} onGrab={onGrab} />
      ))}

      <VRHelpUI mode={heldOrgan ? 'holding' : 'idle'} visible />

      {/* FIX 4: OrbitControls disabled in XR */}
      <SmartOrbitControls />
    </>
  );
}

/* ─── Main Component ─── */
interface VRAnatomyLabProps {
  onExit: () => void;
}

export const VRAnatomyLab: React.FC<VRAnatomyLabProps> = ({ onExit }) => {
  const [activeSystem, setActiveSystem] = useState<BodySystem>('cardiovascular');
  const [heldOrgan, setHeldOrgan] = useState<OrganInfo | null>(null);
  const [inspectedOrgan, setInspectedOrgan] = useState<OrganInfo | null>(null);
  const [zoomLevel, setZoomLevel] = useState<ZoomLevel>('room');
  const { unlockAchievement } = useLabStore();

  const ZOOM_ORDER: ZoomLevel[] = ['room', 'skin', 'tissue', 'cellular', 'organ'];
  const ZOOM_LABELS: Record<ZoomLevel, string> = {
    room: 'MEDICAL ROOM', skin: 'SKIN SURFACE', tissue: 'TISSUE LAYER',
    cellular: 'NEURAL CELLS', organ: 'ORGAN VIEW',
  };

  const handleZoomIn = useCallback(() => {
    setZoomLevel(prev => {
      const idx = ZOOM_ORDER.indexOf(prev);
      return idx < ZOOM_ORDER.length - 1 ? ZOOM_ORDER[idx + 1] : prev;
    });
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoomLevel(prev => {
      const idx = ZOOM_ORDER.indexOf(prev);
      return idx > 0 ? ZOOM_ORDER[idx - 1] : prev;
    });
  }, []);

  const handleGrab = useCallback((organ: OrganInfo) => {
    setHeldOrgan(organ);
    setInspectedOrgan(organ);
    unlockAchievement('organ-hunter');
  }, [unlockAchievement]);

  const zoomIdx = ZOOM_ORDER.indexOf(zoomLevel);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: '#f0f4f4' }}>

      {/* ── Header ── */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 210,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 16px', background: 'rgba(240,244,244,0.95)',
        borderBottom: '1px solid rgba(0,200,160,0.25)', backdropFilter: 'blur(12px)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <button onClick={onExit} style={{
            fontFamily: 'Orbitron, sans-serif', fontSize: '0.55rem', padding: '5px 14px',
            borderRadius: 6, cursor: 'pointer', background: 'rgba(255,50,80,0.1)',
            border: '1px solid rgba(255,50,80,0.3)', color: '#ff6655',
          }}>← EXIT</button>

          <span style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '0.65rem', color: '#00aa88' }}>
            🧬 ANATOMY VR
          </span>

          {/* Zoom controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(0,200,160,0.08)', padding: '4px 10px', borderRadius: 8, border: '1px solid rgba(0,200,160,0.2)' }}>
            <button onClick={handleZoomOut} disabled={zoomIdx === 0} style={{
              fontFamily: 'Orbitron, sans-serif', fontSize: '0.5rem', padding: '3px 8px',
              borderRadius: 4, cursor: zoomIdx === 0 ? 'default' : 'pointer',
              background: 'transparent', border: '1px solid rgba(0,200,160,0.3)',
              color: zoomIdx === 0 ? '#aaaaaa' : '#00cc99',
            }}>◀ OUT</button>
            <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '0.55rem', color: '#00cc99', minWidth: 100, textAlign: 'center' }}>
              {ZOOM_LABELS[zoomLevel]}
            </span>
            <button onClick={handleZoomIn} disabled={zoomIdx === ZOOM_ORDER.length - 1} style={{
              fontFamily: 'Orbitron, sans-serif', fontSize: '0.5rem', padding: '3px 8px',
              borderRadius: 4, cursor: zoomIdx === ZOOM_ORDER.length - 1 ? 'default' : 'pointer',
              background: 'transparent', border: '1px solid rgba(0,200,160,0.3)',
              color: zoomIdx === ZOOM_ORDER.length - 1 ? '#aaaaaa' : '#00cc99',
            }}>IN ▶</button>
          </div>

          {zoomLevel === 'organ' && (
            <div style={{ display: 'flex', gap: 3 }}>
              {BODY_SYSTEMS.map(sys => (
                <button key={sys.id} onClick={() => setActiveSystem(sys.id)} style={{
                  fontFamily: 'Orbitron, sans-serif', fontSize: '0.42rem', padding: '3px 8px', borderRadius: 14, cursor: 'pointer',
                  background: activeSystem === sys.id ? sys.color + '33' : 'transparent',
                  border: `1px solid ${activeSystem === sys.id ? sys.color : 'rgba(0,0,0,0.1)'}`,
                  color: activeSystem === sys.id ? sys.color : '#444444', transition: 'all 0.2s',
                }}>{sys.icon} {sys.label}</button>
              ))}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          {/* Quest 3 MR — primary */}
          <button onClick={() => tryEnterXR(xrStore, 'ar')} style={{
            fontFamily: 'Orbitron, sans-serif', fontSize: '0.55rem', padding: '5px 16px', borderRadius: 6, cursor: 'pointer',
            background: 'linear-gradient(135deg, rgba(0,200,160,0.25), rgba(0,245,196,0.15))',
            border: '1px solid rgba(0,200,160,0.5)', color: '#00cc99',
            boxShadow: '0 0 14px rgba(0,200,160,0.2)',
          }}>🥽 ENTER MR (Quest 3)</button>
          <button onClick={() => tryEnterXR(xrStore, 'vr')} style={{
            fontFamily: 'Orbitron, sans-serif', fontSize: '0.55rem', padding: '5px 16px', borderRadius: 6, cursor: 'pointer',
            background: 'rgba(180,79,255,0.1)', border: '1px solid rgba(180,79,255,0.4)', color: '#b44fff',
          }}>🌐 ENTER VR (Quest 2)</button>
        </div>
      </div>

      {/* ── Zoom breadcrumb ── */}
      <div style={{
        position: 'absolute', top: 56, left: 0, right: 0, zIndex: 210,
        height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0,
        background: 'rgba(240,244,244,0.85)', borderBottom: '1px solid rgba(0,200,160,0.12)',
      }}>
        {ZOOM_ORDER.map((level, i) => (
          <React.Fragment key={level}>
            <button onClick={() => setZoomLevel(level)} style={{
              fontFamily: 'Orbitron, sans-serif', fontSize: '0.42rem',
              padding: '3px 10px', borderRadius: 0, cursor: 'pointer', border: 'none',
              background: zoomLevel === level ? 'rgba(0,200,160,0.2)' : 'transparent',
              color: zoomLevel === level ? '#00cc99' : '#888888',
              borderBottom: zoomLevel === level ? '2px solid #00cc99' : '2px solid transparent',
              transition: 'all 0.2s',
            }}>{ZOOM_LABELS[level]}</button>
            {i < ZOOM_ORDER.length - 1 && (
              <span style={{ color: '#cccccc', fontSize: '0.6rem', padding: '0 2px' }}>›</span>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* ── Organ info panel ── */}
      <AnimatePresence>
        {inspectedOrgan && (
          <motion.div
            initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 40 }}
            style={{
              position: 'absolute', top: 84, right: 0, width: 270, zIndex: 210,
              background: 'rgba(2,20,18,0.96)', borderLeft: '1px solid rgba(0,200,160,0.2)',
              padding: 14, backdropFilter: 'blur(20px)',
            }}
          >
            <div style={{ height: 100, overflow: 'hidden', borderRadius: 6, marginBottom: 10 }}>
              <img src={inspectedOrgan.imageUrl} alt={inspectedOrgan.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => {
                  const el = e.target as HTMLImageElement;
                  el.style.display = 'none';
                  const p = el.parentElement!;
                  p.style.cssText += 'display:flex;align-items:center;justify-content:center;font-size:2.5rem;';
                  p.textContent = inspectedOrgan.emoji;
                }}
              />
            </div>
            <p style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '0.75rem', color: inspectedOrgan.glowColor, marginBottom: 6 }}>
              {inspectedOrgan.emoji} {inspectedOrgan.name}
            </p>
            <p style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '0.8rem', color: '#e0faff', lineHeight: 1.5, marginBottom: 8 }}>
              {inspectedOrgan.function}
            </p>
            {[['Weight', inspectedOrgan.weight], ['Size', inspectedOrgan.size], ['System', inspectedOrgan.system]].map(([l, v]) => (
              <div key={l} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <span style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '0.48rem', color: '#4a7a8a' }}>{l}</span>
                <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '0.6rem', color: inspectedOrgan.glowColor }}>{v}</span>
              </div>
            ))}
            <p style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '0.55rem', color: '#4a7a8a', marginTop: 6, lineHeight: 1.4 }}>
              {inspectedOrgan.composition}
            </p>
            <button onClick={() => setInspectedOrgan(null)} className="btn-teal"
              style={{ width: '100%', fontSize: '0.5rem', marginTop: 10 }}>CLOSE</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 3D Canvas ── */}
      <Canvas
        camera={{ position: [0, 1.6, 3.5], fov: 75, near: 0.005, far: 50 }}
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
          // FIX 2: Do NOT set gl.xr.enabled manually
          gl.setClearColor(0x000000, 0);  // fully transparent — AR passthrough shows through
        }}
      >
        <XR store={xrStore}>
          <Suspense fallback={null}>
            {/* FIX 3: No <Physics> wrapper */}
            <VRAnatomyScene
              activeSystem={activeSystem}
              zoomLevel={zoomLevel}
              onClickSkin={handleZoomIn}
              onGrab={handleGrab}
              heldOrgan={heldOrgan}
            />
          </Suspense>
        </XR>
      </Canvas>
    </div>
  );
};
