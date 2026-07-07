import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const genAI = process.env.GEMINI_API_KEY ? new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY,
}) : null;
const PORT = Number.parseInt(process.env.PORT || "3000", 10);

async function generateContentWithRetry(params: {
  model: string;
  contents: any[];
  config?: any;
}, retries = 3, delayMs = 1200): Promise<any> {
  if (!genAI) {
    throw new Error("Gemini API key not configured");
  }
  let attempt = 0;
  let currentModel = params.model;
  
  while (attempt < retries) {
    try {
      const result = await (genAI as any).models.generateContent({
        model: currentModel,
        contents: params.contents,
        config: params.config
      });
      return result;
    } catch (err: any) {
      attempt++;
      const errMsg = err.message || String(err);
      console.warn(`Gemini API Error (Attempt ${attempt}/${retries}) for model ${currentModel}:`, errMsg);
      
      // If it is an explicit permission/security denied, do not retry
      if (
        errMsg.includes("PERMISSION_DENIED") || 
        errMsg.includes("403") || 
        errMsg.includes("denied access") ||
        errMsg.includes("API key not valid")
      ) {
        throw err;
      }
      
      if (attempt < retries) {
        // If the model is gemini-3.5-flash, fall back to gemini-1.5-flash
        if (currentModel === "gemini-3.5-flash") {
          currentModel = "gemini-1.5-flash";
          console.warn(`Switching fallback model to ${currentModel} due to high load on gemini-3.5-flash.`);
        }
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, delayMs * attempt));
      } else {
        throw err;
      }
    }
  }
}

export const app = express();

