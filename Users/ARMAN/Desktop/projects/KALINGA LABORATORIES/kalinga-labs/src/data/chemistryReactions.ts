// src/data/chemistryReactions.ts
// Full Grade 10-12 Chemistry Reaction Database — 60 reactions

export type ReactionCategory =
  | 'combination' | 'decomposition' | 'displacement' | 'double_displacement'
  | 'combustion' | 'acid_base' | 'redox' | 'precipitation' | 'organic'
  | 'electrolysis' | 'indicator' | 'industrial';

export interface ChemicalInfo {
  id: string;
  name: string;
  formula: string;
  color: string;        // bottle/liquid color in VR
  glowColor: string;
  hazard: 'safe' | 'low' | 'medium' | 'high';
  state: 'solid' | 'liquid' | 'gas';
  emoji: string;
}

export interface ReactionResult {
  id: string;
  equation: string;
  products: string;
  type: ReactionCategory;
  grade: 10 | 11 | 12;
  effect: {
    colorBefore: string;
    colorAfter: string;
    particles: 'bubbles' | 'smoke' | 'precipitate' | 'flash' | 'none' | 'glow' | 'crystal';
    sound: 'fizz' | 'boom' | 'hiss' | 'pop' | 'none' | 'crackle';
    temperature: 'exothermic' | 'endothermic' | 'neutral';
    emoji: string;
  };
  description: string;
  realWorldExample?: string;
}

/* ── Chemicals available in the VR lab ── */
export const CHEMICALS: ChemicalInfo[] = [
  { id: 'H2', name: 'Hydrogen', formula: 'H₂', color: '#e8f4ff', glowColor: '#aaddff', hazard: 'medium', state: 'gas', emoji: '💨' },
  { id: 'O2', name: 'Oxygen', formula: 'O₂', color: '#e0f0ff', glowColor: '#ccddff', hazard: 'low', state: 'gas', emoji: '🌬️' },
  { id: 'Na', name: 'Sodium', formula: 'Na', color: '#d0c0a0', glowColor: '#e0d0b0', hazard: 'high', state: 'solid', emoji: '🔲' },
  { id: 'Cl2', name: 'Chlorine', formula: 'Cl₂', color: '#aaffaa', glowColor: '#88ee88', hazard: 'high', state: 'gas', emoji: '💚' },
  { id: 'Mg', name: 'Magnesium', formula: 'Mg', color: '#d8d8d8', glowColor: '#ffffff', hazard: 'medium', state: 'solid', emoji: '⬜' },
  { id: 'CuO', name: 'Copper Oxide', formula: 'CuO', color: '#1a0a00', glowColor: '#aa4400', hazard: 'low', state: 'solid', emoji: '🟤' },
  { id: 'CaCO3', name: 'Calcium Carbonate', formula: 'CaCO₃', color: '#f0f0f0', glowColor: '#dddddd', hazard: 'safe', state: 'solid', emoji: '⬜' },
  { id: 'NaOH', name: 'Sodium Hydroxide', formula: 'NaOH', color: '#f8f8f0', glowColor: '#ddddcc', hazard: 'high', state: 'solid', emoji: '🔷' },
  { id: 'HCl', name: 'Hydrochloric Acid', formula: 'HCl', color: '#ffffee', glowColor: '#ffffaa', hazard: 'high', state: 'liquid', emoji: '🧪' },
  { id: 'Zn', name: 'Zinc', formula: 'Zn', color: '#c8c8b8', glowColor: '#d8d8c8', hazard: 'low', state: 'solid', emoji: '🔘' },
  { id: 'H2SO4', name: 'Sulfuric Acid', formula: 'H₂SO₄', color: '#f0f8ff', glowColor: '#ddddff', hazard: 'high', state: 'liquid', emoji: '☠️' },
  { id: 'Fe', name: 'Iron', formula: 'Fe', color: '#888888', glowColor: '#aaaaaa', hazard: 'safe', state: 'solid', emoji: '🔩' },
  { id: 'CuSO4', name: 'Copper Sulphate', formula: 'CuSO₄', color: '#2255cc', glowColor: '#4477ff', hazard: 'medium', state: 'solid', emoji: '🔵' },
  { id: 'AgNO3', name: 'Silver Nitrate', formula: 'AgNO₃', color: '#f5f5f5', glowColor: '#cccccc', hazard: 'high', state: 'solid', emoji: '🔘' },
  { id: 'NaCl', name: 'Sodium Chloride', formula: 'NaCl', color: '#ffffff', glowColor: '#eeeeee', hazard: 'safe', state: 'solid', emoji: '🧂' },
  { id: 'N2', name: 'Nitrogen', formula: 'N₂', color: '#ddecf8', glowColor: '#aaccee', hazard: 'safe', state: 'gas', emoji: '💨' },
  { id: 'H2O', name: 'Water', formula: 'H₂O', color: '#88ccff', glowColor: '#55aaff', hazard: 'safe', state: 'liquid', emoji: '💧' },
  { id: 'SO2', name: 'Sulphur Dioxide', formula: 'SO₂', color: '#ffff88', glowColor: '#ffff44', hazard: 'high', state: 'gas', emoji: '🟡' },
  { id: 'CO2', name: 'Carbon Dioxide', formula: 'CO₂', color: '#f0f8ff', glowColor: '#ccddff', hazard: 'safe', state: 'gas', emoji: '💨' },
  { id: 'CH4', name: 'Methane', formula: 'CH₄', color: '#f8f8f8', glowColor: '#dddddd', hazard: 'medium', state: 'gas', emoji: '🔥' },
  { id: 'C2H5OH', name: 'Ethanol', formula: 'C₂H₅OH', color: '#f0fff0', glowColor: '#aaffaa', hazard: 'medium', state: 'liquid', emoji: '🥃' },
  { id: 'HNO3', name: 'Nitric Acid', formula: 'HNO₃', color: '#ffffcc', glowColor: '#ffff88', hazard: 'high', state: 'liquid', emoji: '☠️' },
  { id: 'BaCl2', name: 'Barium Chloride', formula: 'BaCl₂', color: '#f0f0f0', glowColor: '#dddddd', hazard: 'high', state: 'solid', emoji: '⬜' },
  { id: 'KMnO4', name: 'Potassium Permanganate', formula: 'KMnO₄', color: '#660066', glowColor: '#aa00aa', hazard: 'high', state: 'solid', emoji: '🟣' },
  { id: 'phenolphthalein', name: 'Phenolphthalein', formula: 'C₂₀H₁₄O₄', color: '#fffaf0', glowColor: '#fff0f0', hazard: 'low', state: 'liquid', emoji: '🔬' },
  { id: 'litmus', name: 'Litmus', formula: 'Litmus', color: '#aa44aa', glowColor: '#cc66cc', hazard: 'safe', state: 'liquid', emoji: '🟣' },
  { id: 'starch', name: 'Starch', formula: 'C₆H₁₀O₅', color: '#fffff0', glowColor: '#eeeecc', hazard: 'safe', state: 'solid', emoji: '⬜' },
  { id: 'iodine', name: 'Iodine', formula: 'I₂', color: '#220033', glowColor: '#440066', hazard: 'medium', state: 'liquid', emoji: '🟤' },
  { id: 'H2O2', name: 'Hydrogen Peroxide', formula: 'H₂O₂', color: '#f0f8ff', glowColor: '#ddeeff', hazard: 'medium', state: 'liquid', emoji: '💧' },
  { id: 'KClO3', name: 'Potassium Chlorate', formula: 'KClO₃', color: '#f8f8f8', glowColor: '#eeeeee', hazard: 'high', state: 'solid', emoji: '⬜' },
];

