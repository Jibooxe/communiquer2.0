import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  SkipBack, 
  SkipForward, 
  Mic2,
  X,
  Music,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import WaveSurfer from 'wavesurfer.js';
import { assetUrl } from '@/lib/assets';

interface AudioFile {
  id: string;
  name: string;
  url: string;
  duration?: string;
  description: string;
}

// Mock list of audio files based on expected structure
// The user should place these files in the public/ folder or public/audio/
const AUDIO_FILES: AudioFile[] = [
  { id: '1', name: 'Extrait n°1', url: assetUrl('/extrait-1.mp3'), duration: '---', description: 'Compréhension orale - Niveau A1' },
  { id: '2', name: 'Extrait n°2', url: assetUrl('/extrait-2.mp3'), duration: '---', description: 'Compréhension orale - Niveau A2' },
  { id: '3', name: 'Extrait n°3', url: assetUrl('/extrait-3.mp3'), duration: '---', description: 'Compréhension orale - Niveau B1' },
  { id: '4', name: 'Extrait n°4', url: assetUrl('/extrait-4.mp3'), duration: '---', description: 'Compréhension orale - Niveau B2' },
  { id: '5', name: 'Extrait n°5', url: assetUrl('/extrait-5.mp3'), duration: '---', description: 'Compréhension orale - Niveau C1' },
  { id: '6', name: 'Extrait n°6', url: assetUrl('/extrait-6.mp3'), duration: '---', description: 'Compréhension orale - TCF' },
  { id: '7', name: 'Extrait n°7', url: assetUrl('/extrait-7.mp3'), duration: '---', description: 'Compréhension orale - TCF' },
  { id: '8', name: 'Extrait n°8', url: assetUrl('/extrait-8.mp3'), duration: '---', description: 'Compréhension orale - TCF' },
  { id: '9', name: 'Extrait n°9', url: assetUrl('/extrait-9.mp3'), duration: '---', description: 'Compréhension orale - TCF' },
  { id: '10', name: 'Extrait n°10', url: assetUrl('/extrait-10.mp3'), duration: '---', description: 'Compréhension orale - TCF' },
  { id: '11', name: 'Extrait n°11', url: assetUrl('/extrait-11.mp3'), duration: '---', description: 'Compréhension orale - TCF' },
  { id: '12', name: 'Extrait n°12', url: assetUrl('/extrait-12.mp3'), duration: '---', description: 'Compréhension orale - TCF' },
  { id: '13', name: 'Extrait n°13', url: assetUrl('/extrait-13.mp3'), duration: '---', description: 'Compréhension orale - TCF' },
  { id: '14', name: 'Extrait n°14', url: assetUrl('/extrait-14.mp3'), duration: '---', description: 'Compréhension orale - TCF' },
  { id: '15', name: 'Extrait n°15', url: assetUrl('/extrait-15.mp3'), duration: '---', description: 'Compréhension orale - TCF' },
  { id: '16', name: 'Extrait n°16', url: assetUrl('/extrait-16.mp3'), duration: '---', description: 'Compréhension orale - TCF' },
  { id: '17', name: 'Extrait n°17', url: assetUrl('/extrait-17.mp3'), duration: '---', description: 'Compréhension orale - TCF' },
];

interface AudioExtractsProps {
  onBack: () => void;
}

