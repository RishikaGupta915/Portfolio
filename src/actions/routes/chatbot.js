import express from 'express';
import fetch from 'node-fetch';

const router = express.Router();

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// Chat endpoint
router.post('/ask', async (req, res) => {
  try {
    const { question } = req.body;

    // Validate input
    if (!question || typeof question !== 'string' || !question.trim()) {
      return res.status(400).json({
        error: "Missing or invalid 'question'",
        answer: 'Please provide a valid question.',
      });
    }

    // Check API key
    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({
        error: 'API key not configured',
        answer: 'AI service is not properly configured.',
      });
    }

    // Choose model
    const chosenModel = 'llama-3.1-8b-instant';

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: chosenModel,
        messages: [
          {
            role: 'system',
            content:
              "You are Rishika's assistant AI helping the users with any question they ask. Be helpful, friendly, and professional. Keep responses concise but informative.",
          },
          { role: 'user', content: question.trim() },
        ],
        max_tokens: 512,
        temperature: 0.7,
        top_p: 1,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Groq API error:', response.status, errorText);

      let errorMessage =
        "Sorry, I'm having trouble connecting to the AI service.";
      if (response.status === 401) {
        errorMessage =
          'AI service authentication failed. Please check API key.';
      } else if (response.status === 429) {
        errorMessage = 'AI service is busy. Please try again in a moment.';
      } else if (response.status === 500) {
        errorMessage = 'AI service is temporarily unavailable.';
      }

      // Keep old behavior: return 200 so frontend can display message.
      return res.status(200).json({
        error: `API Error: ${response.status}`,
        answer: errorMessage,
      });
    }

    const data = await response.json();

    const answer =
      data.choices?.[0]?.message?.content?.trim() ||
      "I couldn't generate a response. Please try again.";

    return res.json({
      answer,
      timestamp: new Date().toISOString(),
      model: chosenModel,
      success: true,
    });
  } catch (err) {
    console.error('Server error:', err);
    return res.status(200).json({
      error: 'Server error',
      answer: 'Sorry, something went wrong on my end. Please try again later.',
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;
