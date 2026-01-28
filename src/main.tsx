import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initializeSecurity } from "./lib/securityHeaders";

// Initialize security measures
initializeSecurity();

// Reveal page once styles are loaded (prevents FOUC)
document.documentElement.classList.add('ready');

createRoot(document.getElementById("root")!).render(<App />);
