import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import App from './App.tsx'
import { ErrorBoundary } from './components/common/ErrorBoundary'
import { startErrorReporting } from './lib/errorReporting'
import './index.css'

// Reveal page once styles are loaded (prevents FOUC)
document.documentElement.classList.add('ready');

// Errors thrown outside React's render — a rejected promise in a handler, a
// throw inside a timer, a dynamic import that fails. The boundary below never
// sees those, and they are most of what goes wrong once a page is running.
startErrorReporting();

createRoot(document.getElementById("root")!).render(
  // Outside every provider on purpose. The crash this exists for came from
  // inside one of them, and a boundary within the tree would have gone down
  // with it.
  <ErrorBoundary>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </ErrorBoundary>
);
