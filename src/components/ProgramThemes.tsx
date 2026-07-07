import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Info, 
  MapPin, 
  Home, 
  Utensils, 
  ShoppingBag, 
  Briefcase, 
  Music, 
  HeartPulse,
  ChevronRight
} from 'lucide-react';
import { motion } from 'motion/react';

export interface Theme {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  exerciseCount: number;
  color: string;
}

const THEMES: Theme[] = [
  {
    id: 'informer',
    title: "S'informer",
    description: "Comprendre les nouvelles et les informations quotidiennes.",
    icon: Info,
    exerciseCount: 15,
    color: "bg-blue-500"
  },
  {
    id: 'deplacer',
    title: "Se déplacer",
    description: "S'orienter et utiliser les transports en commun.",
    icon: MapPin,
    exerciseCount: 12,
    color: "bg-emerald-500"
  },
  {
    id: 'loger',
    title: "Se loger",
    description: "Chercher un logement et décrire son environnement.",
    icon: Home,
    exerciseCount: 8,
    color: "bg-amber-500"
  },
  {
    id: 'restaurer',
    title: "Se restaurer",
    description: "Commander au restaurant et parler de cuisine.",
    icon: Utensils,
    exerciseCount: 10,
    color: "bg-orange-500"
  },
  {
    id: 'achats',
    title: "Faire des achats",
    description: "Faire les courses et gérer son budget.",
    icon: ShoppingBag,
    exerciseCount: 14,
    color: "bg-purple-500"
  },
  {
    id: 'travailler',
    title: "Travailler",
    description: "Le monde professionnel et la recherche d'emploi.",
    icon: Briefcase,
    exerciseCount: 18,
    color: "bg-slate-700"
  },
  {
    id: 'divertir',
    title: "Se divertir",
    description: "Loisirs, culture et sorties entre amis.",
    icon: Music,
    exerciseCount: 11,
    color: "bg-pink-500"
  },
  {
    id: 'sante',
    title: "Santé et bien-être",
    description: "Prendre soin de soi et consulter un médecin.",
    icon: HeartPulse,
    exerciseCount: 9,
    color: "bg-red-500"
  }
];

interface ProgramThemesProps {
  onSelectTheme: (themeId: string) => void;
}

export const ProgramThemes: React.FC<ProgramThemesProps> = ({ onSelectTheme }) => {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-black text-slate-900">Thèmes du programme</h2>
        <p className="text-slate-500 max-w-2xl mx-auto">
          Explorez nos modules thématiques pour apprendre le français en contexte réel.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {THEMES.map((theme, index) => (
          <motion.div
            key={theme.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.02 }}
            onClick={() => onSelectTheme(theme.id)}
            className="cursor-pointer"
          >
            <Card className="h-full border-none shadow-sm hover:shadow-md transition-all overflow-hidden group">
              <CardContent className="p-0">
                <div className={`h-24 ${theme.color} flex items-center justify-center relative`}>
                  <theme.icon className="w-12 h-12 text-white/90" />
                  <div className="absolute top-2 right-2 bg-white/20 backdrop-blur-md px-2 py-1 rounded-full text-[10px] font-bold text-white uppercase">
                    {theme.exerciseCount} exercices
                  </div>
                </div>
                <div className="p-5 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-lg text-slate-900 group-hover:text-blue-600 transition-colors">
                      {theme.title}
                    </h3>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                  </div>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    {theme.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
