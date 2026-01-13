import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

import chatbotRouter from './routes/chatbot.js';
import musicRouter from './routes/music.js';

dotenv.config();

const app = express();
const PORT = Number(process.env.API_PORT || 5000);

// CORS configuration
app.use(
  cors({
    origin: [
      'http://localhost:3000',
      'http://localhost:5173',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:5173',
      'https://rii-sable.vercel.app',
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
  geminiApiConfigured: !!process.env.GEMINI_API_KEY,
  port: PORT,
});

app.get('/health', (req, res) => {
  const status = {
    status: 'OK',
    message: 'Server is running ',
    timestamp: new Date().toISOString(),
    geminiApiConfigured: !!process.env.GEMINI_API_KEY,
    port: PORT,
  };
  res.json(status);
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    geminiApiConfigured: !!process.env.GEMINI_API_KEY,
  });
});

// Mount feature routes
app.use('/api', chatbotRouter);
app.use("/api/music", musicRouter);

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
  console.log(`API Server running at http://localhost:${PORT}`);
  console.log(`Health check → http://localhost:${PORT}/health`);
  console.log(`Chat → http://localhost:${PORT}/api/ask`);
  console.log(
    `Gemini API Key: ${process.env.GEMINI_API_KEY ? 'Configured' : 'Missing'}`
  );
  console.log(`CORS enabled for frontend development`);
});

export default app;
