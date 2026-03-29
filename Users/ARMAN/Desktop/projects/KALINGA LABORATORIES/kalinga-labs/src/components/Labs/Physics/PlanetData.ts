// src/components/Labs/Physics/PlanetData.ts
// Enhanced with moonsData for immersive moon visualization

export interface MoonInfo {
  name: string;
  radiusFactor: number;  // relative to planet radius
  orbitRadius: number;   // orbit radius in scene units
  orbitSpeed: number;    // radians per second
  color: string;
  textureColor: string;
}

export interface PlanetInfo {
  name: string;
  radius: number;
  orbitRadius: number;
  orbitSpeed: number;
  color: string;
  emissive: string;
  textureUrl: string;
  ringTextureUrl?: string;
  diameterKm: number;
  massKg: string;
  distanceAU: number;
  moons: number;
  description: string;
  moonsData: MoonInfo[];    // visible moons with orbital data
  axisTilt: number;         // degrees
  dayLength: string;
  yearLength: string;
}

export const PLANETS: PlanetInfo[] = [
  {
    name: 'Mercury',
    radius: 0.07,
    orbitRadius: 2.4,
    orbitSpeed: 0.48,
    color: '#b0a090',
    emissive: '#604030',
    textureUrl: '/textures/mercury.jpg',
    diameterKm: 4879,
    massKg: '3.30 × 10²³ kg',
    distanceAU: 0.39,
    moons: 0,
    axisTilt: 0.034,
    dayLength: '58.6 Earth days',
    yearLength: '88 Earth days',
    description: 'Smallest planet. Extreme temperature swings (−180°C to 430°C). No atmosphere, heavily cratered surface.',
    moonsData: [],
  },
  {
    name: 'Venus',
    radius: 0.15,
    orbitRadius: 3.2,
    orbitSpeed: 0.35,
    color: '#e8c06a',
    emissive: '#804000',
    textureUrl: '/textures/venus.jpg',
    diameterKm: 12104,
    massKg: '4.87 × 10²⁴ kg',
    distanceAU: 0.72,
    moons: 0,
    axisTilt: 177.4,
    dayLength: '243 Earth days (retrograde)',
    yearLength: '225 Earth days',
    description: 'Hottest planet (462°C average). Thick CO₂ atmosphere with sulfuric acid clouds. Rotates retrograde.',
    moonsData: [],
  },
  {
    name: 'Earth',
    radius: 0.16,
    orbitRadius: 4.2,
    orbitSpeed: 0.28,
    color: '#3a8fff',
    emissive: '#003388',
    textureUrl: '/textures/earth.jpg',
    diameterKm: 12742,
    massKg: '5.97 × 10²⁴ kg',
    distanceAU: 1.0,
    moons: 1,
    axisTilt: 23.5,
    dayLength: '24 hours',
    yearLength: '365.25 days',
    description: 'Our home. Only known planet with confirmed life. 71% water coverage, protective magnetic field.',
    moonsData: [
      { name: 'Moon', radiusFactor: 0.27, orbitRadius: 0.55, orbitSpeed: 0.8, color: '#cccccc', textureColor: '#aaaaaa' },
    ],
  },
  {
    name: 'Mars',
    radius: 0.11,
    orbitRadius: 5.5,
    orbitSpeed: 0.22,
    color: '#cc4422',
    emissive: '#661100',
    textureUrl: '/textures/mars.jpg',
    diameterKm: 6779,
    massKg: '6.39 × 10²³ kg',
    distanceAU: 1.52,
    moons: 2,
    axisTilt: 25.2,
    dayLength: '24h 37m',
    yearLength: '687 Earth days',
    description: 'The Red Planet. Home to Olympus Mons (tallest volcano in solar system at 21.9 km). Curiosity rover is active.',
    moonsData: [
      { name: 'Phobos', radiusFactor: 0.06, orbitRadius: 0.35, orbitSpeed: 3.2, color: '#999980', textureColor: '#888870' },
      { name: 'Deimos', radiusFactor: 0.04, orbitRadius: 0.55, orbitSpeed: 1.4, color: '#aaaaaa', textureColor: '#999990' },
    ],
  },
  {
    name: 'Jupiter',
    radius: 0.4,
    orbitRadius: 7.5,
    orbitSpeed: 0.13,
    color: '#c88a50',
    emissive: '#804020',
    textureUrl: '/textures/jupiter.jpg',
    diameterKm: 142984,
    massKg: '1.90 × 10²⁷ kg',
    distanceAU: 5.2,
    moons: 95,
    axisTilt: 3.1,
    dayLength: '9h 56m',
    yearLength: '11.86 Earth years',
    description: 'Largest planet. Its Great Red Spot is a storm twice Earth\'s size. Has 95 known moons including Europa.',
    moonsData: [
      { name: 'Io', radiusFactor: 0.18, orbitRadius: 0.9, orbitSpeed: 2.1, color: '#ffdd44', textureColor: '#ddbb22' },
      { name: 'Europa', radiusFactor: 0.15, orbitRadius: 1.3, orbitSpeed: 1.4, color: '#ddccbb', textureColor: '#ccbbaa' },
      { name: 'Ganymede', radiusFactor: 0.22, orbitRadius: 1.9, orbitSpeed: 0.9, color: '#aaaaaa', textureColor: '#999999' },
      { name: 'Callisto', radiusFactor: 0.2, orbitRadius: 2.6, orbitSpeed: 0.55, color: '#888880', textureColor: '#777770' },
    ],
  },
  {
    name: 'Saturn',
    radius: 0.32,
    orbitRadius: 9.5,
    orbitSpeed: 0.097,
    color: '#d4a860',
    emissive: '#7a5020',
    textureUrl: '/textures/saturn.jpg',
    ringTextureUrl: '/textures/saturn_ring.png',
    diameterKm: 120536,
    massKg: '5.68 × 10²⁶ kg',
    distanceAU: 9.58,
    moons: 146,
    axisTilt: 26.7,
    dayLength: '10h 42m',
    yearLength: '29.46 Earth years',
    description: 'Famous for its stunning ice and rock ring system. Least dense planet — would float on water.',
    moonsData: [
      { name: 'Titan', radiusFactor: 0.22, orbitRadius: 1.2, orbitSpeed: 0.7, color: '#ddaa55', textureColor: '#cc9944' },
      { name: 'Enceladus', radiusFactor: 0.07, orbitRadius: 0.85, orbitSpeed: 1.6, color: '#eeeeff', textureColor: '#ddddee' },
      { name: 'Mimas', radiusFactor: 0.05, orbitRadius: 0.68, orbitSpeed: 2.4, color: '#cccccc', textureColor: '#bbbbbb' },
      { name: 'Rhea', radiusFactor: 0.1, orbitRadius: 1.6, orbitSpeed: 0.9, color: '#cccccc', textureColor: '#bbbbbb' },
    ],
  },
  {
    name: 'Uranus',
    radius: 0.24,
    orbitRadius: 12.0,
    orbitSpeed: 0.068,
    color: '#7decf5',
    emissive: '#1a8090',
    textureUrl: '/textures/uranus.jpg',
    diameterKm: 51118,
    massKg: '8.68 × 10²⁵ kg',
    distanceAU: 19.18,
    moons: 28,
    axisTilt: 97.8,
    dayLength: '17h 14m (retrograde)',
    yearLength: '84 Earth years',
    description: 'Ice giant that rotates on its side (97.8° axial tilt). Coldest planetary atmosphere at −224°C.',
    moonsData: [
      { name: 'Titania', radiusFactor: 0.13, orbitRadius: 0.8, orbitSpeed: 1.1, color: '#aabbcc', textureColor: '#9aabbc' },
      { name: 'Oberon', radiusFactor: 0.12, orbitRadius: 1.1, orbitSpeed: 0.7, color: '#aabbcc', textureColor: '#9aabbc' },
      { name: 'Miranda', radiusFactor: 0.07, orbitRadius: 0.55, orbitSpeed: 2.1, color: '#cccccc', textureColor: '#bbbbbb' },
    ],
  },
  {
    name: 'Neptune',
    radius: 0.22,
    orbitRadius: 14.5,
    orbitSpeed: 0.054,
    color: '#2244ff',
    emissive: '#001199',
    textureUrl: '/textures/neptune.jpg',
    diameterKm: 49528,
    massKg: '1.02 × 10²⁶ kg',
    distanceAU: 30.07,
    moons: 16,
    axisTilt: 28.3,
    dayLength: '16h 6m',
    yearLength: '165 Earth years',
    description: 'Farthest planet. Fastest winds at 2,100 km/h. Triton orbits backwards — likely a captured Kuiper Belt object.',
    moonsData: [
      { name: 'Triton', radiusFactor: 0.18, orbitRadius: 0.8, orbitSpeed: -0.8, color: '#aadddd', textureColor: '#99cccc' }, // negative = retrograde
      { name: 'Proteus', radiusFactor: 0.06, orbitRadius: 0.55, orbitSpeed: 1.8, color: '#999999', textureColor: '#888888' },
    ],
  },
];
