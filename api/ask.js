import PROFILE_CONTEXT from '../shared/aiProfile.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { question } = req.body;

    if (!question || typeof question !== 'string' || !question.trim()) {
      return res.status(400).json({ error: 'Missing question' });
    }

    const groqKey =
      process.env.GROQ_API_KEY ||
      process.env.GROQ_API_KEY_VERCEL ||
      process.env.GROQ_KEY;

    if (!groqKey) {
      return res.status(500).json({
        error: 'Missing GROQ_API_KEY.',
      });
    }

    const groqRes = await fetch(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${groqKey}`,
        },
        body: JSON.stringify({
          // If you prefer another Groq model, change here.
          model: 'llama-3.3-70b-versatile',
          temperature: 0.4,
          messages: [
            {
              role: 'system',
              content:
                "You are an assistant for Rishika Gupta's portfolio website. If the user asks about Rishika/the owner/the portfolio (including skills, projects, education, contact), answer from the provided Owner Profile. Do not ask who Rishika is. If the profile lacks a detail, say you don't know.",
            },
            {
              role: 'system',
              content: PROFILE_CONTEXT(),
            },
            { role: 'user', content: question },
          ],
        }),
      }
    );

    const contentType = groqRes.headers.get('content-type') || '';
    const data = contentType.includes('application/json')
      ? await groqRes.json()
      : { error: await groqRes.text() };

    if (!groqRes.ok) {
      const requestId = groqRes.headers.get('x-request-id') || undefined;
      return res.status(502).json({
        error: 'Upstream AI request failed',
        upstreamStatus: groqRes.status,
        requestId,
        details: data,
      });
    }

    const raw = data.choices?.[0]?.message?.content || '';
    const clean = raw.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
    return res.status(200).json({ answer: clean });
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ error: 'AI request failed' });
  }
}
