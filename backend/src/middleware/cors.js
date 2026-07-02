import cors from "cors";
import env from "../config/env.js";

// Teacher note:
// The cors package handles the complex parts of the CORS protocol for us,
// including preflight OPTIONS requests and allowing specific origins.
const corsOptions = {
  origin: (origin, callback) => {
    // In production, we want to be strict about which origins can call our API.
    // In development, we allow localhost and any other origins specified in .env.
    const allowedOrigins = [
      "http://localhost:5173",
      "http://localhost:3000",
      "https://chat-gp.netlify.app",
      ...env.corsOrigins,
    ];

    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes("*") || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error("Not allowed by CORS"));
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  credentials: true,
  optionsSuccessStatus: 204, // Some legacy browsers (IE11, various SmartTVs) choke on 204
};

const corsMiddleware = cors(corsOptions);

export default corsMiddleware;
