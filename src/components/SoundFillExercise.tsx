import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Volume2, ChevronRight, RotateCcw, Trophy, PlayCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { speak } from '@/lib/tts';

interface Gap {
  id: string;
  correct: string;
  options: [string, string];
}

interface TextSegment {
  type: 'text' | 'gap';
  content?: string;
  gapId?: string;
}

interface Level {
  id: number;
  difficulty: "Débutant" | "Intermédiaire" | "Avancé" | "Expert" | "Maître";
  instruction: string;
  segments: TextSegment[];
  gaps: Record<string, Gap>;
}

const LEVELS: Level[] = [
  {
    id: 1,
    difficulty: "Débutant",
    instruction: "Écoutez et complétez ce paragraphe avec les bons sons nasaux.",
    segments: [
      { type: 'text', content: "Le mat" },
      { type: 'gap', gapId: 'g1' },
      { type: 'text', content: ", je mange du p" },
      { type: 'gap', gapId: 'g2' },
      { type: 'text', content: " avec mon cop" },
      { type: 'gap', gapId: 'g3' },
      { type: 'text', content: ". Nous aimons bi" },
      { type: 'gap', gapId: 'g4' },
      { type: 'text', content: " marcher dans le jard" },
      { type: 'gap', gapId: 'g5' },
      { type: 'text', content: "." }
    ],
    gaps: {
      g1: { id: 'g1', correct: 'in', options: ['in', 'an'] },
      g2: { id: 'g2', correct: 'ain', options: ['ain', 'en'] },
      g3: { id: 'g3', correct: 'ain', options: ['ain', 'un'] },
      g4: { id: 'g4', correct: 'en', options: ['en', 'on'] },
      g5: { id: 'g5', correct: 'in', options: ['in', 'on'] }
    }
  },
  {
    id: 2,
    difficulty: "Intermédiaire",
    instruction: "Distinguez les sons 'on' et 'ou' dans ce petit récit.",
    segments: [
      { type: 'text', content: "M" },
      { type: 'gap', gapId: 'g1' },
      { type: 'text', content: " chatit" },
      { type: 'gap', gapId: 'g2' },
      { type: 'text', content: " d" },
      { type: 'gap', gapId: 'g3' },
      { type: 'text', content: "rt sur le p" },
      { type: 'gap', gapId: 'g4' },
      { type: 'text', content: "nt. Il est mign" },
      { type: 'gap', gapId: 'g5' },
      { type: 'text', content: " quand il j" },
      { type: 'gap', gapId: 'g6' },
      { type: 'text', content: "e avec sa balle r" },
      { type: 'gap', gapId: 'g7' },
      { type: 'text', content: "nde." }
    ],
    gaps: {
      g1: { id: 'g1', correct: 'on', options: ['on', 'ou'] },
      g2: { id: 'g2', correct: 'ou', options: ['ou', 'on'] },
      g3: { id: 'g3', correct: 'o', options: ['o', 'ou'] },
      g4: { id: 'g4', correct: 'ou', options: ['ou', 'on'] },
      g5: { id: 'g5', correct: 'on', options: ['on', 'ou'] },
      g6: { id: 'g6', correct: 'ou', options: ['ou', 'on'] },
      g7: { id: 'g7', correct: 'o', options: ['o', 'ou'] }
    }
  },
  {
    id: 3,
    difficulty: "Avancé",
    instruction: "Maîtrisez les voyelles complexes 'eu', 'ou' et 'au'.",
    segments: [
      { type: 'text', content: "Le p" },
      { type: 'gap', gapId: 'g1' },
      { type: 'text', content: " d'un h" },
      { type: 'gap', gapId: 'g2' },
      { type: 'text', content: "t v" },
      { type: 'gap', gapId: 'g3' },
      { type: 'text', content: "id. Il a r" },
      { type: 'gap', gapId: 'g4' },
      { type: 'text', content: "lé car il a " },
      { type: 'gap', gapId: 'g5' },
      { type: 'text', content: " p" },
      { type: 'gap', gapId: 'g6' },
      { type: 'text', content: "r du l" },
      { type: 'gap', gapId: 'g7' },
      { type: 'text', content: "p." }
    ],
    gaps: {
      g1: { id: 'g1', correct: 'eu', options: ['eu', 'ou'] },
      g2: { id: 'g2', correct: 'au', options: ['au', 'ou'] },
      g3: { id: 'g3', correct: 'a', options: ['a', 'e'] },
      g4: { id: 'g4', correct: 'ou', options: ['ou', 'eu'] },
      g5: { id: 'g5', correct: 'eu', options: ['eu', 'ou'] },
      g6: { id: 'g6', correct: 'eu', options: ['eu', 'ou'] },
      g7: { id: 'g7', correct: 'ou', options: ['ou', 'eu'] }
    }
  },
  {
    id: 4,
    difficulty: "Expert",
    instruction: "Travaillez sur les graphies 'ai', 'ei' et leurs accents.",
    segments: [
      { type: 'text', content: "La n" },
      { type: 'gap', gapId: 'g1' },
      { type: 'text', content: "ge tomb" },
      { type: 'gap', gapId: 'g2' },
      { type: 'text', content: " sur le bal" },
      { type: 'gap', gapId: 'g3' },
      { type: 'text', content: ". Quelle b" },
      { type: 'gap', gapId: 'g4' },
      { type: 'text', content: "lle journ" },
      { type: 'gap', gapId: 'g5' },
      { type: 'text', content: "e pour f" },
      { type: 'gap', gapId: 'g6' },
      { type: 'text', content: "re une tr" },
      { type: 'gap', gapId: 'g7' },
      { type: 'text', content: "ne." }
    ],
    gaps: {
      g1: { id: 'g1', correct: 'ei', options: ['ei', 'ai'] },
      g2: { id: 'g2', correct: 'ait', options: ['ait', 'eit'] },
      g3: { id: 'g3', correct: 'ai', options: ['ai', 'ei'] },
      g4: { id: 'g4', correct: 'e', options: ['e', 'ai'] },
      g5: { id: 'g5', correct: 'ée', options: ['ée', 'ei'] },
      g6: { id: 'g6', correct: 'ai', options: ['ai', 'ei'] },
      g7: { id: 'g7', correct: 'aî', options: ['aî', 'eî'] }
    }
  },
  {
    id: 5,
    difficulty: "Maître",
    instruction: "Dérnier défi : Distinguez 'au', 'eau' et 'o'.",
    segments: [
      { type: 'text', content: "L'" },
      { type: 'gap', gapId: 'g1' },
      { type: 'text', content: " du riss" },
      { type: 'gap', gapId: 'g2' },
      { type: 'text', content: " est fr" },
      { type: 'gap', gapId: 'g3' },
      { type: 'text', content: "ide. Le crap" },
      { type: 'gap', gapId: 'g4' },
      { type: 'text', content: "d et le l" },
      { type: 'gap', gapId: 'g5' },
      { type: 'text', content: "t" },
      { type: 'gap', gapId: 'g6' },
      { type: 'text', content: " reg" },
      { type: 'gap', gapId: 'g7' },
      { type: 'text', content: "rdent le bat" },
      { type: 'gap', gapId: 'g8' },
      { type: 'text', content: "." }
    ],
    gaps: {
      g1: { id: 'g1', correct: 'eau', options: ['eau', 'au'] },
      g2: { id: 'g2', correct: 'eau', options: ['eau', 'au'] },
      g3: { id: 'g3', correct: 'o', options: ['o', 'au'] },
      g4: { id: 'g4', correct: 'au', options: ['au', 'eau'] },
      g5: { id: 'g5', correct: 'o', options: ['o', 'au'] },
      g6: { id: 'g6', correct: 'o', options: ['o', 'au'] },
      g7: { id: 'g7', correct: 'a', options: ['a', 'e'] },
      g8: { id: 'g8', correct: 'eau', options: ['eau', 'au'] }
    }
  }
];

