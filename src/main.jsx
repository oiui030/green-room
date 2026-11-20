import React from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter, MemoryRouter } from 'react-router-dom';

// A preview host that cannot keep a #/path in its address (set VITE_ROUTER=memory at build time)
// gets in-memory routing; everywhere else the route lives in the hash.
const Router = import.meta.env.VITE_ROUTER === 'memory' ? MemoryRouter : HashRouter;
import App from './App.jsx';
import { StoreProvider } from './lib/store.jsx';
import './styles.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <StoreProvider>
      <Router>
        <App />
      </Router>
    </StoreProvider>
  </React.StrictMode>,
);
