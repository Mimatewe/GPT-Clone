import process from 'node:process';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  // This plugin lets Vite compile React JSX files.
  plugins: [react()],
  server: {
    proxy: {
      // Teacher note:
      // The frontend calls /api/chat/conversations.
      // During development, Vite forwards /api requests to Express on port 3777.
      // This avoids CORS trouble and keeps frontend code using a simple /api path.
      '/api': process.env.VITE_API_PROXY_TARGET || 'http://localhost:3777',
    },
  },
});
