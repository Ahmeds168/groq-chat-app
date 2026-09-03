require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const app = express();

const PORT = process.env.PORT || 5000;
const GROQ_API_URL = process.env.GROQ_API_URL || 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = process.env.GROQ_MODEL || 'openai/gpt-oss-120b';
const GROQ_API_KEY = process.env.GROQ_API_KEY;

// Only allow requests from the deployed frontend (and localhost during development).
// Set ALLOWED_ORIGINS in the environment as a comma-separated list to override/extend this.
const DEFAULT_ALLOWED_ORIGINS = [
  'https://groq-chat-frontend-ahmed-ali-shahs-projects-c142f759.vercel.app',
  'http://localhost:5173',
];
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
  : DEFAULT_ALLOWED_ORIGINS;

app.use(
  cors({
    origin(origin, callback) {
      // Allow non-browser tools (curl, health checks) that send no Origin header.
      if (!origin || ALLOWED_ORIGINS.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    },
  })
);
app.use(express.json({ limit: '10kb' })); // prompts don't need to be huge; blocks oversized payload abuse

// Trust Render's proxy so req.ip reflects the real client IP (needed for accurate rate limiting)
app.set('trust proxy', 1);

// General limiter: caps total traffic per IP across the whole API
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please try again later.' },
});
app.use('/api/', generalLimiter);

// Stricter limiter just for the expensive Groq-calling endpoint
const chatLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many prompts sent. Please wait a moment before trying again.' },
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', keyConfigured: Boolean(GROQ_API_KEY) });
});

// Main endpoint the frontend calls with the user's prompt
app.post('/api/chat', chatLimiter, async (req, res) => {
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

// Catches CORS rejections and any other unhandled errors so we return clean JSON, not an HTML stack trace
app.use((err, req, res, next) => {
  if (err && err.message === 'Not allowed by CORS') {
    return res.status(403).json({ error: 'Origin not allowed.' });
  }
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Unexpected server error.' });
});

app.listen(PORT, () => {
  console.log(`Groq backend listening on http://localhost:${PORT}`);
  if (!GROQ_API_KEY) {
    console.warn('WARNING: GROQ_API_KEY is not set. Copy .env.example to .env and add your key.');
  }
});