/* ── 60 Reactions — Grade 10-12 Full Curriculum ── */
export const REACTIONS: ReactionResult[] = [
  // ═══════════ GRADE 10 ════════════════════════════════════════════
  {
    id: 'r01', grade: 10, type: 'combination',
    equation: '2H₂ + O₂ → 2H₂O',
    products: 'Water',
    effect: { colorBefore: '#e8f4ff', colorAfter: '#88ccff', particles: 'flash', sound: 'boom', temperature: 'exothermic', emoji: '💧' },
    description: 'Hydrogen burns in oxygen to form water. Highly exothermic — used in rocket fuel.',
    realWorldExample: 'Space shuttle main engines, hydrogen fuel cells',
  },
  {
    id: 'r02', grade: 10, type: 'combination',
    equation: '2Na + Cl₂ → 2NaCl',
    products: 'Sodium Chloride (Table Salt)',
    effect: { colorBefore: '#aaffaa', colorAfter: '#ffffff', particles: 'crystal', sound: 'crackle', temperature: 'exothermic', emoji: '🧂' },
    description: 'Sodium burns in chlorine gas to produce common table salt.',
    realWorldExample: 'Table salt production',
  },
  {
    id: 'r03', grade: 10, type: 'combination',
    equation: '2Mg + O₂ → 2MgO',
    products: 'Magnesium Oxide',
    effect: { colorBefore: '#d8d8d8', colorAfter: '#ffffff', particles: 'flash', sound: 'boom', temperature: 'exothermic', emoji: '✨' },
    description: 'Magnesium burns brilliantly white in oxygen — extremely bright flame.',
    realWorldExample: 'Fireworks, old camera flash bulbs',
  },
  {
    id: 'r04', grade: 10, type: 'displacement',
    equation: 'CuO + H₂ → Cu + H₂O',
    products: 'Copper + Water',
    effect: { colorBefore: '#1a0a00', colorAfter: '#cc4400', particles: 'smoke', sound: 'hiss', temperature: 'exothermic', emoji: '🟤' },
    description: 'Hydrogen reduces copper oxide to pure copper. Demonstrates reducing agent properties.',
    realWorldExample: 'Copper refining, metallurgy',
  },
  {
    id: 'r05', grade: 10, type: 'decomposition',
    equation: 'CaCO₃ → CaO + CO₂',
    products: 'Quicklime + Carbon Dioxide',
    effect: { colorBefore: '#f0f0f0', colorAfter: '#f5f0e0', particles: 'smoke', sound: 'hiss', temperature: 'endothermic', emoji: '🏛️' },
    description: 'Thermal decomposition of limestone. Industrial process for cement production.',
    realWorldExample: 'Cement, limestone industries',
  },
  {
    id: 'r06', grade: 10, type: 'acid_base',
    equation: 'NaOH + HCl → NaCl + H₂O',
    products: 'Salt + Water (Neutralisation)',
    effect: { colorBefore: '#f8f8f0', colorAfter: '#f0f8ff', particles: 'none', sound: 'none', temperature: 'exothermic', emoji: '⚗️' },
    description: 'Classic acid-base neutralization. Heat is released.',
    realWorldExample: 'Antacids neutralizing stomach acid',
  },
  {
    id: 'r07', grade: 10, type: 'displacement',
    equation: 'Zn + H₂SO₄ → ZnSO₄ + H₂',
    products: 'Zinc Sulphate + Hydrogen gas',
    effect: { colorBefore: '#c8c8b8', colorAfter: '#f0f0ff', particles: 'bubbles', sound: 'fizz', temperature: 'exothermic', emoji: '💨' },
    description: 'Zinc reacts with dilute sulphuric acid to release hydrogen gas.',
    realWorldExample: 'Batteries, electroplating solutions',
  },
  {
    id: 'r08', grade: 10, type: 'displacement',
    equation: 'Fe + CuSO₄ → FeSO₄ + Cu',
    products: 'Iron Sulphate + Copper',
    effect: { colorBefore: '#2255cc', colorAfter: '#22aa22', particles: 'precipitate', sound: 'none', temperature: 'neutral', emoji: '🟤' },
    description: 'Iron displaces copper from copper sulphate solution. Solution turns green.',
    realWorldExample: 'Activity series demonstration, copper recovery',
  },
  {
    id: 'r09', grade: 10, type: 'precipitation',
    equation: 'CuSO₄ + 2NaOH → Cu(OH)₂↓ + Na₂SO₄',
    products: 'Copper Hydroxide precipitate (blue)',
    effect: { colorBefore: '#2255cc', colorAfter: '#3388ff', particles: 'precipitate', sound: 'none', temperature: 'neutral', emoji: '🔵' },
    description: 'Blue precipitate of copper hydroxide forms immediately.',
    realWorldExample: 'Qualitative analysis, water testing',
  },
  {
    id: 'r10', grade: 10, type: 'precipitation',
    equation: 'AgNO₃ + NaCl → AgCl↓ + NaNO₃',
    products: 'Silver Chloride (white precipitate)',
    effect: { colorBefore: '#f5f5f5', colorAfter: '#ffffff', particles: 'precipitate', sound: 'none', temperature: 'neutral', emoji: '⬜' },
    description: 'White curdy precipitate of AgCl forms. Used to test for chloride ions.',
    realWorldExample: 'Qualitative analysis, photography (photosensitive salts)',
  },
  // ═══════════ GRADE 11 ════════════════════════════════════════════
  {
    id: 'r11', grade: 11, type: 'industrial',
    equation: 'N₂ + 3H₂ ⇌ 2NH₃',
    products: 'Ammonia (Haber Process)',
    effect: { colorBefore: '#ddecf8', colorAfter: '#aaffdd', particles: 'smoke', sound: 'hiss', temperature: 'exothermic', emoji: '🏭' },
    description: 'Haber-Bosch process. Iron catalyst, 450°C, 200 atm. Most important industrial reaction.',
    realWorldExample: 'Fertilizers supply 50% of world food production',
  },
  {
    id: 'r12', grade: 11, type: 'combination',
    equation: 'SO₂ + H₂O → H₂SO₃',
    products: 'Sulphurous Acid',
    effect: { colorBefore: '#ffff88', colorAfter: '#ffffaa', particles: 'bubbles', sound: 'hiss', temperature: 'exothermic', emoji: '💛' },
    description: 'Sulphur dioxide dissolves in water to form sulphurous acid — causes acid rain.',
    realWorldExample: 'Acid rain, food preservation',
  },
  {
    id: 'r13', grade: 11, type: 'combination',
    equation: 'CO₂ + H₂O → H₂CO₃',
    products: 'Carbonic Acid',
    effect: { colorBefore: '#88ccff', colorAfter: '#66bbff', particles: 'bubbles', sound: 'fizz', temperature: 'neutral', emoji: '🥤' },
    description: 'Carbon dioxide dissolves in water to form carbonic acid — makes fizzy drinks.',
    realWorldExample: 'Carbonated drinks, blood pH buffering',
  },
  {
    id: 'r14', grade: 11, type: 'combustion',
    equation: 'CH₄ + 2O₂ → CO₂ + 2H₂O',
    products: 'Carbon Dioxide + Water',
    effect: { colorBefore: '#f8f8f8', colorAfter: '#f0f0f0', particles: 'flash', sound: 'boom', temperature: 'exothermic', emoji: '🔥' },
    description: 'Complete combustion of methane (natural gas). Used for cooking and heating.',
    realWorldExample: 'Gas stoves, natural gas power plants',
  },
  {
    id: 'r15', grade: 11, type: 'combustion',
    equation: 'C₂H₅OH + 3O₂ → 2CO₂ + 3H₂O',
    products: 'Carbon Dioxide + Water',
    effect: { colorBefore: '#f0fff0', colorAfter: '#f0f0f0', particles: 'flash', sound: 'boom', temperature: 'exothermic', emoji: '🔥' },
    description: 'Combustion of ethanol. Blue flame. Used as biofuel.',
    realWorldExample: 'Bio-ethanol fuel, spirit lamps',
  },
  {
    id: 'r16', grade: 11, type: 'acid_base',
    equation: 'HNO₃ + NaOH → NaNO₃ + H₂O',
    products: 'Sodium Nitrate + Water',
    effect: { colorBefore: '#ffffcc', colorAfter: '#f0fff0', particles: 'none', sound: 'none', temperature: 'exothermic', emoji: '⚗️' },
    description: 'Strong acid-strong base neutralization. Sodium nitrate is used in fertilizers.',
    realWorldExample: 'Fertilizer production',
  },
  {
    id: 'r17', grade: 11, type: 'precipitation',
    equation: 'BaCl₂ + H₂SO₄ → BaSO₄↓ + 2HCl',
    products: 'Barium Sulphate (white precipitate)',
    effect: { colorBefore: '#f0f0f0', colorAfter: '#ffffff', particles: 'precipitate', sound: 'none', temperature: 'neutral', emoji: '⬜' },
    description: 'White insoluble precipitate. Test for sulphate ions. BaSO₄ used in X-ray imaging.',
    realWorldExample: 'Medical barium X-ray contrast, sulphate test',
  },
  {
    id: 'r18', grade: 11, type: 'redox',
    equation: 'Fe₂O₃ + 3CO → 2Fe + 3CO₂',
    products: 'Iron + Carbon Dioxide',
    effect: { colorBefore: '#aa4422', colorAfter: '#888888', particles: 'smoke', sound: 'hiss', temperature: 'exothermic', emoji: '⚙️' },
    description: 'Blast furnace reaction. Iron ore is reduced by carbon monoxide to produce iron.',
    realWorldExample: 'Steel production worldwide',
  },
  {
    id: 'r19', grade: 11, type: 'combination',
    equation: '4Al + 3O₂ → 2Al₂O₃',
    products: 'Aluminium Oxide',
    effect: { colorBefore: '#d8d8d8', colorAfter: '#f0f0f0', particles: 'flash', sound: 'crackle', temperature: 'exothermic', emoji: '✨' },
    description: 'Aluminium burns in oxygen, forming a protective oxide layer.',
    realWorldExample: 'Aluminium corrosion resistance, thermite reactions',
  },
  {
    id: 'r20', grade: 11, type: 'redox',
    equation: '2KMnO₄ + 16HCl → 2KCl + 2MnCl₂ + 8H₂O + 5Cl₂',
    products: 'Chlorine gas (green-yellow)',
    effect: { colorBefore: '#660066', colorAfter: '#aaffaa', particles: 'smoke', sound: 'hiss', temperature: 'exothermic', emoji: '💚' },
    description: 'Potassium permanganate reacts with HCl to release chlorine gas.',
    realWorldExample: 'Lab preparation of chlorine gas',
  },
  {
    id: 'r21', grade: 11, type: 'redox',
    equation: '2H₂O₂ → 2H₂O + O₂',
    products: 'Water + Oxygen',
    effect: { colorBefore: '#f0f8ff', colorAfter: '#88ccff', particles: 'bubbles', sound: 'fizz', temperature: 'exothermic', emoji: '💧' },
    description: 'Decomposition of hydrogen peroxide, catalyzed by MnO₂ or KI.',
    realWorldExample: 'Wound disinfection, rocket propellant',
  },
  {
    id: 'r22', grade: 11, type: 'decomposition',
    equation: '2KClO₃ → 2KCl + 3O₂ (MnO₂ catalyst)',
    products: 'Potassium Chloride + Oxygen',
    effect: { colorBefore: '#f8f8f8', colorAfter: '#eeeeee', particles: 'bubbles', sound: 'hiss', temperature: 'endothermic', emoji: '💨' },
    description: 'Thermal decomposition to produce oxygen. MnO₂ acts as a catalyst.',
    realWorldExample: 'Lab oxygen generation',
  },
  {
    id: 'r23', grade: 11, type: 'electrolysis',
    equation: '2H₂O → 2H₂ + O₂ (electrolysis)',
    products: 'Hydrogen + Oxygen',
    effect: { colorBefore: '#88ccff', colorAfter: '#88ccff', particles: 'bubbles', sound: 'fizz', temperature: 'endothermic', emoji: '⚡' },
    description: 'Water is split into hydrogen and oxygen by electric current.',
    realWorldExample: 'Hydrogen fuel production, Hofmann voltameter',
  },
  {
    id: 'r24', grade: 11, type: 'electrolysis',
    equation: '2NaCl(aq) + 2H₂O → 2NaOH + Cl₂ + H₂ (chlor-alkali)',
    products: 'NaOH + Chlorine + Hydrogen',
    effect: { colorBefore: '#ffffff', colorAfter: '#f8f8f8', particles: 'bubbles', sound: 'fizz', temperature: 'endothermic', emoji: '⚡' },
    description: 'Chlor-alkali process. Most important industrial electrolysis.',
    realWorldExample: 'Chlorine for PVC, NaOH for soap making',
  },
  {
    id: 'r25', grade: 11, type: 'double_displacement',
    equation: 'FeCl₃ + 3NaOH → Fe(OH)₃↓ + 3NaCl',
    products: 'Iron(III) Hydroxide (brown precipitate)',
    effect: { colorBefore: '#ddaa00', colorAfter: '#cc6600', particles: 'precipitate', sound: 'none', temperature: 'neutral', emoji: '🟤' },
    description: 'Reddish-brown precipitate of iron(III) hydroxide. Test for Fe³⁺ ions.',
    realWorldExample: 'Water treatment, qualitative analysis',
  },
  {
    id: 'r26', grade: 11, type: 'double_displacement',
    equation: 'Pb(NO₃)₂ + 2KI → PbI₂↓ + 2KNO₃',
    products: 'Lead Iodide (golden yellow precipitate)',
    effect: { colorBefore: '#f5f5f5', colorAfter: '#ffee00', particles: 'precipitate', sound: 'none', temperature: 'neutral', emoji: '🟡' },
    description: 'Stunning golden yellow precipitate — "golden rain" experiment.',
    realWorldExample: 'Classic school demonstration, qualitative analysis',
  },
  {
    id: 'r27', grade: 11, type: 'redox',
    equation: 'Cu + 2AgNO₃ → Cu(NO₃)₂ + 2Ag',
    products: 'Copper Nitrate + Silver',
    effect: { colorBefore: '#f5f5f5', colorAfter: '#2255cc', particles: 'crystal', sound: 'none', temperature: 'neutral', emoji: '🪙' },
    description: 'Silver crystals form on copper wire; solution turns blue.',
    realWorldExample: 'Electroplating, activity series',
  },
  {
    id: 'r28', grade: 11, type: 'double_displacement',
    equation: 'CaCl₂ + Na₂CO₃ → CaCO₃↓ + 2NaCl',
    products: 'Calcium Carbonate (white precipitate)',
    effect: { colorBefore: '#f0f0f0', colorAfter: '#ffffff', particles: 'precipitate', sound: 'none', temperature: 'neutral', emoji: '⬜' },
    description: 'White precipitate of calcium carbonate (chalk/limestone).',
    realWorldExample: 'Water hardness, limestone formation',
  },
  {
    id: 'r29', grade: 11, type: 'displacement',
    equation: 'Mg + 2HCl → MgCl₂ + H₂',
    products: 'Magnesium Chloride + Hydrogen',
    effect: { colorBefore: '#d8d8d8', colorAfter: '#f0f0f0', particles: 'bubbles', sound: 'fizz', temperature: 'exothermic', emoji: '💨' },
    description: 'Vigorous reaction between magnesium and HCl producing hydrogen gas.',
    realWorldExample: 'Activity series, production of H₂',
  },
  {
    id: 'r30', grade: 11, type: 'combination',
    equation: 'CaO + H₂O → Ca(OH)₂ + heat',
    products: 'Slaked Lime (Calcium Hydroxide)',
    effect: { colorBefore: '#f5f0e0', colorAfter: '#ffffff', particles: 'smoke', sound: 'hiss', temperature: 'exothermic', emoji: '🌡️' },
    description: '"Slaking of lime" — highly exothermic. Beaker gets very hot.',
    realWorldExample: 'Cement mortar, whitewash production',
  },
  // ═══════════ GRADE 12 — ORGANIC CHEMISTRY ═══════════════════════
  {
    id: 'r31', grade: 12, type: 'organic',
    equation: 'CH₄ + Cl₂ → CH₃Cl + HCl (UV light)',
    products: 'Chloromethane + HCl',
    effect: { colorBefore: '#f8f8f8', colorAfter: '#f0f0f0', particles: 'flash', sound: 'crackle', temperature: 'exothermic', emoji: '☀️' },
    description: 'Free radical halogenation of methane. Requires UV light as initiator.',
    realWorldExample: 'PVC production pathway',
  },
  {
    id: 'r32', grade: 12, type: 'organic',
    equation: 'CH₂=CH₂ + H₂ → CH₃-CH₃ (Ni catalyst)',
    products: 'Ethane',
    effect: { colorBefore: '#f0fff0', colorAfter: '#f5f5f5', particles: 'none', sound: 'none', temperature: 'exothermic', emoji: '⚗️' },
    description: 'Catalytic hydrogenation of ethylene. Pt/Pd/Ni catalyst at 150-200°C.',
    realWorldExample: 'Margarine production from vegetable oils',
  },
  {
    id: 'r33', grade: 12, type: 'organic',
    equation: 'C₂H₅OH + Na → C₂H₅ONa + ½H₂',
    products: 'Sodium Ethoxide + Hydrogen',
    effect: { colorBefore: '#f0fff0', colorAfter: '#f5f5f5', particles: 'bubbles', sound: 'fizz', temperature: 'exothermic', emoji: '💧' },
    description: 'Ethanol reacts with sodium metal. Much less vigorous than water-sodium reaction.',
    realWorldExample: 'Production of sodium alkoxides for synthesis',
  },
  {
    id: 'r34', grade: 12, type: 'organic',
    equation: 'CH₃COOH + C₂H₅OH ⇌ CH₃COOC₂H₅ + H₂O',
    products: 'Ethyl Acetate (fruity smell)',
    effect: { colorBefore: '#f0fff0', colorAfter: '#fff8f0', particles: 'smoke', sound: 'hiss', temperature: 'neutral', emoji: '🍎' },
    description: 'Fischer esterification. H₂SO₄ catalyst. Produces sweet fruity smell.',
    realWorldExample: 'Nail polish remover, fruit flavoring',
  },
  {
    id: 'r35', grade: 12, type: 'organic',
    equation: 'C₆H₆ + Br₂ → C₆H₅Br + HBr (FeBr₃ catalyst)',
    products: 'Bromobenzene + HBr',
    effect: { colorBefore: '#cc4400', colorAfter: '#f8f8f8', particles: 'smoke', sound: 'hiss', temperature: 'exothermic', emoji: '⚗️' },
    description: 'Electrophilic aromatic substitution. FeBr₃ is a Lewis acid catalyst.',
    realWorldExample: 'Pharmaceutical intermediates production',
  },
  {
    id: 'r36', grade: 12, type: 'organic',
    equation: 'CH₃CHO + O₂ → CH₃COOH (oxidation)',
    products: 'Acetic Acid',
    effect: { colorBefore: '#f0fff0', colorAfter: '#fff0e0', particles: 'none', sound: 'none', temperature: 'exothermic', emoji: '🍾' },
    description: 'Oxidation of acetaldehyde to acetic acid — vinegar production.',
    realWorldExample: 'Vinegar production, acetic acid industry',
  },
  {
    id: 'r37', grade: 12, type: 'acid_base',
    equation: 'CH₃COOH + NaOH → CH₃COONa + H₂O',
    products: 'Sodium Acetate + Water',
    effect: { colorBefore: '#fff0e0', colorAfter: '#f8fff8', particles: 'none', sound: 'none', temperature: 'exothermic', emoji: '⚗️' },
    description: 'Weak acid neutralized by strong base. Buffer solution formed.',
    realWorldExample: 'Soap making, baking soda reactions',
  },
  {
    id: 'r38', grade: 12, type: 'organic',
    equation: 'C₆H₁₂O₆ → 2C₂H₅OH + 2CO₂ (fermentation)',
    products: 'Ethanol + Carbon Dioxide',
    effect: { colorBefore: '#ffeecc', colorAfter: '#f0fff0', particles: 'bubbles', sound: 'fizz', temperature: 'neutral', emoji: '🍷' },
    description: 'Anaerobic fermentation of glucose by yeast enzymes.',
    realWorldExample: 'Beer, wine, bioethanol fuel production',
  },
  {
    id: 'r39', grade: 12, type: 'organic',
    equation: 'CH₂=CH₂ + H₂O → C₂H₅OH (H₃PO₄ catalyst)',
    products: 'Ethanol',
    effect: { colorBefore: '#f0fff0', colorAfter: '#f0fff0', particles: 'none', sound: 'none', temperature: 'exothermic', emoji: '💧' },
    description: 'Acid-catalyzed hydration of ethylene. Industrial ethanol production.',
    realWorldExample: 'Industrial alcohol synthesis',
  },
  {
    id: 'r40', grade: 12, type: 'organic',
    equation: 'C₂H₅OH → CH₂=CH₂ + H₂O (H₂SO₄, 180°C)',
    products: 'Ethylene + Water',
    effect: { colorBefore: '#f0fff0', colorAfter: '#f0f8ff', particles: 'smoke', sound: 'hiss', temperature: 'endothermic', emoji: '💨' },
    description: 'Dehydration of ethanol. Requires concentrated H₂SO₄ at 180°C.',
    realWorldExample: 'Monomer for polyethylene plastic',
  },
  // ═══════════ GRADE 12 — INDICATORS ══════════════════════════════
  {
    id: 'r41', grade: 12, type: 'indicator',
    equation: 'Phenolphthalein + NaOH → pink/magenta',
    products: 'Pink coloration',
    effect: { colorBefore: '#fffaf0', colorAfter: '#ff66aa', particles: 'glow', sound: 'none', temperature: 'neutral', emoji: '💗' },
    description: 'Phenolphthalein turns vivid pink in basic solutions (pH > 8.2). Colorless in acid.',
    realWorldExample: 'Acid-base titration endpoint indicator',
  },
  {
    id: 'r42', grade: 12, type: 'indicator',
    equation: 'Litmus + strong acid → red',
    products: 'Red litmus',
    effect: { colorBefore: '#aa44aa', colorAfter: '#ff2222', particles: 'none', sound: 'none', temperature: 'neutral', emoji: '🔴' },
    description: 'Litmus changes from purple to red in acidic solutions.',
    realWorldExample: 'pH testing, classic school indicator',
  },
  {
    id: 'r43', grade: 12, type: 'indicator',
    equation: 'Litmus + strong base → blue',
    products: 'Blue litmus',
    effect: { colorBefore: '#aa44aa', colorAfter: '#2255cc', particles: 'none', sound: 'none', temperature: 'neutral', emoji: '🔵' },
    description: 'Litmus turns blue in basic solutions.',
    realWorldExample: 'pH testing, classic indicator',
  },
  {
    id: 'r44', grade: 12, type: 'indicator',
    equation: 'Starch + I₂ → blue-black complex',
    products: 'Blue-black starch-iodine complex',
    effect: { colorBefore: '#fffff0', colorAfter: '#110022', particles: 'glow', sound: 'none', temperature: 'neutral', emoji: '🟤' },
    description: 'Iodine forms a charge-transfer complex in the helix of starch. Classic starch test.',
    realWorldExample: 'Testing for starch in food, iodometry titrations',
  },
  {
    id: 'r45', grade: 12, type: 'indicator',
    equation: 'Universal indicator + HCl → red (pH 1–2)',
    products: 'Red solution',
    effect: { colorBefore: '#ffdd00', colorAfter: '#ff2222', particles: 'none', sound: 'none', temperature: 'neutral', emoji: '🔴' },
    description: 'Universal indicator spans full pH range with color spectrum.',
    realWorldExample: 'pH determination across all ranges',
  },
  // ═══════════ GRADE 12 — REDOX & ADVANCED ════════════════════════
  {
    id: 'r46', grade: 12, type: 'redox',
    equation: '4Fe + 3O₂ + 6H₂O → 4Fe(OH)₃ (rust)',
    products: 'Hydrated Iron Oxide (rust)',
    effect: { colorBefore: '#888888', colorAfter: '#aa4422', particles: 'none', sound: 'none', temperature: 'neutral', emoji: '🔩' },
    description: 'Corrosion of iron. Requires both oxygen and water. Slow electrochemical process.',
    realWorldExample: 'Rusting of bridges, cars. Prevented by galvanising/painting.',
  },
  {
    id: 'r47', grade: 12, type: 'redox',
    equation: '2KI + Cl₂ → 2KCl + I₂',
    products: 'Potassium Chloride + Iodine (brown)',
    effect: { colorBefore: '#f8f8f8', colorAfter: '#664400', particles: 'glow', sound: 'none', temperature: 'neutral', emoji: '🟤' },
    description: 'Chlorine displaces iodine. Solution turns brown due to I₂. Test for halogens.',
    realWorldExample: 'Starch-iodine papers, halogen activity test',
  },
  {
    id: 'r48', grade: 12, type: 'double_displacement',
    equation: 'MnSO₄ + 2NaOH → Mn(OH)₂↓ + Na₂SO₄',
    products: 'Manganese Hydroxide (pale pink precipitate)',
    effect: { colorBefore: '#ffcccc', colorAfter: '#ffaaaa', particles: 'precipitate', sound: 'none', temperature: 'neutral', emoji: '🌸' },
    description: 'Pale pink precipitate slowly turns brown in air due to oxidation.',
    realWorldExample: 'Manganese qualitative test',
  },
  {
    id: 'r49', grade: 12, type: 'displacement',
    equation: 'Zn + 2NaOH → Na₂ZnO₂ + H₂ (amphoteric)',
    products: 'Sodium Zincate + Hydrogen',
    effect: { colorBefore: '#c8c8b8', colorAfter: '#f0f0f0', particles: 'bubbles', sound: 'fizz', temperature: 'exothermic', emoji: '💨' },
    description: 'Zinc as amphoteric metal reacts with both acids AND bases.',
    realWorldExample: 'Galvanised steel production, zinc-oxide skin cream',
  },
  {
    id: 'r50', grade: 12, type: 'displacement',
    equation: 'Al + NaOH + H₂O → NaAlO₂ + H₂ (amphoteric)',
    products: 'Sodium Aluminate + Hydrogen',
    effect: { colorBefore: '#d8d8d8', colorAfter: '#f0f0f0', particles: 'bubbles', sound: 'fizz', temperature: 'exothermic', emoji: '💨' },
    description: 'Aluminium also amphoteric — reacts with NaOH to produce aluminate and H₂.',
    realWorldExample: 'Bayer process for aluminium refining',
  },
  {
    id: 'r51', grade: 12, type: 'organic',
    equation: 'nCH₂=CH₂ → (-CH₂-CH₂-)n (polymerisation)',
    products: 'Polyethylene',
    effect: { colorBefore: '#f0fff0', colorAfter: '#f8f8f8', particles: 'none', sound: 'none', temperature: 'exothermic', emoji: '🧴' },
    description: 'Addition polymerisation of ethylene to polyethylene.',
    realWorldExample: 'Plastic bags, bottles, packaging materials',
  },
  {
    id: 'r52', grade: 12, type: 'organic',
    equation: 'nH₂N-(CH₂)₆-NH₂ + nHOOC-(CH₂)₄-COOH → Nylon-6,6 + nH₂O',
    products: 'Nylon-6,6 (condensation polymer)',
    effect: { colorBefore: '#f5f5f5', colorAfter: '#eeeeee', particles: 'crystal', sound: 'none', temperature: 'exothermic', emoji: '🧵' },
    description: 'Condensation polymerisation. Nylon-6,6 can be pulled from the interface.',
    realWorldExample: 'Ropes, fabric, toothbrush bristles',
  },
  {
    id: 'r53', grade: 12, type: 'industrial',
    equation: 'N₂O₄ ⇌ 2NO₂ (equilibrium)',
    products: 'Nitrogen Dioxide (brown)',
    effect: { colorBefore: '#f0f0f0', colorAfter: '#ff8822', particles: 'smoke', sound: 'none', temperature: 'endothermic', emoji: '🟠' },
    description: 'Classic equilibrium reaction. Colourless N₂O₄ ⇌ brown NO₂. Temp-dependent.',
    realWorldExample: 'Demonstrating Le Chatelier\'s principle',
  },
  {
    id: 'r54', grade: 12, type: 'industrial',
    equation: 'CaC₂ + 2H₂O → C₂H₂ + Ca(OH)₂',
    products: 'Acetylene gas (C₂H₂)',
    effect: { colorBefore: '#f5f0e0', colorAfter: '#f5f5f5', particles: 'bubbles', sound: 'fizz', temperature: 'exothermic', emoji: '🔥' },
    description: 'Calcium carbide reacts with water to produce acetylene (welding gas).',
    realWorldExample: 'Oxy-acetylene welding torches',
  },
  {
    id: 'r55', grade: 12, type: 'combination',
    equation: 'NH₃ + HCl → NH₄Cl (white fumes)',
    products: 'Ammonium Chloride (white smoke)',
    effect: { colorBefore: '#f0f0f0', colorAfter: '#ffffff', particles: 'smoke', sound: 'crackle', temperature: 'exothermic', emoji: '💨' },
    description: 'When ammonia and HCl vapors meet, white smoke of NH₄Cl forms instantly.',
    realWorldExample: 'Classic white fumes experiment, fertilizer production',
  },
  {
    id: 'r56', grade: 12, type: 'combination',
    equation: 'P₄O₁₀ + 6H₂O → 4H₃PO₄',
    products: 'Phosphoric Acid',
    effect: { colorBefore: '#f0f0f0', colorAfter: '#f0f8ff', particles: 'smoke', sound: 'hiss', temperature: 'exothermic', emoji: '⚗️' },
    description: 'Phosphorus pentoxide reacts vigorously with water.',
    realWorldExample: 'Fertilizers (superphosphate), detergents',
  },
  {
    id: 'r57', grade: 12, type: 'acid_base',
    equation: 'Na₂CO₃ + 2HCl → 2NaCl + H₂O + CO₂',
    products: 'NaCl + Water + CO₂ gas',
    effect: { colorBefore: '#f8f8f8', colorAfter: '#f0f8ff', particles: 'bubbles', sound: 'fizz', temperature: 'neutral', emoji: '💨' },
    description: 'Sodium carbonate (washing soda) reacts with HCl, releasing CO₂ bubbles.',
    realWorldExample: 'Washing soda, baking soda powder',
  },
  {
    id: 'r58', grade: 12, type: 'redox',
    equation: '2Na₂O₂ + 2H₂O → 4NaOH + O₂',
    products: 'Sodium Hydroxide + Oxygen',
    effect: { colorBefore: '#f8f8f8', colorAfter: '#ffffff', particles: 'bubbles', sound: 'fizz', temperature: 'exothermic', emoji: '💨' },
    description: 'Sodium peroxide reacts with water to give NaOH and release O₂.',
    realWorldExample: 'Emergency oxygen source in submarines, fire risk',
  },
  {
    id: 'r59', grade: 12, type: 'organic',
    equation: 'C₆H₅COOH + NaOH → C₆H₅COONa + H₂O',
    products: 'Sodium Benzoate + Water',
    effect: { colorBefore: '#f8f0e0', colorAfter: '#f0fff0', particles: 'none', sound: 'none', temperature: 'exothermic', emoji: '⚗️' },
    description: 'Benzoic acid neutralized by NaOH. Sodium benzoate is a food preservative.',
    realWorldExample: 'E211 food preservative in soft drinks',
  },
  {
    id: 'r60', grade: 12, type: 'organic',
    equation: 'CH₃COCH₃ + 2[H] → CH₃CH(OH)CH₃ (reduction)',
    products: 'Propan-2-ol',
    effect: { colorBefore: '#f0fff0', colorAfter: '#f0f0f0', particles: 'none', sound: 'none', temperature: 'exothermic', emoji: '⚗️' },
    description: 'Reduction of acetone (ketone) to secondary alcohol using NaBH₄ or LiAlH₄.',
    realWorldExample: 'Manufacture of rubbing alcohol, solvents',
  },
];

