import express from "express";
import env from "./config/env.js";
import mainRouter from "./api/main.routes.js";
import corsMiddleware from "./middleware/cors.js";
import errorHandler from "./middleware/error-handler.js";
import notFoundHandler from "./middleware/not-found.js";

// Teacher note:
// createApp() creates the Express application. Keeping this separate from
// index.js makes the app easier to test and keeps startup code separate from
// route/middleware setup.
export function createApp() {
  const app = express();

  // Small security cleanup: Express normally sends an X-Powered-By header.
  // Hiding it gives attackers one less hint about the server technology.
  app.disable("x-powered-by");

  // Middleware runs before routes. CORS lets the Vite frontend talk to this API.
  app.use(corsMiddleware);

  // These parsers turn JSON request bodies into req.body.
  // Without express.json(), POST /api/chat/conversations could not read
  // { "question": "..." } from the frontend.
  app.use(express.json({ limit: env.requestBodyLimit }));
  app.use(express.urlencoded({ extended: true, limit: env.requestBodyLimit }));

  // These headers are simple browser safety defaults.
  app.use((req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Referrer-Policy", "no-referrer");
    next();
  });

  // Root route is a quick manual check in the browser.
  app.get("/", (req, res) => {
    res.json({
      success: true,
      message: "GPT Clone API is running",
      endpoints: {
        health: "/api/health",
        conversations: "/api/chat/conversations",
      },
    });
  });

  // All project API routes start with /api.
  // Example: /api + /chat + /conversations.
  app.use("/api", mainRouter);

  // Keep these last. If no route matched, notFoundHandler runs.
  // If any route throws an error, errorHandler formats the response.
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
