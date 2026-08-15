import { useState } from 'react';

export default function App() {
  const [prompt, setPrompt] = useState('');
  const [reply, setReply] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim() || loading) return;

    setLoading(true);
    setError('');
    setReply('');

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
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
        <p style={styles.subtitle}>Type a prompt below and send it to the Groq API.</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <textarea
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
  form: { display: 'flex', flexDirection: 'column', gap: 12 },
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
