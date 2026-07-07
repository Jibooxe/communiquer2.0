import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sparkles, Volume2, Loader2, PlayCircle, BookOpen, BrainCircuit } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { speak, preload } from '@/lib/tts';
import { SoundFillExercise } from './SoundFillExercise';

export function AIDecoding() {
  const [activeMode, setActiveMode] = useState<'analyzer' | 'exercise'>('analyzer');
  const [input, setInput] = useState('');
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  const analyzeWord = async () => {
    if (!input.trim()) return;
    setLoading(true);
    try {
      const response = await fetch("/api/gemini/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `En tant qu'expert pédagogique en alphabétisation pour adultes, analyse avec précision le mot français : "${input}". 
          
          Règles :
          1. Découpe-le en syllabes réelles.
          2. Explique chaque son (ex: "oi" se prononce "wa").
          3. Donne un conseil de placement de la bouche si nécessaire.
          
          Réponds uniquement en JSON valide :
          { 
            "syllables": ["syl1", "syl2"], 
            "explanation": "...", 
            "audioHint": "...",
            "pedagogicalReading": "Lisez lentement : [décomposition phonétique]"
          }`,
          responseMimeType: "application/json"
        })
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to analyze word");
      
      setAnalysis(data);
      
      // Start preloading the audio as soon as we have the analysis
      preload(input, false, true);
      if (data.pedagogicalReading) {
        preload(data.pedagogicalReading, true, true);
      }
      
      // Auto-speak the analytical reading
      handleSpeak(data.pedagogicalReading || input);
    } catch (error) {
      console.error("AI Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSpeak = async (text: string, slow = false) => {
    setSpeaking(true);
    // Explicitly force AI for the decoding results to keep the high-quality pedagogical voice
    await speak(text, slow, true);
    setSpeaking(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-12 py-4">
      <div className="flex justify-center p-1 bg-slate-100 rounded-2xl max-w-sm mx-auto mb-8">
        <Button
          variant={activeMode === 'analyzer' ? 'default' : 'ghost'}
          onClick={() => setActiveMode('analyzer')}
          className={`flex-1 rounded-xl h-12 font-black gap-2 ${activeMode === 'analyzer' ? 'bg-white shadow-sm text-blue-600 hover:bg-white' : 'text-slate-500'}`}
        >
          <BrainCircuit className="w-5 h-5" />
          ANALYSEUR
        </Button>
        <Button
          variant={activeMode === 'exercise' ? 'default' : 'ghost'}
          onClick={() => setActiveMode('exercise')}
          className={`flex-1 rounded-xl h-12 font-black gap-2 ${activeMode === 'exercise' ? 'bg-white shadow-sm text-blue-600 hover:bg-white' : 'text-slate-500'}`}
        >
          <BookOpen className="w-5 h-5" />
          EXERCICES
        </Button>
      </div>

      {activeMode === 'analyzer' ? (
        <div className="space-y-8">
          <div className="space-y-4 text-center">
            <h3 className="text-2xl font-black text-slate-900 flex items-center justify-center gap-2">
              <Sparkles className="w-6 h-6 text-blue-600" />
              Déchiffrage Haute Qualité par IA
            </h3>
            <p className="text-slate-500 font-medium">
              L'IA analyse le mot et vous le lit avec une prononciation naturelle parfaite.
            </p>
          </div>

          <div className="flex gap-2">
            <Input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Entrez un mot ou une syllabe..."
              className="bg-white border-slate-200 text-lg h-12 shadow-sm focus:ring-blue-500"
              onKeyDown={(e) => e.key === 'Enter' && analyzeWord()}
            />
            <Button 
              onClick={analyzeWord} 
              disabled={loading || !input}
              className="h-12 px-6 bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
            </Button>
          </div>

          <AnimatePresence mode="wait">
            {analysis && (
              <motion.div
                key={input}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-8 bg-blue-50/50 rounded-[2rem] border-2 border-white shadow-xl space-y-8"
              >
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex gap-3">
                    {analysis.syllables.map((syl: string, idx: number) => (
                      <motion.span 
                        key={idx} 
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: idx * 0.1 }}
                        className="text-4xl font-black text-blue-700 p-4 bg-white rounded-2xl shadow-sm border border-blue-100"
                      >
                        {syl}
                      </motion.span>
                    ))}
                  </div>
                  <div className="flex gap-3">
                    <Button 
                      size="icon" 
                      variant="outline" 
                      onClick={() => handleSpeak(input)} 
                      disabled={speaking}
                      className="w-14 h-14 rounded-full border-blue-200 text-blue-600 bg-white hover:bg-blue-50 shadow-md"
                    >
                      <Volume2 className={cn("w-7 h-7", speaking && "animate-pulse")} />
                    </Button>
                    <Button 
                      size="icon" 
                      variant="outline" 
                      onClick={() => handleSpeak(analysis.pedagogicalReading, true)} 
                      disabled={speaking}
                      className="w-14 h-14 rounded-full border-green-200 text-green-600 bg-white hover:bg-green-50 shadow-md"
                      title="Lecture lente pédagogique"
                    >
                      <PlayCircle className="w-7 h-7" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="p-6 bg-white rounded-2xl relative overflow-hidden shadow-sm border border-slate-100">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-600" />
                    <h4 className="text-sm font-black text-slate-400 uppercase mb-3 tracking-[0.1em]">Comment lire ce mot ?</h4>
                    <p className="text-xl text-slate-800 leading-relaxed font-medium">
                      {analysis.explanation}
                    </p>
                  </div>

                  <div className="p-6 bg-blue-600/5 rounded-2xl border-2 border-dashed border-blue-200/50">
                    <p className="text-slate-700 font-serif text-lg leading-relaxed">
                      <span className="text-blue-700 font-black not-italic mr-3 inline-flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        Astuce Pédagogique :
                      </span>
                      {analysis.audioHint}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ) : (
        <SoundFillExercise />
      )}
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
