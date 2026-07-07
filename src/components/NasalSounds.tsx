import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Volume2, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { speak, preload } from '@/lib/tts';

import { achievementManager } from '@/lib/badges';

const NASAL_SOUNDS = [
  { 
    id: 'an',
    sound: 'Le son /ɑ̃/', 
    pattern: /(an|am|en|em)/gi,
    examples: [
      'Maman', 'Enfant', 'Chanter', 'Danser', 'Pendant',
      'Vendre', 'Tempête', 'Jambon', 'Champ', 'Lampe',
      'Vent', 'Dent', 'Banc', 'Blanc'
    ], 
    color: 'from-orange-500/20 to-orange-500/5' 
  },
  { 
    id: 'in',
    sound: 'Le son /ɛ̃/', 
    pattern: /(in|ain|ein|aim|yn|ym)/gi,
    examples: [
      'Lapin', 'Train', 'Main', 'Pain', 'Plein',
      'Faim', 'Matin', 'Jardin', 'Sapin', 'Vin',
      'Timbre', 'Sympa', 'Daim', 'Peintre'
    ], 
    color: 'from-blue-500/20 to-blue-500/5' 
  },
  { 
    id: 'on',
    sound: 'Le son /ɔ̃/', 
    pattern: /(on|om)/gi,
    examples: [
      'Ballon', 'Maison', 'Pont', 'Bonbon', 'Garçon',
      'Pompe', 'Tomber', 'Long', 'Rond', 'Blond',
      'Montre', 'Donner', 'Action', 'Saison'
    ], 
    color: 'from-purple-500/20 to-purple-500/5' 
  },
  { 
    id: 'un',
    sound: 'Le son /œ̃/', 
    pattern: /(un|um)/gi,
    examples: [
      'Lundi', 'Un', 'Chacun', 'Parfum', 'Commun',
      'Aucun', 'Humble', 'Verdun', 'Melun', 'Brun'
    ], 
    color: 'from-green-500/20 to-green-500/5' 
  },
];

const HighlightedText = ({ text, pattern }: { text: string, pattern: RegExp }) => {
  const parts = text.split(pattern);
  const matches = text.match(pattern) || [];
  let matchIndex = 0;

  // Manual split/reconstruct to ensure we only highlight actual patterns
  const elements: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;
  const regex = new RegExp(pattern.source, 'gi');

  while ((match = regex.exec(text)) !== null) {
    // Text before match
    elements.push(text.substring(lastIndex, match.index));
    // The match itself
    elements.push(
      <strong key={match.index} className="text-slate-950 font-black bg-yellow-300 px-1 rounded shadow-sm">
        {match[0]}
      </strong>
    );
    lastIndex = regex.lastIndex;
  }
  elements.push(text.substring(lastIndex));

  return <span>{elements}</span>;
};

export function NasalSounds() {
  const [playing, setPlaying] = useState<string | null>(null);

  useEffect(() => {
    NASAL_SOUNDS.forEach(item => {
      preload(item.id);
      preload(item.examples[0]);
    });
  }, []);

  const handleSpeak = async (text: string, originalId?: string) => {
    const textToSpeak = originalId || text;
    setPlaying(text);
    achievementManager.trackNasal();
    await speak(textToSpeak);
    setPlaying(null);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {NASAL_SOUNDS.map((item, idx) => (
        <motion.div
          key={item.sound}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: idx * 0.1 }}
        >
          <Card className={cn("border-slate-200 bg-gradient-to-br bg-white shadow-md overflow-hidden", item.color)}>
            <CardContent className="p-0">
              <div className="p-6 bg-white/50 border-b border-slate-100 flex items-center justify-center text-center">
                <h4 className="text-2x font-black text-slate-900 tracking-tight">{item.sound}</h4>
              </div>
              <div className="p-4 grid grid-cols-2 gap-2">
                {item.examples.map(ex => (
                  <Button
                    key={ex}
                    variant="ghost"
                    className="justify-start text-base h-12 hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-100 rounded-lg group"
                    onClick={() => handleSpeak(ex)}
                    onMouseEnter={() => preload(ex)}
                    disabled={playing === ex}
                  >
                    <Volume2 className="w-3.5 h-3.5 mr-2.5 text-slate-400 group-hover:text-blue-500 transition-colors" />
                    <HighlightedText text={ex} pattern={item.pattern} />
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
