// Debug Reporter for Assessment Engines
// Provides comprehensive debugging and verification tools for data loading and engine performance

import { ErrorHandler, SecurityUtils } from './utils.js';

/**
 * DebugReporter - Tracks and reports on engine initialization, data loading, and performance
 */
export class DebugReporter {
  constructor(engineName) {
    this.engineName = engineName;
    this.report = {
      engine: engineName,
      timestamp: new Date().toISOString(),
      initialization: {
        startTime: null,
        endTime: null,
        duration: null,
        errors: []
      },
      dataLoading: {
        modules: {},
        totalModules: 0,
        loadedModules: 0,
        failedModules: [],
        loadTimes: {},
        totalLoadTime: null
      },
      performance: {
        renderTimes: [],
        averageRenderTime: null,
        questionCount: 0,
        sections: []
      },
      errors: [],
      warnings: []
    };
    
    this.startTime = performance.now();
    this.report.initialization.startTime = this.startTime;
  }

  /**
   * Mark initialization complete
   */
  markInitialized() {
    this.report.initialization.endTime = performance.now();
    this.report.initialization.duration = 
      this.report.initialization.endTime - this.report.initialization.startTime;
  }

  /**
   * Register a data module that will be loaded
   * @param {string} modulePath - Path to the module
   * @param {string} moduleName - Human-readable name for the module
   */
  registerDataModule(modulePath, moduleName = null) {
    if (!this.report.dataLoading.modules[modulePath]) {
      this.report.dataLoading.modules[modulePath] = {
        name: moduleName || modulePath,
        path: modulePath,
        status: 'registered',
        loadStartTime: null,
        loadEndTime: null,
        loadDuration: null,
        size: null,
        error: null
      };
      this.report.dataLoading.totalModules++;
    }
  }

  /**
   * Mark a data module as loading
   * @param {string} modulePath - Path to the module
   */
  markModuleLoading(modulePath) {
    if (this.report.dataLoading.modules[modulePath]) {
      this.report.dataLoading.modules[modulePath].status = 'loading';
      this.report.dataLoading.modules[modulePath].loadStartTime = performance.now();
    }
  }

  /**
   * Mark a data module as loaded successfully
   * @param {string} modulePath - Path to the module
   * @param {Object} moduleData - The loaded module data (for size estimation)
   */
  markModuleLoaded(modulePath, moduleData = null) {
    if (this.report.dataLoading.modules[modulePath]) {
      const module = this.report.dataLoading.modules[modulePath];
      module.status = 'loaded';
      module.loadEndTime = performance.now();
      module.loadDuration = module.loadEndTime - module.loadStartTime;
      
      // Estimate size (rough approximation)
      if (moduleData) {
        try {
          const jsonString = JSON.stringify(moduleData);
          module.size = new Blob([jsonString]).size; // Size in bytes
        } catch (e) {
          // If stringification fails, estimate based on object keys
          module.size = Object.keys(moduleData || {}).length * 100; // Rough estimate
        }
      }
      
      this.report.dataLoading.loadedModules++;
      this.report.dataLoading.loadTimes[modulePath] = module.loadDuration;
    }
  }

