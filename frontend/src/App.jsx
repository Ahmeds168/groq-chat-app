import { useState } from 'react';

export default function App() {
  const [systemPrompt, setSystemPrompt] = useState('');
  const [prompt, setPrompt] = useState('');
  const [reply, setReply] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const API_BASE = 'https://groq-chat-backend-n5w1.onrender.com';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim() || loading) return;

    setLoading(true);
    setError('');
    setReply('');

    try {
      const res = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, systemPrompt }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Request failed');
      }

      setReply(data.reply);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>Groq Chat</h1>
        <p style={styles.subtitle}>
          Set a system prompt to steer behavior, then send a user prompt to Groq.
        </p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label} htmlFor="systemPrompt">
            System prompt
          </label>
          <textarea
            id="systemPrompt"
            style={styles.textarea}
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            placeholder="e.g. You are a concise, friendly assistant that answers in bullet points."
            rows={3}
          />

          <label style={styles.label} htmlFor="userPrompt">
            User prompt
          </label>
          <textarea
            id="userPrompt"
            style={styles.textarea}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ask Groq anything..."
            rows={5}
          />

          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? 'Sending...' : 'Send'}
          </button>
        </form>

        {error && <div style={styles.error}>{error}</div>}

        {reply && (
          <div style={styles.replyBox}>
            <h3 style={styles.replyTitle}>Response</h3>
            <p style={styles.replyText}>{reply}</p>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
    padding: '48px 16px',
    background: '#0f172a',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  card: {
    width: '100%',
    maxWidth: 640,
    background: '#1e293b',
    borderRadius: 12,
    padding: 32,
    boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
  },
  title: { color: '#f8fafc', margin: 0, fontSize: 28 },
  subtitle: { color: '#94a3b8', marginTop: 8, marginBottom: 24 },
  form: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: {
    color: '#a5b4fc',
    fontSize: 13,
    fontWeight: 600,
    marginTop: 12,
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  textarea: {
    resize: 'vertical',
    borderRadius: 8,
    border: '1px solid #334155',
    background: '#0f172a',
    color: '#f8fafc',
    padding: 12,
    fontSize: 15,
    fontFamily: 'inherit',
  },
  button: {
    alignSelf: 'flex-end',
    marginTop: 16,
    padding: '10px 20px',
    borderRadius: 8,
    border: 'none',
    background: '#6366f1',
    color: '#fff',
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer',
  },
  error: {
    marginTop: 16,
    padding: 12,
    borderRadius: 8,
    background: '#450a0a',
    color: '#fecaca',
  },
  replyBox: {
    marginTop: 24,
    padding: 16,
    borderRadius: 8,
    background: '#0f172a',
    border: '1px solid #334155',
  },
  replyTitle: { color: '#a5b4fc', margin: '0 0 8px 0', fontSize: 14, textTransform: 'uppercase', letterSpacing: 0.5 },
  replyText: { color: '#e2e8f0', margin: 0, whiteSpace: 'pre-wrap', lineHeight: 1.6 },
};
