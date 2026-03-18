/**
 * Shared utility functions for assessment engines
 * Provides common functionality for error handling, state management, and security
 */

/**
 * Security utilities for input sanitization
 */
export const SecurityUtils = {
  /**
   * Sanitize HTML string to prevent XSS
   * @param {string} str - String to sanitize
   * @returns {string} - Sanitized string
   */
  sanitizeHTML(str) {
    if (typeof str !== 'string') return str;
    const temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
  },

  /**
   * Recursively sanitize objects/arrays for display
   * @param {any} obj - Object, array, or primitive to sanitize
   * @returns {any} - Sanitized version
   */
  sanitizeForDisplay(obj) {
    if (typeof obj === 'string') {
      return this.sanitizeHTML(obj);
    }
    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitizeForDisplay(item));
    }
    if (typeof obj === 'object' && obj !== null) {
      const sanitized = {};
      for (const [key, value] of Object.entries(obj)) {
        sanitized[key] = this.sanitizeForDisplay(value);
      }
      return sanitized;
    }
    return obj;
  },

  /**
   * Safely set innerHTML - assumes content is already sanitized
   * Dynamic content should be sanitized BEFORE building the template literal
   * @param {HTMLElement} element - Element to set innerHTML on
   * @param {string} content - HTML content to set (should already have dynamic parts sanitized)
   */
  safeInnerHTML(element, content) {
    if (!element) {
      console.warn('SecurityUtils.safeInnerHTML: element is null or undefined');
      return;
    }
    if (typeof content !== 'string') {
      console.warn('SecurityUtils.safeInnerHTML: content is not a string', typeof content);
      element.innerHTML = '';
      return;
    }
    // Trust the HTML structure - dynamic content should already be sanitized
    // This allows HTML tags in template literals to render correctly
    element.innerHTML = content;
  },

  /**
   * Safely set innerHTML with template function (sanitizes all string values)
   * @param {HTMLElement} element - Element to set innerHTML on
   * @param {Function} templateFn - Template function that returns HTML string
   * @param {any} data - Data object to pass to template (will be sanitized)
   */
  safeTemplate(element, templateFn, data) {
    if (!element || typeof templateFn !== 'function') {
      console.warn('SecurityUtils.safeTemplate: invalid arguments');
      return;
    }
    const sanitized = this.sanitizeForDisplay(data);
    const html = templateFn(sanitized);
    element.innerHTML = this.sanitizeHTML(html);
  }
};

/**
 * DataStore abstraction for localStorage with versioning and error handling
 */
export class DataStore {
  constructor(namespace) {
    this.namespace = namespace;
    this.version = '1.0.0';
  }

  /**
   * Save data with versioning and error handling
   * @param {string} key - Storage key
   * @param {any} data - Data to store
   * @returns {boolean} - Success status
   */
  save(key, data) {
    try {
      const payload = {
        version: this.version,
        timestamp: Date.now(),
        data: data
      };
      if (key === 'progress') {
        localStorage.setItem(`resume:${this.namespace}`, 'true');
      }
      localStorage.setItem(`${this.namespace}:${key}`, JSON.stringify(payload));
      return true;
    } catch (error) {
      console.error('Save failed:', error);
      // Fallback to sessionStorage
      try {
        if (key === 'progress') {
          sessionStorage.setItem(`resume:${this.namespace}`, 'true');
        }
        sessionStorage.setItem(`${this.namespace}:${key}`, JSON.stringify(payload));
        return true;
      } catch {
        return false;
      }
    }
  }

  /**
   * Load data with version checking
   * @param {string} key - Storage key
   * @returns {any|null} - Stored data or null
   */
  load(key) {
    try {
      const resumeKey = `resume:${this.namespace}`;
      const storedLocal = localStorage.getItem(`${this.namespace}:${key}`);
      const storedSession = sessionStorage.getItem(`${this.namespace}:${key}`);
      const stored = storedLocal || storedSession;
      const resumeAllowed = Boolean(stored)
        || sessionStorage.getItem(resumeKey) === 'true'
        || localStorage.getItem(resumeKey) === 'true';
      if (key === 'progress' && !resumeAllowed) return null;
      if (!stored) return null;
      if (key === 'progress' && !sessionStorage.getItem(resumeKey) && !localStorage.getItem(resumeKey)) {
        localStorage.setItem(resumeKey, 'true');
      }
      
      const payload = JSON.parse(stored);
      
      // Version checking and migration
      if (payload.version !== this.version) {
        return this.migrate(payload);
      }
      
      if (key === 'progress' && resumeAllowed) {
        sessionStorage.removeItem(resumeKey);
      }
      return payload.data;
    } catch (error) {
      console.error('Load failed:', error);
      return null;
    }
  }