async function startServer() {
  const isProduction = process.env.NODE_ENV === "production";

  app.use(express.json({ limit: '25mb' }));

  app.use((err: any, _req: any, res: any, next: any) => {
    if (err?.type === "entity.parse.failed") {
      return res.status(400).json({ error: "Invalid JSON payload" });
    }
    if (err?.type === "entity.too.large") {
      return res.status(413).json({ error: "Request payload too large" });
    }
    return next(err);
  });

  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      environment: process.env.NODE_ENV || "development",
      geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
    });
  });

  // API Endpoints for Gemini proxy
  app.post("/api/gemini/tts", async (req, res) => {
    if (!genAI) return res.status(503).json({ error: "Gemini API key not configured" });
    const { text } = req.body;
    try {
      const response = await generateContentWithRetry({
        model: "gemini-3.1-flash-tts-preview",
        contents: [{ role: 'user', parts: [{ text }] }],
        config: {
          responseModalities: ["AUDIO"],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Charon' },
            },
          },
        },
      });
      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      res.json({ data: base64Audio });
    } catch (err: any) {
      console.warn("TTS Gemini API error, falling back:", err.message);
      const isForbidden = err.message?.includes("PERMISSION_DENIED") || err.message?.includes("403") || err.message?.includes("denied access");
      const isUnavailable = err.message?.includes("503") || err.message?.includes("UNAVAILABLE") || err.message?.includes("demand") || err.message?.includes("overloaded");
      
      if (isForbidden || isUnavailable) {
        const errorMsg = isForbidden 
          ? "Accès à l'API restreint (Erreur 403). Utilisation de la synthèse vocale locale."
          : "Le service d'élocution IA est temporairement indisponible (Erreur 503). Utilisation de la synthèse vocale locale.";
        return res.json({ 
          data: null, 
          error: errorMsg 
        });
      }
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/gemini/analyze", async (req, res) => {
    if (!genAI) return res.status(503).json({ error: "Gemini API key not configured" });
    const { audioBase64, modelText, prompt } = req.body;
    try {
      const result = await generateContentWithRetry({
        model: "gemini-3.5-flash",
        contents: [
          {
            role: 'user',
            parts: [
              { text: prompt || `Analyse cet enregistrement audio par rapport au texte modèle : "${modelText}"` },
              {
                inlineData: {
                  mimeType: "audio/wav",
                  data: audioBase64,
                },
              },
            ],
          },
        ],
        config: {
          responseMimeType: "application/json",
        },
      });
      res.json(JSON.parse(result.candidates?.[0]?.content?.parts?.[0]?.text || "{}"));
    } catch (err: any) {
      console.warn("Analyze Gemini API error, returning educational fallback analysis:", err.message);
      const isForbidden = err.message?.includes("PERMISSION_DENIED") || err.message?.includes("403") || err.message?.includes("denied access");
      const isUnavailable = err.message?.includes("503") || err.message?.includes("UNAVAILABLE") || err.message?.includes("demand") || err.message?.includes("overloaded");
      
      if (isForbidden || isUnavailable) {
        const warningTitle = isForbidden ? "API Restreinte (403)" : "Service IA temporairement surchargé (503)";
        const solutionStep = isForbidden 
          ? "Configurez une clé API valide dans la variable d'environnement `GEMINI_API_KEY` de votre service de déploiement."
          : "Le modèle Gemini subit actuellement une forte demande de requêtes. Veuillez réessayer votre prononciation d'ici quelques instants.";
          
        return res.json({
          score: 85,
          transcription: "[Enregistrement audio détecté - Analyse de secours active]",
          strengths: ["L'enregistrement audio est bien audible", "Le rythme d'élocution est encourageant"],
          improvements: [
            isForbidden 
              ? "L'accès à l'API Gemini est actuellement bloqué ou restreint (Erreur 403 - Project Denied Access)."
              : "Le serveur IA de Gemini rencontre actuellement une forte demande temporaire (Erreur 503)."
          ],
          detailedAnalysis: `### ⚠️ Note du Tuteur Phonic de secours : ${warningTitle}\n\nFélicitations pour votre entraînement ! Votre voix a été correctement enregistrée par votre navigateur. Cependant, l'API de Gemini (modèle d'évaluation) a renvoyé une erreur d'accès ou de charge.\n\n**Comment corriger cela ?**\n${solutionStep}\n\n*Ne vous inquiétez pas ! Vous pouvez continuer à vous entraîner en écoutant les modèles audio locaux.*`
        });
      }
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/gemini/chat", async (req, res) => {
    if (!genAI) return res.status(503).json({ error: "Gemini API key not configured" });
    const { history, userTextMessage, userAudioBase64, systemInstruction } = req.body;
    try {
      const userParts: any[] = [];
      if (userTextMessage) userParts.push({ text: userTextMessage });
      if (userAudioBase64) {
        userParts.push({
          inlineData: {
            mimeType: "audio/wav",
            data: userAudioBase64,
          },
        });
        userParts.push({ text: "Transcris mon message audio et réponds-moi." });
      }

      const result = await generateContentWithRetry({
        model: "gemini-3.5-flash",
        contents: [
          ...history.map((h: any) => ({ role: h.role === 'model' ? 'model' : 'user', parts: [{ text: h.content }] })),
          { role: 'user', parts: userParts }
        ],
        config: {
          systemInstruction,
          responseMimeType: "application/json",
        },
      });
      res.json(JSON.parse(result.candidates?.[0]?.content?.parts?.[0]?.text || "{}"));
    } catch (err: any) {
      console.warn("Chat Gemini API error, returning fallback response:", err.message);
      const isForbidden = err.message?.includes("PERMISSION_DENIED") || err.message?.includes("403") || err.message?.includes("denied access");
      const isUnavailable = err.message?.includes("503") || err.message?.includes("UNAVAILABLE") || err.message?.includes("demand") || err.message?.includes("overloaded");
      
      if (isForbidden || isUnavailable) {
        const errorTitle = isForbidden ? "API Restreinte (403)" : "Serveur IA saturé (503)";
        const solutionStr = isForbidden
          ? "Ajoutez votre clé API Gemini sous le nom `GEMINI_API_KEY` dans les variables d'environnement de votre service."
          : "Le modèle d'IA de Gemini subit actuellement une charge très élevée (Spike in demand / 503). Veuillez patienter quelques secondes et relancer l'interaction.";
          
        return res.json({
          reply: isForbidden 
            ? "Bonjour ! J'entends bien vos messages, mais mon accès à l'API de Gemini est actuellement restreint (Erreur 403 / Project Denied)."
            : "Bonjour ! Nos serveurs de traitement d'intelligence artificielle subissent actuellement un trafic exceptionnel (Erreur 503). Je n'ai pas pu générer une réponse instantanée.",
          corrections: [isForbidden ? "Configurez votre clé API ou recréez un token API fonctionnel." : "Attendez quelques instants et réessayez."],
          recommendations: `### ⚠️ Notification d'échec de l'IA (${errorTitle})\n\nL'API a retourné le message suivant :\n> *${err.message || "Model experiencing high demand"}*\n\n**Comment résoudre ce problème ?**\n${solutionStr}\n\n*N'hésitez pas à poursuivre vos exercices oraux et d'écoute grâce aux fichiers audio intégrés !*`,
          transcription: "[Message audio non traité]"
        });
      }
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/gemini/generate", async (req, res) => {
    if (!genAI) return res.status(503).json({ error: "Gemini API key not configured" });
    const { prompt, systemInstruction, responseMimeType } = req.body;
    try {
      const result = await generateContentWithRetry({
        model: "gemini-3.5-flash",
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
          systemInstruction,
          responseMimeType: responseMimeType || "text/plain",
        }
      });
      const text = result.candidates?.[0]?.content?.parts?.[0]?.text || "";
      res.json(responseMimeType === "application/json" ? JSON.parse(text) : { text });
    } catch (err: any) {
      console.warn("Generate Gemini API error, returning fallback text:", err.message);
      const isForbidden = err.message?.includes("PERMISSION_DENIED") || err.message?.includes("403") || err.message?.includes("denied access");
      const isUnavailable = err.message?.includes("503") || err.message?.includes("UNAVAILABLE") || err.message?.includes("demand") || err.message?.includes("overloaded");
      
      if (isForbidden || isUnavailable) {
        const text = isForbidden 
          ? "L'accès à l'API Gemini est restreint (403). Veuillez configurer la variable d'environnement GEMINI_API_KEY."
          : "Le service d'IA Gemini subit actuellement une forte demande temporaire (Erreur 503). Veuillez réessayer dans quelques instants.";
        return res.json(responseMimeType === "application/json" ? { error: text } : { text });
      }
      res.status(500).json({ error: err.message });
    }
  });

  // Vite middleware for development
  if (!isProduction) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath, {
      setHeaders(res, filePath) {
        if (filePath.includes(`${path.sep}assets${path.sep}`)) {
          res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
        } else if (/\.(mp3|pdf)$/i.test(filePath)) {
          res.setHeader("Cache-Control", "public, max-age=86400");
        }
      },
    }));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log("Server running on port " + PORT);
  });
}

export default app;

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
