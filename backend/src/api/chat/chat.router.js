import express from "express";
import {
  createConversationController,
  getConversationsController,
} from "./controller/chat.controller.js";

const chatRouter = express.Router();

// Teacher note:
// Router maps URL + HTTP method to a controller function.
// GET means "read chat history".
// POST means "send a new question and create two rows: user + assistant".
chatRouter
  .route("/conversations")
  .get(getConversationsController)
  .post(createConversationController);

export default chatRouter;
