require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

const PORT = process.env.PORT || 5000;
const GROQ_API_URL = process.env.GROQ_API_URL || 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = process.env.GROQ_MODEL || 'openai/gpt-oss-120b';
const GROQ_API_KEY = process.env.GROQ_API_KEY;

app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', keyConfigured: Boolean(GROQ_API_KEY) });
});

// Main endpoint the frontend calls with the user's prompt
app.post('/api/chat', async (req, res) => {
  try {
    const { prompt, systemPrompt } = req.body;

    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return res.status(400).json({ error: 'A non-empty "prompt" string is required.' });
    }

    if (systemPrompt !== undefined && typeof systemPrompt !== 'string') {
      return res.status(400).json({ error: '"systemPrompt", if provided, must be a string.' });
    }

    if (!GROQ_API_KEY) {
      return res.status(500).json({
        error: 'Server is missing GROQ_API_KEY. Add it to backend/.env and restart the server.',
      });
    }

    const messages = [];
    if (systemPrompt && systemPrompt.trim()) {
      messages.push({ role: 'system', content: systemPrompt });
    }
    messages.push({ role: 'user', content: prompt });

    const groqResponse = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages,
      }),
    });

    const data = await groqResponse.json();

    if (!groqResponse.ok) {
      return res.status(groqResponse.status).json({
        error: data?.error?.message || 'Groq API request failed.',
        details: data,
      });
    }

    const reply = data?.choices?.[0]?.message?.content ?? '';
    res.json({ reply, raw: data });
  } catch (err) {
    console.error('Error calling Groq API:', err);
    res.status(500).json({ error: 'Unexpected server error while calling Groq API.' });
  }
});

app.listen(PORT, () => {
  console.log(`Groq backend listening on http://localhost:${PORT}`);
  if (!GROQ_API_KEY) {
    console.warn('WARNING: GROQ_API_KEY is not set. Copy .env.example to .env and add your key.');
  }
});
