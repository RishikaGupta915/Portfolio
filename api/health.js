export default function handler(req, res) {
  return res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    geminiApiConfigured: !!(
      process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_API_KEY ||
      process.env.GEMINI_API_KEY_VERCEL ||
      process.env.GEMINI_KEY
    ),
  });
}