export function AudioExtracts({ onBack }: AudioExtractsProps) {
  const [currentAudio, setCurrentAudio] = useState<AudioFile | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState('0:00');
  const [totalDuration, setTotalDuration] = useState('0:00');
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const waveformRef = useRef<HTMLDivElement>(null);
  const wavesurfer = useRef<WaveSurfer | null>(null);

  // Initialize WaveSurfer when the container is available
  useEffect(() => {
    if (currentAudio && waveformRef.current && !wavesurfer.current) {
      setIsLoading(true);
      setLoadError(null);

      wavesurfer.current = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: '#e2e8f0',
        progressColor: '#3b82f6',
        cursorColor: '#3b82f6',
        barWidth: 3,
        barRadius: 4,
        height: 60,
      });

      wavesurfer.current.on('play', () => setIsPlaying(true));
      wavesurfer.current.on('pause', () => setIsPlaying(false));
      wavesurfer.current.on('finish', () => setIsPlaying(false));
      
      wavesurfer.current.on('timeupdate', (time) => {
        setCurrentTime(formatTime(time));
      });

      wavesurfer.current.on('ready', (duration) => {
        setIsLoading(false);
        setTotalDuration(formatTime(duration));
        wavesurfer.current?.play().catch(err => console.error("Play error:", err));
      });

      wavesurfer.current.on('error', (err) => {
        console.error("Wavesurfer error:", err);
        setIsLoading(false);
        setLoadError("Impossible de charger ce fichier audio. Assurez-vous qu'il s'agit d'un fichier MP3 valide.");
        setIsPlaying(false);
      });

      wavesurfer.current.load(currentAudio.url);
    }

    return () => {
      if (wavesurfer.current) {
        wavesurfer.current.destroy();
        wavesurfer.current = null;
      }
    };
  }, [currentAudio]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSelectAudio = async (audio: AudioFile) => {
    if (currentAudio?.id === audio.id) {
      wavesurfer.current?.playPause();
      return;
    }
    
    setLoadError(null);
    setIsLoading(true);

    // Optional: Pre-check file size to give a better error message if it's empty
    try {
      const response = await fetch(audio.url, { method: 'HEAD' });
      const contentLength = response.headers.get('Content-Length');
      if (contentLength && parseInt(contentLength, 10) < 100) {
        setLoadError("Ce fichier est vide (0 octets). La création manuelle via l'éditeur crée des fichiers vides. Vous devez importer un véritable fichier MP3.");
        setIsLoading(false);
        setCurrentAudio(audio);
        return;
      }
    } catch (e) {
      console.warn("Could not pre-check audio file size", e);
    }
    
    setCurrentAudio(audio);
    setIsPlaying(false);
  };

  const toggleMute = () => {
    if (wavesurfer.current) {
      const newMuted = !isMuted;
      setIsMuted(newMuted);
      wavesurfer.current.setVolume(newMuted ? 0 : volume);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 py-8 px-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button 
          variant="ghost" 
          onClick={onBack} 
          className="text-slate-500 hover:text-blue-600 font-bold"
        >
          <X className="w-5 h-5 mr-2" /> Retour
        </Button>
      </div>

      <div className="text-center space-y-6">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-24 h-24 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-sm"
        >
          <Mic2 className="w-12 h-12" />
        </motion.div>
        <div className="space-y-2">
          <h3 className="text-4xl font-black text-slate-900 tracking-tight">Extraits Sonores</h3>
          <p className="text-slate-500 text-lg font-medium">Écoutez les ressources audio pour votre préparation TCF</p>
        </div>
      </div>

      {/* Main Player UI */}
      <AnimatePresence mode="wait">
        {currentAudio && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            className="sticky top-4 z-50 pt-4"
          >
            <Card className="border-none shadow-2xl bg-white/90 backdrop-blur-md overflow-hidden rounded-[2.5rem] border-2 border-blue-50">
              <div className="h-2 bg-gradient-to-r from-blue-400 to-blue-600" />
              <CardContent className="p-8 space-y-6">
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className="w-20 h-20 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/30">
                    <Music className="w-10 h-10" />
                  </div>
                  <div className="text-center md:text-left flex-1">
                    <h4 className="text-2xl font-black text-slate-900">{currentAudio.name}</h4>
                    <p className="text-blue-600 font-bold">{currentAudio.description}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button variant="outline" size="icon" className="rounded-full h-12 w-12 border-slate-200" onClick={() => wavesurfer.current?.skip(-5)}>
                      <SkipBack className="w-6 h-6" />
                    </Button>
                    <Button 
                      className="rounded-full h-16 w-16 bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-600/20" 
                      onClick={() => wavesurfer.current?.playPause()}
                    >
                      {isPlaying ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current translate-x-0.5" />}
                    </Button>
                    <Button variant="outline" size="icon" className="rounded-full h-12 w-12 border-slate-200" onClick={() => wavesurfer.current?.skip(5)}>
                      <SkipForward className="w-6 h-6" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  {isLoading && (
                    <div className="h-[60px] flex items-center justify-center bg-slate-50 rounded-lg animate-pulse">
                      <p className="text-slate-400 text-sm font-bold">Chargement de l'audio...</p>
                    </div>
                  )}
                  {loadError && (
                    <div className="h-[60px] flex items-center justify-center bg-red-50 rounded-lg border border-red-100">
                      <p className="text-red-500 text-sm font-bold px-4 text-center">{loadError}</p>
                    </div>
                  )}
                  <div ref={waveformRef} className={`w-full ${isLoading || loadError ? 'hidden' : 'block'}`} />
                  <div className="flex justify-between text-xs font-black text-slate-400 tracking-widest uppercase">
                    <span>{currentTime}</span>
                    <span>{totalDuration}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400" onClick={toggleMute}>
                      {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </Button>
                    <input 
                      type="range" 
                      min="0" 
                      max="1" 
                      step="0.05" 
                      value={isMuted ? 0 : volume}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        setVolume(val);
                        setIsMuted(val === 0);
                        wavesurfer.current?.setVolume(val);
                      }}
                      className="w-24 accent-blue-600"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Audio List */}
      <div className="grid grid-cols-1 gap-4">
        {AUDIO_FILES.map((audio) => (
          <motion.div
            key={audio.id}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            <Card 
              className={`group transition-all border-slate-100 hover:border-blue-200 rounded-[2rem] overflow-hidden cursor-pointer ${currentAudio?.id === audio.id ? 'bg-blue-50/50 border-blue-200 ring-4 ring-blue-50' : 'bg-white'}`}
              onClick={() => handleSelectAudio(audio)}
            >
              <CardContent className="p-6 flex items-center justify-between gap-4">
                <div className="flex items-center gap-6">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${currentAudio?.id === audio.id ? 'bg-blue-600 text-white' : 'bg-slate-50 text-blue-600 group-hover:bg-blue-100'}`}>
                    {currentAudio?.id === audio.id && isPlaying ? (
                      <Pause className="w-6 h-6 fill-current" />
                    ) : (
                      <Play className="w-6 h-6 fill-current translate-x-0.5" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-black text-xl text-slate-900 leading-none">{audio.name}</h4>
                    <p className="text-slate-500 font-medium mt-1 uppercase text-[10px] tracking-widest">{audio.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-black text-slate-400 font-mono">{audio.duration}</span>
                  <Button variant="ghost" className="rounded-xl font-bold text-blue-600 hover:bg-blue-50">
                    {currentAudio?.id === audio.id ? 'LECTURE' : 'ÉCOUTER'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Technical Note */}
      <div className="p-10 bg-blue-50 border-2 border-dashed border-blue-200 rounded-[2.5rem] space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
            <Info className="w-6 h-6" />
          </div>
          <h4 className="text-xl font-black text-blue-900">Note sur les fichiers audio</h4>
        </div>
        <div className="space-y-4 text-blue-800 font-medium leading-relaxed">
          <p>
            Les fichiers doivent être de véritables fichiers audio MP3 importés depuis votre ordinateur.
          </p>
          <div className="bg-amber-100/50 border-l-4 border-amber-400 p-4 rounded-r-xl my-4 text-amber-900 text-sm italic">
            <p><strong>Important :</strong> Créer un nouveau fichier nommé ".mp3" via l'explorateur de fichiers crée un fichier vide. Vous devez utiliser le bouton d'import/upload (ou glisser-déposer) pour ajouter vos fichiers MP3 existants.</p>
          </div>
          <p>
            Veuillez placer vos fichiers MP3 dans le dossier <code className="bg-white px-2 py-1 rounded">public/</code> de l'application :
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4 decoration-blue-300">
            <li><code className="bg-white/50 px-2 py-0.5 rounded">extrait-1.mp3</code></li>
            <li><code className="bg-white/50 px-2 py-0.5 rounded">extrait-2.mp3</code></li>
            <li>etc.</li>
          </ul>
          <p className="text-sm text-blue-600 italic pt-2">
            L'application détecte maintenant les fichiers placés directement à la racine du dossier public.
          </p>
        </div>
      </div>
    </div>
  );
}
