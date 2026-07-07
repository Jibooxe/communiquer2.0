import type { VercelRequest, VercelResponse } from '@vercel/node';
import { buildGeminiFallbackResponse, isGeminiConfigured, jsonError, parseJsonBody, runGemini } from '../lib/gemini';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return jsonError(res, 405, 'Method not allowed');

  const body = await parseJsonBody(req as any);
  const { text } = body as { text?: string };

  if (!text) return jsonError(res, 400, 'Missing text');
  if (!isGeminiConfigured()) return jsonError(res, 503, 'Gemini API key not configured');

  try {
    const response = await runGemini({
      model: 'gemini-3.1-flash-tts-preview',
      contents: [{ role: 'user', parts: [{ text }] }],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Charon' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    return res.status(200).json({ data: base64Audio });
  } catch (err: any) {
    console.warn('TTS Gemini API error, falling back:', err.message);
    return res.status(200).json(buildGeminiFallbackResponse(err, 'tts'));
  }
}
