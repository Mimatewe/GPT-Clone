# GPT Clone Teacher Notes

This guide explains how the project is connected. Read it with the code open.

## Big Picture

The app has two sides:

1. Frontend: React app in `frontend/`
   - Shows the chat UI.
   - Sends HTTP requests with Axios.
   - Displays messages returned by the backend.

2. Backend: Express app in `backend/`
   - Receives frontend requests.
   - Validates the question.
   - Saves messages in MySQL.
   - Calls Gemini.
   - Returns saved user and assistant messages.

The normal request flow is:

```txt
User types question
  -> React ChatInput sends text to App
  -> App POSTs /api/chat/conversations
  -> Vite proxy forwards /api to Express on localhost:3777
  -> Express router calls controller
  -> Controller calls service
  -> Service validates, loads history, saves user row, calls Gemini, saves assistant row
  -> Repository runs SQL against MySQL
  -> Backend returns JSON
  -> React updates the message list
```

## Backend File Map

`backend/index.js`

This is where the backend starts. It imports environment variables, checks the database connection, creates the Express app, and listens on the configured port. If MySQL is unavailable in local development, it marks `DB_AVAILABLE=false`, so the service can use memory storage.

`backend/src/app.js`

This builds the Express app. It adds middleware first, then routes, then error handlers. Order matters in Express:

```txt
middleware -> routes -> not found -> error handler
```

`backend/src/config/env.js`

This reads `.env` values and gives the rest of the backend one clean `env` object. This is better than calling `process.env` everywhere.

`backend/db/schema.sql`

This creates the `conversations` table. Every chat message is one row. A full question-answer turn creates two rows:

```txt
row 1: role = user
row 2: role = assistant
```

`backend/db/db.config.js`

This creates a MySQL connection pool. A pool reuses database connections, which is more efficient than opening a new connection for every request.

`backend/db/migrate.js`

This reads `schema.sql` and runs it. Use it when you need to create the database table:

```bash
npm run migrate
```

`backend/src/api/main.routes.js`

This is the main API router. It defines `/api/health` and connects `/api/chat` to the chat router.

`backend/src/api/chat/chat.router.js`

This maps the route path to controller functions:

```txt
GET  /api/chat/conversations  -> getConversationsController
POST /api/chat/conversations  -> createConversationController
```

`backend/src/api/chat/controller/chat.controller.js`

Controllers understand HTTP. They read `req`, call the service, and send `res.json(...)`.

`backend/src/api/chat/service/chat.service.js`

This is the most important backend file. It contains the app rules:

- validate `question`
- get the latest 5 previous rows for Gemini context
- save the user question
- call Gemini
- save the assistant answer
- return both saved rows

`backend/src/api/chat/repository/chat.repository.js`

Repository functions contain SQL. They are responsible for reading and writing database rows.

## Frontend File Map

`frontend/src/main.jsx`

This starts React and renders `<App />` into the browser page.

`frontend/src/App.jsx`

This is the main frontend brain. It owns:

- `conversations`: the messages visible on screen
- `isLoading`: whether the assistant is responding
- `isBooting`: whether initial history is loading
- `toast`: temporary feedback text

Important functions:

- `fetchConversations()` calls `GET /api/chat/conversations`
- `handleSendMessage()` calls `POST /api/chat/conversations`
- `handleRefresh()` reloads saved history
- `handleNewChat()` clears the visible screen only
- `handleExportChat()` downloads visible chat as Markdown

`frontend/src/components/ChatInput/ChatInput.jsx`

This owns the textarea. It sends typed text up to `App` through `handleSendMessage`.

`frontend/src/components/MessageList/MessageList.jsx`

This chooses what to show in the message area:

- loading saved chats
- empty state
- message bubbles
- assistant typing dots

`frontend/src/components/ChatMessage/ChatMessage.jsx`

This renders one message bubble. User messages show plain text. Assistant messages use `ReactMarkdown`, so Gemini can return Markdown and code blocks.

`frontend/vite.config.js`

This configures the dev proxy:

```txt
Frontend calls: /api/chat/conversations
Vite forwards to: http://localhost:3777/api/chat/conversations
```

That is why the frontend does not need to hard-code the backend port in React code.

## API Contract

Load history:

```http
GET /api/chat/conversations
```

Success response:

```json
{
  "success": true,
  "message": "Conversations fetched successfully.",
  "data": {
    "conversations": []
  }
}
```

Send question:

```http
POST /api/chat/conversations
Content-Type: application/json

{
  "question": "What is a closure in JavaScript?"
}
```

Success response:

```json
{
  "success": true,
  "message": "Conversation posted successfully.",
  "data": {
    "userConversation": {},
    "assistantConversation": {}
  }
}
```

Validation error:

```json
{
  "status": false,
  "message": "question is required"
}
```

## Corrections And Code Quality Notes

1. Good: The active backend now matches the PDF route contract.

2. Good: The frontend no longer calls old `/chat/sessions` routes.

3. Correction note: `frontend/src/components/Sidebar` and `frontend/src/components/ChatHeader` are old unused files from the previous session-based design. They do not break the app, but they can confuse students. You can delete them later if you want a cleaner project.

4. Correction note: `handleNewChat()` clears only the visible React state. It does not delete database rows. This is correct for a simple no-session project, but the button name can be confusing. A clearer label could be "Clear screen".

5. Correction note: If Gemini fails after the user message is saved, the database can contain the user message without an assistant answer. For this class project that is acceptable, but a production app should save a status, retry, or create an assistant error row.

6. Correction note: The backend falls back to memory only when database connection fails during startup. If MySQL connects at startup but fails later, repository calls will return errors. Production apps need stronger retry and monitoring.

7. Correction note: Error responses use the PDF shape `{ status: false, message }`, while success responses use `{ success: true, message, data }`. This follows the PDF, but many real projects standardize both success and error shapes.

8. Extra feature note: File attach and voice input are frontend-only helpers. They put text into the prompt box. They are not real file upload or audio upload features.

## How To Study This Project

Read in this order:

1. `backend/db/schema.sql`
2. `backend/src/api/chat/repository/chat.repository.js`
3. `backend/src/api/chat/service/chat.service.js`
4. `backend/src/api/chat/controller/chat.controller.js`
5. `backend/src/api/chat/chat.router.js`
6. `backend/src/app.js`
7. `backend/index.js`
8. `frontend/src/App.jsx`
9. `frontend/src/components/ChatInput/ChatInput.jsx`
10. `frontend/src/components/MessageList/MessageList.jsx`
11. `frontend/src/components/ChatMessage/ChatMessage.jsx`

After that, run the project and watch the browser Network tab when you send a message.
