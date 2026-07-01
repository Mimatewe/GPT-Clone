import "dotenv/config";

// Teacher note:
// env.js is the one place where we read environment variables.
// This makes configuration predictable and avoids scattering process.env
// across every controller/service file.
function readRequiredEnv(name) {
  const value = process.env[name];

  if (!value || value.trim() === "") {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value.trim();
}

function readNumberEnv(name, fallback, options = {}) {
  // Environment variables always arrive as strings.
  // This helper converts them to numbers and validates min/max values.
  const rawValue = process.env[name];

  if (!rawValue || rawValue.trim() === "") {
    return fallback;
  }

  const parsedValue = Number(rawValue);

  if (!Number.isFinite(parsedValue)) {
    throw new Error(`${name} must be a number`);
  }

  if (options.min !== undefined && parsedValue < options.min) {
    throw new Error(`${name} must be greater than or equal to ${options.min}`);
  }

  if (options.max !== undefined && parsedValue > options.max) {
    throw new Error(`${name} must be less than or equal to ${options.max}`);
  }

  return parsedValue;
}

function readListEnv(name, fallback) {
  // CORS_ORIGIN can hold a comma-separated list.
  // Example: http://localhost:5173,http://localhost:3000
  const rawValue = process.env[name];

  if (!rawValue || rawValue.trim() === "") {
    return fallback;
  }

  return rawValue
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

// Keeping all environment reads in one file makes startup failures easier to
// understand. When a required value is missing, the app fails before it accepts
// requests instead of crashing later inside a controller.
const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: readNumberEnv("PORT", 3777, { min: 1, max: 65535 }),
  corsOrigins: readListEnv("CORS_ORIGIN", ["*"]),
  requestBodyLimit: process.env.REQUEST_BODY_LIMIT || "1mb",
  dbRequired:
    (process.env.DB_REQUIRED || "").toLowerCase() === "true" ||
    process.env.NODE_ENV === "production",

  db: {
    host: readRequiredEnv("DB_HOST"),
    port: readNumberEnv("DB_PORT", 3306, { min: 1, max: 65535 }),
    user: readRequiredEnv("DB_USER"),
    password: readRequiredEnv("DB_PASSWORD"),
    database: readRequiredEnv("DB_DATABASE"),
    connectionLimit: readNumberEnv("DB_CONNECTION_LIMIT", 10, {
      min: 1,
      max: 50,
    }),
  },

  gemini: {
    apiKey: process.env.GEMINI_API_KEY || "",
    model: process.env.GEMINI_MODEL || "gemini-3.5-flash",
    maxOutputTokens: readNumberEnv("GEMINI_MAX_OUTPUT_TOKENS", 1024, {
      min: 1,
      max: 8192,
    }),
    temperature: readNumberEnv("GEMINI_TEMPERATURE", 0.7, {
      min: 0,
      max: 2,
    }),
    systemInstruction:
      process.env.GEMINI_SYSTEM_INSTRUCTION ||
      "You are a helpful programming assistant. Answer questions about programming, software engineering, computer science, and IT. Explain clearly, use Markdown when helpful, wrap code in fenced code blocks, politely decline unrelated topics, and avoid harmful or unethical code.",
  },

  chat: {
    defaultHistoryLimit: readNumberEnv("CHAT_HISTORY_LIMIT", 5, {
      min: 2,
      max: 50,
    }),
    defaultListLimit: readNumberEnv("CHAT_LIST_LIMIT", 100, {
      min: 1,
      max: 500,
    }),
    maxQuestionLength: readNumberEnv("CHAT_MAX_QUESTION_LENGTH", 65535, {
      min: 1,
      max: 65535,
    }),
  },
};

export default env;
