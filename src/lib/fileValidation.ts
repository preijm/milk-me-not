// File validation utilities for enhanced security

export interface FileValidationResult {
  isValid: boolean;
  error?: string;
}

export interface FileValidationOptions {
  maxSizeBytes?: number;
  allowedMimeTypes?: string[];
  allowedExtensions?: string[];
  maxDimensions?: { width: number; height: number };
}

const DEFAULT_OPTIONS: Required<FileValidationOptions> = {
  maxSizeBytes: 5 * 1024 * 1024, // 5MB
  allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp'],
  maxDimensions: { width: 4096, height: 4096 }
};

export const validateFile = async (
  file: File, 
  options: FileValidationOptions = {}
): Promise<FileValidationResult> => {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  // File size validation
  if (file.size > opts.maxSizeBytes) {
    const maxSizeMB = opts.maxSizeBytes / (1024 * 1024);
    return {
      isValid: false,
      error: `File size must be less than ${maxSizeMB}MB. Current size: ${(file.size / (1024 * 1024)).toFixed(1)}MB`
    };
  }

  // MIME type validation
  if (!opts.allowedMimeTypes.includes(file.type)) {
    return {
      isValid: false,
      error: `File type not allowed. Allowed types: ${opts.allowedMimeTypes.join(', ')}`
    };
  }

  // File extension validation
  const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
  if (!opts.allowedExtensions.includes(fileExtension)) {
    return {
      isValid: false,
      error: `File extension not allowed. Allowed extensions: ${opts.allowedExtensions.join(', ')}`
    };
  }

  // Image dimension validation
  if (file.type.startsWith('image/')) {
    try {
      const dimensions = await getImageDimensions(file);
      if (dimensions.width > opts.maxDimensions.width || dimensions.height > opts.maxDimensions.height) {
        return {
          isValid: false,
          error: `Image dimensions too large. Maximum: ${opts.maxDimensions.width}x${opts.maxDimensions.height}px. Current: ${dimensions.width}x${dimensions.height}px`
        };
      }
    } catch (error) {
      return {
        isValid: false,
        error: 'Invalid image file or corrupted data'
      };
    }
  }

  // Additional security: Check for potential malicious content
  if (await hasSuspiciousContent(file)) {
    return {
      isValid: false,
      error: 'File contains potentially malicious content'
    };
  }

  return { isValid: true };
};

const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.width, height: img.height });
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };
    
    img.src = url;
  });
};

const hasSuspiciousContent = async (file: File): Promise<boolean> => {
  // Basic check for suspicious content in file headers
  const buffer = await file.slice(0, 512).arrayBuffer();
  const bytes = new Uint8Array(buffer);
  
  // Check for common script tags or suspicious patterns
  const content = new TextDecoder('utf-8', { fatal: false }).decode(bytes);
  const suspiciousPatterns = [
    '<script',
    'javascript:',
    'data:text/html',
    'vbscript:',
    'onload=',
    'onerror=',
    'eval(',
    'document.cookie'
  ];
  
  return suspiciousPatterns.some(pattern => 
    content.toLowerCase().includes(pattern.toLowerCase())
  );
};

export const sanitizeFileName = (fileName: string): string => {
  // Remove or replace dangerous characters
  return fileName
    .replace(/[^a-zA-Z0-9.-]/g, '_') // Replace non-alphanumeric chars with underscore
    .replace(/_{2,}/g, '_') // Replace multiple underscores with single
    .replace(/^_+|_+$/g, '') // Remove leading/trailing underscores
    .toLowerCase();
};