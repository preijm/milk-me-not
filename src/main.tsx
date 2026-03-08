import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Defer CSP meta tag injection to avoid blocking render
if ('requestIdleCallback' in window) {
  requestIdleCallback(() => {
    import('./lib/securityHeaders').then(({ setSecurityHeaders }) => setSecurityHeaders());
  });
} else {
  setTimeout(() => {
    import('./lib/securityHeaders').then(({ setSecurityHeaders }) => setSecurityHeaders());
  }, 0);
}

// Reveal page once styles are loaded (prevents FOUC)
document.documentElement.classList.add('ready');

createRoot(document.getElementById("root")!).render(<App />);
