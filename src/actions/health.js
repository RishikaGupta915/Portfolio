export default async function handler(req, res) {
  res.json({
    status: 'OK',
    message: 'AI Chat Server is running 🚀',
    groqApiConfigured: !!process.env.GROQ_API_KEY,
  });
}
