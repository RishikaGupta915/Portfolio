import { PROFILE_CONTEXT } from '../shared/aiProfile.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { question } = req.body;

    if (!question || typeof question !== 'string' || !question.trim()) {
      return res.status(400).json({ error: 'Missing question' });
    }

    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({
        error:
          'Missing GROQ_API_KEY. Add it in your environment variables and redeploy (or set it locally for dev).',
      });
    }

    const groqRes = await fetch(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'deepseek-r1-distill-llama-70b',
          messages: [
            { role: 'system', content: PROFILE_CONTEXT },
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
      return res.status(502).json({
        error: 'Upstream AI request failed',
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
