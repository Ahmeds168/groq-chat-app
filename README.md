# Groq Chat App

A minimal full-stack app: a Node.js/Express backend that calls the Groq API,
and a React (Vite) frontend with a textbox to send prompts.

## Structure

```
groq-chat-app/
  backend/     Express server, proxies prompts to Groq API
  frontend/    React app (Vite) with the prompt textbox
```

## 1. Backend setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env` and paste your real Groq API key:

```
GROQ_API_KEY=your_actual_key_here
```

Start the backend:

```bash
npm run dev
```

It runs on **http://localhost:5000** and exposes:
- `POST /api/chat` — body `{ "prompt": "..." }`, returns `{ "reply": "..." }`
- `GET /api/health` — quick check that the server (and key) are configured

## 2. Frontend setup

In a separate terminal:

```bash
cd frontend
npm install
npm run dev
```

It runs on **http://localhost:5173** and proxies `/api/*` requests to the
backend on port 5000 (configured in `vite.config.js`), so no extra CORS setup
is needed in dev.

Open http://localhost:5173, type a prompt in the textbox, and hit Send.

## Notes

- The backend uses Node's built-in `fetch`, so Node 18+ is required.
- The Groq model is set via `GROQ_MODEL` in `.env` (defaults to `llama-3.3-70b-versatile`) —
  change it if you want a different model.
- Never commit your real `.env` file — only `.env.example` is meant to be shared.
- For production, build the frontend (`npm run build` in `frontend/`) and serve
  the static files from the backend or your host of choice, and set the
  frontend's fetch URL to your backend's real address if not proxied.
