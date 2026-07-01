import {
  createConversationService,
  getConversationsService,
} from "../service/chat.service.js";

// Teacher note:
// Controllers are the HTTP layer. They know about req and res.
// They should stay thin: read request data, call the service, send JSON.
export async function getConversationsController(req, res, next) {
  try {
    // req.query.limit comes from URLs like /api/chat/conversations?limit=50.
    // The service validates and clamps it so the controller stays simple.
    const conversations = await getConversationsService(req.query.limit);

    res.status(200).json({
      success: true,
      message: "Conversations fetched successfully.",
      data: { conversations },
    });
  } catch (error) {
    next(error);
  }
}

export async function createConversationController(req, res, next) {
  try {
    // req.body is the parsed JSON from the frontend POST request.
    // Expected shape: { "question": "What is a closure?" }
    const result = await createConversationService(req.body);

    res.status(201).json({
      success: true,
      message: "Conversation posted successfully.",
      data: result,
    });
  } catch (error) {
    // next(error) sends the problem to error-handler.js.
    // This keeps all error response formatting in one file.
    next(error);
  }
}
