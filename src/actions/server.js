import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

// Load environment variables
dotenv.config();

// Debug environment loading
console.log('=== Environment Debug ===');
console.log('HF_TOKEN exists:', !!process.env.HF_TOKEN);
console.log(
  'HF_TOKEN length:',
  process.env.HF_TOKEN ? process.env.HF_TOKEN.length : 'undefined'
);
console.log(
  'HF_TOKEN preview:',
  process.env.HF_TOKEN
    ? process.env.HF_TOKEN.substring(0, 15) + '...'
    : 'undefined'
);
console.log(
  'All env keys:',
  Object.keys(process.env).filter((key) => key.includes('HF'))
);
console.log('=========================');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'Server is running!',
    timestamp: new Date().toISOString(),
  });
});

// AI Chat endpoint
app.post('/api/ask', async (req, res) => {
  try {
    const { question } = req.body;

    if (!question || question.trim() === '') {
      return res.status(400).json({
        error: 'Question is required',
        answer: 'Please provide a question to get an answer.',
      });
    }

    // Check if HuggingFace token is available
    if (!process.env.HF_TOKEN) {
      return res.status(500).json({
        error: 'HuggingFace token not configured',
        answer:
          'AI service is not properly configured. Please check the server setup.',
      });
    }

    console.log('Processing question:', question);
    console.log(
      'Token length:',
      process.env.HF_TOKEN ? process.env.HF_TOKEN.length : 'undefined'
    );
    console.log(
      'Token starts with:',
      process.env.HF_TOKEN
        ? process.env.HF_TOKEN.substring(0, 10) + '...'
        : 'undefined'
    );

    // Call HuggingFace API with GPT-2 (fallback option)
    const response = await fetch(
      'https://api-inference.huggingface.co/models/gpt2',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.HF_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: question,
          parameters: {
            max_length: 100,
            temperature: 0.7,
            do_sample: true,
            pad_token_id: 50256,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('HuggingFace API error:', response.status, errorText);

      // Handle specific error cases
      if (response.status === 503) {
        return res.json({
          answer:
            'The AI model is currently loading. Please try again in a few moments.',
          error: 'Model loading',
        });
      }

      return res.status(500).json({
        error: 'AI service error',
        answer:
          'Sorry, I encountered an error while processing your question. Please try again later.',
      });
    }

    const data = await response.json();
    console.log('HuggingFace response:', data);

    // Extract answer from response
    let answer = 'Sorry, I could not generate a response.';

    if (Array.isArray(data) && data.length > 0) {
      if (data[0].generated_text) {
        // For DialoGPT, extract the response after the input
        const fullText = data[0].generated_text;
        const responseText = fullText.substring(question.length).trim();
        answer =
          responseText ||
          'I understand your question, but I need more context to provide a helpful answer.';
      } else if (typeof data[0] === 'string') {
        answer = data[0];
      }
    } else if (data.generated_text) {
      answer = data.generated_text;
    } else if (typeof data === 'string') {
      answer = data;
    }

    // Final cleanup
    answer = answer.trim();

    if (answer === '' || answer.length < 3) {
      answer =
        'I understand your question. Could you please rephrase it or provide more details?';
    }

    res.json({
      answer,
      timestamp: new Date().toISOString(),
      question: question,
    });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({
      error: 'Internal server error',
      answer: 'Sorry, something went wrong on my end. Please try again later.',
      timestamp: new Date().toISOString(),
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`🔍 Health check: http://localhost:${PORT}/health`);
  console.log(`🤖 AI Chat endpoint: http://localhost:${PORT}/api/ask`);
  console.log(
    `🔑 HuggingFace token configured: ${process.env.HF_TOKEN ? 'Yes' : 'No'}`
  );
});

export default app;
