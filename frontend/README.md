# GPT Clone Frontend

React + Vite chat UI for the Week 2 GPT Clone backend.

## Scripts

```bash
npm run dev
npm run build
npm run lint
npm run preview
```

## Environment

Copy `.env.example` to `.env` when you need to override local defaults.

- `VITE_API_BASE_URL`: browser API base path. Default: `/api`.
- `VITE_API_PROXY_TARGET`: Vite dev proxy target. Default: `http://localhost:3777`.

## API Flow

- Page load: `GET /api/chat/conversations`.
- Send prompt: `POST /api/chat/conversations` with `{ "question": "..." }`.
- Successful sends append `data.userConversation` and `data.assistantConversation`.
