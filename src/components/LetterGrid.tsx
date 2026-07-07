import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Volume2, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { speak, preload } from '@/lib/tts';

const VOYELLES = ['A', 'E', 'I', 'O', 'U', 'Y'];
const CONSONNES = ['B', 'C', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'V', 'W', 'X', 'Z'];

const CONSONANT_EXAMPLES: Record<string, string> = {
  'B': 'Bateau',
  'C': 'Cadeau',
  'D': 'Domino',
  'F': 'Fourmi',
  'G': 'Gâteau',
  'H': 'Hibou',
  'J': 'Jardin',
  'K': 'Kangourou',
  'L': 'Lapin',
  'M': 'Maman',
  'N': 'Nager',
  'P': 'Papa',
  'Q': 'Quatre',
  'R': 'Renard',
  'S': 'Soleil',
  'T': 'Table',
  'V': 'Vélo',
  'W': 'Wagon',
  'X': 'Xylophone',
  'Z': 'Zèbre'
};

export function LetterGrid() {
  const [playing, setPlaying] = useState<string | null>(null);

  useEffect(() => {
    // Proactively preload first few letters to reduce initial wait
    VOYELLES.forEach(l => preload(l));
    CONSONNES.slice(0, 5).forEach(l => {
      preload(l);
      if (CONSONANT_EXAMPLES[l]) preload(CONSONANT_EXAMPLES[l]);
    });
  }, []);

  const handleSpeak = async (text: string) => {
    setPlaying(text);
    await speak(text);
    setPlaying(null);
  };

  const handleSpeakFull = async (letter: string) => {
    const example = CONSONANT_EXAMPLES[letter];
    if (!example) {
      handleSpeak(letter);
      return;
    }

    setPlaying(letter);
    await speak(letter);
    await new Promise(r => setTimeout(r, 400));
    await speak(`comme ${example}`);
    setPlaying(null);
  };

  return (
    <div className="space-y-8">
      <section>
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-500/20">
            <Volume2 className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-3xl font-black text-blue-600 tracking-tighter uppercase italic">
            Les Voyelles
          </h3>
          <div className="flex-1 h-px bg-gradient-to-r from-blue-100 to-transparent" />
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
          {VOYELLES.map((letter, idx) => (
            <motion.div
              key={letter}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Button
                variant="outline"
                className="w-full h-16 text-3xl font-bold bg-slate-800/50 hover:bg-blue-600 hover:text-white border-slate-700 transition-all"
                onClick={() => handleSpeak(letter)}
                onMouseEnter={() => preload(letter)}
                disabled={playing === letter}
              >
                {letter}
                {playing === letter ? (
                  <Loader2 className="w-4 h-4 ml-2 animate-spin opacity-50" />
                ) : (
                  <Volume2 className="w-4 h-4 ml-2 opacity-50" />
                )}
              </Button>
            </motion.div>
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-500/20">
            <Volume2 className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-3xl font-black text-indigo-600 tracking-tighter uppercase italic">
            Les Consonnes
          </h3>
          <div className="flex-1 h-px bg-gradient-to-r from-indigo-100 to-transparent" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
          {CONSONNES.map((letter, idx) => (
            <motion.div
              key={letter}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.03 }}
            >
              <Button
                variant="outline"
                className="w-full h-24 flex-col gap-1 bg-slate-800/50 hover:bg-indigo-600 hover:text-white border-slate-700 transition-all group overflow-hidden relative"
                onClick={() => handleSpeakFull(letter)}
                onMouseEnter={() => {
                  preload(letter);
                  if (CONSONANT_EXAMPLES[letter]) preload(CONSONANT_EXAMPLES[letter]);
                }}
                disabled={playing === letter}
              >
                <span className="text-3xl font-black">{letter}</span>
                <span className="text-[10px] uppercase font-bold text-slate-400 group-hover:text-indigo-100 transition-colors">
                  {CONSONANT_EXAMPLES[letter]}
                </span>
                
                <div className="absolute bottom-2 right-2">
                  {playing === letter ? (
                    <Loader2 className="w-3 h-3 animate-spin opacity-50" />
                  ) : (
                    <Volume2 className="w-3 h-3 opacity-30 group-hover:opacity-100 transition-opacity" />
                  )}
                </div>
              </Button>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
