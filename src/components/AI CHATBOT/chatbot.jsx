'use client';
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export default function AIBrowser({ onClose }) {
  const API_BASE = import.meta.env.VITE_API_BASE || '';
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState([
    {
      type: 'ai',
      content: "👋 Hello! I'm your AI assistant. Ask me anything!",
      timestamp: new Date().toISOString(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Check server connection on component mount
  useEffect(() => {
    checkServerConnection();
  }, []);

  const checkServerConnection = async () => {
    try {
      console.log('Attempting to connect to /api/health...');
      const response = await fetch(`${API_BASE}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      console.log(
        'Response content-type:',
        response.headers.get('content-type')
      );

      if (response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          console.log('API health check success:', data);
          setIsConnected(true);
        } else {
          const text = await response.text();
          console.error(
            'API returned non-JSON response:',
            text.substring(0, 200)
          );
          setIsConnected(false);
        }
      } else {
        const errorText = await response.text();
        console.error('API health check failed:', response.status, errorText);
        setIsConnected(false);
      }
    } catch (error) {
      console.error('API connection error details:', error);
      setIsConnected(false);
    }
  };

  const askAI = async () => {
    if (!question.trim()) return;

    const userMessage = {
      type: 'user',
      content: question,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    const currentQuestion = question;
    setQuestion('');

    try {
      console.log('Sending question to API:', currentQuestion);

      const res = await fetch(`${API_BASE}/api/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: currentQuestion }),
      });

      console.log('API response status:', res.status);
      const data = await res.json();
      console.log('API response data:', data);

      const aiMessage = {
        type: 'ai',
        content: data.answer || "Sorry, I couldn't process your request.",
        timestamp: new Date().toISOString(),
        error: data.error ? true : false,
      };

      setMessages((prev) => [...prev, aiMessage]);
      setIsConnected(true); // Connection successful
    } catch (error) {
      console.error('Error asking AI:', error);
      const errorMessage = {
        type: 'ai',
        content:
          "❌ Connection failed. Please make sure you're running 'vercel dev' and try again.",
        timestamp: new Date().toISOString(),
        error: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      askAI();
    }
  };

  const clearMessages = () => {
    setMessages([
      {
        type: 'ai',
        content: "👋 Hello! I'm your AI assistant. Ask me anything!",
        timestamp: new Date().toISOString(),
      },
    ]);
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 rounded-2xl w-full max-w-4xl h-[80vh] flex flex-col shadow-2xl border border-purple-500/20"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700/50">
          <div className="flex items-center space-x-3">
            <div className="text-2xl">🤖</div>
            <div>
              <h1 className="text-xl font-bold text-white">AI Assistant</h1>
              <div className="flex items-center space-x-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    isConnected === true
                      ? 'bg-green-400'
                      : isConnected === false
                      ? 'bg-red-400'
                      : 'bg-yellow-400'
                  }`}
                ></div>
                <span className="text-sm text-gray-400">
                  {isConnected === true
                    ? 'Connected'
                    : isConnected === false
                    ? 'Disconnected'
                    : 'Checking...'}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={clearMessages}
              className="text-gray-400 hover:text-white transition-colors px-3 py-1 rounded hover:bg-gray-700/50"
              title="Clear chat"
            >
              🗑️
            </button>
            <button
              onClick={checkServerConnection}
              className="text-gray-400 hover:text-white transition-colors px-3 py-1 rounded hover:bg-gray-700/50"
              title="Check connection"
            >
              🔄 Test
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors text-xl font-bold w-8 h-8 flex items-center justify-center rounded hover:bg-gray-700/50"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <AnimatePresence>
            {messages.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex ${
                  message.type === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl p-4 ${
                    message.type === 'user'
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                      : message.error
                      ? 'bg-red-900/50 text-red-200 border border-red-500/30'
                      : 'bg-gray-800/60 text-gray-100 border border-gray-600/30'
                  }`}
                >
                  <div className="flex items-start space-x-2">
                    <div className="text-lg">
                      {message.type === 'user'
                        ? '👤'
                        : message.error
                        ? '❌'
                        : '🤖'}
                    </div>
                    <div className="flex-1">
                      <p className="whitespace-pre-wrap">{message.content}</p>
                      <div className="text-xs opacity-60 mt-2">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Loading indicator */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="bg-gray-800/60 text-gray-100 border border-gray-600/30 rounded-2xl p-4">
                <div className="flex items-center space-x-2">
                  <div className="text-lg">🤖</div>
                  <div className="flex space-x-1">
                    <div
                      className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                      style={{ animationDelay: '0ms' }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                      style={{ animationDelay: '150ms' }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                      style={{ animationDelay: '300ms' }}
                    ></div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-6 border-t border-gray-700/50">
          <div className="flex space-x-4">
            <textarea
              className="flex-1 bg-gray-800/60 text-white rounded-xl p-4 border border-gray-600/30 focus:border-purple-500/50 focus:outline-none resize-none"
              placeholder="Ask me anything... (Press Enter to send, Shift+Enter for new line)"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyPress={handleKeyPress}
              rows="3"
              disabled={isLoading}
            />
            <button
              onClick={askAI}
              disabled={isLoading || !question.trim() || isConnected === false}
              className="px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                'Send 🚀'
              )}
            </button>
          </div>

          {isConnected === false && (
            <div className="mt-3 text-center">
              <div className="inline-flex items-center space-x-2 bg-red-900/50 text-red-200 px-4 py-2 rounded-lg border border-red-500/30">
                <span>⚠️</span>
                <span className="text-sm">
                  API not connected. Please run: vercel dev
                </span>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
