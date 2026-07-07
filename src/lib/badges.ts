import { Trophy, Star, Target, Zap, Waves, Brain, Medal, Award } from 'lucide-react';

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: any;
  color: string;
  milestone: number;
  type: 'syllables' | 'words' | 'score' | 'weekly';
}

export const ALL_BADGES: Badge[] = [
  {
    id: 'syllable_rookie',
    title: 'Apprenti Syllabes',
    description: 'A débloqué 5 syllabes cachées',
    icon: Target,
    color: 'text-blue-500',
    milestone: 5,
    type: 'syllables',
  },
  {
    id: 'syllable_master',
    title: 'Maître des Syllabes',
    description: 'A débloqué 20 syllabes cachées',
    icon: Trophy,
    color: 'text-yellow-500',
    milestone: 20,
    type: 'syllables',
  },
  {
    id: 'segmentation_explorer',
    title: 'Explorateur de Mots',
    description: 'A découpé 5 mots correctement',
    icon: Star,
    color: 'text-purple-500',
    milestone: 5,
    type: 'words',
  },
  {
    id: 'segmentation_expert',
    title: 'Expert Découpeur',
    description: 'A découpé 15 mots correctement',
    icon: Medal,
    color: 'text-orange-500',
    milestone: 15,
    type: 'words',
  },
  {
    id: 'perfect_nasals',
    title: 'Pro des Nasales',
    description: 'A écouté tous les exemples de sons nasals',
    icon: Waves,
    color: 'text-cyan-500',
    milestone: 40, // 10 examples per 4 sounds
    type: 'score',
  },
  {
    id: 'daily_learner',
    title: 'Élève Assidu',
    description: 'A complété 10 exercices cette semaine',
    icon: Zap,
    color: 'text-green-500',
    milestone: 10,
    type: 'weekly',
  },
];

type AchievementState = {
  syllablesCount: number;
  wordsCount: number;
  nasalsCount: number;
  weeklyCount: number;
  unlockedBadges: string[];
};

const STORAGE_KEY = 'communiquer_achievements';

const getInitialState = (): AchievementState => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) return JSON.parse(stored);
  return {
    syllablesCount: 0,
    wordsCount: 0,
    nasalsCount: 0,
    weeklyCount: 0,
    unlockedBadges: [],
  };
};

let state = getInitialState();
const listeners = new Set<(s: AchievementState) => void>();

const persist = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  listeners.forEach(l => l(state));
};

export const achievementManager = {
  getState: () => state,
  subscribe: (l: (s: AchievementState) => void) => {
    listeners.add(l);
    return () => listeners.delete(l);
  },
  trackSyllable: () => {
    state.syllablesCount++;
    checkBadges();
    persist();
  },
  trackWord: () => {
    state.wordsCount++;
    state.weeklyCount++;
    checkBadges();
    persist();
  },
  trackNasal: () => {
    state.nasalsCount++;
    checkBadges();
    persist();
  }
};

function checkBadges() {
  ALL_BADGES.forEach(badge => {
    if (state.unlockedBadges.includes(badge.id)) return;

    let unlocked = false;
    if (badge.type === 'syllables' && state.syllablesCount >= badge.milestone) unlocked = true;
    if (badge.type === 'words' && state.wordsCount >= badge.milestone) unlocked = true;
    if (badge.type === 'score' && state.nasalsCount >= badge.milestone) unlocked = true;
    if (badge.type === 'weekly' && state.weeklyCount >= badge.milestone) unlocked = true;

    if (unlocked) {
      state.unlockedBadges.push(badge.id);
    }
  });
}
