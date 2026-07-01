# GPT Clone Backend

Express + MySQL + Gemini API backend for the Week 2 ChatGPT clone project.

## Scripts

```bash
npm run migrate
npm run dev
npm run start
npm run check
```

Run `npm run migrate` after creating the MySQL database, then start the server.

## API

Base URL: `http://localhost:3777`

```txt
GET  /api/health
GET  /api/chat/conversations
POST /api/chat/conversations
```

Backward-compatible aliases:

```txt
GET  /api/conversations
POST /api/conversations
```

## Database

The migration creates one table:

```txt
conversations
- id
- role
- content
- token_count
- created_at
```

## Send A Message

```http
POST /api/chat/conversations
Content-Type: application/json

{
  "question": "Explain React props like I am a beginner"
}
```

Successful responses return `data.userConversation` and `data.assistantConversation`.

## Environment

Copy `.env.example` to `.env` and fill in the values.

- `PORT`: API port. Default: `3777`.
- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_DATABASE`: MySQL connection.
- `DB_REQUIRED`: set `true` to fail startup when MySQL is unavailable. Production enforces this automatically.
- `GEMINI_API_KEY`: required for assistant responses.
- `GEMINI_MODEL`: Gemini model name. Default: `gemini-2.5-flash-lite`.
- `CORS_ORIGIN`: comma-separated allowed frontend origins, or `*` for local development.
- `CHAT_HISTORY_LIMIT`: previous rows sent to Gemini for context. Default: `5`.
- `CHAT_MAX_QUESTION_LENGTH`: maximum accepted prompt length. Default: `65535`.

When MySQL is unavailable in development, the API starts with an in-memory chat store so the frontend remains runnable.
