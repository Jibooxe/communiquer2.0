export interface Exercise {
  id: string;
  themeId?: string;
  moduleId?: string;
  moduleTitle?: string;
  stepId?: string;
  stepTitle?: string;
  title: string;
  description: string;
  level: 'Débutant' | 'Intermédiaire' | 'Avancé';
  category: 'Prononciation' | 'Intonation' | 'Vocabulaire' | 'Débat';
  modelText: string;
  modelAudioUrl?: string;
  videoUrl?: string;
}

export interface Feedback {
  score: number;
  transcription: string;
  strengths: string[];
  improvements: string[];
  detailedAnalysis: string;
}

export interface ExerciseHistoryEntry {
  id: string;
  exerciseId: string;
  exerciseTitle: string;
  score: number;
  date: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
  corrections?: string[];
  recommendations?: string;
}

export interface DirectExchangeTheme {
  id: string;
  title: string;
  icon: string;
  description: string;
}
