import 'dotenv/config';

import db from './db/db.config.js';
import env from './src/config/env.js';
import { createApp } from './src/app.js';

// Teacher note:
// index.js is the backend entry point. When you run `npm run dev` or
// `npm start`, Node starts here first.
async function startServer() {
  try {
    // Before accepting requests, we test the database connection once.
    // This tells the rest of the app whether it should use MySQL or the
    // temporary in-memory fallback in development.
    const connection = await db.getConnection();
    connection.release();
    process.env.DB_AVAILABLE = 'true';
    console.log('DB connected');
  } catch (error) {
    process.env.DB_AVAILABLE = 'false';

    // In production, losing the database is a serious problem, so the server
    // stops. In local development, we keep running so you can still test the UI.
    if (env.dbRequired) {
      console.error(`Database connection failed: ${error.message}`);
      process.exit(1);
    }

    console.warn(
      `Database unavailable; using in-memory chat store: ${error.message}`
    );
  }

  // createApp() builds the Express app with routes and middleware.
  // app.listen(...) connects that app to a real network port.
  const app = createApp();
  const server = app.listen(env.port, () => {
    console.log('--- Server Started ---');
    console.log(`Port: ${env.port}`);
    console.log(`NODE_ENV: ${env.nodeEnv}`);
    console.log(`Allowed CORS Origins: ${env.corsOrigins.join(', ') || '*'}`);
    console.log(`Server is running on http://localhost:${env.port}`);
    console.log('----------------------');
  });

  // If the port is busy or the server cannot start, this reports the failure.
  server.on('error', error => {
    console.error('Server failed to start:', error.message);
    process.exit(1);
  });

  // Graceful shutdown closes the HTTP server first, then closes MySQL.
  // This prevents hanging connections when you stop the server with Ctrl+C.
  const shutdown = async signal => {
    console.log(`${signal} received. Shutting down...`);
    server.close(async () => {
      await db.end();
      process.exit(0);
    });
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

startServer();