  /**
   * Migrate data between versions
   * @param {Object} oldPayload - Old payload with different version
   * @returns {any} - Migrated data
   */
  migrate(oldPayload) {
    console.log(`Migrating from ${oldPayload.version} to ${this.version}`);
    // Migration logic here - for now, just return old data
    return oldPayload.data;
  }

  /**
   * Clear stored data
   * @param {string} key - Storage key
   */
  clear(key) {
    if (!key) {
      Object.keys(localStorage)
        .filter(storageKey => storageKey.startsWith(`${this.namespace}:`))
        .forEach(storageKey => localStorage.removeItem(storageKey));
      Object.keys(sessionStorage)
        .filter(storageKey => storageKey.startsWith(`${this.namespace}:`))
        .forEach(storageKey => sessionStorage.removeItem(storageKey));
      localStorage.removeItem(`resume:${this.namespace}`);
      sessionStorage.removeItem(`resume:${this.namespace}`);
      return;
    }
    localStorage.removeItem(`${this.namespace}:${key}`);
    sessionStorage.removeItem(`${this.namespace}:${key}`);
    if (key === 'progress') {
      localStorage.removeItem(`resume:${this.namespace}`);
      sessionStorage.removeItem(`resume:${this.namespace}`);
    }
  }

  /**
   * Export all data for this namespace
   * @returns {string} - JSON string of all data
   */
  export() {
    const data = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(this.namespace)) {
        data[key] = localStorage.getItem(key);
      }
    }
    return JSON.stringify(data, null, 2);
  }
}

/**
 * Storage wrapper with enhanced error handling and fallbacks
 */
export const Storage = {
  /**
   * Save data with fallback to sessionStorage
   * @param {string} key - Storage key
   * @param {any} data - Data to store
   * @returns {boolean} - Success status
   */
  save(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (e) {
      console.warn('localStorage failed, using sessionStorage:', e);
      try {
        sessionStorage.setItem(key, JSON.stringify(data));
        return true;
      } catch (e2) {
        console.error('Storage failed completely:', e2);
        if (typeof ErrorHandler !== 'undefined' && ErrorHandler.showUserError) {
          ErrorHandler.showUserError('Unable to save progress. Please ensure cookies and local storage are enabled.');
        }
        return false;
      }
    }
  },
  
  /**
   * Load data with fallback support
   * @param {string} key - Storage key
   * @returns {any|null} - Stored data or null
   */
  load(key) {
    try {
      const data = localStorage.getItem(key) || sessionStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.warn('Storage load failed:', e);
      return null;
    }
  },
  
  /**
   * Clear storage
   * @param {string} key - Storage key
   */
  clear(key) {
    try {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    } catch (e) {
      console.warn('Storage clear failed:', e);
    }
  }
};

/**
 * User-friendly error message display (convenience function)
 * Calls ErrorHandler.showUserError for consistency
 */
export function showError(message) {
  return ErrorHandler.showUserError(message);
}

/**
 * Loading state management
 */
export const LoadingState = {
  /**
   * Show loading indicator
   * @param {string} message - Loading message
   */
  show(message = 'Loading...') {
    // Remove any existing loader
    const existing = document.getElementById('loader');
    if (existing) existing.remove();
    
    const loader = document.createElement('div');
    loader.className = 'loading';
    loader.id = 'loader';
    loader.setAttribute('role', 'status');
    loader.setAttribute('aria-live', 'polite');
    loader.setAttribute('aria-label', message);
    loader.textContent = message;
    document.body.appendChild(loader);
  },
  
  /**
   * Hide loading indicator
   */
  hide() {
    const loader = document.getElementById('loader');
    if (loader) loader.remove();
  }
};

/**
 * Question validation feedback
 */
export function markQuestionState(questionId, answered) {
  const questionEl = document.getElementById(`question-${questionId}`) || 
                     document.querySelector(`[data-question-id="${questionId}"]`);
  if (!questionEl) return;
  
  if (answered) {
    questionEl.classList.remove('question-incomplete');
    questionEl.classList.add('question-complete');
  } else {
    questionEl.classList.remove('question-complete');
    questionEl.classList.add('question-incomplete');
  }
}

