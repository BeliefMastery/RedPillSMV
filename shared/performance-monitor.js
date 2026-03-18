/**
 * Performance monitoring utility
 * Tracks and reports performance metrics for assessment engines
 */

/**
 * Performance metrics tracker
 */
export class PerformanceMonitor {
  constructor(engineName) {
    this.engineName = engineName;
    this.metrics = {
      initTime: null,
      firstQuestionTime: null,
      questionRenderTimes: [],
      dataLoadTime: null,
      totalTime: null
    };
    this.startTime = performance.now();
  }

  /**
   * Mark initialization complete
   */
  markInit() {
    this.metrics.initTime = performance.now() - this.startTime;
    this.logMetric('Initialization', this.metrics.initTime);
  }

  /**
   * Mark first question rendered
   */
  markFirstQuestion() {
    if (!this.metrics.firstQuestionTime) {
      this.metrics.firstQuestionTime = performance.now() - this.startTime;
      this.logMetric('First Question Rendered', this.metrics.firstQuestionTime);
    }
  }

  /**
   * Track question render time
   * @param {number} renderTime - Time taken to render question in ms
   */
  trackQuestionRender(renderTime) {
    this.metrics.questionRenderTimes.push(renderTime);
    
    // Log if render time is slow (>100ms)
    if (renderTime > 100) {
      console.warn(`Slow question render: ${renderTime.toFixed(2)}ms`);
    }
  }

  /**
   * Mark data load complete
   * @param {number} loadTime - Time taken to load data in ms
   */
  markDataLoad(loadTime) {
    this.metrics.dataLoadTime = loadTime;
    this.logMetric('Data Load', loadTime);
  }

  /**
   * Mark assessment complete
   */
  markComplete() {
    this.metrics.totalTime = performance.now() - this.startTime;
    this.logMetric('Total Assessment Time', this.metrics.totalTime);
    this.reportMetrics();
  }

  /**
   * Log a performance metric
   * @param {string} label - Metric label
   * @param {number} value - Metric value in ms
   */
  logMetric(label, value) {
    if (console && console.log) {
      console.log(`[${this.engineName}] ${label}: ${value.toFixed(2)}ms`);
    }
  }

  /**
   * Report all metrics
   */
  reportMetrics() {
    const avgRenderTime = this.metrics.questionRenderTimes.length > 0
      ? this.metrics.questionRenderTimes.reduce((a, b) => a + b, 0) / this.metrics.questionRenderTimes.length
      : 0;

    const report = {
      engine: this.engineName,
      metrics: {
        ...this.metrics,
        averageQuestionRenderTime: avgRenderTime,
        totalQuestions: this.metrics.questionRenderTimes.length
      }
    };

    // Log to console
    console.log(`[${this.engineName}] Performance Report:`, report);

    // Store in localStorage for analytics (optional)
    try {
      const reports = JSON.parse(localStorage.getItem('performanceReports') || '[]');
      reports.push(report);
      // Keep only last 10 reports
      if (reports.length > 10) {
        reports.shift();
      }
      localStorage.setItem('performanceReports', JSON.stringify(reports));
    } catch (e) {
      // Ignore storage errors
    }

    return report;
  }

  /**
   * Get current performance metrics
   * @returns {Object} Current metrics
   */
  getMetrics() {
    return {
      ...this.metrics,
      currentTime: performance.now() - this.startTime
    };
  }
}

/**
 * Measure execution time of a function
 * @param {Function} fn - Function to measure
 * @param {string} label - Label for the measurement
 * @returns {Promise<any>} - Result of the function
 */
export async function measureTime(fn, label = 'Operation') {
  const start = performance.now();
  try {
    const result = await fn();
    const duration = performance.now() - start;
    console.log(`[Performance] ${label}: ${duration.toFixed(2)}ms`);
    return result;
  } catch (error) {
    const duration = performance.now() - start;
    console.error(`[Performance] ${label} failed after ${duration.toFixed(2)}ms:`, error);
    throw error;
  }
}

/**
 * Check if page is loading slowly
 * @returns {boolean} True if page load is slow
 */
export function isSlowLoad() {
  if ('performance' in window && 'timing' in window.performance) {
    const loadTime = window.performance.timing.loadEventEnd - window.performance.timing.navigationStart;
    return loadTime > 3000; // 3 seconds
  }
  return false;
}

