import React, { useState } from 'react';
import { Exercise, ExerciseHistoryEntry } from './types';
import { ExerciseView } from './components/ExerciseView';
import { DirectExchange } from './components/DirectExchange';
import { ReadingWorkshop } from './components/ReadingWorkshop';
import { WrittenComprehension } from './components/WrittenComprehension';
import { Login } from './components/Login';
import { AudioExtracts } from './components/AudioExtracts';
import { ExerciseHistory } from './components/ExerciseHistory';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { assetUrl } from '@/lib/assets';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Languages, 
  Mic2, 
  MessageSquare, 
  TrendingUp, 
  BookOpen, 
  Play,
  Award,
  Users,
  Download,
  ClipboardCheck,
  Menu,
  X,
  LayoutDashboard,
  Sparkles,
  LogOut
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const EXERCISES: Exercise[] = [
  // Module 01 - Step 1
  {
    id: 'm1-s1-1',
    moduleId: '01',
    moduleTitle: 'Les salutations',
    stepId: '1',
    stepTitle: 'Donner des informations sur son état civil',
    title: 'Dire son nom',
    description: 'Apprenez à donner votre nom et prénom clairement.',
    level: 'Débutant',
    category: 'Prononciation',
    modelText: 'Je m\'appelle Jean Dupont.',
  },
  {
    id: 'm1-s1-2',
    moduleId: '01',
    moduleTitle: 'Les salutations',
    stepId: '1',
    stepTitle: 'Donner des informations sur son état civil',
    title: 'Dire son âge',
    description: 'Pratiquez la prononciation des nombres pour donner votre âge.',
    level: 'Débutant',
    category: 'Prononciation',
    modelText: 'J\'ai vingt-cinq ans.',
  },
  // Module 01 - Step 2
  {
    id: 'm1-s2-1',
    moduleId: '01',
    moduleTitle: 'Les salutations',
    stepId: '2',
    stepTitle: 'Se présenter',
    title: 'Salutation formelle',
    description: 'Se présenter poliment dans un cadre professionnel.',
    level: 'Débutant',
    category: 'Prononciation',
    modelText: 'Bonjour, je suis enchanté de vous rencontrer.',
  },
  {
    id: 'm1-s2-2',
    moduleId: '01',
    moduleTitle: 'Les salutations',
    stepId: '2',
    stepTitle: 'Se présenter',
    title: 'Dire sa profession',
    description: 'Indiquez votre métier avec la bonne intonation.',
    level: 'Débutant',
    category: 'Prononciation',
    modelText: 'Je travaille comme ingénieur à Paris.',
  },
  // Module 01 - Step 3
  {
    id: 'm1-s3-1',
    moduleId: '01',
    moduleTitle: 'Les salutations',
    stepId: '3',
    stepTitle: 'Parler de son entourage proche',
    title: 'Présenter sa famille',
    description: 'Apprenez à présenter les membres de votre famille.',
    level: 'Débutant',
    category: 'Prononciation',
    modelText: 'Voici ma femme et mes deux enfants.',
  },
  // Module 01 - Step 4
  {
    id: 'm1-s4-1',
    moduleId: '01',
    moduleTitle: 'Les salutations',
    stepId: '4',
    stepTitle: 'Dire son origine',
    title: 'Indiquer son pays',
    description: 'Dites d\'où vous venez avec fierté.',
    level: 'Débutant',
    category: 'Prononciation',
    modelText: 'Je viens du Sénégal, je suis né à Dakar.',
  },
  // Video-based exercises
  {
    id: 'v1',
    title: 'Commander un café',
    description: 'Regardez la situation et reproduisez la commande polie du client.',
    level: 'Débutant',
    category: 'Vocabulaire',
    modelText: 'Bonjour, je voudrais un café crème et un croissant, s\'il vous plaît.',
    videoUrl: 'https://www.youtube.com/embed/6_6z_7_8_90', // Placeholder, using a generic structure
  },
  {
    id: 'v2',
    title: 'Demander son chemin',
    description: 'Écoutez comment le touriste demande la direction et pratiquez la phrase.',
    level: 'Débutant',
    category: 'Vocabulaire',
    modelText: 'Excusez-moi, est-ce que vous pouvez me dire où se trouve la station de métro la plus proche ?',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', // Placeholder
  },
  {
    id: '1',
    title: 'Les voyelles nasales',
    description: 'Pratiquez la distinction entre "an", "in" et "on" dans des phrases courantes.',
    level: 'Débutant',
    category: 'Prononciation',
    modelText: 'Un bon vin blanc se boit avec du pain et du jambon.',
  },
  {
    id: '2',
    title: 'L\'intonation expressive',
    description: 'Apprenez à varier votre ton pour exprimer la surprise ou l\'enthousiasme.',
    level: 'Intermédiaire',
    category: 'Intonation',
    modelText: 'Oh là là ! Je n\'arrive pas à croire que nous avons enfin réussi ce projet !',
  },
  {
    id: '3',
    title: 'Argumentation rapide',
    description: 'Présentez un argument court de manière fluide et convaincante.',
    level: 'Avancé',
    category: 'Débat',
    modelText: 'À mon sens, la technologie doit rester au service de l\'humain et non l\'inverse.',
  },
  {
    id: '4',
    title: 'Le "R" français',
    description: 'Maîtrisez le son "R" guttural avec des mots simples.',
    level: 'Débutant',
    category: 'Prononciation',
    modelText: 'Regarde cette rose rouge dans le jardin de la rue Rivoli.',
  }
];

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('auth_token') === 'true';
  });
  const [showLoginOverlay, setShowLoginOverlay] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'chat' | 'reading' | 'comprehension' | 'tcf-printable' | 'training-selection' | 'audio-extracts'>('reading');
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [history, setHistory] = useState<ExerciseHistoryEntry[]>([
    {
      id: 'h1',
      exerciseId: '1',
      exerciseTitle: 'Les voyelles nasales',
      score: 85,
      date: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: 'h2',
      exerciseId: '4',
      exerciseTitle: 'Le "R" français',
      score: 62,
      date: new Date(Date.now() - 172800000).toISOString(),
    }
  ]);

  const addToHistory = (score: number) => {
    if (!selectedExercise) return;
    
    const newEntry: ExerciseHistoryEntry = {
      id: Math.random().toString(36).substr(2, 9),
      exerciseId: selectedExercise.id,
      exerciseTitle: selectedExercise.title,
      score,
      date: new Date().toISOString(),
    };
    
    setHistory(prev => [newEntry, ...prev]);
  };

  const handleLogin = (code: string) => {
    setIsAuthenticated(true);
    localStorage.setItem('auth_token', 'true');
    setShowLoginOverlay(false);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('auth_token');
  };

  const protectedAction = (action: () => void) => {
    if (isAuthenticated) {
      action();
    } else {
      alert("Veuillez vous connecter pour accéder à ce contenu.");
      // The login view will be shown automatically because isAuthenticated is false
    }
  };

  const navItems = [
    { id: 'reading', label: 'Atelier Lecture', icon: BookOpen },
    { id: 'comprehension', label: 'Compréhension', icon: Sparkles },
    { id: 'chat', label: 'Échange Direct', icon: MessageSquare },
    { id: 'dashboard', label: 'Accueil', icon: LayoutDashboard },
  ];

  if (selectedExercise) {
    return (
      <ExerciseView 
        exercise={selectedExercise} 
        onBack={() => setSelectedExercise(null)} 
        onComplete={addToHistory}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col items-center gap-6">
          <div className="flex items-center justify-center cursor-pointer transition-opacity hover:opacity-80" onClick={() => setActiveTab('dashboard')}>
            <span className="text-3xl md:text-5xl font-black text-blue-950 tracking-tighter">Communiquer2.0</span>
          </div>

          <div className="w-full flex items-center justify-between md:justify-center gap-4">
            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-2 lg:gap-4">
              {navItems.map((item) => (
                <Button 
                  key={item.id}
                  variant={activeTab === item.id ? 'secondary' : 'ghost'} 
                  className={cn(
                    "gap-2 font-bold transition-all px-4 h-11",
                    activeTab === item.id ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50/50'
                  )}
                  onClick={() => setActiveTab(item.id as any)}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Button>
              ))}
              <div className="w-px h-6 bg-slate-200 mx-2" />
              {isAuthenticated ? (
                <Button 
                  variant="ghost" 
                  onClick={handleLogout}
                  className="text-slate-600 font-bold hover:text-red-600 hover:bg-red-50 h-11 gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Quitter
                </Button>
              ) : (
                <Button 
                  className="bg-blue-600 hover:bg-blue-700 font-bold shadow-lg shadow-blue-500/20 h-11"
                  onClick={() => setShowLoginOverlay(true)}
                >
                  Se connecter
                </Button>
              )}
            </nav>

            {/* Mobile Actions (Login/Logout) */}
            <div className="md:hidden flex items-center gap-2">
              {isAuthenticated ? (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleLogout}
                  className="text-slate-600 font-bold hover:text-red-600 hover:bg-red-50 h-9"
                >
                  <X className="w-4 h-4 mr-1" />
                  Quitter
                </Button>
              ) : (
                <Button 
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 font-bold shadow-lg shadow-blue-500/20 h-9"
                  onClick={() => setShowLoginOverlay(true)}
                >
                  Connexion
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8 md:py-16 pb-32 md:pb-16 space-y-12 md:space-y-24">
        {showLoginOverlay || (activeTab === 'chat' && !isAuthenticated) ? (
          <div className="mt-8">
            <Button 
              variant="ghost" 
              onClick={() => setShowLoginOverlay(false)} 
              className="mb-4 text-slate-500 hover:text-blue-600"
            >
              <X className="w-4 h-4 mr-2" /> Retour
            </Button>
            <Login onLogin={handleLogin} />
          </div>
        ) : activeTab === 'reading' ? (
          <ReadingWorkshop />
        ) : activeTab === 'comprehension' ? (
          <WrittenComprehension />
        ) : activeTab === 'chat' ? (
          <DirectExchange />
        ) : activeTab === 'training-selection' ? (
          <div className="max-w-4xl mx-auto space-y-12 py-8 px-4">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                onClick={() => setActiveTab('dashboard')} 
                className="text-slate-500 hover:text-blue-600 font-bold"
              >
                <X className="w-5 h-5 mr-2" /> Retour
              </Button>
            </div>

            <div className="text-center space-y-6">
              <div className="w-20 h-20 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-sm">
                <Sparkles className="w-10 h-10" />
              </div>
              <div className="space-y-2">
                <h3 className="text-3xl font-black text-slate-900 tracking-tight">Espace d'entraînement</h3>
                <p className="text-slate-500 text-lg font-medium">Choisissez votre mode d'entraînement</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-64 md:h-80">
              <Button 
                className="h-full rounded-[2.5rem] bg-blue-600 hover:bg-blue-700 text-2xl font-black flex flex-col gap-4 shadow-xl shadow-blue-500/20"
                onClick={() => setActiveTab('tcf-printable')}
              >
                <BookOpen className="w-12 h-12" />
                Livrets PDF
              </Button>
              <Button 
                className="h-full rounded-[2.5rem] bg-blue-500 hover:bg-blue-600 text-2xl font-black flex flex-col gap-4 shadow-xl shadow-blue-500/20"
                onClick={() => setActiveTab('audio-extracts')}
              >
                <Mic2 className="w-12 h-12" />
                extraits sonores
              </Button>
            </div>
          </div>
        ) : activeTab === 'audio-extracts' ? (
          <AudioExtracts onBack={() => setActiveTab('training-selection')} />
        ) : activeTab === 'tcf-printable' ? (
          <div className="max-w-4xl mx-auto space-y-12 py-8 px-4">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                onClick={() => setActiveTab('training-selection')} 
                className="text-slate-500 hover:text-blue-600 font-bold"
              >
                <X className="w-5 h-5 mr-2" /> Retour
              </Button>
            </div>

            <div className="text-center space-y-6">
              <div className="w-20 h-20 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-sm">
                <Award className="w-10 h-10" />
              </div>
              <div className="space-y-2">
                <h3 className="text-3xl font-black text-slate-900 tracking-tight">TCF Imprimable</h3>
                <p className="text-slate-500 text-lg font-medium">
                  Accédez aux livrets d'entraînement. Si vous avez chargé vos fichiers PDF dans le dossier "public", ils apparaîtront ici.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Array.from({ length: 14 }, (_, i) => (
                <Card key={i} className="group hover:shadow-lg transition-all border-slate-100 hover:border-blue-100 rounded-3xl overflow-hidden bg-white">
                  <CardContent className="p-6 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 flex items-center justify-center transition-colors">
                        <Download className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 leading-none">Livret n°{i + 1}</h4>
                        <p className="text-xs text-slate-500 mt-1 font-medium">Entraînement TCF</p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <a 
                        href={assetUrl(`/livret-${i + 1}.pdf`)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-900 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors"
                      >
                        PDF
                      </a>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <div className="p-10 bg-amber-50 border-2 border-dashed border-amber-200 rounded-[2.5rem] text-center space-y-4">
              <h4 className="text-xl font-bold text-amber-900">Note Technique</h4>
              <p className="text-amber-800 font-medium max-w-2xl mx-auto">
                Pour que les boutons "PDF" fonctionnent, veuillez vous assurer que vos fichiers sont nommés <code className="bg-white px-2 py-1 rounded">livret-1.pdf</code>, <code className="bg-white px-2 py-1 rounded">livret-2.pdf</code>, etc. et qu'ils sont placés dans le dossier <code className="bg-white px-2 py-1 rounded">public</code> de l'application.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Hero Section */}
            <section className="relative overflow-hidden rounded-[2.5rem] bg-slate-900 text-white p-8 sm:p-12 lg:p-20">
              {/* Background Decoration */}
              <div className="absolute inset-0 z-0">
                <img 
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=2071" 
                  alt="Background" 
                  className="w-full h-full object-cover opacity-10 md:opacity-20 transition-transform duration-1000 md:group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900/90 to-transparent" />
              </div>

              <div className="relative z-10 max-w-3xl space-y-8 md:space-y-10">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-bold uppercase tracking-[0.15em]"
                >
                  <Sparkles className="w-4 h-4" />
                  Expertise Pédagogique
                </motion.div>
                
                <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight">
                  L'excellence <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">en communication orale</span> <br />
                  <span className="text-2xl md:text-4xl font-bold text-slate-400 block mt-4 border-l-4 border-blue-600 pl-4">depuis +12 ans</span>
                </h2>
                
                <p className="text-slate-400 text-lg md:text-xl lg:text-2xl leading-relaxed max-w-2xl font-medium">
                  Maîtrisez l'art de la prise de parole avec des outils interactifs, des modèles réels et une IA de correction instantanée.
                </p>
                
                <div className="flex flex-col sm:flex-row flex-wrap gap-4 pt-4 md:pt-8">
                  <Button 
                    size="lg" 
                    className="bg-blue-600 hover:bg-blue-700 text-lg md:text-xl h-14 md:h-16 px-8 md:px-10 gap-3 rounded-2xl shadow-xl shadow-blue-500/30 transition-all hover:-translate-y-1 active:translate-y-0"
                    onClick={() => {
                      setActiveTab('training-selection');
                    }}
                  >
                    <Sparkles className="w-6 h-6" />
                    Je m'entraîne
                  </Button>
                  <Button 
                    size="lg" 
                    className="bg-blue-600 hover:bg-blue-700 text-lg md:text-xl h-14 md:h-16 px-8 md:px-10 gap-3 rounded-2xl shadow-xl shadow-blue-500/30 transition-all hover:-translate-y-1 active:translate-y-0"
                    onClick={() => {
                      if (isAuthenticated) {
                        window.open('https://apprendre.tv5monde.com/fr/exercices/premiere-classe', '_blank');
                      } else {
                        setShowLoginOverlay(true);
                      }
                    }}
                  >
                    <Play className="w-6 h-6 fill-current" />
                    Ma classe virtuelle
                  </Button>
                  <Button 
                    variant="outline"
                    size="lg" 
                    className="bg-white/5 border-white/10 hover:bg-white/10 text-white text-lg md:text-xl h-14 md:h-16 px-8 md:px-10 gap-3 rounded-2xl backdrop-blur-md transition-all hover:bg-white/15"
                    onClick={() => {
                      if (isAuthenticated) {
                        window.open('https://apprendre.tv5monde.com/fr/tcf/simulation-du-tcf', '_blank');
                      } else {
                        setShowLoginOverlay(true);
                      }
                    }}
                  >
                    <Award className="w-6 h-6" />
                    TCF en ligne
                  </Button>
                  <Button 
                    variant="ghost"
                    size="lg" 
                    className="text-slate-400 hover:text-white hover:bg-white/5 text-lg h-14 md:h-16 px-6 gap-3 rounded-2xl transition-all"
                    onClick={() => {
                      if (isAuthenticated) {
                        window.open(assetUrl('/fiche-auto-evaluation.html'), '_blank');
                      } else {
                        setShowLoginOverlay(true);
                      }
                    }}
                  >
                    <ClipboardCheck className="w-5 h-5" />
                    Auto-évaluation
                  </Button>
                </div>
              </div>
              
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-3/4 h-full bg-gradient-to-l from-blue-600/5 to-transparent hidden lg:block" />
              <Mic2 className="absolute -bottom-10 -right-10 w-64 h-64 md:w-96 md:h-96 text-white/5 rotate-12 hidden sm:block" />
            </section>

            {/* Stats / Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
              <div className="lg:col-span-2 grid grid-cols-2 gap-4 md:gap-8">
                {[
                  { icon: TrendingUp, label: "Progrès moyens", value: "85%", color: "text-green-500", bg: "bg-green-50/50" },
                  { icon: BookOpen, label: "Exercices", value: "120+", color: "text-blue-500", bg: "bg-blue-50/50" },
                  { icon: Award, label: "Badges", value: "12", color: "text-amber-500", bg: "bg-amber-50/50" },
                  { icon: Users, label: "Apprenants", value: "2.4k", color: "text-purple-500", bg: "bg-purple-50/50" },
                ].map((stat, i) => (
                  <Card key={i} className="border-none shadow-sm bg-white overflow-hidden group hover:shadow-xl hover:shadow-slate-200/50 transition-all rounded-[2rem]">
                    <CardContent className="p-6 md:p-8 flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-6">
                      <div className={cn("p-5 rounded-2xl transition-transform group-hover:scale-110 group-hover:rotate-6", stat.bg, stat.color)}>
                        <stat.icon className="w-8 h-8 md:w-10 md:h-10" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs md:text-sm text-slate-500 font-black uppercase tracking-widest leading-none">{stat.label}</p>
                        <p className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter">{stat.value}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className="lg:col-span-1">
                <ExerciseHistory history={history} />
              </div>
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-8 md:py-12 mt-16 pb-32 md:pb-12">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="flex flex-col items-center md:items-start gap-4 text-center md:text-left">
            <span className="text-3xl font-black text-blue-950 tracking-tighter">Communiquer2.0</span>
            <p className="text-slate-500 text-base md:text-lg max-w-sm font-medium leading-relaxed">
              La plateforme innovante pour transformer votre communication orale grâce à la puissance de l'IA pédagogique.
            </p>
          </div>
          <div className="flex flex-col items-center md:items-end gap-6 border-t md:border-t-0 pt-8 md:pt-0 border-slate-100">
            <div className="flex gap-8 text-slate-600 font-bold">
              <a href="#" className="hover:text-blue-600 transition-colors">À propos</a>
              <a href="#" className="hover:text-blue-600 transition-colors">Aide</a>
              <a href="#" className="hover:text-blue-600 transition-colors">Contact</a>
            </div>
            <div className="flex flex-col items-center md:items-end gap-1">
              <p className="text-slate-400 text-sm font-medium">© 2024 Communiquer2.0. Tous droits réservés.</p>
              <p className="text-slate-300 text-[10px] uppercase tracking-widest font-bold">Plateforme IA pédagogique</p>
            </div>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-t border-slate-200 px-2 py-2 pb-safe flex items-center justify-around shadow-[0_-8px_30px_rgb(0,0,0,0.04)]">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id as any)}
            className={cn(
              "relative flex flex-col items-center gap-1 py-1 flex-1 transition-all rounded-xl",
              activeTab === item.id ? "text-blue-600" : "text-slate-400 hover:text-slate-600"
            )}
          >
            <div className={cn(
              "p-1.5 rounded-lg transition-all duration-300",
              activeTab === item.id ? "bg-blue-50" : "bg-transparent"
            )}>
              <item.icon className={cn("w-5 h-5", activeTab === item.id && "fill-blue-600/10")} />
            </div>
            <span className="text-[9px] font-bold uppercase tracking-tight text-center">{item.label}</span>
            {activeTab === item.id && (
              <motion.div 
                layoutId="activeTabIndicator" 
                className="absolute -top-2 w-10 h-1 bg-blue-600 rounded-full"
                transition={{ type: "spring", bounce: 0.3, duration: 0.6 }}
              />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
