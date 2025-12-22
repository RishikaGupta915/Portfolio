export default function handler(req, res) {
  return res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    groqApiConfigured: !!(
      process.env.GROQ_API_KEY || process.env.GROQ_API_KEY_VERCEL
    ),
  });
}
