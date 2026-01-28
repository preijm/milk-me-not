/**
 * Security utilities for input validation and sanitization
 */

const replaceUntilStable = (input: string, pattern: RegExp, replacement: string): string => {
  let current = input;
  let previous: string;
  do {
    previous = current;
    current = current.replace(pattern, replacement);
  } while (current !== previous);
  return current;
};

export const sanitizeInput = (input: string): string => {
  if (typeof input !== 'string') {
    return '';
  }
  
  // Remove potentially dangerous characters and patterns
  let sanitized = input;
  
  // Remove < and > to prevent XSS
  sanitized = sanitized.replace(/[<>]/g, '');
  
  // Remove javascript: protocol (case insensitive, handles encoding tricks)
  sanitized = replaceUntilStable(sanitized, /j\s*a\s*v\s*a\s*s\s*c\s*r\s*i\s*p\s*t\s*:/gi, '');
  
  // Remove event handler attributes completely (on + word characters + = with optional quotes)
  // Match the entire pattern including any value to prevent partial matches
  sanitized = replaceUntilStable(sanitized, /\bon\w+\s*=\s*(['"]?)[^'"]*\1/gi, '');
  
  // Also remove standalone "on" followed by event names without = as a secondary measure
  sanitized = replaceUntilStable(sanitized, /\bon(click|load|error|mouse\w+|key\w+|focus|blur|change|submit|reset|select|input|scroll|resize|unload|beforeunload|abort|canplay\w*|durationchange|emptied|ended|loadeddata|loadedmetadata|pause|play|playing|progress|ratechange|seeked|seeking|stalled|suspend|timeupdate|volumechange|waiting|copy|cut|paste|drag\w*|drop|wheel|contextmenu|invalid|search|toggle|animationend|animationiteration|animationstart|transitionend|pointerdown|pointermove|pointerup|pointercancel|pointerover|pointerout|pointerenter|pointerleave|gotpointercapture|lostpointercapture|touchstart|touchend|touchmove|touchcancel)\b/gi, '');
  
  return sanitized.trim();
};

export const validateEmail = (email: string): boolean => {
  if (!email || typeof email !== 'string') {
    return false;
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254; // RFC 5321 limit
};

export const validatePassword = (password: string, isSignup: boolean = false): { 
  isValid: boolean; 
  message: string; 
} => {
  if (!password || typeof password !== 'string') {
    return { isValid: false, message: "Password is required" };
  }
  
  if (isSignup) {
    if (password.length < 8) {
      return { isValid: false, message: "Password must be at least 8 characters" };
    }
    if (!/(?=.*[a-z])/.test(password)) {
      return { isValid: false, message: "Password must contain at least one lowercase letter" };
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return { isValid: false, message: "Password must contain at least one uppercase letter" };
    }
    if (!/(?=.*\d)/.test(password)) {
      return { isValid: false, message: "Password must contain at least one number" };
    }
    if (password.length > 128) { // Reasonable upper limit
      return { isValid: false, message: "Password is too long" };
    }
  }
  
  return { isValid: true, message: "" };
};

export const validateUsername = (username: string): { 
  isValid: boolean; 
  message: string; 
} => {
  if (!username || typeof username !== 'string') {
    return { isValid: false, message: "Username is required" };
  }
  
  const sanitized = sanitizeInput(username);
  
  if (sanitized.length < 2) {
    return { isValid: false, message: "Username must be at least 2 characters" };
  }
  
  if (sanitized.length > 30) {
    return { isValid: false, message: "Username must be less than 30 characters" };
  }
  
  return { isValid: true, message: "" };
};

export const validateMilkTestInput = (data: {
  rating: number;
  notes?: string;
  shopName?: string;
  countryCode?: string;
}): { isValid: boolean; message: string; } => {
  // Validate rating
  if (typeof data.rating !== 'number' || data.rating < 0 || data.rating > 10) {
    return { isValid: false, message: "Rating must be between 0 and 10" };
  }
  
  // Validate notes length
  if (data.notes && data.notes.length > 1000) {
    return { isValid: false, message: "Notes must be less than 1000 characters" };
  }
  
  // Validate shop name length
  if (data.shopName && data.shopName.length > 255) {
    return { isValid: false, message: "Shop name must be less than 255 characters" };
  }
  
  // Validate country code format
  if (data.countryCode && (data.countryCode.length !== 2 || !/^[A-Z]{2}$/.test(data.countryCode))) {
    return { isValid: false, message: "Country code must be a 2-letter uppercase code" };
  }
  
  return { isValid: true, message: "" };
};

export const validateSearchInput = (searchTerm: string): { 
  isValid: boolean; 
  message: string; 
} => {
  if (!searchTerm || typeof searchTerm !== 'string') {
    return { isValid: false, message: "Search term is required" };
  }
  
  const sanitized = sanitizeInput(searchTerm);
  
  if (sanitized.length < 1) {
    return { isValid: false, message: "Search term must be at least 1 character" };
  }
  
  if (sanitized.length > 100) {
    return { isValid: false, message: "Search term must be less than 100 characters" };
  }
  
  return { isValid: true, message: "" };
};

/**
 * Rate limiting helper (client-side basic implementation)
 * Note: This is not a substitute for server-side rate limiting
 */
export class ClientSideRateLimit {
  private attempts: Map<string, number[]> = new Map();
  private maxAttempts: number;
  private windowMs: number;

  constructor(maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000) { // 5 attempts per 15 minutes
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
  }

  canAttempt(key: string): boolean {
    const now = Date.now();
    const attempts = this.attempts.get(key) || [];
    
    // Remove expired attempts
    const validAttempts = attempts.filter(time => now - time < this.windowMs);
    
    if (validAttempts.length >= this.maxAttempts) {
      return false;
    }
    
    return true;
  }

  recordAttempt(key: string): void {
    const now = Date.now();
    const attempts = this.attempts.get(key) || [];
    attempts.push(now);
    
    // Keep only recent attempts
    const validAttempts = attempts.filter(time => now - time < this.windowMs);
    this.attempts.set(key, validAttempts);
  }

  getRemainingTime(key: string): number {
    const now = Date.now();
    const attempts = this.attempts.get(key) || [];
    
    if (attempts.length === 0) return 0;
    
    const oldestValidAttempt = Math.min(...attempts.filter(time => now - time < this.windowMs));
    return Math.max(0, this.windowMs - (now - oldestValidAttempt));
  }
}

// Global rate limiter instances
export const loginRateLimit = new ClientSideRateLimit(5, 15 * 60 * 1000); // 5 attempts per 15 minutes
export const signupRateLimit = new ClientSideRateLimit(3, 60 * 60 * 1000); // 3 attempts per hour
export const passwordResetRateLimit = new ClientSideRateLimit(3, 60 * 60 * 1000); // 3 attempts per hour
export const searchRateLimit = new ClientSideRateLimit(30, 60 * 1000); // 30 searches per minute

/**
 * Security logging helper
 */
export const logSecurityEvent = async (eventType: string, eventData?: Record<string, unknown>) => {
  try {
    // This would integrate with your security logging system
    console.warn(`Security Event: ${eventType}`, eventData);
    
    // In a production app, you might send this to a logging service
    // or store it in the database via the log_security_event function
  } catch (error) {
    console.error('Failed to log security event:', error);
  }
};

/**
 * Enhanced input sanitization for SQL injection prevention
 * Note: This is a defense-in-depth measure. Always use parameterized queries.
 */
export const sanitizeForDatabase = (input: string): string => {
  if (typeof input !== 'string') {
    return '';
  }
  
  let sanitized = input;
  
  // Remove < and > to prevent XSS
  sanitized = sanitized.replace(/[<>]/g, '');
  
  // Remove javascript: protocol (case insensitive, handles spacing tricks)
  sanitized = replaceUntilStable(sanitized, /j\s*a\s*v\s*a\s*s\s*c\s*r\s*i\s*p\s*t\s*:/gi, '');
  
  // Remove event handler attributes completely
  sanitized = replaceUntilStable(sanitized, /\bon\w+\s*=\s*(['"]?)[^'"]*\1/gi, '');
  
  // Remove standalone event handler names as secondary measure
  sanitized = replaceUntilStable(sanitized, /\bon(click|load|error|mouse\w+|key\w+|focus|blur|change|submit|reset|select|input|scroll|resize|unload|beforeunload|abort|canplay\w*|durationchange|emptied|ended|loadeddata|loadedmetadata|pause|play|playing|progress|ratechange|seeked|seeking|stalled|suspend|timeupdate|volumechange|waiting|copy|cut|paste|drag\w*|drop|wheel|contextmenu|invalid|search|toggle|animationend|animationiteration|animationstart|transitionend|pointerdown|pointermove|pointerup|pointercancel|pointerover|pointerout|pointerenter|pointerleave|gotpointercapture|lostpointercapture|touchstart|touchend|touchmove|touchcancel)\b/gi, '');
  
  // Remove SQL-related patterns (defense in depth - always use parameterized queries)
  // Note: We preserve single and double quotes as they are safe with parameterized queries
  // and users need them for legitimate content like: "this is a 'fake' milk"
  sanitized = sanitized.replace(/;/g, ''); // Remove semicolons
  sanitized = sanitized.replace(/(\/\*)|(\*\/)/g, ''); // Remove SQL comments
  sanitized = sanitized.replace(/\b(hex|waitfor|count|union|select|insert|update|delete|drop|alter|create|truncate|exec|execute|xp_|sp_|0x)\b/gi, '');
  
  return sanitized.trim();
};
