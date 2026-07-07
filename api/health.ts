import { isGeminiConfigured, jsonError } from './lib/gemini';

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    return jsonError(res, 405, 'Method not allowed');
  }

  return res.status(200).json({
    status: 'ok',
    environment: 'production',
    geminiConfigured: isGeminiConfigured(),
  });
}
