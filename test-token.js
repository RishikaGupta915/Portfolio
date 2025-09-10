import dotenv from 'dotenv';
import fetch from 'node-fetch';

// Load environment variables
dotenv.config();

console.log('Testing HuggingFace token...');
console.log('Token length:', process.env.HF_TOKEN?.length);
console.log('Token preview:', process.env.HF_TOKEN?.substring(0, 15) + '...');

async function testWithoutAuth() {
  console.log('\n--- Testing without authentication ---');
  try {
    const response = await fetch(
      'https://api-inference.huggingface.co/models/gpt2',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: 'Hello world',
          parameters: { max_length: 20 },
        }),
      }
    );

    console.log('No-auth response status:', response.status);
    const data = await response.text();
    console.log('No-auth response:', data);
  } catch (error) {
    console.error('No-auth test error:', error);
  }
}

async function testWithAuth() {
  console.log('\n--- Testing with authentication ---');
  try {
    const response = await fetch(
      'https://api-inference.huggingface.co/models/gpt2',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.HF_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: 'Hello world',
          parameters: { max_length: 20 },
        }),
      }
    );

    console.log('Auth response status:', response.status);
    const data = await response.text();
    console.log('Auth response:', data);
  } catch (error) {
    console.error('Auth test error:', error);
  }
}

// Test both approaches
testWithoutAuth().then(() => testWithAuth());
