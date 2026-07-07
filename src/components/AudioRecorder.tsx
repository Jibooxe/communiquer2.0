import React, { useState, useRef, useEffect } from 'react';
import WaveSurfer from 'wavesurfer.js';
import { Mic, Square, Play, RotateCcw, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface AudioRecorderProps {
  onRecordingComplete: (base64Audio: string) => void;
  isAnalyzing: boolean;
}

export const AudioRecorder: React.FC<AudioRecorderProps> = ({ onRecordingComplete, isAnalyzing }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [permissionState, setPermissionState] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  const [recordingError, setRecordingError] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const waveformRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const timerRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  useEffect(() => {
    // Check permission status on mount
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'microphone' as PermissionName }).then((result) => {
        // To prevent false-positives under iframes, we only mark as granted if explicitly granted.
        if (result.state === 'granted') {
          setPermissionState('granted');
        } else {
          setPermissionState('prompt');
        }
        result.onchange = () => {
          if (result.state === 'granted') {
            setPermissionState('granted');
          } else if (result.state === 'denied') {
            setPermissionState('denied');
          } else {
            setPermissionState('prompt');
          }
        };
      }).catch(() => {
        // Fallback for browsers/contexts that don't support permission query
        setPermissionState('prompt');
      });
    }

    if (waveformRef.current && !wavesurferRef.current) {
      wavesurferRef.current = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: '#d1d5db',
        progressColor: '#3b82f6',
        cursorColor: '#3b82f6',
        barWidth: 3,
        barRadius: 4,
        height: 80,
      });
    }

    return () => {
      if (wavesurferRef.current) {
        wavesurferRef.current.destroy();
        wavesurferRef.current = null;
      }
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  const drawLiveWaveform = (analyser: AnalyserNode) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      if (!isRecording) return;
      animationFrameRef.current = requestAnimationFrame(draw);

      analyser.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const barWidth = (canvas.width / bufferLength) * 2.5;
      let barHeight;
      let x = 0;

      for(let i = 0; i < bufferLength; i++) {
        barHeight = (dataArray[i] / 255) * canvas.height;

        // Gradient for a modern look
        const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
        gradient.addColorStop(0, '#3b82f6');
        gradient.addColorStop(1, '#60a5fa');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

        x += barWidth + 1;
      }
    };

    draw();
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setPermissionState('granted');
      
      // Web Audio setup for live viz
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        
        if (wavesurferRef.current) {
          wavesurferRef.current.load(url);
        }

        // Convert to base64 for Gemini
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64data = reader.result as string;
          const base64Content = base64data.split(',')[1];
          onRecordingComplete(base64Content);
        };
        
        audioCtx.close();
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setDuration(0);
      drawLiveWaveform(analyser);
      
      timerRef.current = window.setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);

    } catch (err: any) {
      console.error("Error accessing microphone:", err);
      setPermissionState('denied');
      setRecordingError(err.message || String(err));
      // Provide user-friendly feedback instead of generic alert
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      if (timerRef.current) window.clearInterval(timerRef.current);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    }
  };

  const resetRecording = () => {
    setAudioUrl(null);
    setDuration(0);
    if (wavesurferRef.current) {
      wavesurferRef.current.empty();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="p-4 md:p-8 bg-white border-2 border-slate-100 shadow-xl rounded-[2rem] overflow-hidden relative">
      <div className="absolute top-0 right-0 p-4">
        {isRecording && (
          <div className="flex items-center gap-2 px-3 py-1 bg-red-50 text-red-600 rounded-full text-xs font-bold animate-pulse">
            <span className="w-2 h-2 bg-red-500 rounded-full" />
            LIVE
          </div>
        )}
      </div>

      <div className="flex flex-col items-center gap-8">
        <div className="w-full relative min-h-[100px] flex items-center justify-center bg-slate-50/50 rounded-2xl p-4">
          {/* Static Waveform (After recording) */}
          <div 
            ref={waveformRef} 
            className={`w-full ${audioUrl && !isRecording ? 'block' : 'hidden'}`} 
          />
          
          {/* Live Animation (During recording) */}
          <canvas 
            ref={canvasRef}
            className={`w-full h-20 ${isRecording ? 'block' : 'hidden'}`}
            width={600}
            height={80}
          />

          {!audioUrl && !isRecording && (
            <div className="text-slate-300 flex flex-col items-center gap-2">
              {permissionState === 'denied' ? (
                <>
                  <div className="bg-red-50 p-3 rounded-full mb-1 border border-red-100 animate-pulse">
                    <Mic className="w-8 h-8 text-red-500 opacity-80" />
                  </div>
                  <span className="text-xs font-bold text-red-500 uppercase tracking-widest text-center px-4">Microphone bloqué</span>
                  {recordingError && (
                    <div className="text-[10px] bg-red-100/60 text-red-700 px-3 py-1.5 rounded-lg border border-red-200 font-mono max-w-[260px] text-center break-words select-all">
                      Code : {recordingError}
                    </div>
                  )}
                  <div className="text-[10px] text-slate-500 max-w-[280px] text-center mb-2 space-y-1">
                    <p>Veuillez autoriser l'accès dans les paramètres de votre navigateur (cliquez sur le petit cadenas à côté de l'adresse).</p>
                    <p className="text-purple-600 font-semibold bg-purple-50 p-2 rounded-lg border border-purple-100 mt-2">
                      💡 <b>Astuce :</b> Si l'application est ouverte dans un aperçu intégré ou une iframe, ouvrez-la dans un nouvel onglet pour éviter les restrictions du navigateur sur le micro.
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={startRecording}
                    className="text-[10px] h-7 px-3 border-slate-200 text-slate-700 hover:bg-slate-50 mt-1"
                  >
                    Réessayer
                  </Button>
                </>
              ) : (
                <>
                  <Mic className="w-8 h-8 opacity-20" />
                  <span className="text-xs font-medium uppercase tracking-widest">Prêt à enregistrer</span>
                </>
              )}
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-6">
          {!isRecording && !audioUrl && (
            <Button 
              onClick={startRecording} 
              className="rounded-full w-20 h-20 shadow-2xl transition-all hover:scale-110 active:scale-95 group bg-red-500 hover:bg-red-600"
              disabled={isAnalyzing}
            >
              <Mic className="w-10 h-10 text-white group-hover:scale-110 transition-transform" />
            </Button>
          )}

          {isRecording && (
            <Button 
              onClick={stopRecording} 
              className="rounded-full w-20 h-20 bg-slate-900 shadow-2xl animate-pulse transition-all hover:scale-105"
            >
              <Square className="w-8 h-8 text-white" />
            </Button>
          )}

          {audioUrl && !isRecording && (
            <div className="flex gap-4">
              <Button 
                variant="outline" 
                onClick={() => wavesurferRef.current?.playPause()}
                className="rounded-full w-16 h-16 border-2 border-indigo-100 text-indigo-600 hover:bg-indigo-50 shadow-lg"
              >
                <Play className="w-8 h-8" />
              </Button>
              <Button 
                variant="ghost" 
                onClick={resetRecording}
                className="rounded-full w-16 h-16 text-slate-400 hover:text-red-500 hover:bg-red-50"
                disabled={isAnalyzing}
              >
                <RotateCcw className="w-8 h-8" />
              </Button>
            </div>
          )}
        </div>

        <div className="text-sm font-mono text-slate-500">
          {isRecording ? (
            <span className="text-red-500 flex items-center gap-2">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
              Enregistrement... {formatTime(duration)}
            </span>
          ) : audioUrl ? (
            <span>Prêt pour l'analyse</span>
          ) : (
            <span>Appuyez sur le micro pour commencer</span>
          )}
        </div>

        {isAnalyzing && (
          <div className="flex items-center gap-2 text-blue-600 font-medium animate-pulse">
            <Loader2 className="w-4 h-4 animate-spin" />
            Analyse par l'IA en cours...
          </div>
        )}
      </div>
    </Card>
  );
};
