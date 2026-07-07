import type { VercelRequest, VercelResponse } from '@vercel/node';
import { buildGeminiFallbackResponse, isGeminiConfigured, jsonError, parseJsonBody, runGemini } from '../lib/gemini';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return jsonError(res, 405, 'Method not allowed');

  const body = await parseJsonBody(req as any);
  const { audioBase64, modelText, prompt } = body as { audioBase64?: string; modelText?: string; prompt?: string };

  if (!audioBase64) return jsonError(res, 400, 'Missing audio');
  if (!isGeminiConfigured()) return jsonError(res, 503, 'Gemini API key not configured');

  try {
    const result = await runGemini({
      model: 'gemini-3.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            { text: prompt || `Analyse cet enregistrement audio par rapport au texte modèle : "${modelText}"` },
            { inlineData: { mimeType: 'audio/wav', data: audioBase64 } },
          ],
        },
      ],
      config: { responseMimeType: 'application/json' },
    });

    return res.status(200).json(JSON.parse(result.candidates?.[0]?.content?.parts?.[0]?.text || '{}'));
  } catch (err: any) {
    console.warn('Analyze Gemini API error, returning fallback analysis:', err.message);
    return res.status(200).json(buildGeminiFallbackResponse(err, 'analyze'));
  }
}
