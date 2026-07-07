import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Volume2, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { speak, preload } from '@/lib/tts';
import { achievementManager } from '@/lib/badges';

const SIMPLE_CONSONNES = ['B', 'P', 'D', 'T', 'L', 'M', 'R', 'S'];
const SIMPLE_VOYELLES = ['a', 'e', 'i', 'o', 'u'];

const COMPLEXE_CONSONNES = ['B', 'P', 'D', 'T', 'L', 'M', 'R', 'S'];
const COMPLEXE_VOYELLES = ['ou', 'oi', 'au', 'ai', 'eu', 'ui', 'ion', 'oin'];

const SPECIAL_DIGRAPHES = [
  { sound: 'ph', ipa: '/f/', examples: ['photo', 'phoque', 'téléphone', 'alphabet', 'dauphin'] },
  { sound: 'th', ipa: '/t/', examples: ['thé', 'maths', 'thème', 'thon', 'bibliothèque'] },
  { sound: 'gn', ipa: '/ɲ/', examples: ['montagne', 'campagne', 'ligne', 'signe', 'peigne'] },
  { sound: 'ch', ipa: '/ʃ/', examples: ['cheval', 'chat', 'chien', 'chocolat', 'douche'] },
];

const HIDDEN_SYLLABLES = [
  'pa', 'be', 'pe', 'te', 'le', 'me', 'li', 'lo', 'lu', 
  'ba', 'ro', 'to', 'doi', 'dau', 'lau', 'sau', 'pai', 
  'tai', 'beu', 'reu', 'seu', 'dui', 'mui', 'bion', 'doin'
];

interface TableProps {
  consonants: string[];
  vowels: string[];
  revealed: Record<string, boolean>;
  userInputs: Record<string, string>;
  onCellClick: (c: string, v: string) => void;
  onInputChange: (s: string, v: string) => void;
  onPreload: (s: string) => void;
}

function TableView({ consonants, vowels, revealed, userInputs, onCellClick, onInputChange, onPreload }: TableProps) {
  return (
    <div className="bg-white p-4 rounded-xl overflow-x-auto border border-slate-200 shadow-sm">
      <table className="w-full text-center border-collapse">
        <thead>
          <tr>
            <th className="p-3 border border-slate-100 text-slate-950 font-black bg-slate-50">C \ V</th>
            {vowels.map(v => (
              <th key={v} className="p-3 border border-slate-100 text-slate-950 font-black text-xl bg-slate-50">{v}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {consonants.map(c => (
            <tr key={c}>
              <td className="p-3 border border-slate-100 text-slate-950 font-black text-xl bg-slate-50">{c}</td>
              {vowels.map(v => {
                const syllable = (c + v).toLowerCase();
                const isHidden = HIDDEN_SYLLABLES.includes(syllable);
                const isCorrect = revealed[syllable];

                return (
                  <td 
                    key={v} 
                    className="p-1 border border-slate-100 min-w-[80px]"
                  >
                    {isHidden && !isCorrect ? (
                      <input
                        type="text"
                        maxLength={syllable.length}
                        className="w-full py-2 bg-slate-50 border border-slate-200 rounded text-center text-blue-600 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        placeholder="?"
                        value={userInputs[syllable] || ''}
                        onChange={(e) => onInputChange(syllable, e.target.value)}
                      />
                    ) : (
                      <button
                        onClick={() => onCellClick(c, v)}
                        onMouseEnter={() => onPreload(syllable)}
                        className={`w-full py-3 rounded-md hover:bg-blue-50 font-medium text-lg transition-colors border-none ${
                          isCorrect ? 'text-blue-600 font-black animate-pulse' : 'text-slate-600'
                        }`}
                      >
                        {c.toLowerCase()}{v}
                      </button>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function SyllableTable() {
  const [selectedCell, setSelectedCell] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [userInputs, setUserInputs] = useState<Record<string, string>>({});
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});

  useEffect(() => {
    SIMPLE_CONSONNES.slice(0, 3).forEach(c => {
      SIMPLE_VOYELLES.forEach(v => preload((c + v).toLowerCase(), true));
    });
  }, []);

  const handleCellClick = async (consonant: string, vowel: string) => {
    const syllable = (consonant + vowel).toLowerCase();
    const isHidden = HIDDEN_SYLLABLES.includes(syllable);
    const isCorrect = revealed[syllable];
    
    if (isHidden && !isCorrect) return;

    setSelectedCell(syllable);
    setLoading(true);
    await speak(syllable, true);
    setLoading(false);
  };

  const handleInputChange = (syllable: string, value: string) => {
    const newVal = value.toLowerCase();
    setUserInputs(prev => ({ ...prev, [syllable]: newVal }));
    if (newVal === syllable) {
      setRevealed(prev => ({ ...prev, [syllable]: true }));
      achievementManager.trackSyllable();
    }
  };

  const handleRepeat = async () => {
    if (selectedCell) {
      setLoading(true);
      await speak(selectedCell, true);
      setLoading(false);
    }
  };

  const handleExampleClick = async (word: string) => {
    setSelectedCell(word);
    setLoading(true);
    await speak(word, false); // Normal speed for words
    setLoading(false);
  };

  return (
    <div className="space-y-12">
      <section className="space-y-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-blue-100 text-blue-700 rounded-2xl">
            <Volume2 className="w-6 h-6" />
          </div>
          <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Syllabes Simples</h3>
          <div className="flex-1 h-px bg-slate-200" />
        </div>
        <TableView 
          consonants={SIMPLE_CONSONNES}
          vowels={SIMPLE_VOYELLES}
          revealed={revealed}
          userInputs={userInputs}
          onCellClick={handleCellClick}
          onInputChange={handleInputChange}
          onPreload={(s) => preload(s, true)}
        />
      </section>

      <section className="space-y-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-purple-100 text-purple-700 rounded-2xl">
            <Volume2 className="w-6 h-6" />
          </div>
          <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Syllabes Complexes</h3>
          <div className="flex-1 h-px bg-slate-200" />
        </div>
        <TableView 
          consonants={COMPLEXE_CONSONNES}
          vowels={COMPLEXE_VOYELLES}
          revealed={revealed}
          userInputs={userInputs}
          onCellClick={handleCellClick}
          onInputChange={handleInputChange}
          onPreload={(s) => preload(s, true)}
        />
      </section>

      <section className="space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-1 h-8 bg-amber-600 rounded-full" />
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">Digraphes Spéciaux</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {SPECIAL_DIGRAPHES.map((item) => (
            <div key={item.sound} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h4 className="text-3xl font-black text-amber-600 uppercase tracking-tighter">{item.sound}</h4>
                  <p className="text-sm font-bold text-slate-400 mt-1">Le son {item.ipa}</p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {item.examples.map(word => (
                  <button
                    key={word}
                    onClick={() => handleExampleClick(word)}
                    className="px-3 py-1.5 bg-slate-50 hover:bg-amber-50 hover:text-amber-700 text-slate-600 rounded-lg text-sm font-medium transition-colors border border-slate-100"
                  >
                    {word}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <AnimatePresence>
        {selectedCell && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex items-center justify-center p-8 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200"
          >
            <div className="text-center">
              <span className="text-7xl font-black text-slate-900 mb-6 block uppercase leading-none italic tracking-tighter">
                {selectedCell}
              </span>
              <Button 
                variant="default" 
                size="lg"
                onClick={handleRepeat}
                disabled={loading}
                className="gap-3 rounded-full px-8 bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Volume2 className="w-5 h-5" />}
                Écouter à nouveau
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