/**
 * Get page load metrics
 * @returns {Object} Page load metrics
 */
export function getPageLoadMetrics() {
  if (!('performance' in window) || !('timing' in window.performance)) {
    return null;
  }

  const timing = window.performance.timing;
  
  return {
    dns: timing.domainLookupEnd - timing.domainLookupStart,
    tcp: timing.connectEnd - timing.connectStart,
    request: timing.responseStart - timing.requestStart,
    response: timing.responseEnd - timing.responseStart,
    dom: timing.domComplete - timing.domLoading,
    load: timing.loadEventEnd - timing.navigationStart
  };
}

/**
 * Initialize performance monitoring using PerformanceObserver
 * Tracks Web Vitals (FCP, LCP, CLS, FID)
 */
export function initializePerformanceMonitoring() {
  if (!window.PerformanceObserver) {
    console.warn('PerformanceObserver not supported. Performance monitoring disabled.');
    return;
  }

  const performanceMetrics = {
    fcp: null,
    lcp: null,
    cls: null,
    fid: null,
    tti: null // Time to Interactive (estimated)
  };

  // First Contentful Paint (FCP)
  try {
    new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        if (entry.name === 'first-contentful-paint') {
          performanceMetrics.fcp = entry.startTime;
          console.log('FCP:', entry.startTime);
        }
      }
    }).observe({ type: 'paint', buffered: true });
  } catch (e) {
    console.warn('FCP observation not supported:', e);
  }

  // Largest Contentful Paint (LCP)
  try {
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const lastEntry = entries[entries.length - 1];
      performanceMetrics.lcp = lastEntry.startTime;
      console.log('LCP:', lastEntry.startTime);
    }).observe({ type: 'largest-contentful-paint', buffered: true });
  } catch (e) {
    console.warn('LCP observation not supported:', e);
  }

  // Cumulative Layout Shift (CLS)
  try {
    let lastLoggedCLS = 0;
    let clsLogThrottle = null;
    
    new PerformanceObserver((entryList) => {
      let cls = 0;
      for (const entry of entryList.getEntries()) {
        if (!entry.hadRecentInput) {
          cls += entry.value;
        }
      }
      // Accumulate CLS (it's cumulative)
      performanceMetrics.cls = (performanceMetrics.cls || 0) + cls;
      
      // Only log if CLS increased significantly (>0.01) or periodically
      const currentCLS = performanceMetrics.cls;
      if (currentCLS - lastLoggedCLS > 0.01) {
        console.log('CLS:', currentCLS.toFixed(6));
        lastLoggedCLS = currentCLS;
      } else if (cls > 0) {
        // Throttle: log at most once per 2 seconds for small changes
        if (!clsLogThrottle) {
          clsLogThrottle = setTimeout(() => {
            if (performanceMetrics.cls !== lastLoggedCLS && performanceMetrics.cls > 0.001) {
              console.log('CLS:', performanceMetrics.cls.toFixed(6));
              lastLoggedCLS = performanceMetrics.cls;
            }
            clsLogThrottle = null;
          }, 2000);
        }
      }
    }).observe({ type: 'layout-shift', buffered: true });
    
    // Log final CLS on page visibility change or unload
    const logFinalCLS = () => {
      if (performanceMetrics.cls && performanceMetrics.cls !== lastLoggedCLS) {
        console.log('Final CLS:', performanceMetrics.cls.toFixed(6));
      }
    };
    document.addEventListener('visibilitychange', logFinalCLS);
    window.addEventListener('beforeunload', logFinalCLS);
  } catch (e) {
    console.warn('CLS observation not supported:', e);
  }

  // First Input Delay (FID)
  try {
    new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        performanceMetrics.fid = entry.processingStart - entry.startTime;
        console.log('FID:', performanceMetrics.fid);
      }
    }).observe({ type: 'first-input', buffered: true });
  } catch (e) {
    console.warn('FID observation not supported:', e);
  }

  // Optional: Measure Time to Interactive (TTI) - more complex, often estimated
  window.addEventListener('load', () => {
    setTimeout(() => {
      performanceMetrics.tti = performance.now();
      console.log('Estimated TTI:', performanceMetrics.tti);
    }, 0);
  });

  // Expose metrics for debugging
  window.performanceMetrics = performanceMetrics;
  
  return performanceMetrics;
}

