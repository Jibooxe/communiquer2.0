import { Feedback } from "../types";

export async function textToSpeech(text: string): Promise<string> {
  try {
    const response = await fetch("/api/gemini/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Failed to generate speech");
    return data.data;
  } catch (error) {
    console.error("TTS Service Error:", error);
    throw error;
  }
}

export async function analyzeOralPerformance(
  audioBase64: string,
  modelText: string
): Promise<Feedback> {
  const prompt = `
    Tu es un expert en phonétique et communication orale française. 
    Analyse cet enregistrement audio par rapport au texte modèle : "${modelText}".
    
    Évalue la performance sur les critères suivants :
    1. Fidélité au texte (mots prononcés vs texte modèle).
    2. Clarté de la prononciation (sons spécifiques, voyelles nasales, "R" français, etc.).
    3. Intonation et rythme (fluidité, pauses naturelles).
    
    Réponds EXCLUSIVEMENT en JSON avec cette structure :
    {
      "score": (nombre de 0 à 100 reflétant la qualité globale),
      "transcription": "transcription exacte de ce que tu entends",
      "strengths": ["liste de 2-3 points forts spécifiques"],
      "improvements": ["liste de 2-3 conseils concrets pour s'améliorer"],
      "detailedAnalysis": "Analyse détaillée en Markdown, incluant des conseils sur la posture ou l'articulation si nécessaire."
    }
    
    Sois encourageant mais précis. Si l'audio est inaudible ou vide, donne un score de 0 et explique pourquoi dans detailedAnalysis.
  `;

  try {
    const response = await fetch("/api/gemini/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ audioBase64, modelText, prompt }),
    });
    const data = await response.json();
    if (!response.ok) {
      const errorMsg = data.error || "Failed to analyze performance";
      if (errorMsg.includes("PERMISSION_DENIED") || errorMsg.includes("denied access") || errorMsg.includes("403")) {
        throw new Error("Accès refusé par l'API Gemini (Erreur 403). Veuillez vérifier la variable d'environnement GEMINI_API_KEY de votre déploiement.");
      }
      throw new Error(errorMsg);
    }
    return data;
  } catch (error: any) {
    console.error("Analyze Service Error:", error);
    throw new Error(error.message || "Erreur lors de l'analyse de votre performance (Problème de connexion avec l'IA).");
  }
}

export interface ChatInteraction {
  reply: string;
  corrections: string[];
  recommendations: string;
  transcription?: string;
}

export async function getDirectExchangeResponse(
  themeTitle: string,
  history: { role: 'user' | 'model', content: string }[],
  userAudioBase64?: string,
  userTextMessage?: string
): Promise<ChatInteraction> {
  const systemInstruction = `
    Tu es un tuteur de français expert et bienveillant. 
    Tu participes à une conversation interactive sur le thème : "${themeTitle}".
    
    Ta mission est triple :
    1. Répondre naturellement au message de l'apprenant pour maintenir la conversation.
    2. Identifier TOUTES les erreurs de français (grammaire, lexique, syntaxe) dans le dernier message de l'apprenant et proposer une correction.
    3. Donner des recommandations détaillées pour parler de manière plus authentique ou précise sur ce thème.

    Si un fichier audio est fourni, commence par le transcrire exactement.

    Réponds EXCLUSIVEMENT en JSON avec cette structure :
    {
      "reply": "Ta réponse directe à l'élève dans la conversation",
      "corrections": ["Liste des erreurs corrigées, ex: 'J'ai allé -> Je suis allé'"],
      "recommendations": "Conseils détaillés en Markdown pour s'améliorer sur ce sujet précis",
      "transcription": "La transcription exacte de ce que l'élève a dit (si audio)"
    }

    Reste pédagogique, encourageant et n'hésite pas à poser une question pour relancer l'échange.
  `;

  try {
    const response = await fetch("/api/gemini/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ history, userTextMessage, userAudioBase64, systemInstruction }),
    });
    const data = await response.json();
    if (!response.ok) {
      const errorMsg = data.error || "Failed to get chat response";
      if (errorMsg.includes("PERMISSION_DENIED") || errorMsg.includes("denied access") || errorMsg.includes("403")) {
        throw new Error("Accès refusé par l'API Gemini (Erreur 403). Veuillez vérifier la variable d'environnement GEMINI_API_KEY de votre déploiement.");
      }
      throw new Error(errorMsg);
    }
    return data;
  } catch (error: any) {
    console.error("Chat AI Service Error:", error);
    const errMsg = error.message || String(error);
    const friendlyMsg = errMsg.includes("403") || errMsg.includes("denied")
      ? "L'API Gemini renvoie une erreur d'accès (403). Votre service nécessite une clé API fonctionnelle dans la variable d'environnement `GEMINI_API_KEY`."
      : errMsg;
    return {
      reply: "Oups ! J'ai eu un petit problème de liaison avec le tuteur d'IA.",
      corrections: [],
      recommendations: `### Diagnostic d'accès IA\n\n${friendlyMsg}\n\n*Note : Vous pouvez toujours tester la prononciation locale même si la connexion IA rencontre une restriction.*`,
      transcription: ""
    };
  }
}
