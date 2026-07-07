import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  BookText, 
  ChevronRight,
  Volume2,
  FileText,
  MousePointer2,
  Printer,
  ArrowLeft
} from 'lucide-react';
import { speak, preload } from '@/lib/tts';
import { assetUrl } from '@/lib/assets';
import { achievementManager } from '@/lib/badges';
import { motion, AnimatePresence } from 'motion/react';

interface Question {
  id: string;
  text: string;
}

interface ComprehensionExercise {
  id: string;
  sentence: string;
  questions: Question[];
}

const EXERCISES: ComprehensionExercise[] = [
  // ... existing exercises (keeping them same to save space in the thinking process but will include in replacement)
  {
    id: '1',
    sentence: "Le matin, les trois abeilles se dirigent vers le champ de fleurs.",
    questions: [
      { id: 'q1', text: "Combien y a-t-il d'abeilles ?" },
      { id: 'q2', text: "Où vont-elles ?" }
    ]
  },
  {
    id: '2',
    sentence: "Debout, dans son panier, le chat observe la souris.",
    questions: [
      { id: 'q1', text: "Où est le chat ?" },
      { id: 'q2', text: "Que fait-il ?" }
    ]
  },
  {
    id: '3',
    sentence: "Chaque soir, le renard quitte son terrier pour chasser les lapins.",
    questions: [
      { id: 'q1', text: "Quand le renard quitte-t-il son terrier ?" },
      { id: 'q2', text: "Pourquoi quitte-t-il son terrier ?" }
    ]
  },
  {
    id: '4',
    sentence: "Les deux petites souris se régalent en mangeant du fromage.",
    questions: [
      { id: 'q1', text: "Combien y a-t-il de souris ?" },
      { id: 'q2', text: "Que mangent-elles ?" }
    ]
  },
  {
    id: '5',
    sentence: "Marie a préparé un grand bol de riz pour le diner.",
    questions: [
      { id: 'q1', text: "Qui a préparé le diner ?" },
      { id: 'q2', text: "Que contient le bol ?" }
    ]
  },
  {
    id: '6',
    sentence: "Chaque soir, les deux clowns présentent un numéro très amusant.",
    questions: [
      { id: 'q1', text: "Qui présente un numéro ?" },
      { id: 'q2', text: "Combien sont-ils ?" }
    ]
  },
  {
    id: '7',
    sentence: "Les quatre enfants de l’équipe de basket sont heureux d’avoir gagné.",
    questions: [
      { id: 'q1', text: "Combien y a-t-il d'enfants ?" },
      { id: 'q2', text: "Pourquoi sont-ils heureux ?" }
    ]
  },
  {
    id: '8',
    sentence: "Léo et son père jouent avec un cerf-volant.",
    questions: [
      { id: 'q1', text: "Avec qui Léo joue-t-il ?" },
      { id: 'q2', text: "A quoi jouent-ils ?" }
    ]
  },
  {
    id: '9',
    sentence: "Les trois sorcières préparent une potion dans leur nouveau chaudron.",
    questions: [
      { id: 'q1', text: "Combien y a-t-il de sorcières ?" },
      { id: 'q2', text: "Que préparent-elles ?" }
    ]
  },
  {
    id: '10',
    sentence: "Dimanche dernier, Léo et son oncle ont fait de la luge.",
    questions: [
      { id: 'q1', text: "Quand Léo a-t-il fait de la luge ?" },
      { id: 'q2', text: "Avec qui était-il ?" }
    ]
  },
  {
    id: '11',
    sentence: "La maîtresse raconte l’histoire de Cendrillon à ses élèves.",
    questions: [
      { id: 'q1', text: "Qui raconte une histoire ?" },
      { id: 'q2', text: "Quelle histoire raconte-t-elle ?" }
    ]
  },
  {
    id: '12',
    sentence: "Durant les vacances, Léo et toute sa famille vont à la plage.",
    questions: [
      { id: 'q1', text: "Où va la famille ?" },
      { id: 'q2', text: "Quand y vont-ils ?" }
    ]
  },
  {
    id: '13',
    sentence: "Madame Dupont achète un gros gâteau pour l’anniversaire de Léo.",
    questions: [
      { id: 'q1', text: "Qu'achète Madame Dupont ?" },
      { id: 'q2', text: "Pour quelle occasion ?" }
    ]
  },
  {
    id: '14',
    sentence: "Il y a une heure, le dentiste a soigné deux dents à Mélanie.",
    questions: [
      { id: 'q1', text: "Qui a soigné Mélanie ?" },
      { id: 'q2', text: "Combien de dents a-t-il soignées ?" }
    ]
  },
  {
    id: '15',
    sentence: "Léo ramasse des pommes pour faire une tarte.",
    questions: [
      { id: 'q1', text: "Que ramasse Léo ?" },
      { id: 'q2', text: "Pourquoi ?" }
    ]
  },
  {
    id: '16',
    sentence: "Chaque jour, Léo va s’entrainer à la patinoire.",
    questions: [
      { id: 'q1', text: "Où va Léo chaque jour ?" },
      { id: 'q2', text: "Que fait-il ?" }
    ]
  },
  {
    id: '17',
    sentence: "Pour les vacances, Pierre part en Espagne en train.",
    questions: [
      { id: 'q1', text: "Où part Pierre ?" },
      { id: 'q2', text: "Quel moyen de transport utilise-t-il ?" }
    ]
  },
  {
    id: '18',
    sentence: "Dimanche, lors du match, Martin a marqué trois buts.",
    questions: [
      { id: 'q1', text: "Combien de buts Martin a-t-il marqués ?" },
      { id: 'q2', text: "Quand a eu lieu le match ?" }
    ]
  },
  {
    id: '19',
    sentence: "Pierre a attendu le bus sous la pluie durant dix minutes.",
    questions: [
      { id: 'q1', text: "Qu'est-ce que Pierre a attendu ?" },
      { id: 'q2', text: "Combien de temps a-t-il attendu ?" }
    ]
  },
  {
    id: '20',
    sentence: "Après avoir déjeuné et avant de s’habiller, Léo se lave les dents.",
    questions: [
      { id: 'q1', text: "Que fait Léo après son déjeuner ?" },
      { id: 'q2', text: "Quand se lave-t-il les dents ?" }
    ]
  }
];

