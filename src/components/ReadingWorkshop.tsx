import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  Type, 
  Table as TableIcon, 
  Scissors, 
  Sparkles, 
  Volume2,
  Mic,
  Trophy
} from 'lucide-react';
import { LetterGrid } from './LetterGrid';
import { SyllableTable } from './SyllableTable';
import { SegmentationExercise } from './SegmentationExercise';
import { NasalSounds } from './NasalSounds';
import { AIDecoding } from './AIDecoding';

import { achievementManager } from '@/lib/badges';
import { AchievementDashboard } from './AchievementDashboard';

export function ReadingWorkshop() {
  return (
    <Card className="w-full border-slate-200 bg-white shadow-sm">
      <CardHeader>
        <CardTitle className="text-3xl font-bold flex items-center gap-3">
          <Type className="w-8 h-8 text-blue-600" />
          Atelier de Lecture
        </CardTitle>
        <CardDescription className="text-slate-500 text-lg">
          Apprenez à déchiffrer et lire le français pas à pas.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="letters" className="w-full">
          <TabsList className="bg-transparent h-auto p-0 mb-8 overflow-x-auto flex-nowrap justify-start md:justify-center border-b border-slate-200 rounded-none w-full gap-2">
            <TabsTrigger 
              value="letters" 
              className="gap-2 px-6 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-blue-600 transition-all font-bold group"
            >
              <Type className="w-4 h-4 group-data-[state=active]:text-blue-600" />
              <span className="hidden sm:inline">Lettres</span>
            </TabsTrigger>
            <TabsTrigger 
              value="syllables" 
              className="gap-2 px-6 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-blue-600 transition-all font-bold group"
            >
              <TableIcon className="w-4 h-4 group-data-[state=active]:text-blue-600" />
              <span className="hidden sm:inline">Table Syllabique</span>
            </TabsTrigger>
            <TabsTrigger 
              value="segmentation" 
              className="gap-2 px-6 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-blue-600 transition-all font-bold group"
            >
              <Scissors className="w-4 h-4 group-data-[state=active]:text-blue-600" />
              <span className="hidden sm:inline">Découpage</span>
            </TabsTrigger>
            <TabsTrigger 
              value="nasals" 
              className="gap-2 px-6 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-blue-600 transition-all font-bold group"
            >
              <Volume2 className="w-4 h-4 group-data-[state=active]:text-blue-600" />
              <span className="hidden sm:inline">Sons Nasals</span>
            </TabsTrigger>
            <TabsTrigger 
              value="ai-decoding" 
              className="gap-2 px-6 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-blue-600 transition-all font-bold group"
            >
              <Sparkles className="w-4 h-4 text-blue-400 group-data-[state=active]:text-blue-600" />
              <span className="hidden sm:inline">Déchiffrage IA</span>
            </TabsTrigger>
            <TabsTrigger 
              value="achievements" 
              className="gap-2 px-6 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-blue-600 transition-all font-bold group"
            >
              <Trophy className="w-4 h-4 text-yellow-500 group-data-[state=active]:text-blue-600" />
              <span className="hidden sm:inline">Progression</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="letters">
            <LetterGrid />
          </TabsContent>
          <TabsContent value="syllables">
            <SyllableTable />
          </TabsContent>
          <TabsContent value="segmentation">
            <SegmentationExercise />
          </TabsContent>
          <TabsContent value="nasals">
            <NasalSounds />
          </TabsContent>
          <TabsContent value="ai-decoding">
            <AIDecoding />
          </TabsContent>
          <TabsContent value="achievements">
            <AchievementDashboard />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
