import React, { useState, useRef, useEffect } from 'react';
import { DirectExchangeTheme, ChatMessage } from '../types';
import { getDirectExchangeResponse } from '../services/gemini';
import { speak, stop } from '../lib/tts';
import { AudioRecorder } from './AudioRecorder';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  MessageSquare, 
  Send, 
  Sparkles, 
  AlertCircle, 
  History, 
  Coffee, 
  Home, 
  Briefcase, 
  Stethoscope, 
  Plane, 
  Umbrella,
  Loader2,
  CheckCircle2,
  User,
  Bot,
  Mic,
  Volume2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';

const CHAT_THEMES: DirectExchangeTheme[] = [
  { id: '1', title: 'Les salutations', icon: 'Coffee', description: 'Apprendre à saluer et socialiser.' },
  { id: '2', title: 'Les loisirs', icon: 'Umbrella', description: 'Parler de ses passions et du temps libre.' },
  { id: '3', title: 'Le logement', icon: 'Home', description: 'Décrire son chez-soi et son quartier.' },
  { id: '4', title: 'Les repas', icon: 'Coffee', description: 'Manger au restaurant ou commander.' },
  { id: '5', title: 'Le travail', icon: 'Briefcase', description: 'Le monde professionnel et les carrières.' },
  { id: '6', title: 'La santé', icon: 'Stethoscope', description: 'Prendre rendez-vous et expliquer ses maux.' },
  { id: '7', title: 'Les voyages', icon: 'Plane', description: 'Partir à l\'aventure et se déplacer.' }
];

const IconComponent = ({ name, className }: { name: string, className?: string }) => {
  switch (name) {
    case 'Coffee': return <Coffee className={className} />;
    case 'Umbrella': return <Umbrella className={className} />;
    case 'Home': return <Home className={className} />;
    case 'Briefcase': return <Briefcase className={className} />;
    case 'Stethoscope': return <Stethoscope className={className} />;
    case 'Plane': return <Plane className={className} />;
    default: return <MessageSquare className={className} />;
  }
};

