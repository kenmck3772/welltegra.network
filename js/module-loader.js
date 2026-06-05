/**
 * Well-Tegra Dynamic Module Loader
 *
 * Implements code splitting for main application bundle
 * Reduces initial page load by lazy-loading view modules
 *
 * Usage:
 *   const module = await ModuleLoader.load('planner');
 *   module.init();
 */

class ModuleLoader {
  static cache = new Map();
  static loading = new Map();

  /**
   * Module registry - maps view names to their chunk paths
   */
  static modules = {
    // Core views
    'planner': () => import('./views/planner-view.js'),
    'performer': () => import('./views/performer-view.js'),
    'tracker': () => import('./views/tracker-view.js'),
    'analytics': () => import('./views/analytics-view.js'),

    // Feature modules
    'survey-tool': () => import('./modules/survey-tool.js'),
    'equipment-catalog': () => import('./modules/equipment-catalog.js'),
    'tool-string-builder': () => import('./modules/tool-string-builder.js'),
    'emissions-calculator': () => import('./modules/emissions-calculator.js'),

    // Utility modules
    'chart-renderer': () => import('./modules/chart-renderer.js'),
    'data-export': () => import('./modules/data-export.js'),
    'pdf-generator': () => import('./modules/pdf-generator.js')
  };

  /**
   * Load a module dynamically with caching
   * @param {string} moduleName - Name of the module to load
   * @param {Object} options - Loading options
   * @returns {Promise<Object>} - Loaded module
   */
  static async load(moduleName, options = {}) {
    const {
      forceReload = false,
      timeout = 10000,
      onProgress = null
    } = options;

    // Return cached module if available
    if (!forceReload && this.cache.has(moduleName)) {
      console.log(`[ModuleLoader] Using cached module: ${moduleName}`);
      return this.cache.get(moduleName);
    }

    // Return existing loading promise if already loading
    if (this.loading.has(moduleName)) {
      console.log(`[ModuleLoader] Waiting for in-progress load: ${moduleName}`);
      return this.loading.get(moduleName);
    }

    // Start loading the module
    console.log(`[ModuleLoader] Loading module: ${moduleName}`);

    const loadPromise = this._loadWithTimeout(moduleName, timeout, onProgress);
    this.loading.set(moduleName, loadPromise);

    try {
      const module = await loadPromise;
      this.cache.set(moduleName, module);
      this.loading.delete(moduleName);

      console.log(`[ModuleLoader] Module loaded successfully: ${moduleName}`);
      return module;
    } catch (error) {
      this.loading.delete(moduleName);
      console.error(`[ModuleLoader] Failed to load module: ${moduleName}`, error);
      throw error;
    }
  }

  /**
   * Load module with timeout protection
   * @private
   */
  static async _loadWithTimeout(moduleName, timeout, onProgress) {
    const moduleLoader = this.modules[moduleName];

    if (!moduleLoader) {
      throw new Error(`Module not found: ${moduleName}`);
    }

    return new Promise(async (resolve, reject) => {
      // Set timeout
      const timeoutId = setTimeout(() => {
        reject(new Error(`Module load timeout: ${moduleName}`));
      }, timeout);

      try {
        // Report progress
        if (onProgress) {
          onProgress({ status: 'loading', module: moduleName });
        }

        // Load the module
        const module = await moduleLoader();

        clearTimeout(timeoutId);

        // Report completion
        if (onProgress) {
          onProgress({ status: 'loaded', module: moduleName });
        }

        resolve(module);
      } catch (error) {
        clearTimeout(timeoutId);

        // Report error
        if (onProgress) {
          onProgress({ status: 'error', module: moduleName, error });
        }

        reject(error);
      }
    });
  }

  /**
   * Preload modules in the background
   * @param {string[]} moduleNames - Array of module names to preload
   */
  static preload(moduleNames) {
    console.log(`[ModuleLoader] Preloading modules: ${moduleNames.join(', ')}`);

    moduleNames.forEach(moduleName => {
      // Load without blocking
      this.load(moduleName).catch(error => {
        console.warn(`[ModuleLoader] Preload failed for ${moduleName}:`, error);
      });
    });
  }

  /**
   * Clear module cache
   * @param {string} moduleName - Specific module to clear, or null for all
   */
  static clearCache(moduleName = null) {
    if (moduleName) {
      this.cache.delete(moduleName);
      console.log(`[ModuleLoader] Cleared cache for: ${moduleName}`);
    } else {
      this.cache.clear();
      console.log(`[ModuleLoader] Cleared all module cache`);
    }
  }

  /**
   * Get cache statistics
   */
  static getStats() {
    return {
      cached: Array.from(this.cache.keys()),
      loading: Array.from(this.loading.keys()),
      available: Object.keys(this.modules)
    };
  }
}

/**
 * View Manager - Handles view transitions with lazy loading
 */
class ViewManager {
  static currentView = null;
  static viewContainer = null;

