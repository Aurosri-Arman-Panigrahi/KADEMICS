// src/store/labStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type LabId = 'lobby' | 'chemistry' | 'physics' | 'biology';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  labId?: LabId;
  xpReward: number;
}

export interface ReactionEntry {
  id: string;
  timestamp: number;
  elementA: string;
  elementB: string;
  result: string;
  formula: string;
}

export interface Scientist {
  name: string;
  avatar: string;
  level: number;
  xp: number;
  experimentsCompleted: number;
  visitedLabs: LabId[];
  planetsViewed: string[];
  organsIdentified: number;
}

interface LabState {
  activeLab: LabId;
  scientist: Scientist;
  achievements: Achievement[];
  unlockedAchievements: string[];
  unlockedAt: Record<string, number>;
  reactionLog: ReactionEntry[];

  setActiveLab: (lab: LabId) => void;
  updateScientist: (updates: Partial<Scientist>) => void;
  completeExperiment: (labId: LabId, details?: Partial<ReactionEntry>) => void;
  unlockAchievement: (id: string) => void;
  addPlanetViewed: (planet: string) => void;
  addReactionLog: (entry: Omit<ReactionEntry, 'id' | 'timestamp'>) => void;
  incrementOrgans: () => void;
  visitLab: (lab: LabId) => void;
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first-reaction',
    title: 'First Reaction',
    description: 'Complete your first chemistry experiment.',
    icon: '⚗️',
    labId: 'chemistry',
    xpReward: 100,
  },
  {
    id: 'molecule-master',
    title: 'Molecule Master',
    description: 'Complete all 4 chemical reactions.',
    icon: '🧪',
    labId: 'chemistry',
    xpReward: 300,
  },
  {
    id: 'stargazer',
    title: 'Stargazer',
    description: 'View the NASA Astronomy Picture of the Day.',
    icon: '🌌',
    labId: 'physics',
    xpReward: 50,
  },
  {
    id: 'planetary-explorer',
    title: 'Planetary Explorer',
    description: 'Click on all 8 planets in the solar system.',
    icon: '🪐',
    labId: 'physics',
    xpReward: 250,
  },
  {
    id: 'anatomist',
    title: 'Anatomist',
    description: 'View all 5 body systems in the Biology Lab.',
    icon: '🫀',
    labId: 'biology',
    xpReward: 200,
  },
  {
    id: 'organ-hunter',
    title: 'Organ Hunter',
    description: 'Correctly identify 10 organs in quiz mode.',
    icon: '🧠',
    labId: 'biology',
    xpReward: 300,
  },
  {
    id: 'mars-rover',
    title: 'Mars Rover',
    description: "View photos taken by NASA's Curiosity rover on Mars.",
    icon: '🔴',
    labId: 'physics',
    xpReward: 100,
  },
  {
    id: 'neo-watcher',
    title: 'NEO Watcher',
    description: 'Check the Near Earth Objects feed.',
    icon: '☄️',
    labId: 'physics',
    xpReward: 75,
  },
  {
    id: 'ar-pioneer',
    title: 'AR Pioneer',
    description: 'Activate AR mode in any laboratory.',
    icon: '📡',
    xpReward: 150,
  },
  {
    id: 'orbital-mechanic',
    title: 'Orbital Mechanic',
    description: 'Use the time speed slider in the solar system simulator.',
    icon: '⏱️',
    labId: 'physics',
    xpReward: 100,
  },
  {
    id: 'lab-director',
    title: 'Lab Director',
    description: 'Visit all 3 laboratories.',
    icon: '🏛️',
    xpReward: 200,
  },
  {
    id: 'kalinga-scholar',
    title: 'Kalinga Scholar',
    description: 'Unlock all other achievements.',
    icon: '🏆',
    xpReward: 1000,
  },
];

const DEFAULT_SCIENTIST: Scientist = {
  name: 'Anonymous Scientist',
  avatar: '🔬',
  level: 1,
  xp: 0,
  experimentsCompleted: 0,
  visitedLabs: [],
  planetsViewed: [],
  organsIdentified: 0,
};

function levelFromXP(xp: number): number {
  return Math.floor(Math.sqrt(xp / 100)) + 1;
}

export const useLabStore = create<LabState>()(
  persist(
    (set, get) => ({
      activeLab: 'lobby',
      scientist: DEFAULT_SCIENTIST,
      achievements: ACHIEVEMENTS,
      unlockedAchievements: [],
      unlockedAt: {},
      reactionLog: [],

      setActiveLab: (lab) => set({ activeLab: lab }),

      updateScientist: (updates) =>
        set((state) => ({
          scientist: { ...state.scientist, ...updates },
        })),

      completeExperiment: (_labId, details) =>
        set((state) => {
          const newXP = state.scientist.xp + 50;
          const newLevel = levelFromXP(newXP);
          return {
            scientist: {
              ...state.scientist,
              xp: newXP,
              level: newLevel,
              experimentsCompleted: state.scientist.experimentsCompleted + 1,
            },
          };
        }),

      unlockAchievement: (id) =>
        set((state) => {
          if (state.unlockedAchievements.includes(id)) return state;
          const achievement = ACHIEVEMENTS.find((a) => a.id === id);
          const xpBonus = achievement?.xpReward ?? 0;
          const newUnlocked = [...state.unlockedAchievements, id];
          const newXP = state.scientist.xp + xpBonus;

          // check if all non-scholar achievements done
          const nonScholar = ACHIEVEMENTS.filter((a) => a.id !== 'kalinga-scholar');
          const allDone = nonScholar.every((a) => newUnlocked.includes(a.id));
          if (allDone && !newUnlocked.includes('kalinga-scholar')) {
            newUnlocked.push('kalinga-scholar');
          }

          return {
            unlockedAchievements: newUnlocked,
            unlockedAt: { ...state.unlockedAt, [id]: Date.now() },
            scientist: {
              ...state.scientist,
              xp: newXP,
              level: levelFromXP(newXP),
            },
          };
        }),

      addPlanetViewed: (planet) =>
        set((state) => {
          const viewed = state.scientist.planetsViewed.includes(planet)
            ? state.scientist.planetsViewed
            : [...state.scientist.planetsViewed, planet];
          return { scientist: { ...state.scientist, planetsViewed: viewed } };
        }),

      addReactionLog: (entry) =>
        set((state) => ({
          reactionLog: [
            { ...entry, id: crypto.randomUUID(), timestamp: Date.now() },
            ...state.reactionLog.slice(0, 49),
          ],
        })),

      incrementOrgans: () =>
        set((state) => ({
          scientist: {
            ...state.scientist,
            organsIdentified: state.scientist.organsIdentified + 1,
          },
        })),

      visitLab: (lab) =>
        set((state) => {
          const visited = state.scientist.visitedLabs.includes(lab)
            ? state.scientist.visitedLabs
            : [...state.scientist.visitedLabs, lab];
          return { scientist: { ...state.scientist, visitedLabs: visited } };
        }),
    }),
    { name: 'kalinga-lab-store' }
  )
);
