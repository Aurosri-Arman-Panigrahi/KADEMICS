// src/components/Labs/Biology/organData.ts

export type BodySystem = 'skeletal' | 'muscular' | 'cardiovascular' | 'nervous' | 'digestive';

export interface OrganInfo {
  id: string;
  name: string;
  system: BodySystem;
  function: string;
  weight: string;
  size: string;
  composition: string;
  position: [number, number, number];
  color: string;
  glowColor: string;
  emoji: string;
  imageUrl: string;        // Real organ image (public domain)
  systemImageUrl?: string; // Body system diagram
}

export const BODY_SYSTEMS: { id: BodySystem; label: string; color: string; icon: string; diagramUrl: string }[] = [
  { id: 'skeletal',       label: 'Skeletal',       color: '#d0e8f0', icon: '🦴', diagramUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/da/Human_skeleton_front.svg/200px-Human_skeleton_front.svg.png' },
  { id: 'muscular',       label: 'Muscular',        color: '#ff6655', icon: '💪', diagramUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Blausen_0088_Bicep.png/200px-Blausen_0088_Bicep.png' },
  { id: 'cardiovascular', label: 'Cardiovascular',  color: '#ff3355', icon: '🫀', diagramUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Heart_diagram-en.svg/200px-Heart_diagram-en.svg.png' },
  { id: 'nervous',        label: 'Nervous',         color: '#ffcc88', icon: '🧠', diagramUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Nervous_system_diagram-en.svg/200px-Nervous_system_diagram-en.svg.png' },
  { id: 'digestive',      label: 'Digestive',       color: '#88cc55', icon: '🫁', diagramUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/Digestive_system_diagram_en.svg/200px-Digestive_system_diagram_en.svg.png' },
];

export const ORGANS: OrganInfo[] = [
  // ── Skeletal ──────────────────────────────────────────────────────────
  {
    id: 'skull',
    name: 'Skull',
    system: 'skeletal',
    function: 'Protects the brain and forms the facial structure. Consists of 22 bones fused together in adulthood.',
    weight: '≈ 600 g',
    size: '20 cm',
    composition: 'Cranium (8 bones) + facial bones (14)',
    position: [0, 1.38, 0],
    color: '#d0e8f0',
    glowColor: '#d0e8f0',
    emoji: '💀',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Human_skull_side.jpg/320px-Human_skull_side.jpg',
  },
  {
    id: 'spine',
    name: 'Spine',
    system: 'skeletal',
    function: 'Supports the body, protects the spinal cord, and enables flexible movement via 33 vertebrae.',
    weight: '≈ 1 kg',
    size: '70 cm',
    composition: '33 vertebrae (cervical, thoracic, lumbar, sacral, coccygeal)',
    position: [0, 0.3, 0],
    color: '#c0d8e8',
    glowColor: '#c0d8e8',
    emoji: '🦴',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Spine.jpg/320px-Spine.jpg',
  },
  {
    id: 'ribcage',
    name: 'Rib Cage',
    system: 'skeletal',
    function: 'Shields the heart and lungs from trauma. Assists respiration via expansion/contraction.',
    weight: '≈ 1.2 kg',
    size: '30 cm',
    composition: '24 ribs (12 pairs) + sternum + costal cartilage',
    position: [0, 0.75, 0.1],
    color: '#d8ecf8',
    glowColor: '#d8ecf8',
    emoji: '🦴',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/Rijksmuseum_van_Oudheden_-_Ribs.jpg/320px-Rijksmuseum_van_Oudheden_-_Ribs.jpg',
  },
  // ── Muscular ──────────────────────────────────────────────────────────
  {
    id: 'biceps',
    name: 'Biceps',
    system: 'muscular',
    function: 'Flexes the elbow and supinates the forearm. Main flexor of the arm used in pulling motions.',
    weight: '≈ 350 g',
    size: '30 cm',
    composition: 'Skeletal muscle fibres + bicipital tendon',
    position: [-0.55, 0.8, 0.2],
    color: '#ff7766',
    glowColor: '#ff6655',
    emoji: '💪',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Blausen_0088_Bicep.png/320px-Blausen_0088_Bicep.png',
  },
  {
    id: 'quads',
    name: 'Quadriceps',
    system: 'muscular',
    function: 'Extends the knee; primary muscle for walking, running, and standing. Largest muscle group.',
    weight: '≈ 1.5 kg',
    size: '40 cm',
    composition: 'Rectus femoris + 3 vastus muscles',
    position: [0.2, -0.85, 0.25],
    color: '#ff5544',
    glowColor: '#ff4433',
    emoji: '🦵',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/Illu_lower_extremity_muscles.jpg/200px-Illu_lower_extremity_muscles.jpg',
  },
  {
    id: 'diaphragm',
    name: 'Diaphragm',
    system: 'muscular',
    function: 'Primary breathing muscle; dome-shaped muscle separating thorax from abdomen.',
    weight: '≈ 200 g',
    size: '27 cm wide',
    composition: 'Dome-shaped striated skeletal muscle',
    position: [0, 0.28, 0.2],
    color: '#ff8877',
    glowColor: '#ff7766',
    emoji: '💪',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Diaphragm_from_above.jpg/320px-Diaphragm_from_above.jpg',
  },
  // ── Cardiovascular ────────────────────────────────────────────────────
  {
    id: 'heart',
    name: 'Heart',
    system: 'cardiovascular',
    function: 'Pumps ~5 L/min of oxygenated blood through the body. Beats 100,000 times per day.',
    weight: '≈ 300 g',
    size: '12 cm',
    composition: 'Cardiac muscle (myocardium), 4 chambers, valves',
    position: [-0.1, 0.68, 0.22],
    color: '#ff2244',
    glowColor: '#ff0033',
    emoji: '🫀',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Heart_diagram-en.svg/320px-Heart_diagram-en.svg.png',
  },
  {
    id: 'lungs',
    name: 'Lungs',
    system: 'cardiovascular',
    function: 'Performs gas exchange — absorbs O₂ from air and expels CO₂. About 300 million alveoli.',
    weight: '≈ 1.3 kg (pair)',
    size: '25 cm',
    composition: 'Alveoli, bronchi, blood vessels, pleura',
    position: [0, 0.8, 0.12],
    color: '#ffaaaa',
    glowColor: '#ff8888',
    emoji: '🫁',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/16/Lungs_anatomy.png/320px-Lungs_anatomy.png',
  },
  {
    id: 'aorta',
    name: 'Aorta',
    system: 'cardiovascular',
    function: 'Largest artery in the body. Distributes oxygenated blood from the left ventricle to the entire body.',
    weight: '≈ 60 g',
    size: '40 cm',
    composition: 'Elastic arterial wall with 3 layers (tunica intima, media, adventitia)',
    position: [0.1, 0.55, 0.18],
    color: '#cc1133',
    glowColor: '#cc0022',
    emoji: '🩸',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Aorta_diagram.jpg/240px-Aorta_diagram.jpg',
  },
  // ── Nervous ───────────────────────────────────────────────────────────
  {
    id: 'brain',
    name: 'Brain',
    system: 'nervous',
    function: 'Command center for thought, memory, emotion, and voluntary movement. ~86 billion neurons.',
    weight: '≈ 1.4 kg',
    size: '15 cm',
    composition: '86 billion neurons + ~85 billion glial cells. Cerebrum, cerebellum, brainstem.',
    position: [0, 1.36, 0.1],
    color: '#ffccaa',
    glowColor: '#ffaa88',
    emoji: '🧠',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/24701-heart.jpg/320px-24701-heart.jpg',
  },
  {
    id: 'spinalcord',
    name: 'Spinal Cord',
    system: 'nervous',
    function: 'Relays signals between brain and body. Controls reflex arcs independently of the brain.',
    weight: '≈ 35 g',
    size: '45 cm',
    composition: 'White matter (axons) + grey matter (neuron cell bodies)',
    position: [0, 0.3, -0.05],
    color: '#ffe0cc',
    glowColor: '#ffcc99',
    emoji: '🧬',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d6/Medulla_spinalis_-_tracts_-_English.svg/200px-Medulla_spinalis_-_tracts_-_English.svg.png',
  },
  {
    id: 'eyes',
    name: 'Eyes',
    system: 'nervous',
    function: 'Photoreceptors convert light into electrical signals. Contains 120 million rod cells and 7 million cone cells.',
    weight: '≈ 7.5 g each',
    size: '2.5 cm diameter',
    composition: 'Cornea, lens, vitreous humor, retina, optic nerve',
    position: [0.08, 1.3, 0.2],
    color: '#88ccff',
    glowColor: '#66bbff',
    emoji: '👁️',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Schematic_diagram_of_the_human_eye_en.svg/320px-Schematic_diagram_of_the_human_eye_en.svg.png',
  },
  // ── Digestive ─────────────────────────────────────────────────────────
  {
    id: 'stomach',
    name: 'Stomach',
    system: 'digestive',
    function: 'Digests food via HCl acid and enzymes. Temp stores up to 1.5 L of food. pH 1.5–3.5.',
    weight: '≈ 150 g',
    size: '25 cm',
    composition: 'Smooth muscle (3 layers) + gastric mucosa lining',
    position: [0.05, 0.1, 0.17],
    color: '#88dd44',
    glowColor: '#77cc33',
    emoji: '🫙',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/Gray1062.png/240px-Gray1062.png',
  },
  {
    id: 'liver',
    name: 'Liver',
    system: 'digestive',
    function: 'Largest internal organ. Detoxifies blood, produces bile, metabolizes fats/proteins/carbohydrates.',
    weight: '≈ 1.5 kg',
    size: '26 cm',
    composition: 'Hepatocytes, bile ducts, Kupffer cells, sinusoids',
    position: [0.25, 0.22, 0.12],
    color: '#aa5533',
    glowColor: '#994422',
    emoji: '🟤',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/dc/Blausen_0428_HepaticSystem.png/320px-Blausen_0428_HepaticSystem.png',
  },
  {
    id: 'intestines',
    name: 'Intestines',
    system: 'digestive',
    function: 'Small intestine (6 m) absorbs nutrients. Large intestine (1.5 m) absorbs water and forms stool.',
    weight: '≈ 1.2 kg',
    size: '7.5 m total',
    composition: 'Smooth muscle + villi lining + gut microbiome',
    position: [0, -0.3, 0.16],
    color: '#ccaa44',
    glowColor: '#bb9933',
    emoji: '🫧',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/Digestive_system_no_labels.png/200px-Digestive_system_no_labels.png',
  },
];

export function getOrgansBySystem(system: BodySystem): OrganInfo[] {
  return ORGANS.filter((o) => o.system === system);
}
