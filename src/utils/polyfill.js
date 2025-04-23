// This file provides polyfills for node modules that are not available in browser
import { Buffer } from 'buffer';

// Make buffer available globally
if (typeof window !== 'undefined') {
  window.Buffer = Buffer;
}

// Define process if it doesn't exist
if (typeof window.process === 'undefined') {
  window.process = {
    env: { 
      NODE_ENV: process.env.NODE_ENV || 'development',
      // Add other env variables your app might need
    },
    browser: true,
    version: '',
    versions: {},
    nextTick: function(cb) { setTimeout(cb, 0); },
  };
} else {
  // Ensure process.browser is set
  window.process.browser = true;
}

// Handle module resolution for process/browser
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  try {
    if (!module.exports.browser) {
      module.exports = {
        ...module.exports,
        ...window.process,
      };
    }
  } catch (e) {
    console.warn('Error setting up process polyfill:', e);
  }
}

// Export for direct imports
export default {
  Buffer,
  process: window.process,
}; 