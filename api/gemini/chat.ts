import type { VercelRequest, VercelResponse } from '@vercel/node';
import { buildGeminiFallbackResponse, isGeminiConfigured, jsonError, parseJsonBody, runGemini } from '../lib/gemini';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return jsonError(res, 405, 'Method not allowed');

  const body = await parseJsonBody(req as any);
  const { history, userTextMessage, userAudioBase64, systemInstruction } = body as {
    history?: Array<{ role: 'user' | 'model'; content: string }>;
    userTextMessage?: string;
    userAudioBase64?: string;
    systemInstruction?: string;
  };

  if (!isGeminiConfigured()) return jsonError(res, 503, 'Gemini API key not configured');

  try {
    const userParts: any[] = [];
    if (userTextMessage) userParts.push({ text: userTextMessage });
    if (userAudioBase64) {
      userParts.push({ inlineData: { mimeType: 'audio/wav', data: userAudioBase64 } });
      userParts.push({ text: 'Transcris mon message audio et réponds-moi.' });
    }

    const result = await runGemini({
      model: 'gemini-3.5-flash',
      contents: [
        ...(history || []).map((h: any) => ({ role: h.role === 'model' ? 'model' : 'user', parts: [{ text: h.content }] })),
        { role: 'user', parts: userParts },
      ],
      config: { systemInstruction, responseMimeType: 'application/json' },
    });

    return res.status(200).json(JSON.parse(result.candidates?.[0]?.content?.parts?.[0]?.text || '{}'));
  } catch (err: any) {
    console.warn('Chat Gemini API error, returning fallback response:', err.message);
    return res.status(200).json(buildGeminiFallbackResponse(err, 'chat'));
  }
}
