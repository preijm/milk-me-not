import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import App from './App.tsx'
import { ErrorBoundary } from './components/common/ErrorBoundary'
import './index.css'

// Reveal page once styles are loaded (prevents FOUC)
document.documentElement.classList.add('ready');

// The build writes a canonical into the file for each fixed route (routeHeads
// in vite.config.ts) so a crawler has one before any script runs. From here
// <Seo> owns it. Left in, it would sit first in the head and still name the
// landing page after a Back press — and Counterscale reads the first canonical
// in preference to the address.
document.querySelector('link[rel="canonical"]')?.remove();

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
