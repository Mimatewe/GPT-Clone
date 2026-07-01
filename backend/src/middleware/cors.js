import env from "../config/env.js";

// Teacher note:
// Browsers block requests between different origins unless the API allows them.
// Vite might run on localhost:5173, while Express runs on localhost:3777.
// CORS headers tell the browser that this frontend is allowed to call this API.
export default function corsMiddleware(req, res, next) {
  const requestOrigin = req.headers.origin;
  const allowsAnyOrigin = env.corsOrigins.includes("*");
  const allowedOrigin = allowsAnyOrigin
    ? requestOrigin || "*"
    : env.corsOrigins.find((origin) => origin === requestOrigin);

  if (allowedOrigin) {
    res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
  }

  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS"
  );

  if (req.method === "OPTIONS") {
    // Browsers send OPTIONS preflight requests before some real requests.
    // A 204 response means "allowed, no body needed".
    return res.sendStatus(204);
  }

  return next();
}
