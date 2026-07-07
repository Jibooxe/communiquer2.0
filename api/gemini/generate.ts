import type { VercelRequest, VercelResponse } from '@vercel/node';
import { buildGeminiFallbackResponse, isGeminiConfigured, jsonError, parseJsonBody, runGemini } from '../lib/gemini';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return jsonError(res, 405, 'Method not allowed');

  const body = await parseJsonBody(req as any);
  const { prompt, systemInstruction, responseMimeType } = body as { prompt?: string; systemInstruction?: string; responseMimeType?: string };

  if (!prompt) return jsonError(res, 400, 'Missing prompt');
  if (!isGeminiConfigured()) return jsonError(res, 503, 'Gemini API key not configured');

  try {
    const result = await runGemini({
      model: 'gemini-3.5-flash',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: { systemInstruction, responseMimeType: responseMimeType || 'text/plain' },
    });

    const text = result.candidates?.[0]?.content?.parts?.[0]?.text || '';
    return res.status(200).json(responseMimeType === 'application/json' ? JSON.parse(text) : { text });
  } catch (err: any) {
    console.warn('Generate Gemini API error, returning fallback text:', err.message);
    return res.status(200).json(buildGeminiFallbackResponse(err, 'generate'));
  }
}
