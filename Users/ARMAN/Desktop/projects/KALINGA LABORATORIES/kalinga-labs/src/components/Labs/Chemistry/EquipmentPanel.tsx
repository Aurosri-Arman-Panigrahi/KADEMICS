// src/components/Labs/Chemistry/EquipmentPanel.tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface Equipment {
  id: string;
  name: string;
  emoji: string;
  imageUrl: string;
  uses: string;
  material: string;
  capacity?: string;
  safetyNote?: string;
}

const LAB_EQUIPMENT: Equipment[] = [
  {
    id: 'beaker',
    name: 'Beaker',
    emoji: '🧪',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/3beakers.jpg/320px-3beakers.jpg',
    uses: 'Holding and mixing liquids. Heating solutions. Graduated markings for rough measurement.',
    material: 'Borosilicate glass (heat-resistant)',
    capacity: '50 – 2000 mL',
    safetyNote: 'Handle with tongs when hot. Never seal with a stopper.',
  },
  {
    id: 'flask',
    name: 'Erlenmeyer Flask',
    emoji: '⚗️',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/Erlenmeyer_flask_500mL.jpg/240px-Erlenmeyer_flask_500mL.jpg',
    uses: 'Mixing without splashing, culturing microbes, conducting reactions under controlled conditions.',
    material: 'Borosilicate glass',
    capacity: '100 – 1000 mL',
    safetyNote: 'Use a clamp on a stand for heating. Never fill more than 50% capacity.',
  },
  {
    id: 'bunsen',
    name: 'Bunsen Burner',
    emoji: '🔥',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Bunsenburner.jpg/200px-Bunsenburner.jpg',
    uses: 'Heating, sterilization, combustion reactions. Produces a single open-gas flame at ~1500°C.',
    material: 'Cast iron base, stainless steel barrel',
    safetyNote: 'Never leave unattended. Tie back hair. Ensure gas tap is off when finished.',
  },
  {
    id: 'testtube',
    name: 'Test Tube',
    emoji: '🧫',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/61/Test_tubes.jpg/200px-Test_tubes.jpg',
    uses: 'Holding small samples, performing reactions, culturing microorganisms in racks.',
    material: 'Borosilicate glass or polypropylene',
    capacity: '5 – 25 mL',
    safetyNote: 'Never point at people when heating. Use a test tube holder.',
  },
  {
    id: 'microscope',
    name: 'Compound Microscope',
    emoji: '🔬',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/Optical_microscope_nikon_alphaphot.jpg/240px-Optical_microscope_nikon_alphaphot.jpg',
    uses: 'Magnifying specimens 40×–1000×, examining cells, microorganisms, and tissue samples.',
    material: 'Optical glass lenses, metal frame',
    safetyNote: 'Carry with two hands. Clean lenses with lens paper only.',
  },
  {
    id: 'cylinder',
    name: 'Graduated Cylinder',
    emoji: '📏',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Graduated_cylinder.jpg/200px-Graduated_cylinder.jpg',
    uses: 'Accurately measuring volumes of liquids. Read at the bottom of the meniscus.',
    material: 'Borosilicate glass or polypropylene',
    capacity: '10 – 2000 mL',
    safetyNote: 'Place on flat surface to read. Avoid thermal shock.',
  },
  {
    id: 'pipette',
    name: 'Pipette',
    emoji: '💧',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Pipette_graduated_Pasteur_and_micropipette.jpg/200px-Pipette_graduated_Pasteur_and_micropipette.jpg',
    uses: 'Transferring precise volumes of liquid. Volumetric pipettes are very accurate for single volumes.',
    material: 'Borosilicate glass, polypropylene tips',
    capacity: '0.1 – 50 mL',
    safetyNote: 'Never pipette by mouth. Use a pipette filler or micropipette.',
  },
  {
    id: 'funnel',
    name: 'Separating Funnel',
    emoji: '🔽',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/Separating_funnel_-_60_ml.jpg/160px-Separating_funnel_-_60_ml.jpg',
    uses: 'Separating two immiscible liquids (e.g., oil and water). Extracting compounds from solution.',
    material: 'Borosilicate glass with PTFE stopcock',
    safetyNote: 'Release pressure frequently when mixing. Point tap away from face.',
  },
  {
    id: 'reflux',
    name: 'Round-bottom Flask',
    emoji: '⚗️',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/Roundbottomflask.jpg/200px-Roundbottomflask.jpg',
    uses: 'Heating reactions evenly, distillation setups, reflux reactions under heat and condensation.',
    material: 'Borosilicate glass',
    capacity: '50 – 3000 mL',
    safetyNote: 'Always support with a clamp. Round bottom — it will roll and break.',
  },
  {
    id: 'burette',
    name: 'Burette',
    emoji: '🧪',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/32/Burette.jpg/100px-Burette.jpg',
    uses: 'Precise addition of titrant in volumetric analysis. Allows drop-by-drop dispensing.',
    material: 'Borosilicate glass with PTFE stopcock',
    capacity: '10 – 50 mL',
    safetyNote: 'Check for leaks before use. Clamp at eye level for reading.',
  },
];

