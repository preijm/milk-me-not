/**
 * Security headers utility for client-side hardening
 * Note: In production, these should be set at the server/CDN level
 */

export const setSecurityHeaders = () => {
  // These are client-side implementations - in production you should set these at server level
  
  // Content Security Policy for XSS protection
  // Note: frame-ancestors directive removed as it cannot be set via meta tag
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://api.mapbox.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://api.mapbox.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: blob: https:",
    "connect-src 'self' https://jtabjndnietpewvknjrm.supabase.co wss://jtabjndnietpewvknjrm.supabase.co https://api.mapbox.com https://*.tiles.mapbox.com https://events.mapbox.com",
    "worker-src 'self' blob:",
    "base-uri 'self'",
    "form-action 'self'"
  ].join('; ');

  // Add meta tag for CSP if not already present
  if (!document.querySelector('meta[http-equiv="Content-Security-Policy"]')) {
    const meta = document.createElement('meta');
    meta.setAttribute('http-equiv', 'Content-Security-Policy');
    meta.setAttribute('content', csp);
    document.head.appendChild(meta);
  }

  // Add referrer policy
  if (!document.querySelector('meta[name="referrer"]')) {
    const referrerMeta = document.createElement('meta');
    referrerMeta.setAttribute('name', 'referrer');
    referrerMeta.setAttribute('content', 'strict-origin-when-cross-origin');
    document.head.appendChild(referrerMeta);
  }

  // Disable MIME type sniffing
  if (!document.querySelector('meta[http-equiv="X-Content-Type-Options"]')) {
    const mimeTypeMeta = document.createElement('meta');
    mimeTypeMeta.setAttribute('http-equiv', 'X-Content-Type-Options');
    mimeTypeMeta.setAttribute('content', 'nosniff');
    document.head.appendChild(mimeTypeMeta);
  }

  // Enable XSS filtering
  if (!document.querySelector('meta[http-equiv="X-XSS-Protection"]')) {
    const xssMeta = document.createElement('meta');
    xssMeta.setAttribute('http-equiv', 'X-XSS-Protection');
    xssMeta.setAttribute('content', '1; mode=block');
    document.head.appendChild(xssMeta);
  }

  // X-Frame-Options removed to allow embedding in Lovable iframe
  // In production, configure this at the server level based on your requirements
};

/**
 * Validate origin for sensitive operations
 */
export const validateOrigin = (): boolean => {
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://your-domain.com' // Replace with your actual domain
  ];
  
  return allowedOrigins.includes(window.location.origin);
};

/**
 * Check if running in secure context
 */
export const isSecureContext = (): boolean => {
  return window.isSecureContext || window.location.protocol === 'https:' || window.location.hostname === 'localhost';
};

/**
 * Initialize security measures
 */
export const initializeSecurity = () => {
  setSecurityHeaders();
  
  // Log security context information
  console.log('Security context initialized:', {
    origin: window.location.origin,
    isSecure: isSecureContext(),
    protocol: window.location.protocol
  });

  // Warn if not in secure context in production
  if (!isSecureContext() && window.location.hostname !== 'localhost') {
    console.warn('Application is not running in a secure context. Some features may be limited.');
  }
};