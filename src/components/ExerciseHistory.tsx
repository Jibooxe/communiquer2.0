import React from 'react';
import { ExerciseHistoryEntry } from '../types';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { History, Calendar, Award } from 'lucide-react';
import { motion } from 'motion/react';

interface ExerciseHistoryProps {
  history: ExerciseHistoryEntry[];
}

export const ExerciseHistory: React.FC<ExerciseHistoryProps> = ({ history }) => {
  if (history.length === 0) {
    return (
      <Card className="border-none shadow-sm bg-white">
        <CardContent className="p-12 text-center space-y-4">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
            <History className="w-8 h-8 text-slate-300" />
          </div>
          <div className="space-y-1">
            <p className="text-slate-900 font-bold">Aucun historique</p>
            <p className="text-slate-500 text-sm">Commencez un exercice pour voir vos résultats ici.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-none shadow-sm bg-white overflow-hidden">
      <CardHeader className="border-b border-slate-50 bg-slate-50/50">
        <CardTitle className="text-lg font-bold flex items-center gap-2">
          <History className="w-5 h-5 text-blue-600" />
          Historique des exercices
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[400px]">
          <div className="divide-y divide-slate-50">
            {history.map((entry, index) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    entry.score >= 80 ? 'bg-green-100 text-green-600' : 
                    entry.score >= 50 ? 'bg-blue-100 text-blue-600' : 'bg-amber-100 text-amber-600'
                  }`}>
                    <Award className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-slate-900 truncate">{entry.exerciseTitle}</h4>
                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(entry.date).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <Badge className={`${
                    entry.score >= 80 ? 'bg-green-500' : 
                    entry.score >= 50 ? 'bg-blue-500' : 'bg-amber-500'
                  } text-white border-none font-black`}>
                    {entry.score}%
                  </Badge>
                </div>
              </motion.div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