export const EquipmentPanel: React.FC = () => {
  const [selected, setSelected] = useState<Equipment | null>(null);
  const [search, setSearch] = useState('');

  const filtered = LAB_EQUIPMENT.filter((e) =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.uses.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}>
      {/* Search */}
      <input
        className="cyber-input"
        type="text"
        placeholder="Search equipment..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ fontSize: '0.85rem' }}
      />

      {/* Detail view */}
      {selected && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: 'rgba(0,245,196,0.04)',
            border: '1px solid rgba(0,245,196,0.2)',
            borderRadius: 8,
            overflow: 'hidden',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', gap: 0 }}>
            <img
              src={selected.imageUrl}
              alt={selected.name}
              style={{ width: 90, height: 90, objectFit: 'cover', flexShrink: 0 }}
              onError={(e) => {
                (e.target as HTMLImageElement).src = '';
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
            <div style={{ padding: '10px 12px', flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <p style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '0.75rem', color: '#00f5c4' }}>
                    {selected.emoji} {selected.name}
                  </p>
                  {selected.capacity && (
                    <p style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '0.6rem', color: '#4a7a8a', marginTop: 2 }}>
                      Capacity: {selected.capacity}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setSelected(null)}
                  style={{ background: 'none', border: 'none', color: '#4a7a8a', cursor: 'pointer', fontSize: '0.9rem' }}
                >
                  ✕
                </button>
              </div>
              <p style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '0.78rem', color: '#e0faff', marginTop: 4, lineHeight: 1.5 }}>
                {selected.uses}
              </p>
              {selected.safetyNote && (
                <p style={{
                  fontFamily: 'Rajdhani, sans-serif', fontSize: '0.7rem', color: '#ffaa44',
                  marginTop: 5, padding: '3px 6px', background: 'rgba(255,170,68,0.08)',
                  border: '1px solid rgba(255,170,68,0.2)', borderRadius: 4,
                }}>
                  ⚠ {selected.safetyNote}
                </p>
              )}
              <p style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '0.6rem', color: '#4a7a8a', marginTop: 4 }}>
                Material: {selected.material}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Equipment grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: 8,
        overflowY: 'auto',
        flex: 1,
        paddingRight: 2,
      }}>
        {filtered.map((eq, i) => (
          <motion.div
            key={eq.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.04 }}
            onClick={() => setSelected(selected?.id === eq.id ? null : eq)}
            style={{
              background: selected?.id === eq.id
                ? 'rgba(0,245,196,0.1)'
                : 'rgba(0,245,196,0.03)',
              border: `1px solid ${selected?.id === eq.id ? 'rgba(0,245,196,0.4)' : 'rgba(0,245,196,0.1)'}`,
              borderRadius: 8,
              overflow: 'hidden',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <div style={{ height: 70, overflow: 'hidden', background: '#0a1a25' }}>
              <img
                src={eq.imageUrl}
                alt={eq.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                  const parent = (e.target as HTMLImageElement).parentElement!;
                  parent.style.display = 'flex';
                  parent.style.alignItems = 'center';
                  parent.style.justifyContent = 'center';
                  parent.textContent = eq.emoji;
                  parent.style.fontSize = '2rem';
                }}
              />
            </div>
            <div style={{ padding: '6px 8px' }}>
              <p style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '0.55rem', color: '#00f5c4', letterSpacing: '0.08em' }}>
                {eq.name}
              </p>
              <p style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '0.72rem', color: '#4a7a8a', marginTop: 2, lineHeight: 1.3 }}>
                {eq.uses.substring(0, 55)}…
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
