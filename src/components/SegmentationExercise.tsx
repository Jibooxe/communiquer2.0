import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Scissors, RotateCcw, CheckCircle2, Volume2, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { speak, preload } from '@/lib/tts';

import { achievementManager } from '@/lib/badges';

const WORDS = [
  // Famille
  { word: 'maman', syllables: ['ma', 'man'] },
  { word: 'papa', syllables: ['pa', 'pa'] },
  { word: 'frère', syllables: ['frè', 're'] },
  { word: 'cousin', syllables: ['cou', 'sin'] },
  { word: 'parent', syllables: ['pa', 'rent'] },
  // Loisir
  { word: 'vélo', syllables: ['vé', 'lo'] },
  { word: 'cinéma', syllables: ['ci', 'né', 'ma'] },
  { word: 'musique', syllables: ['mu', 'si', 'que'] },
  { word: 'piano', syllables: ['pi', 'a', 'no'] },
  // Hôtel
  { word: 'chambre', syllables: ['cham', 'bre'] },
  { word: 'valise', syllables: ['va', 'li', 'se'] },
  { word: 'hôtel', syllables: ['hô', 'tel'] },
  { word: 'douche', syllables: ['dou', 'che'] },
  // Travail
  { word: 'bureau', syllables: ['bu', 'reau'] },
  { word: 'travail', syllables: ['tra', 'vail'] },
  { word: 'patron', syllables: ['pa', 'tron'] },
  { word: 'métier', syllables: ['mé', 'tier'] },
  // Repas
  { word: 'soupe', syllables: ['sou', 'pe'] },
  { word: 'salade', syllables: ['sa', 'la', 'de'] },
  { word: 'dessert', syllables: ['des', 'sert'] },
  { word: 'pomme', syllables: ['pom', 'me'] },
  { word: 'poulet', syllables: ['pou', 'let'] },
  // Voyage
  { word: 'train', syllables: ['train'] },
  { word: 'avion', syllables: ['a', 'vion'] },
  { word: 'bateau', syllables: ['ba', 'teau'] },
  { word: 'billet', syllables: ['bil', 'let'] },
  // Logement
  { word: 'maison', syllables: ['mai', 'son'] },
  { word: 'jardin', syllables: ['jar', 'din'] },
  { word: 'cuisine', syllables: ['cui', 'si', 'ne'] },
  { word: 'balcon', syllables: ['bal', 'con'] },
  // Santé
  { word: 'docteur', syllables: ['doc', 'teur'] },
  { word: 'hôpital', syllables: ['hô', 'pi', 'tal'] },
  { word: 'santé', syllables: ['san', 'té'] },
  { word: 'remède', syllables: ['re', 'mè', 'de'] },
];

export function SegmentationExercise() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cuts, setCuts] = useState<number[]>([]);
  const [finished, setFinished] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Preload current and next word
    preload(WORDS[currentIndex].word);
    if (currentIndex < WORDS.length - 1) {
      preload(WORDS[currentIndex + 1].word);
    }

    // Auto-finish if word has only one syllable
    if (WORDS[currentIndex].syllables.length === 1) {
      setFinished(true);
    }
  }, [currentIndex]);

  const currentItem = WORDS[currentIndex];

  const handleCut = async (index: number) => {
    if (cuts.includes(index)) return;
    const newCuts = [...cuts, index].sort((a, b) => a - b);
    setCuts(newCuts);

    // Check if correct
    const expectedCuts = [];
    let currentPos = 0;
    for (let i = 0; i < currentItem.syllables.length - 1; i++) {
      currentPos += currentItem.syllables[i].length;
      expectedCuts.push(currentPos);
    }

    if (newCuts.length === expectedCuts.length) {
      const isCorrect = JSON.stringify(newCuts) === JSON.stringify(expectedCuts);
      if (isCorrect) {
        setFinished(true);
        achievementManager.trackWord();
        setLoading(true);
        await speak(currentItem.word);
        setLoading(false);
      }
    }
  };

  const nextWord = () => {
    if (currentIndex < WORDS.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setCuts([]);
      setFinished(false);
    }
  };

  const handleRepeat = async () => {
    setLoading(true);
    await speak(currentItem.word);
    setLoading(false);
  };

  return (
    <div className="space-y-8 py-4">
      <div className="text-center space-y-6">
        <div className="inline-flex flex-col items-center gap-2">
          <div className="inline-flex items-center gap-4 px-8 py-4 bg-white border border-slate-200 rounded-[2rem] shadow-xl shadow-slate-200/50 mb-4 border-b-4 border-b-blue-500">
            <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-500/20">
              <Scissors className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tighter uppercase italic">
              Découpez le mot en syllabes :
            </h3>
          </div>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Utilisez les ciseaux pour couper entre les lettres</p>
        </div>
        
        <div className="relative inline-flex items-center gap-1 p-10 bg-slate-950 rounded-[2.5rem] border border-slate-800 shadow-2xl">
          {currentItem.syllables.length === 1 && (
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">
              Bloc Unique
            </div>
          )}
          {currentItem.word.split('').map((char, idx) => (
            <React.Fragment key={idx}>
              <motion.span 
                className="text-6xl font-black text-white uppercase"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                key={`${currentIndex}-${idx}`}
              >
                {char}
              </motion.span>
              {idx < currentItem.word.length - 1 && (
                <button
                  onClick={() => handleCut(idx + 1)}
                  className={cn(
                    "w-4 h-16 -mx-1 rounded-full transition-all flex flex-col items-center justify-center group",
                    cuts.includes(idx + 1) ? "bg-blue-600 scale-y-110" : "bg-slate-800 hover:bg-slate-700"
                  )}
                >
                  <Scissors className={cn(
                    "w-3 h-3 text-white transition-opacity",
                    cuts.includes(idx + 1) ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                  )} />
                </button>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="flex justify-center gap-4">
        <Button 
          variant="outline" 
          onClick={handleRepeat}
          disabled={loading}
          className="gap-2"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Volume2 className="w-4 h-4" />}
          Écouter
        </Button>
        <Button 
          variant="outline" 
          onClick={() => { setCuts([]); setFinished(false); }}
          className="gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          Recommencer
        </Button>
        {finished && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <Button 
              onClick={nextWord}
              className="bg-green-600 hover:bg-green-700 gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              Mot suivant
            </Button>
          </motion.div>
        )}
      </div>

      <div className="flex justify-center gap-2">
        {WORDS.map((_, idx) => (
          <div 
            key={idx}
            className={cn(
              "w-2 h-2 rounded-full",
              idx === currentIndex ? "bg-blue-400 w-4" : idx < currentIndex ? "bg-green-500" : "bg-slate-800"
            )}
          />
        ))}
      </div>
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
