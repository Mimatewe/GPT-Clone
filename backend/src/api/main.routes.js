import express from "express";
import chatRouter from "./chat/chat.router.js";
import {
  createConversationController,
  getConversationsController,
} from "./chat/controller/chat.controller.js";

const mainRouter = express.Router();

// Teacher note:
// This route is for checking that the API is alive.
// The frontend does not need it, but it is useful for debugging.
mainRouter.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API is healthy.",
    data: {
      uptime: process.uptime(),
      database:
        process.env.DB_AVAILABLE === "false" ? "development-memory" : "mysql",
      timestamp: new Date().toISOString(),
    },
  });
});

// This connects /api/chat/... routes to chat.router.js.
// So /api/chat/conversations is defined in the chat router.
mainRouter.use("/chat", chatRouter);

// These two routes are aliases. They let you call /api/conversations too.
// The PDF mainly uses /api/chat/conversations, so that is the main route.
mainRouter
  .route("/conversations")
  .get(getConversationsController)
  .post(createConversationController);

export default mainRouter;
