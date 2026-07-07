import React, { useState, useEffect } from 'react';
import { Exercise, Feedback } from '../types';
import { AudioRecorder } from './AudioRecorder';
import { analyzeOralPerformance, textToSpeech } from '../services/gemini';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { CheckCircle2, AlertCircle, ArrowLeft, PlayCircle, Mic, Volume2, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';

interface ExerciseViewProps {
  exercise: Exercise;
  onBack: () => void;
  onComplete: (score: number) => void;
}

export const ExerciseView: React.FC<ExerciseViewProps> = ({ exercise, onBack, onComplete }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGeneratingSpeech, setIsGeneratingSpeech] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);



  const playTTS = async () => {
    if (isGeneratingSpeech) return;
    setIsGeneratingSpeech(true);
    try {
      const base64 = await textToSpeech(exercise.modelText);
      const binaryString = window.atob(base64);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      const audioBuffer = audioContext.createBuffer(1, len / 2, 24000);
      const channelData = audioBuffer.getChannelData(0);
      
      const int16Data = new Int16Array(bytes.buffer);
      for (let i = 0; i < int16Data.length; i++) {
        channelData[i] = int16Data[i] / 32768;
      }
      
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      source.start();
    } catch (error) {
      console.error("TTS Error:", error);
    } finally {
      setIsGeneratingSpeech(false);
    }
  };

  const handleRecordingComplete = async (base64Audio: string) => {
    setIsAnalyzing(true);
    try {
      const result = await analyzeOralPerformance(base64Audio, exercise.modelText);
      setFeedback(result);
      onComplete(result.score);
    } catch (error) {
      console.error(error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <Button variant="ghost" onClick={onBack} className="mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Retour aux exercices
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card className="overflow-hidden border-none shadow-xl bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-slate-900 text-white">
              <div className="flex justify-between items-start">
                <div>
                  <Badge variant="outline" className="text-blue-400 border-blue-400 mb-2">
                    {exercise.category}
                  </Badge>
                  <CardTitle className="text-2xl font-bold">{exercise.title}</CardTitle>
                </div>
                <Badge className="bg-blue-600">{exercise.level}</Badge>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {exercise.videoUrl && (
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                    <PlayCircle className="w-4 h-4" />
                    Situation de communication
                  </h3>
                  <div className="aspect-video rounded-2xl overflow-hidden bg-slate-900 shadow-lg">
                    <iframe
                      src={exercise.videoUrl.replace('watch?v=', 'embed/')}
                      title="Situation de communication"
                      className="w-full h-full border-none"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                  <Separator />
                </div>
              )}

              <div className="space-y-2">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Instructions</h3>
                <p className="text-slate-700 leading-relaxed">{exercise.description}</p>
              </div>

              <div className="p-6 bg-blue-50 rounded-xl border border-blue-100 relative group">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-blue-600 flex items-center gap-2">
                    <PlayCircle className="w-4 h-4" />
                    Modèle à reproduire
                  </h3>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={playTTS}
                    disabled={isGeneratingSpeech}
                    className="bg-white border-blue-200 text-blue-600 hover:bg-blue-50"
                  >
                    {isGeneratingSpeech ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <Volume2 className="w-4 h-4 mr-2" />
                    )}
                    Écouter le modèle
                  </Button>
                </div>
                <p className="text-xl font-medium text-slate-800 italic leading-snug">
                  "{exercise.modelText}"
                </p>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Votre enregistrement</h3>
                <AudioRecorder 
                  onRecordingComplete={handleRecordingComplete} 
                  isAnalyzing={isAnalyzing} 
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <AnimatePresence mode="wait">
            {isAnalyzing ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full flex flex-col items-center justify-center p-12 text-center space-y-4 bg-blue-50/50 rounded-3xl border-2 border-dashed border-blue-200"
              >
                <div className="relative">
                  <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                  <Mic className="w-8 h-8 text-blue-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-blue-900">Analyse en cours...</h3>
                  <p className="text-blue-600/70 text-sm">
                    L'IA pédagogique écoute votre enregistrement pour vous donner des conseils personnalisés.
                  </p>
                </div>
              </motion.div>
            ) : feedback ? (
              <motion.div
                key="feedback"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <Card className="border-none shadow-xl bg-white overflow-hidden">
                  <div className="h-2 bg-blue-600 w-full" />
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-bold flex items-center justify-between">
                      Score Global
                      <span className="text-3xl font-black text-blue-600">{feedback.score}%</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Progress value={feedback.score} className="h-3 bg-slate-100" />
                    
                    {feedback.transcription && (
                      <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-100">
                        <p className="text-xs font-semibold text-slate-400 uppercase mb-1">Transcription</p>
                        <p className="text-sm text-slate-600 italic">"{feedback.transcription}"</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="border-none shadow-xl bg-green-50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-bold text-green-700 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      Points Forts
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="text-sm space-y-1 text-green-800">
                      {feedback.strengths.map((s, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="mt-1.5 w-1.5 h-1.5 bg-green-500 rounded-full shrink-0" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-xl bg-amber-50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-bold text-amber-700 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      À Améliorer
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="text-sm space-y-1 text-amber-800">
                      {feedback.improvements.map((s, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="mt-1.5 w-1.5 h-1.5 bg-amber-500 rounded-full shrink-0" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-xl bg-white">
                  <CardHeader>
                    <CardTitle className="text-sm font-bold">Analyse Détaillée</CardTitle>
                  </CardHeader>
                  <CardContent className="prose prose-sm max-w-none text-slate-600">
                    <ReactMarkdown>{feedback.detailedAnalysis}</ReactMarkdown>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <Card className="border-none shadow-xl bg-slate-50 border-2 border-dashed h-full flex items-center justify-center p-12 text-center">
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-slate-200 rounded-full mx-auto flex items-center justify-center">
                    <Mic className="w-8 h-8 text-slate-400" />
                  </div>
                  <p className="text-slate-400 font-medium">
                    Enregistrez-vous pour recevoir une analyse personnalisée par l'IA.
                  </p>
                </div>
              </Card>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
