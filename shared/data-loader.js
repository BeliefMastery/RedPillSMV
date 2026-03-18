/**
 * Lazy data loading utility for assessment engines
 * Loads large data files only when needed to improve initial page load
 * Integrates with DebugReporter for comprehensive tracking
 */

/**
 * Cache for loaded data modules
 */
const dataCache = new Map();

/**
 * Optional debug reporter instance for tracking
 */
let debugReporter = null;

/**
 * Set the debug reporter instance for tracking data loading
 * @param {Object} reporter - DebugReporter instance
 */
export function setDebugReporter(reporter) {
  debugReporter = reporter;
}

/**
 * Load a data module dynamically
 * @param {string} modulePath - Path to the data module
 * @param {string} moduleName - Optional human-readable name for debugging
 * @returns {Promise<any>} - The exported data from the module
 */
export async function loadDataModule(modulePath, moduleName = null) {
  // Register with debug reporter if available
  if (debugReporter) {
    debugReporter.registerDataModule(modulePath, moduleName || modulePath);
    debugReporter.markModuleLoading(modulePath);
  }

  // Check cache first
  if (dataCache.has(modulePath)) {
    if (debugReporter) {
      debugReporter.markModuleLoaded(modulePath, dataCache.get(modulePath));
    }
    return dataCache.get(modulePath);
  }

  try {
    // Resolve path relative to project root (parent of shared/)
    // import() resolves relative to THIS file (shared/data-loader.js)
    let resolvedPath = modulePath;
    if (modulePath.startsWith('./')) {
      resolvedPath = modulePath.replace('./', '../');
    } else if (!modulePath.startsWith('/') && !modulePath.startsWith('http') && !modulePath.startsWith('.')) {
      resolvedPath = '../' + modulePath;
    }

    // Resolve to absolute URL relative to this module (handles base href, subpaths)
    const specifier = new URL(resolvedPath, import.meta.url).href;
    const module = await import(specifier);
    
    // Cache the module (use original path as key for consistency)
    dataCache.set(modulePath, module);
    
    // Mark as loaded in debug reporter
    if (debugReporter) {
      debugReporter.markModuleLoaded(modulePath, module);
    }
    
    return module;
  } catch (error) {
    // Mark as failed in debug reporter
    if (debugReporter) {
      debugReporter.markModuleFailed(modulePath, error);
    }
    console.error(`Failed to load data module: ${modulePath}`, error);
    throw error;
  }
}

/**
 * Preload data modules in the background
 * @param {Array<string>} modulePaths - Array of module paths to preload
 */
export async function preloadDataModules(modulePaths) {
  // Use requestIdleCallback if available, otherwise setTimeout
  const schedulePreload = (callback) => {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(callback, { timeout: 2000 });
    } else {
      setTimeout(callback, 100);
    }
  };

  schedulePreload(async () => {
    const loadPromises = modulePaths.map(path => 
      loadDataModule(path).catch(err => {
        console.warn(`Preload failed for ${path}:`, err);
        return null;
      })
    );
    
    await Promise.all(loadPromises);
    console.log('Data modules preloaded');
  });
}

/**
 * Load data with loading indicator
 * @param {string} modulePath - Path to the data module
 * @param {HTMLElement} container - Container to show loading state
 * @returns {Promise<any>} - The exported data from the module
 */
export async function loadDataWithIndicator(modulePath, container) {
  if (container) {
    container.classList.add('loading');
    const loadingMsg = document.createElement('div');
    loadingMsg.className = 'loading-message';
    loadingMsg.textContent = 'Loading assessment data...';
    loadingMsg.setAttribute('aria-live', 'polite');
    container.appendChild(loadingMsg);
  }

  try {
    const data = await loadDataModule(modulePath);
    
    if (container) {
      container.classList.remove('loading');
      const loadingMsg = container.querySelector('.loading-message');
      if (loadingMsg) loadingMsg.remove();
    }
    
    return data;
  } catch (error) {
    if (container) {
      container.classList.remove('loading');
      container.classList.add('error');
      const errorMsg = document.createElement('div');
      errorMsg.className = 'error-message';
      errorMsg.textContent = 'Failed to load assessment data. Please refresh the page.';
      errorMsg.setAttribute('role', 'alert');
      container.appendChild(errorMsg);
    }
    throw error;
  }
}

