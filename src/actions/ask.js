export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { question } = req.body;

    if (!question?.trim()) {
      return res.json({ answer: 'Please provide a valid question.' });
    }

    const response = await fetch(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: [
            {
              role: 'system',
              content:
                "You are Rishika's assistant AI helping users with any questions. Be helpful, friendly, and professional.",
            },
            { role: 'user', content: question.trim() },
          ],
          max_tokens: 512,
          temperature: 0.7,
        }),
      }
    );

    if (!response.ok) {
      return res.json({
        answer: "Sorry, I'm having trouble connecting to the AI service.",
      });
    }

    const data = await response.json();
    const answer =
      data.choices?.[0]?.message?.content?.trim() ||
      "I couldn't generate a response.";

    res.json({ answer });
  } catch (error) {
    res.json({
      answer: 'Sorry, something went wrong. Please try again later.',
    });
  }
}
