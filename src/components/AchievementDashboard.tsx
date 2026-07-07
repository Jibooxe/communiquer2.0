import React, { useState, useEffect } from 'react';
import { ALL_BADGES, achievementManager } from '@/lib/badges';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { motion } from 'motion/react';
import { Trophy } from 'lucide-react';

export function AchievementDashboard() {
  const [state, setState] = useState(achievementManager.getState());

  useEffect(() => {
    const unsub = achievementManager.subscribe(setState);
    return () => { unsub(); };
  }, []);

  return (
    <Card className="w-full border-slate-200 shadow-sm overflow-hidden bg-white">
      <CardHeader className="bg-slate-50 border-b border-slate-100">
        <CardTitle className="flex items-center gap-2 text-xl font-black text-slate-900">
          <Trophy className="w-6 h-6 text-yellow-500" />
          Mes Trophées
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {ALL_BADGES.map((badge) => {
            const isUnlocked = state.unlockedBadges.includes(badge.id);
            const Icon = badge.icon;
            
            return (
              <motion.div
                key={badge.id}
                initial={false}
                animate={{
                  opacity: isUnlocked ? 1 : 0.6,
                  scale: isUnlocked ? 1 : 0.98,
                  y: isUnlocked ? 0 : 5
                }}
                whileHover={isUnlocked ? { scale: 1.02, y: -2 } : {}}
                className={`group relative flex flex-col items-center text-center p-6 rounded-3xl border-2 transition-all duration-500 overflow-hidden ${
                  isUnlocked 
                    ? 'border-blue-100 bg-gradient-to-b from-blue-50/50 to-white shadow-xl shadow-blue-500/5' 
                    : 'border-slate-100 bg-slate-50/50 grayscale opacity-70'
                }`}
              >
                {/* Background Decoration */}
                {isUnlocked && (
                  <div className="absolute -top-12 -right-12 w-24 h-24 bg-blue-100/30 rounded-full blur-2xl group-hover:bg-blue-200/40 transition-colors" />
                )}

                <div className={`relative mb-5 p-5 rounded-2xl bg-white shadow-lg shadow-black/5 transition-transform duration-500 ${isUnlocked ? 'group-hover:scale-110 group-hover:rotate-3' : ''} ${badge.color}`}>
                  <Icon className="w-10 h-10" />
                  {isUnlocked && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full" />
                  )}
                </div>

                <div className="space-y-2 relative z-10">
                  <h4 className={`font-black text-base uppercase tracking-tight leading-none ${isUnlocked ? 'text-slate-900' : 'text-slate-400'}`}>
                    {badge.title}
                  </h4>
                  <p className="text-xs text-slate-500 font-medium px-2 italic">
                    {badge.description}
                  </p>
                  
                  {isUnlocked ? (
                    <div className="mt-3 flex items-center justify-center gap-1.5">
                      <div className="h-1 w-1 bg-blue-400 rounded-full" />
                      <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Débloqué</span>
                      <div className="h-1 w-1 bg-blue-400 rounded-full" />
                    </div>
                  ) : (
                    <div className="mt-4 w-24 mx-auto">
                      <div className="flex justify-between text-[9px] font-bold text-slate-400 mb-1 uppercase tracking-tighter">
                        <span>Progression</span>
                        <span>{Math.round((getProgressValue(badge, state) / badge.milestone) * 100)}%</span>
                      </div>
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden shadow-inner">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(100, (getProgressValue(badge, state) / badge.milestone) * 100)}%` }}
                          className="bg-slate-400 h-full rounded-full"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function getProgressValue(badge: any, state: any) {
  if (badge.type === 'syllables') return state.syllablesCount;
  if (badge.type === 'words') return state.wordsCount;
  if (badge.type === 'score') return state.nasalsCount;
  if (badge.type === 'weekly') return state.weeklyCount;
  return 0;
}
