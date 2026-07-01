import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';

// Teacher note:
// main.jsx is the frontend entry point. React starts here, finds the #root div
// in index.html, and renders the App component into it.
createRoot(document.getElementById('root')).render(
  // StrictMode helps catch React problems during development.
  // It can intentionally run some code twice in dev, so do not put server writes
  // directly inside effects without thinking about repeat behavior.
  <StrictMode>
    <App />
  </StrictMode>,
);