/* ── Lookup helpers ── */
export function findReaction(chemIdsA: string[], chemIdsB: string[]): ReactionResult | null {
  // Simple key-based matching — check if the combined IDs match any known reactant pair
  const REACTANT_MAP: Record<string, string> = {
    'H2+O2': 'r01', 'O2+H2': 'r01',
    'Na+Cl2': 'r02', 'Cl2+Na': 'r02',
    'Mg+O2': 'r03', 'O2+Mg': 'r03',
    'CuO+H2': 'r04', 'H2+CuO': 'r04',
    'NaOH+HCl': 'r06', 'HCl+NaOH': 'r06',
    'Zn+H2SO4': 'r07', 'H2SO4+Zn': 'r07',
    'Fe+CuSO4': 'r08', 'CuSO4+Fe': 'r08',
    'CuSO4+NaOH': 'r09', 'NaOH+CuSO4': 'r09',
    'AgNO3+NaCl': 'r10', 'NaCl+AgNO3': 'r10',
    'SO2+H2O': 'r12', 'H2O+SO2': 'r12',
    'CO2+H2O': 'r13', 'H2O+CO2': 'r13',
    'HNO3+NaOH': 'r16', 'NaOH+HNO3': 'r16',
    'Mg+HCl': 'r29', 'HCl+Mg': 'r29',
    'CaO+H2O': 'r30', 'H2O+CaO': 'r30',
    'starch+iodine': 'r44', 'iodine+starch': 'r44',
    'phenolphthalein+NaOH': 'r41', 'NaOH+phenolphthalein': 'r41',
    'litmus+HCl': 'r42', 'HCl+litmus': 'r42',
    'Na2CO3+HCl': 'r57', 'HCl+Na2CO3': 'r57',
    'C2H5OH+CH3COOH': 'r34', 'CH3COOH+C2H5OH': 'r34',
    'KMnO4+HCl': 'r20', 'HCl+KMnO4': 'r20',
    'NH3+HCl': 'r55', 'HCl+NH3': 'r55',
    'H2O2': 'r21',
    'KClO3': 'r22',
  };

  const allA = chemIdsA.join('+');
  const allB = chemIdsB.join('+');
  const key1 = `${allA}+${allB}`;
  const key2 = `${allB}+${allA}`;
  const single = chemIdsA[0] ?? '';

  const id = REACTANT_MAP[key1] ?? REACTANT_MAP[key2] ?? REACTANT_MAP[single] ?? null;
  if (!id) return null;
  return REACTIONS.find((r) => r.id === id) ?? null;
}

export function getReactionsByGrade(grade: 10 | 11 | 12): ReactionResult[] {
  return REACTIONS.filter((r) => r.grade === grade);
}

export function getChemicalById(id: string): ChemicalInfo | undefined {
  return CHEMICALS.find((c) => c.id === id);
}
