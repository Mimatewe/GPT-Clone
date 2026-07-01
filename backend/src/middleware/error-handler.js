export default function errorHandler(err, req, res, next) {
  // Teacher note:
  // Express sends errors here when a controller calls next(error).
  // One shared error handler keeps every API error response consistent.
  const statusCode = err.statusCode || err.status || 500;
  const message =
    statusCode >= 500 && !err.isOperational
      ? "Something went wrong try again later"
      : err.message || "Something went wrong try again later";

  if (statusCode >= 500) {
    // Log server errors for the developer, but return a simple message to users.
    console.error("Unhandled request error:", err);
  }

  // The PDF examples use { status: false, message: "..." } for errors.
  // We use success: false to match the success: true shape.
  return res.status(statusCode).json({
    success: false,
    message,
  });
}

export { errorHandler };