type Mode = 'selection' | 'digital' | 'pdf';

export function WrittenComprehension() {
  const [mode, setMode] = useState<Mode>('selection');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [completedExercises, setCompletedExercises] = useState<string[]>([]);

  const currentExercise = EXERCISES[currentIndex];

  const handleSpeak = (text: string) => {
    speak(text);
  };

  const nextExercise = () => {
    if (currentIndex < EXERCISES.length - 1) {
      if (!completedExercises.includes(currentExercise.id)) {
        setCompletedExercises(prev => [...prev, currentExercise.id]);
        achievementManager.trackWord();
      }
      setCurrentIndex(currentIndex + 1);
      setAnswers({});
    }
  };

  const prevExercise = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setAnswers({});
    }
  };

  if (mode === 'selection') {
    return (
      <div className="max-w-4xl mx-auto space-y-12 py-8 px-4">
        <div className="text-center space-y-6">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex items-center gap-3 px-6 py-2 bg-indigo-50 border border-indigo-100 rounded-full shadow-sm"
          >
            <BookText className="w-6 h-6 text-indigo-600" />
            <h3 className="text-2xl font-black text-indigo-900 tracking-tight">
              Compréhension Écrite
            </h3>
          </motion.div>
          <p className="text-slate-500 text-lg font-medium max-w-xl mx-auto">
            Choisissez votre support d'apprentissage pour cette session.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div
            whileHover={{ y: -8 }}
            className="group cursor-pointer"
            onClick={() => setMode('pdf')}
          >
            <Card className="h-full border-none shadow-xl bg-white overflow-hidden rounded-[2.5rem] transition-all hover:shadow-2xl hover:shadow-indigo-200/50">
              <div className="h-4 bg-indigo-500" />
              <CardContent className="p-10 flex flex-col items-center text-center space-y-6">
                <div className="w-24 h-24 rounded-3xl bg-indigo-50 text-indigo-600 flex items-center justify-center transition-transform group-hover:scale-110 group-hover:rotate-3">
                  <FileText className="w-12 h-12" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-2xl font-black text-slate-900 leading-none">Documents PDF</h4>
                  <p className="text-slate-500 font-medium">Consultez les documents officiels et supports à imprimer.</p>
                </div>
                <Button size="lg" className="w-full bg-indigo-600 hover:bg-indigo-700 rounded-2xl h-14 font-bold text-lg">
                  Ouvrir dossier
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            whileHover={{ y: -8 }}
            className="group cursor-pointer"
            onClick={() => setMode('digital')}
          >
            <Card className="h-full border-none shadow-xl bg-white overflow-hidden rounded-[2.5rem] transition-all hover:shadow-2xl hover:shadow-purple-200/50">
              <div className="h-4 bg-purple-500" />
              <CardContent className="p-10 flex flex-col items-center text-center space-y-6">
                <div className="w-24 h-24 rounded-3xl bg-purple-50 text-purple-600 flex items-center justify-center transition-transform group-hover:scale-110 group-hover:rotate-3">
                  <MousePointer2 className="w-12 h-12" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-2xl font-black text-slate-900 leading-none">Support Numérique</h4>
                  <p className="text-slate-500 font-medium">Réalisez les exercices directement sur votre écran.</p>
                </div>
                <Button size="lg" className="w-full bg-purple-600 hover:bg-purple-700 rounded-2xl h-14 font-bold text-lg">
                  Démarrer maintenant
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  if (mode === 'pdf') {
    return (
      <div className="max-w-4xl mx-auto space-y-12 py-8 px-4">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            onClick={() => setMode('selection')}
            className="text-slate-500 hover:text-indigo-600 font-bold"
          >
            <ArrowLeft className="w-5 h-5 mr-2" /> Retour
          </Button>
        </div>

        <div className="text-center space-y-6">
          <div className="w-20 h-20 rounded-3xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto shadow-sm">
            <FileText className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h3 className="text-3xl font-black text-slate-900 tracking-tight">Documents PDF</h3>
            <p className="text-slate-500 text-lg font-medium">Accédez à vos supports de cours au format PDF pour une consultation hors ligne.</p>
          </div>
        </div>

        <Card className="border-none shadow-2xl bg-white overflow-hidden rounded-[2.5rem]">
          <div className="h-3 bg-indigo-500" />
          <CardContent className="p-8 md:p-12">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8 p-8 bg-slate-50 rounded-[2rem] border-2 border-slate-100 group transition-all hover:bg-white hover:border-indigo-100 hover:shadow-lg">
              <div className="flex items-center gap-6">
                <div className="w-20 h-24 bg-white rounded-xl shadow-md flex items-center justify-center p-4 relative overflow-hidden border border-slate-100">
                  <div className="absolute top-0 right-0 w-8 h-8 bg-red-500 transform translate-x-4 -translate-y-4 rotate-45" />
                  <FileText className="w-10 h-10 text-red-500" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xl font-black text-slate-900">Compréhension de l'écrit - Exercices</h4>
                  <p className="text-slate-500 font-medium">Format PDF • 5 pages • Supports visuels</p>
                </div>
              </div>
              <a 
                href={assetUrl('/comprehension-ecrite.pdf')} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-lg h-14 px-10 gap-3 shadow-xl shadow-indigo-500/20 text-white font-bold transition-all"
              >
                <Printer className="w-5 h-5" />
                Ouvrir & Imprimer
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-12 py-4">
      <div className="flex items-center gap-4 px-4 translate-y-4">
        <Button 
          variant="ghost" 
          onClick={() => setMode('selection')}
          className="text-slate-500 hover:text-indigo-600 font-bold"
        >
          <ArrowLeft className="w-5 h-5 mr-2" /> Retour au choix
        </Button>
      </div>

      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-3 px-6 py-2 bg-indigo-50 border border-indigo-100 rounded-full shadow-sm">
          <BookText className="w-5 h-5 text-indigo-600" />
          <h3 className="text-xl md:text-2xl font-black text-indigo-900 tracking-tight">
            Compréhension Écrite
          </h3>
        </div>
        <p className="text-slate-500 font-medium">Écoutez, lisez et répondez aux questions.</p>
      </div>

      <div className="space-y-8">
        <Card className="border-none shadow-2xl bg-white overflow-hidden rounded-[2.5rem]">
          <div className="h-3 bg-gradient-to-r from-indigo-500 to-purple-500 w-full" />
          <CardContent className="p-8 md:p-12 space-y-10">
            {/* Sentence Display */}
            <div className="space-y-6">
              <div className="bg-slate-50 p-10 rounded-[2.5rem] border-4 border-slate-100 text-center relative group">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-2 shadow-lg">
                  <Volume2 className="w-4 h-4" />
                  Phrase {currentIndex + 1} / {EXERCISES.length}
                </div>
                <p className="text-2xl md:text-5xl font-black text-slate-900 leading-tight">
                  {currentExercise.sentence}
                </p>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleSpeak(currentExercise.sentence)}
                  onMouseEnter={() => preload(currentExercise.sentence)}
                  className="mt-6 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-full h-16 w-16"
                >
                  <Volume2 className="w-10 h-10" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {currentExercise.questions.map((q, idx) => (
                <div key={q.id} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-black text-xl">
                        {idx + 1}
                      </div>
                      <label className="text-xl font-bold text-slate-700">{q.text}</label>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleSpeak(q.text)}
                      onMouseEnter={() => preload(q.text)}
                      className="h-10 w-10 text-slate-400 hover:text-indigo-600"
                    >
                      <Volume2 className="w-5 h-5" />
                    </Button>
                  </div>
                  
                  <div className="relative">
                    <Input 
                      placeholder="Votre réponse ici..."
                      value={answers[q.id] || ''}
                      onChange={(e) => setAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                      className="h-16 rounded-[1.5rem] text-xl px-8 border-2 border-slate-200 transition-all pr-16 bg-slate-50/50 hover:bg-white focus:bg-white"
                    />
                    <div className="absolute right-3 top-3">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleSpeak(answers[q.id])}
                        disabled={!answers[q.id]?.trim()}
                        className="h-10 w-10 text-slate-400"
                      >
                        <Volume2 className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-10 border-t border-slate-100 flex items-center justify-between gap-6">
              <Button 
                variant="outline"
                size="lg" 
                onClick={prevExercise}
                disabled={currentIndex === 0}
                className="h-14 px-8 rounded-xl text-base font-black gap-2 transition-all border-2 border-slate-200 hover:bg-slate-50 disabled:opacity-30"
              >
                <ChevronRight className="w-5 h-5 rotate-180" />
                PRÉCÉDENT
              </Button>

              <Button 
                size="lg" 
                onClick={nextExercise}
                className="h-14 flex-1 max-w-xs rounded-xl text-lg font-black gap-2 transition-all shadow-lg bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/20"
              >
                {currentIndex === EXERCISES.length - 1 ? "TERMINER" : "SUIVANTE"}
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Progression Bar */}
        <div className="flex justify-center gap-2">
          {EXERCISES.map((ex, idx) => (
            <div 
              key={ex.id}
              className={cn(
                "h-2 rounded-full transition-all duration-500",
                idx === currentIndex ? "w-12 bg-indigo-500" : 
                completedExercises.includes(ex.id) ? "w-6 bg-green-500" : "w-6 bg-slate-200"
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
