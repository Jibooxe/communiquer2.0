import { GoogleGenAI } from '@google/genai';

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
}

async function generateContentWithRetry(
  params: { model: string; contents: any[]; config?: any },
  retries = 3,
  delayMs = 1200
): Promise<any> {
  const genAI = getGeminiClient();
  if (!genAI) {
    throw new Error('Gemini API key not configured');
  }

  let attempt = 0;
  let currentModel = params.model;

  while (attempt < retries) {
    try {
      const result = await (genAI as any).models.generateContent({
        model: currentModel,
        contents: params.contents,
        config: params.config,
      });
      return result;
    } catch (err: any) {
      attempt += 1;
      const errMsg = err.message || String(err);
      console.warn(`Gemini API Error (Attempt ${attempt}/${retries}) for model ${currentModel}:`, errMsg);

      if (
        errMsg.includes('PERMISSION_DENIED') ||
        errMsg.includes('403') ||
        errMsg.includes('denied access') ||
        errMsg.includes('API key not valid')
      ) {
        throw err;
      }

      if (attempt < retries) {
        if (currentModel === 'gemini-3.5-flash') {
          currentModel = 'gemini-1.5-flash';
          console.warn(`Switching fallback model to ${currentModel} due to high load on gemini-3.5-flash.`);
        }
        await new Promise((resolve) => setTimeout(resolve, delayMs * attempt));
      } else {
        throw err;
      }
    }
  }

  throw new Error('Gemini request failed');
}

export async function runGemini(params: { model: string; contents: any[]; config?: any }) {
  return generateContentWithRetry(params);
}

export function isGeminiConfigured() {
  return Boolean(process.env.GEMINI_API_KEY);
}

export async function parseJsonBody(req: any) {
  if (req.body && typeof req.body === 'object') {
    return req.body;
  }

  if (req.method === 'GET') {
    return {};
  }

  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  const raw = Buffer.concat(chunks).toString('utf8');
  if (!raw) return {};

  try {
    return JSON.parse(raw);
  } catch {
    return { raw };
  }
}

export function jsonError(res: any, status: number, error: string) {
  return res.status(status).json({ error });
}

export function buildGeminiFallbackResponse(err: any, fallbackType: 'tts' | 'analyze' | 'chat' | 'generate') {
  const isForbidden = err.message?.includes('PERMISSION_DENIED') || err.message?.includes('403') || err.message?.includes('denied access');
  const isUnavailable = err.message?.includes('503') || err.message?.includes('UNAVAILABLE') || err.message?.includes('demand') || err.message?.includes('overloaded');

  if (fallbackType === 'tts') {
    return {
      data: null,
      error: isForbidden
        ? "Accès à l'API restreint (Erreur 403). Utilisation de la synthèse vocale locale."
        : "Le service d'élocution IA est temporairement indisponible (Erreur 503). Utilisation de la synthèse vocale locale.",
    };
  }

  if (fallbackType === 'analyze') {
    return {
      score: 85,
      transcription: '[Enregistrement audio détecté - Analyse de secours active]',
      strengths: ['L\'enregistrement audio est bien audible', 'Le rythme d\'élocution est encourageant'],
      improvements: [
        isForbidden
          ? "L'accès à l'API Gemini est actuellement bloqué ou restreint (Erreur 403 - Project Denied Access)."
          : 'Le serveur IA de Gemini rencontre actuellement une forte demande temporaire (Erreur 503).',
      ],
      detailedAnalysis: `### ⚠️ Note du Tuteur Phonic de secours : ${isForbidden ? 'API Restreinte (403)' : 'Service IA temporairement surchargé (503)'}\n\nFélicitations pour votre entraînement ! Votre voix a été correctement enregistrée par votre navigateur. Cependant, l'API de Gemini (modèle d'évaluation) a renvoyé une erreur d'accès ou de charge.\n\n**Comment corriger cela ?**\n${isForbidden ? 'Configurez une clé API valide dans la variable d\'environnement GEMINI_API_KEY de votre service de déploiement.' : 'Le modèle Gemini subit actuellement une forte demande de requêtes. Veuillez réessayer votre prononciation d\'ici quelques instants.'}\n\n*Ne vous inquiétez pas ! Vous pouvez continuer à vous entraîner en écoutant les modèles audio locaux.*`,
    };
  }

  if (fallbackType === 'chat') {
    return {
      reply: isForbidden
        ? "Bonjour ! J'entends bien vos messages, mais mon accès à l'API de Gemini est actuellement restreint (Erreur 403 / Project Denied)."
        : "Bonjour ! Nos serveurs de traitement d'intelligence artificielle subissent actuellement un trafic exceptionnel (Erreur 503). Je n'ai pas pu générer une réponse instantanée.",
      corrections: [isForbidden ? 'Configurez votre clé API ou recréez un token API fonctionnel.' : 'Attendez quelques instants et réessayez.'],
      recommendations: `### ⚠️ Notification d'échec de l'IA (${isForbidden ? 'API Restreinte (403)' : 'Serveur IA saturé (503)'})\n\nL'API a retourné le message suivant :\n> *${err.message || 'Model experiencing high demand'}*\n\n**Comment résoudre ce problème ?**\n${isForbidden ? 'Ajoutez votre clé API Gemini sous le nom `GEMINI_API_KEY` dans les variables d\'environnement de votre service.' : 'Le modèle d\'IA de Gemini subit actuellement une charge très élevée (Spike in demand / 503). Veuillez patienter quelques secondes et relancer l\'interaction.'}\n\n*N\'hésitez pas à poursuivre vos exercices oraux et d\'écoute grâce aux fichiers audio intégrés !*`,
      transcription: '[Message audio non traité]',
    };
  }

  return {
    text: isForbidden
      ? 'L\'accès à l\'API Gemini est restreint (403). Veuillez configurer la variable d\'environnement GEMINI_API_KEY.'
      : 'Le service d\'IA Gemini subit actuellement une forte demande temporaire (Erreur 503). Veuillez réessayer dans quelques instants.',
  };
}