/**
 * Error handling utilities
 */
export const ErrorHandler = {
  errors: [],

  /**
   * Log error with context
   * @param {Error} error - Error object
   * @param {string} context - Context where error occurred
   */
  logError(error, context = '') {
    const errorEntry = {
      timestamp: new Date(),
      message: error.message,
      stack: error.stack,
      context: context
    };
    this.errors.push(errorEntry);
    console.error(`[${context}] Assessment Error:`, error);
  },

  /**
   * Show user-friendly error message
   * @param {string} message - Error message to display
   * @param {HTMLElement} container - Container to show error in
   */
  showUserError(message, container = null) {
    // Remove any existing error
    const existing = document.querySelector('.user-error');
    if (existing) existing.remove();
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'user-error';
    errorDiv.setAttribute('role', 'alert');
    errorDiv.setAttribute('aria-live', 'assertive');
    errorDiv.innerHTML = `
      <span>⚠️ ${SecurityUtils.sanitizeHTML(message)}</span>
      <button onclick="this.parentElement.remove()" aria-label="Dismiss error message">×</button>
    `;
    
    const targetContainer = container || document.querySelector('.assessment-container') || document.body;
    targetContainer.appendChild(errorDiv);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      errorDiv.remove();
    }, 5000);
    
    // Focus for screen readers
    errorDiv.focus();
    
    return errorDiv;
  },

  /**
   * Clear all logged errors
   */
  clearErrors() {
    this.errors = [];
  }
};

/**
 * Common scoring utilities
 */
export const ScoringUtils = {
  /**
   * Calculate weighted score from responses
   * @param {Array} responses - Array of response objects with value property
   * @param {Array} weights - Array of weights corresponding to responses
   * @returns {number} - Weighted score
   */
  calculateWeightedScore(responses, weights) {
    if (!responses || !weights || responses.length !== weights.length) {
      throw new Error('Responses and weights arrays must have same length');
    }
    
    const total = responses.reduce((sum, response, idx) => {
      const value = typeof response === 'object' ? response.value : response;
      return sum + (value * (weights[idx] || 1));
    }, 0);
    
    const totalWeight = weights.reduce((sum, w) => sum + (w || 1), 0);
    
    return totalWeight > 0 ? total / totalWeight : 0;
  },

  /**
   * Normalize scores to 0-100 range
   * @param {Object} scores - Object with archetype/category scores
   * @returns {Object} - Normalized scores
   */
  normalizeScores(scores) {
    const values = Object.values(scores);
    const max = Math.max(...values, 1); // Avoid division by zero
    const min = Math.min(...values, 0);
    const range = max - min || 1; // Avoid division by zero
    
    const normalized = {};
    for (const [key, value] of Object.entries(scores)) {
      normalized[key] = ((value - min) / range) * 100;
    }
    
    return normalized;
  }
};

/**
 * DOM utilities for common operations
 */
export const DOMUtils = {
  /**
   * Create element with attributes and children
   * @param {string} tag - HTML tag name
   * @param {Object} attrs - Attributes object
   * @param {Array|string} children - Child elements or text
   * @returns {HTMLElement} - Created element
   */
  createElement(tag, attrs = {}, children = []) {
    const el = document.createElement(tag);
    
    for (const [key, value] of Object.entries(attrs)) {
      if (key === 'style' && typeof value === 'object') {
        Object.assign(el.style, value);
      } else if (key === 'className') {
        el.className = value;
      } else if (key.startsWith('data-')) {
        el.setAttribute(key, value);
      } else {
        el[key] = value;
      }
    }
    
    if (typeof children === 'string') {
      el.textContent = children;
    } else if (Array.isArray(children)) {
      children.forEach(child => {
        if (typeof child === 'string') {
          el.appendChild(document.createTextNode(child));
        } else if (child instanceof Node) {
          el.appendChild(child);
        }
      });
    }
    
    return el;
  },

  /**
   * Focus management - focus element and scroll into view
   * @param {HTMLElement} element - Element to focus
   * @param {Object} options - Focus options
   */
  focusElement(element, options = {}) {
    if (!element) return;
    
    element.focus({ preventScroll: options.preventScroll || false });
    
    if (!options.preventScroll) {
      element.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
    }
  }
};