  /**
   * Mark a data module as failed
   * @param {string} modulePath - Path to the module
   * @param {Error} error - The error that occurred
   */
  markModuleFailed(modulePath, error) {
    if (this.report.dataLoading.modules[modulePath]) {
      const module = this.report.dataLoading.modules[modulePath];
      module.status = 'failed';
      module.loadEndTime = performance.now();
      module.loadDuration = module.loadEndTime - (module.loadStartTime || this.startTime);
      module.error = {
        message: error.message,
        stack: error.stack
      };
      
      this.report.dataLoading.failedModules.push(modulePath);
      this.report.errors.push({
        type: 'data_loading',
        module: modulePath,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Calculate total data loading time
   */
  calculateDataLoadTime() {
    const loadTimes = Object.values(this.report.dataLoading.loadTimes);
    if (loadTimes.length > 0) {
      this.report.dataLoading.totalLoadTime = loadTimes.reduce((a, b) => a + b, 0);
    }
  }

  /**
   * Record a render operation
   * @param {string} operation - Name of the render operation (e.g., 'question', 'results')
   * @param {number} duration - Duration in milliseconds
   */
  recordRender(operation, duration) {
    this.report.performance.renderTimes.push({
      operation,
      duration,
      timestamp: performance.now()
    });
    
    // Calculate average
    const durations = this.report.performance.renderTimes.map(r => r.duration);
    this.report.performance.averageRenderTime = 
      durations.reduce((a, b) => a + b, 0) / durations.length;
  }

  /**
   * Record question count
   * @param {number} count - Total number of questions
   */
  recordQuestionCount(count) {
    this.report.performance.questionCount = count;
  }

  /**
   * Record section information
   * @param {string} sectionName - Name of the section
   * @param {number} questionCount - Number of questions in the section
   */
  recordSection(sectionName, questionCount) {
    this.report.performance.sections.push({
      name: sectionName,
      questionCount
    });
  }

  /**
   * Log an error
   * @param {Error} error - The error
   * @param {string} context - Context where the error occurred
   */
  logError(error, context = 'Unknown') {
    this.report.errors.push({
      type: 'error',
      context,
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    ErrorHandler.logError(error, `${this.engineName}: ${context}`);
  }

  /**
   * Log an event (informational message)
   * @param {string} category - Event category
   * @param {string} message - Event message
   * @param {Object} data - Optional event data
   */
  logEvent(category, message, data = {}) {
    this.report.warnings.push({
      type: 'event',
      category,
      message,
      data,
      timestamp: new Date().toISOString()
    });
    console.log(`[${this.engineName}] ${category}: ${message}`, data);
  }

  /**
   * Log a warning
   * @param {string} message - Warning message
   * @param {string} context - Context where the warning occurred
   */
  logWarning(message, context = 'Unknown') {
    this.report.warnings.push({
      message,
      context,
      timestamp: new Date().toISOString()
    });
    console.warn(`[${this.engineName}] ${context}: ${message}`);
  }

  /**
   * Get the current report
   * @returns {Object} The debug report
   */
  getReport() {
    this.calculateDataLoadTime();
    return { ...this.report };
  }

  /**
   * Generate a human-readable summary
   * @returns {string} Summary text
   */
  getSummary() {
    this.calculateDataLoadTime();
    
    const report = this.report;
    let summary = `\n=== ${report.engine} Debug Report ===\n`;
    summary += `Timestamp: ${report.timestamp}\n\n`;
    
    // Initialization
    summary += `Initialization: ${report.initialization.duration?.toFixed(2) || 'N/A'}ms\n`;
    if (report.initialization.errors.length > 0) {
      summary += `  Errors: ${report.initialization.errors.length}\n`;
    }
    
    // Data Loading
    summary += `\nData Loading:\n`;
    summary += `  Total Modules: ${report.dataLoading.totalModules}\n`;
    summary += `  Loaded: ${report.dataLoading.loadedModules}\n`;
    summary += `  Failed: ${report.dataLoading.failedModules.length}\n`;
    summary += `  Total Load Time: ${report.dataLoading.totalLoadTime?.toFixed(2) || 'N/A'}ms\n`;
    
    if (report.dataLoading.failedModules.length > 0) {
      summary += `  Failed Modules:\n`;
      report.dataLoading.failedModules.forEach(path => {
        summary += `    - ${path}\n`;
      });
    }
    
    // Performance
    summary += `\nPerformance:\n`;
    summary += `  Questions: ${report.performance.questionCount}\n`;
    summary += `  Sections: ${report.performance.sections.length}\n`;
    summary += `  Average Render Time: ${report.performance.averageRenderTime?.toFixed(2) || 'N/A'}ms\n`;
    summary += `  Render Operations: ${report.performance.renderTimes.length}\n`;
    
    // Errors and Warnings
    if (report.errors.length > 0) {
      summary += `\nErrors: ${report.errors.length}\n`;
    }
    if (report.warnings.length > 0) {
      summary += `Warnings: ${report.warnings.length}\n`;
    }
    
    return summary;
  }

  /**
   * Display the report in the console
   */
  logReport() {
    console.log(this.getSummary());
    console.log('Full Report:', this.getReport());
  }

  /**
   * Display the report in a UI element (if available)
   * @param {string} containerId - ID of the container element
   */
  displayReport(containerId = 'debug-report') {
    const container = document.getElementById(containerId);
    if (!container) {
      this.logWarning(`Debug report container #${containerId} not found. Logging to console instead.`, 'displayReport');
      this.logReport();
      return;
    }

    const report = this.getReport();
    const summary = this.getSummary();
    
    // Create report HTML
    const reportHTML = `
      <div class="debug-report" style="
        background: #f5f5f5;
        border: 1px solid #ddd;
        border-radius: 4px;
        padding: 16px;
        margin: 16px 0;
        font-family: monospace;
        font-size: 12px;
        white-space: pre-wrap;
        max-height: 400px;
        overflow-y: auto;
      ">
        <h3 style="margin-top: 0;">${report.engine} Debug Report</h3>
        <pre style="margin: 0;">${summary}</pre>
        <details style="margin-top: 16px;">
          <summary style="cursor: pointer; font-weight: bold;">Full JSON Report</summary>
          <pre style="background: white; padding: 8px; border-radius: 4px; overflow-x: auto;">${JSON.stringify(report, null, 2)}</pre>
        </details>
        <button onclick="navigator.clipboard.writeText(JSON.stringify(${JSON.stringify(report)}, null, 2))" 
                style="margin-top: 8px; padding: 4px 8px; cursor: pointer;">
          Copy Report to Clipboard
        </button>
      </div>
    `;
    
    SecurityUtils.safeInnerHTML(container, reportHTML);
  }

  /**
   * Export the report as JSON
   * @returns {string} JSON string
   */
  exportJSON() {
    this.calculateDataLoadTime();
    return JSON.stringify(this.getReport(), null, 2);
  }

  /**
   * Save the report to localStorage
   * @param {string} key - Storage key (defaults to engine name)
   */
  saveToStorage(key = null) {
    const storageKey = key || `debug_report_${this.engineName}`;
    try {
      localStorage.setItem(storageKey, this.exportJSON());
      this.logWarning(`Report saved to localStorage as '${storageKey}'`, 'saveToStorage');
    } catch (e) {
      this.logError(e, 'saveToStorage');
    }
  }
}

/**
 * Create a debug reporter instance for an engine
 * @param {string} engineName - Name of the engine
 * @returns {DebugReporter} Debug reporter instance
 */
export function createDebugReporter(engineName) {
  return new DebugReporter(engineName);
}

/**
 * Global function to display all saved debug reports
 */
export function displayAllReports() {
  const reports = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('debug_report_')) {
      try {
        const report = JSON.parse(localStorage.getItem(key));
        reports.push(report);
      } catch (e) {
        console.error(`Failed to parse report ${key}:`, e);
      }
    }
  }
  
  if (reports.length === 0) {
    console.log('No debug reports found in localStorage.');
    return;
  }
  
  console.log(`Found ${reports.length} debug report(s):`);
  reports.forEach(report => {
    const reporter = new DebugReporter(report.engine);
    reporter.report = report;
    reporter.logReport();
  });
}

// Make displayAllReports available globally for console access
if (typeof window !== 'undefined') {
  window.displayAllDebugReports = displayAllReports;
}