export const DirectExchange: React.FC = () => {
  const [selectedTheme, setSelectedTheme] = useState<DirectExchangeTheme | null>(() => {
    const savedId = localStorage.getItem('active_theme_id');
    if (savedId) {
      return CHAT_THEMES.find(t => t.id === savedId) || null;
    }
    return null;
  });
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('chat_messages');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  });
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedTheme) {
      localStorage.setItem('active_theme_id', selectedTheme.id);
    } else {
      localStorage.removeItem('active_theme_id');
    }
  }, [selectedTheme]);

  useEffect(() => {
    localStorage.setItem('chat_messages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages, isLoading]);

  const playResponse = (text: string) => {
    setIsSpeaking(true);
    // Use the optimized speak function from tts.ts
    // We don't await because we want the UI to be responsive immediately
    speak(text).finally(() => setIsSpeaking(false));
  };

  const handleSendMessage = async (audioBase64?: string, text?: string) => {
    const userMessageContent = text || input.trim();
    if (!userMessageContent && !audioBase64) return;
    if (!selectedTheme || isLoading) return;

    setInput('');
    
    // UI: Add a temporary user message if it's audio (will be updated with transcription)
    const userMsg: ChatMessage = { 
      role: 'user', 
      content: userMessageContent || "..." // Placeholder if audio
    };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }));
      const result = await getDirectExchangeResponse(
        selectedTheme.title, 
        history, 
        audioBase64, 
        userMessageContent
      );
      
      // Update the user message with transcription if needed
      if (result.transcription) {
        setMessages(prev => {
          const newMessages = [...prev];
          const lastMsg = newMessages[newMessages.length - 1];
          if (lastMsg && lastMsg.role === 'user') {
            lastMsg.content = result.transcription;
          }
          return newMessages;
        });
      }

      const aiMsg: ChatMessage = { 
        role: 'model', 
        content: result.reply,
        corrections: result.corrections,
        recommendations: result.recommendations
      };
      
      setMessages(prev => [...prev, aiMsg]);
      setIsLoading(false); // Move this UP to show message early
      
      // AUTO-PLAY VOICE RESPONSE
      playResponse(result.reply);

    } catch (error) {
      console.error("Chat error:", error);
      setIsLoading(false);
    }
  };

  if (!selectedTheme) {
    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest animate-pulse">
            <Mic className="w-4 h-4" />
            Espace 100% Vocal
          </div>
          <h2 className="text-4xl font-black text-slate-900 leading-tight">Conversation Orale IA</h2>
          <p className="text-slate-500 text-lg">
            Parlez directement avec votre tuteur IA. Exprimez-vous à voix haute, écoutez ses réponses et progressez grâce à ses corrections personnalisées.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-4">
          {CHAT_THEMES.map((theme) => (
            <motion.div
              key={theme.id}
              whileHover={{ y: -8, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
              onClick={() => setSelectedTheme(theme)}
            >
              <Card className="group h-full cursor-pointer border-none shadow-md hover:shadow-2xl transition-all duration-300 bg-white overflow-hidden text-left">
                <div className="h-2 bg-gradient-to-r from-purple-600 to-indigo-600 w-full" />
                <CardHeader className="p-6">
                  <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors duration-300 mb-4 shadow-inner">
                    <IconComponent name={theme.icon} className="w-6 h-6" />
                  </div>
                  <CardTitle className="text-xl font-bold group-hover:text-purple-600 transition-colors">
                    {theme.title}
                  </CardTitle>
                  <CardDescription className="text-slate-500 mt-2 line-clamp-2">
                    {theme.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:h-[750px] items-stretch">
        
        {/* Chat Area */}
        <div className="lg:col-span-8 flex flex-col space-y-4">
          <Card className="flex-1 flex flex-col border-none shadow-2xl bg-white overflow-hidden rounded-[2rem]">
            <CardHeader className="bg-slate-900 text-white p-6 flex flex-row items-center justify-between">
              <div className="flex items-center gap-4">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => {
                    stop(); // Stop any playing audio
                    setSelectedTheme(null);
                    setMessages([]);
                  }}
                  className="text-white hover:bg-white/10"
                >
                  <History className="w-5 h-5" />
                </Button>
                <div>
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <IconComponent name={selectedTheme.icon} className="w-5 h-5 text-purple-400" />
                    {selectedTheme.title}
                  </CardTitle>
                  <p className="text-xs text-slate-400 flex items-center gap-1">
                    <Mic className="w-3 h-3 text-red-400" /> Mode Vocal Actif
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isSpeaking && (
                   <Badge className="bg-blue-600 animate-pulse flex gap-2 items-center">
                     <Volume2 className="w-3 h-3" /> L'IA vous parle
                   </Badge>
                )}
                <Badge className="bg-purple-600 font-bold border-none">Interactif</Badge>
              </div>
            </CardHeader>
            
            <ScrollArea ref={scrollAreaRef} className="flex-1 p-6">
              <div className="space-y-6">
                {messages.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-center p-12 space-y-6 opacity-80">
                    <div className="w-24 h-24 bg-purple-50 rounded-full flex items-center justify-center relative">
                      <div className="absolute inset-0 bg-purple-200 rounded-full animate-ping opacity-20" />
                      <Mic className="w-10 h-10 text-purple-600" />
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-xl font-bold text-slate-900">À vous la parole !</h3>
                      <p className="text-slate-500 max-w-xs mx-auto text-sm">
                        Appuyez sur le micro rouge ci-dessous, <b>attendez que la barre bouge</b>, et commencez à parler. 
                      </p>
                      <div className="flex justify-center gap-2">
                        <Badge variant="outline" className="text-[10px] uppercase font-bold text-slate-400 border-slate-200">
                          1. Appuyer
                        </Badge>
                        <Badge variant="outline" className="text-[10px] uppercase font-bold text-slate-400 border-slate-200">
                          2. Parler
                        </Badge>
                        <Badge variant="outline" className="text-[10px] uppercase font-bold text-slate-400 border-slate-200">
                          3. Terminer
                        </Badge>
                      </div>
                    </div>
                  </div>
                )}
                
                {messages.map((m, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex gap-3 max-w-[85%] ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm ${
                        m.role === 'user' ? 'bg-purple-600 text-white' : 'bg-slate-900 text-white'
                      }`}>
                        {m.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                      </div>
                      <div className={`space-y-1 ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                        <div className={`rounded-2xl p-4 shadow-sm ${
                          m.role === 'user' 
                          ? 'bg-purple-600 text-white rounded-tr-none' 
                          : 'bg-white border border-slate-100 rounded-tl-none'
                        }`}>
                          <p className="text-sm leading-relaxed">{m.content}</p>
                        </div>
                        {i === messages.length - 1 && m.role === 'model' && (
                          <div className="flex flex-col gap-2">
                            {m.corrections && m.corrections.length > 0 && (
                              <motion.div 
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-red-50 border border-red-100 p-3 rounded-xl mt-1 max-w-sm"
                              >
                                <p className="text-[10px] font-black text-red-600 uppercase mb-2 flex items-center gap-1">
                                  <AlertCircle className="w-3 h-3" />
                                  Corrections orales
                                </p>
                                <div className="space-y-1">
                                  {m.corrections.map((c, idx) => (
                                    <p key={idx} className="text-xs text-red-800 flex items-start gap-2">
                                      <span className="mt-1 w-1 h-1 bg-red-400 rounded-full shrink-0" />
                                      {c}
                                    </p>
                                  ))}
                                </div>
                              </motion.div>
                            )}
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => playResponse(m.content)}
                              className="text-slate-400 hover:text-purple-600 size-fit p-1"
                            >
                              <Volume2 className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
                
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="flex gap-3 items-center text-slate-400 italic text-sm">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center animate-pulse">
                        <Bot className="w-4 h-4" />
                      </div>
                      <span>L'IA analyse votre voix...</span>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
            
            <div className="p-4 md:p-8 border-t border-slate-100 bg-white">
              <div className="flex flex-col items-center gap-4">
                <AudioRecorder 
                  onRecordingComplete={(audio) => handleSendMessage(audio)} 
                  isAnalyzing={isLoading}
                />
                <div className="flex items-center gap-4 w-full">
                  <div className="h-px bg-slate-100 flex-1" />
                  <span className="text-[10px] uppercase font-black tracking-widest text-slate-300">Ou par écrit</span>
                  <div className="h-px bg-slate-100 flex-1" />
                </div>
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex items-center gap-2 relative w-full"
                >
                  <Input 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Écrivez votre message..."
                    className="rounded-2xl h-12 pr-12 focus-visible:ring-purple-600 border-slate-200"
                    disabled={isLoading}
                  />
                  <Button 
                    type="submit" 
                    size="icon" 
                    className={`absolute right-1 rounded-xl h-10 w-10 transition-all ${
                      input.trim() ? 'bg-purple-600 hover:bg-purple-700' : 'bg-slate-100 text-slate-400'
                    }`}
                    disabled={!input.trim() || isLoading}
                  >
                    <Send className="w-5 h-5" />
                  </Button>
                </form>
              </div>
            </div>
          </Card>
        </div>

        {/* Info Area */}
        <div className="lg:col-span-4 flex flex-col space-y-4">
          <Card className="flex-1 border-none shadow-xl bg-slate-50 rounded-[2rem] overflow-hidden">
            <CardHeader className="p-6 pb-2">
              <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                Recommandations
              </CardTitle>
            </CardHeader>
            <ScrollArea className="h-full">
              <CardContent className="p-6">
                <AnimatePresence mode="wait">
                  {messages.filter(m => m.role === 'model' && m.recommendations).length > 0 ? (
                    <motion.div 
                      key="recommendations"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="space-y-6"
                    >
                      <div className="prose prose-sm max-w-none text-slate-600">
                        <ReactMarkdown>
                          {messages.filter(m => m.role === 'model' && m.recommendations).slice(-1)[0].recommendations || ""}
                        </ReactMarkdown>
                      </div>
                      
                      <div className="pt-6 border-t border-slate-200">
                         <h5 className="text-xs font-black text-slate-900 uppercase mb-4">Focus Communication</h5>
                         <Badge variant="outline" className="border-purple-200 text-purple-700 bg-purple-50 px-3 py-1 mb-4 w-full justify-center">
                            {selectedTheme.title}
                         </Badge>
                         <p className="text-xs text-slate-500 leading-relaxed italic">
                           "Discuter à voix haute améliore votre fluidité et votre confiance."
                         </p>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4 opacity-50">
                      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                        <CheckCircle2 className="w-6 h-6 text-slate-200" />
                      </div>
                      <p className="text-xs text-slate-400">
                        Après votre première interaction vocale, vous recevrez ici des conseils détaillés.
                      </p>
                    </div>
                  )}
                </AnimatePresence>
              </CardContent>
            </ScrollArea>
          </Card>
        </div>

      </div>
    </div>
  );
};
