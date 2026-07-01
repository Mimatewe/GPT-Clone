export default function notFoundHandler(req, res) {
  // Teacher note:
  // This runs only after every real route failed to match.
  // It helps you see typos like /api/chat/conversation instead of
  // /api/chat/conversations.
  return res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
}