  /**
   * Initialize the view manager
   */
  static init(containerSelector = '#app-container') {
    this.viewContainer = document.querySelector(containerSelector);
    if (!this.viewContainer) {
      console.error('[ViewManager] Container not found:', containerSelector);
    }
  }

  /**
   * Switch to a different view with lazy loading
   * @param {string} viewName - Name of the view to switch to
   * @param {Object} viewData - Data to pass to the view
   */
  static async switchView(viewName, viewData = {}) {
    try {
      // Show loading indicator
      this._showLoading(viewName);

      // Load the view module
      const viewModule = await ModuleLoader.load(viewName, {
        onProgress: (progress) => {
          console.log(`[ViewManager] Load progress:`, progress);
        }
      });

      // Hide previous view
      if (this.currentView) {
        await this._hideView(this.currentView);
      }

      // Initialize and show new view
      await this._showView(viewModule, viewData);
      this.currentView = viewName;

      // Preload related views
      this._preloadRelatedViews(viewName);

      // Hide loading indicator
      this._hideLoading();

      console.log(`[ViewManager] View switched to: ${viewName}`);
    } catch (error) {
      console.error(`[ViewManager] Failed to switch view:`, error);
      this._showError(error);
    }
  }

  /**
   * Show loading indicator
   * @private
   */
  static _showLoading(viewName) {
    if (!this.viewContainer) return;

    this.viewContainer.innerHTML = `
      <div class="view-loading">
        <div class="loading-spinner"></div>
        <div class="loading-text">Loading ${viewName}...</div>
      </div>
    `;
  }

  /**
   * Hide loading indicator
   * @private
   */
  static _hideLoading() {
    const loader = this.viewContainer?.querySelector('.view-loading');
    if (loader) {
      loader.remove();
    }
  }

  /**
   * Show error message
   * @private
   */
  static _showError(error) {
    if (!this.viewContainer) return;

    this.viewContainer.innerHTML = `
      <div class="view-error">
        <div class="error-icon">[!]</div>
        <div class="error-title">Failed to Load View</div>
        <div class="error-message">${error.message}</div>
        <button onclick="location.reload()">Reload Page</button>
      </div>
    `;
  }

  /**
   * Hide current view
   * @private
   */
  static async _hideView(viewName) {
    // Call view's cleanup method if it exists
    const viewModule = ModuleLoader.cache.get(viewName);
    if (viewModule?.cleanup) {
      await viewModule.cleanup();
    }
  }

  /**
   * Show new view
   * @private
   */
  static async _showView(viewModule, viewData) {
    if (viewModule.init) {
      await viewModule.init(this.viewContainer, viewData);
    } else if (viewModule.render) {
      const html = await viewModule.render(viewData);
      this.viewContainer.innerHTML = html;
    }
  }

  /**
   * Preload views that are likely to be accessed next
   * @private
   */
  static _preloadRelatedViews(currentView) {
    const relatedViews = {
      'planner': ['performer', 'equipment-catalog'],
      'performer': ['tracker', 'survey-tool'],
      'tracker': ['analytics', 'data-export'],
      'analytics': ['chart-renderer', 'pdf-generator']
    };

    const toPreload = relatedViews[currentView] || [];
    if (toPreload.length > 0) {
      ModuleLoader.preload(toPreload);
    }
  }
}

/**
 * Bundle Analyzer - Helps identify optimization opportunities
 */
class BundleAnalyzer {
  /**
   * Log bundle statistics
   */
  static logStats() {
    const stats = ModuleLoader.getStats();

    console.group('[BundleAnalyzer] Module Statistics');
    console.log('Cached modules:', stats.cached.length);
    console.log('Loading modules:', stats.loading.length);
    console.log('Available modules:', stats.available.length);
    console.log('Cache efficiency:', `${Math.round(stats.cached.length / stats.available.length * 100)}%`);
    console.groupEnd();

    return stats;
  }

  /**
   * Measure module load time
   */
  static async measureLoadTime(moduleName) {
    const startTime = performance.now();

    try {
      await ModuleLoader.load(moduleName, { forceReload: true });
      const endTime = performance.now();
      const loadTime = endTime - startTime;

      console.log(`[BundleAnalyzer] ${moduleName} load time: ${loadTime.toFixed(2)}ms`);
      return loadTime;
    } catch (error) {
      console.error(`[BundleAnalyzer] Failed to measure ${moduleName}:`, error);
      return null;
    }
  }
}

// Export for use in application
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ModuleLoader, ViewManager, BundleAnalyzer };
}

// Example usage in index.html:
/*
<script type="module">
  import { ViewManager, ModuleLoader } from './module-loader.js';

  // Initialize view manager
  ViewManager.init('#app-container');

  // Handle navigation
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', async (e) => {
      e.preventDefault();
      const viewName = e.target.dataset.view;
      await ViewManager.switchView(viewName);
    });
  });

  // Preload critical modules on page load
  window.addEventListener('load', () => {
    ModuleLoader.preload(['planner', 'performer']);
  });
</script>
*/