export function SoundFillExercise() {
  const [currentLevelIdx, setCurrentLevelIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [score, setScore] = useState(0);
  const [totalPossible, setTotalPossible] = useState(0);
  const [finished, setFinished] = useState(false);

  const level = LEVELS[currentLevelIdx];

  const handleSelect = (gapId: string, option: string) => {
    setAnswers(prev => ({ ...prev, [gapId]: option }));
    speak(option);
  };

  const calculateLevelScore = () => {
    let currentScore = 0;
    const levelGaps = Object.values(level.gaps);
    levelGaps.forEach(gap => {
      if (answers[gap.id] === gap.correct) {
        currentScore++;
      }
    });
    return currentScore;
  };

  const nextLevel = () => {
    const levelGapsCount = Object.keys(level.gaps).length;
    const levelScore = calculateLevelScore();
    
    setScore(prev => prev + levelScore);
    setTotalPossible(prev => prev + levelGapsCount);

    if (currentLevelIdx < LEVELS.length - 1) {
      setCurrentLevelIdx(prev => prev + 1);
      setAnswers({});
    } else {
      setFinished(true);
    }
  };

  const reset = () => {
    setCurrentLevelIdx(0);
    setAnswers({});
    setScore(0);
    setTotalPossible(0);
    setFinished(false);
  };

  const getFullText = () => {
    return level.segments.map(s => {
      if (s.type === 'text') return s.content;
      return answers[s.gapId!] || " ... ";
    }).join('');
  };

  const getLevelLabel = (scorePct: number) => {
    if (scorePct >= 90) return "Expert en Lecture";
    if (scorePct >= 70) return "Lecteur Confirmé";
    if (scorePct >= 50) return "Lecteur Intermédiaire";
    return "Apprenti Lecteur";
  };

  if (finished) {
    const scorePct = Math.round((score / totalPossible) * 100);
    return (
      <Card className="border-none shadow-2xl bg-white rounded-[2.5rem] overflow-hidden">
        <div className="h-4 bg-gradient-to-r from-blue-500 to-purple-500" />
        <CardContent className="p-12 text-center space-y-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-24 h-24 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto shadow-lg"
          >
            <Trophy className="w-12 h-12" />
          </motion.div>
          <div className="space-y-2">
            <h3 className="text-3xl font-black text-slate-900">Exercice Terminé !</h3>
            <p className="text-slate-500 font-medium">Voici votre bilan de lecture</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="p-6 bg-blue-50 rounded-3xl border-2 border-white shadow-sm">
              <p className="text-sm font-bold text-blue-600 uppercase">Score Total</p>
              <p className="text-4xl font-black text-blue-900">{score} / {totalPossible}</p>
            </div>
            <div className="p-6 bg-purple-50 rounded-3xl border-2 border-white shadow-sm">
              <p className="text-sm font-bold text-purple-600 uppercase">Niveau Atteint</p>
              <p className="text-xl font-black text-purple-900">{getLevelLabel(scorePct)}</p>
            </div>
          </div>

          <Button 
            onClick={reset}
            className="w-full h-14 rounded-2xl bg-slate-900 hover:bg-slate-800 text-lg font-black gap-2 transition-all shadow-xl"
          >
            <RotateCcw className="w-5 h-5" />
            RECOMMENCER L'ENTRAÎNEMENT
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-xs font-black uppercase tracking-wider">
              Niveau {level.id} : {level.difficulty}
            </span>
          </div>
          <h3 className="text-xl font-black text-slate-900">{level.instruction}</h3>
        </div>
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => speak(level.instruction + " . " + getFullText())}
          className="w-12 h-12 rounded-2xl border-blue-200 text-blue-600 hover:bg-blue-50 shadow-sm"
          title="Écouter tout le paragraphe"
        >
          <Volume2 className="w-6 h-6" />
        </Button>
      </div>

      <Card className="border-none shadow-xl bg-white rounded-[2rem] overflow-hidden">
        <CardContent className="p-10 space-y-12">
          {/* Paragraph Display */}
          <div className="flex flex-wrap items-baseline gap-y-8 gap-x-2 text-2xl md:text-3xl font-bold text-slate-800 leading-relaxed text-left">
            {level.segments.map((seg, idx) => {
              if (seg.type === 'text') {
                return <span key={idx}>{seg.content}</span>;
              }
              const gap = level.gaps[seg.gapId!];
              const userAns = answers[gap.id];
              return (
                <div key={idx} className="inline-flex flex-col items-center">
                  <div className={`min-w-[3rem] h-12 border-b-4 flex items-center justify-center px-2 transition-all ${userAns ? 'border-indigo-500 text-indigo-600 bg-indigo-50/30 rounded-t-lg' : 'border-slate-200 text-slate-300'}`}>
                    {userAns || '...'}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Options Selection */}
          <div className="space-y-8 py-8 border-t border-slate-100">
            <div className="flex items-center gap-3 mb-2">
              <PlayCircle className="w-5 h-5 text-indigo-600" />
              <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Complétez le paragraphe :</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-8">
              {level.segments.filter(s => s.type === 'gap').map((seg, gapIdx) => {
                const gap = level.gaps[seg.gapId!];
                return (
                  <div key={gap.id} className="space-y-3">
                    <p className="text-xs font-bold text-slate-400 uppercase">Trou n°{gapIdx + 1}</p>
                    <div className="flex gap-3">
                      {gap.options.map(opt => (
                        <div key={opt} className="flex-1 flex gap-1">
                          <Button
                            variant="outline"
                            onClick={() => handleSelect(gap.id, opt)}
                            className={`flex-1 h-16 rounded-2xl text-xl font-black border-2 transition-all ${answers[gap.id] === opt ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-md' : 'border-slate-100 hover:border-indigo-200 hover:bg-slate-50'}`}
                          >
                            {opt}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => speak(opt)}
                            className="h-16 w-12 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                            title="Écouter le son"
                          >
                            <Volume2 className="w-5 h-5" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <Button 
            onClick={nextLevel}
            disabled={Object.keys(answers).length < Object.keys(level.gaps).length}
            className="w-full h-16 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-xl font-black gap-2 transition-all shadow-xl shadow-indigo-500/20 disabled:opacity-30"
          >
            {currentLevelIdx === LEVELS.length - 1 ? "TERMINER ET VOIR MON BILAN" : "PASSER AU PARAGRAPHE SUIVANT"}
            <ChevronRight className="w-6 h-6" />
          </Button>
        </CardContent>
      </Card>
      
      {/* Level Progress */}
      <div className="flex justify-center gap-2">
        {LEVELS.map((_, idx) => (
          <div 
            key={idx}
            className={`h-2 rounded-full transition-all duration-500 ${idx === currentLevelIdx ? 'w-10 bg-indigo-600' : idx < currentLevelIdx ? 'w-4 bg-green-500' : 'w-4 bg-slate-200'}`}
          />
        ))}
      </div>
    </div>
  );
}

