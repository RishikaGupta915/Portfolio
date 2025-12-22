import express from 'express';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// CORS configuration
app.use(
  cors({
    origin: [
      'http://localhost:3000',
      'http://localhost:5173',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:5173',
    ],
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

// Middleware
app.use(express.json());

// Health check routes
const healthPayload = () => ({
  status: 'OK',
  message: 'Server is running',
  timestamp: new Date().toISOString(),
  groqApiConfigured: !!process.env.GROQ_API_KEY,
  port: PORT,
});

app.get('/health', (req, res) => {
  const status = {
    status: 'OK',
    message: 'Server is running ',
    timestamp: new Date().toISOString(),
    groqApiConfigured: !!process.env.GROQ_API_KEY,
    port: PORT,
  };
  res.json(status);
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Chat endpoint
app.post('/api/ask', async (req, res) => {
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
    const chosenModel = 'llama-3.1-8b-instant'; // Most stable current model
    // Alternative options: 'llama-3.1-70b-versatile', 'mixtral-8x7b-32768', 'deepseek-r1-distill-qwen-32b'

    console.log(`Processing question: "${question.substring(0, 50)}..."`);
    console.log(`Using model: ${chosenModel}`);
    console.log(
      `API Key configured: ${process.env.GROQ_API_KEY ? 'Yes' : 'No'}`
    );

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

      return res.status(200).json({
        error: `API Error: ${response.status}`,
        answer: errorMessage,
      });
    }

    const data = await response.json();
    console.log('API response received successfully');

    const answer =
      data.choices?.[0]?.message?.content?.trim() ||
      "I couldn't generate a response. Please try again.";

    res.json({
      answer,
      timestamp: new Date().toISOString(),
      model: chosenModel,
      success: true,
    });
  } catch (err) {
    console.error('Server error:', err);
    res.status(200).json({
      error: 'Server error',
      answer: 'Sorry, something went wrong on my end. Please try again later.',
      timestamp: new Date().toISOString(),
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    answer: 'Something went wrong. Please try again.',
  });
});

// Start server with enhanced logging
app.listen(PORT, () => {
  console.log(`Chat Server running at http://localhost:${PORT}`);
  console.log(`Health check → http://localhost:${PORT}/health`);
  console.log(`Chat → http://localhost:${PORT}/api/ask`);
  console.log(
    `Groq API Key: ${process.env.GROQ_API_KEY ? 'Configured' : 'Missing'}`
  );
  console.log(`CORS enabled for frontend development`);
});

export default app;
