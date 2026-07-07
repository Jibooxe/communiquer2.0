import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Logo } from './Logo';
import { KeyRound, ShieldCheck, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface LoginProps {
  onLogin: (code: string) => void;
}

// In a real production app, these would be in a database
// But following instructions for manual admin codes:
const VALID_CODES = ['021992'];

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (VALID_CODES.includes(code.toUpperCase().trim())) {
      onLogin(code.toUpperCase().trim());
    } else {
      setError("Code d'adhésion invalide. Veuillez contacter votre administrateur.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md space-y-8"
      >
        <div className="flex flex-col items-center gap-6 text-center">
          <Logo className="h-16 w-auto" />
          <div className="space-y-2">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Espace Membres</h1>
            <p className="text-slate-500 font-medium font-serif">
              Veuillez entrer votre code d'adhésion pour accéder à votre espace de formation.
            </p>
          </div>
        </div>

        <Card className="border-none shadow-2xl rounded-[2rem] overflow-hidden bg-white">
          <div className="h-2 bg-blue-600 w-full" />
          <CardContent className="p-8 md:p-10">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 uppercase tracking-widest ml-1">
                  Code d'adhésion
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    type="password"
                    placeholder="Entrez votre code..."
                    className="pl-12 h-14 bg-slate-50 border-slate-200 text-lg rounded-2xl focus:ring-blue-500"
                    value={code}
                    onChange={(e) => {
                      setCode(e.target.value);
                      setError(null);
                    }}
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-3 p-4 bg-red-50 text-red-700 rounded-2xl animate-shake">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <p className="text-sm font-medium">{error}</p>
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-lg font-black rounded-2xl shadow-xl shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Accéder à l'application
              </Button>

              <div className="flex items-center justify-center gap-2 text-slate-400 text-xs font-bold pt-2">
                <ShieldCheck className="w-4 h-4" />
                ACCÈS SÉCURISÉ & RESTREINT
              </div>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-slate-400 text-sm font-medium">
          Pas de code ? Contactez votre formateur référent.
        </p>
      </motion.div>
    </div>
  );
};
