import { GoogleGenAI } from "@google/genai";
import env from "../../../config/env.js";
import AppError from "../../../utils/app-error.js";
import {
  insertConversation,
  listRecentConversations,
} from "../repository/chat.repository.js";

// Teacher note:
// Services are the business-logic layer. This file decides the chat flow:
// validate question -> load history -> save user message -> call Gemini ->
// save assistant message -> return both rows.
const memoryStore = {
  // This fallback is only for local development when MySQL is not available.
  // It disappears when the server restarts, so it is not permanent storage.
  conversations: [],
  nextConversationId: 1,
};

function databaseAvailable() {
  // index.js sets DB_AVAILABLE after it tries to connect to MySQL.
  return process.env.DB_AVAILABLE !== "false";
}

function normalizeLimit(value, fallback = env.chat.defaultListLimit) {
  // Query params are strings, so we convert limit to a number.
  // Bad values fall back to the default instead of breaking the app.
  const parsed = Number.parseInt(value, 10);

  if (Number.isNaN(parsed) || parsed <= 0) {
    return fallback;
  }

  return Math.min(parsed, env.chat.defaultListLimit);
}

function validateQuestion(value) {
  // The PDF requires question to exist, be a string, not be empty after
  // trimming spaces, and be at most 65535 characters.
  if (typeof value !== "string") {
    throw new AppError("question is required", 400);
  }

  const question = value.trim();

  if (!question) {
    throw new AppError("question is required", 400);
  }

  if (question.length > env.chat.maxQuestionLength) {
    throw new AppError("question is too long", 400);
  }

  return question;
}

function createMemoryConversation({ role, content, tokenCount = 0 }) {
  // This creates the same object shape as a database row would return.
  // That way the rest of the app does not care whether storage is memory or MySQL.
  const conversation = {
    id: memoryStore.nextConversationId++,
    role,
    content,
    tokenCount,
    createdAt: new Date().toISOString(),
  };

  memoryStore.conversations.push(conversation);
  return conversation;
}

async function saveConversation({ role, content, tokenCount = 0 }) {
  // One function chooses the storage type.
  // Service code calls saveConversation and does not repeat fallback logic.
  if (!databaseAvailable()) {
    return createMemoryConversation({ role, content, tokenCount });
  }

  return insertConversation({ role, content, tokenCount });
}

async function getHistoryRows() {
  // Gemini receives only a small recent history as context.
  // The PDF asks for the latest 5 previous rows, not the entire database.
  if (!databaseAvailable()) {
    return memoryStore.conversations.slice(-env.chat.defaultHistoryLimit);
  }

  return listRecentConversations(env.chat.defaultHistoryLimit);
}

function createProviderError(error) {
  // Keep provider errors simple for students and users.
  // Correction note: in a production app, logging provider status/details
  // internally would make debugging easier.
  const status = Number(error?.status || error?.code);

  if (status === 401 || status === 403) {
    return new AppError("AI provider API key is not configured.", 500);
  }

  return new AppError("Something went wrong try again later", 500);
}

async function generateAssistantAnswer({ historyRows, question }) {
  // The API key is checked on the server. The frontend must never receive
  // secret keys because browser code is visible to users.
  if (!env.gemini.apiKey) {
    throw new AppError("AI provider API key is not configured.", 500);
  }

  const client = new GoogleGenAI({ apiKey: env.gemini.apiKey });
  // Gemini uses role "model" for assistant messages.
  // Our database stores that same idea as role "assistant", so we convert here.
  const contents = [
    ...historyRows.map((row) => ({
      role: row.role === "assistant" ? "model" : "user",
      parts: [{ text: row.content }],
    })),
    {
      role: "user",
      parts: [{ text: question }],
    },
  ];

  try {
    // This is the actual AI call.
    // model, temperature, token limit, and system instruction come from env.js.
    const response = await client.models.generateContent({
      model: env.gemini.model,
      contents,
      config: {
        maxOutputTokens: env.gemini.maxOutputTokens,
        temperature: env.gemini.temperature,
        systemInstruction: env.gemini.systemInstruction,
      },
    });

    const text = String(response.text || "").trim();

    // Empty AI output is treated as a server error because the user paid the
    // cost of a request but received no useful answer.
    if (!text) {
      throw new AppError("The model returned an empty answer", 500);
    }

    return {
      text,
      tokenCount: response.usageMetadata?.totalTokenCount || 0,
    };
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    throw createProviderError(error);
  }
}

export async function getConversationsService(limit) {
  // This powers GET /api/chat/conversations.
  // It returns saved messages for page load or refresh.
  const safeLimit = normalizeLimit(limit);

  if (!databaseAvailable()) {
    return memoryStore.conversations.slice(-safeLimit);
  }

  return listRecentConversations(safeLimit);
}

export async function createConversationService({ question } = {}) {
  // This powers POST /api/chat/conversations.
  // It is intentionally not idempotent: every successful request creates
  // a new user row and a new assistant row.
  const normalizedQuestion = validateQuestion(question);

  // Important: load previous history before saving the new user question.
  // Then Gemini receives old history + the new question exactly once.
  const historyRows = await getHistoryRows();

  const userConversation = await saveConversation({
    role: "user",
    content: normalizedQuestion,
    tokenCount: 0,
  });

  const assistantAnswer = await generateAssistantAnswer({
    historyRows,
    question: normalizedQuestion,
  });

  const assistantConversation = await saveConversation({
    role: "assistant",
    content: assistantAnswer.text,
    tokenCount: assistantAnswer.tokenCount,
  });

  return {
    userConversation,
    assistantConversation,
  };
}
