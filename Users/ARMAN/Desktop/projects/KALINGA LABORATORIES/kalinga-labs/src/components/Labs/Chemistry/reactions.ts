// src/components/Labs/Chemistry/reactions.ts

export interface ReactionDef {
  id: string;
  name: string;
  elementA: string;
  elementB: string;
  formula: string;
  type: string;
  energyKJ: number;
  state: 'solid' | 'liquid' | 'gas';
  particleColor: string;
  glowColor: string;
  description: string;
  molarMass: number;
}

export const ELEMENTS = ['H', 'O', 'C', 'N', 'Na', 'Cl'] as const;
export type ElementSymbol = typeof ELEMENTS[number];

export const ELEMENT_COLORS: Record<ElementSymbol, string> = {
  H: '#e0faff',
  O: '#ff4444',
  C: '#888888',
  N: '#4488ff',
  Na: '#ffaa00',
  Cl: '#88ff44',
};

export const ELEMENT_INFO: Record<ElementSymbol, { name: string; mass: number; radius: number }> = {
  H:  { name: 'Hydrogen',  mass: 1.008,   radius: 0.08 },
  O:  { name: 'Oxygen',    mass: 15.999,  radius: 0.13 },
  C:  { name: 'Carbon',    mass: 12.011,  radius: 0.12 },
  N:  { name: 'Nitrogen',  mass: 14.007,  radius: 0.12 },
  Na: { name: 'Sodium',    mass: 22.990,  radius: 0.18 },
  Cl: { name: 'Chlorine',  mass: 35.453,  radius: 0.15 },
};

export const REACTIONS: ReactionDef[] = [
  {
    id: 'water',
    name: 'Water Formation',
    elementA: 'H',
    elementB: 'O',
    formula: '2H₂ + O₂ → 2H₂O',
    type: 'Synthesis',
    energyKJ: -483.6,
    state: 'liquid',
    particleColor: '#44aaff',
    glowColor: '#1af0ff',
    description: 'Hydrogen and oxygen combine exothermically to form water. This reaction releases significant energy.',
    molarMass: 18.015,
  },
  {
    id: 'salt',
    name: 'Salt Formation',
    elementA: 'Na',
    elementB: 'Cl',
    formula: 'Na + Cl₂ → NaCl',
    type: 'Synthesis',
    energyKJ: -411.2,
    state: 'solid',
    particleColor: '#ffffff',
    glowColor: '#e0faff',
    description: 'Sodium metal vigorously reacts with chlorine gas to form sodium chloride (table salt).',
    molarMass: 58.44,
  },
  {
    id: 'co2',
    name: 'Carbon Dioxide',
    elementA: 'C',
    elementB: 'O',
    formula: 'C + O₂ → CO₂',
    type: 'Combustion',
    energyKJ: -393.5,
    state: 'gas',
    particleColor: '#aaaaaa',
    glowColor: '#888888',
    description: 'Carbon undergoes complete combustion with oxygen to produce carbon dioxide gas.',
    molarMass: 44.01,
  },
  {
    id: 'fire',
    name: 'Combustion',
    elementA: 'C',
    elementB: 'O',
    formula: 'C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O',
    type: 'Exothermic',
    energyKJ: -2803.0,
    state: 'gas',
    particleColor: '#ff6600',
    glowColor: '#ff8800',
    description: 'Complete combustion of glucose with oxygen releases vast amounts of energy as heat and light.',
    molarMass: 180.16,
  },
];

export function findReaction(a: string, b: string): ReactionDef | null {
  return (
    REACTIONS.find(
      (r) =>
        (r.elementA === a && r.elementB === b) ||
        (r.elementA === b && r.elementB === a)
    ) ?? null
  );
}
