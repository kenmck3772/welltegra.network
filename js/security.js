/**
 * Security and monitoring utilities for WellTegra
 * Provides error tracking, security monitoring, and safety checks
 */

class WellTegraSecurity {
    constructor() {
        this.errorCount = 0;
        this.maxErrors = 10;
        this.securityViolations = [];
        this.performanceMetrics = {
            loadTime: null,
            cacheHitRate: 0,
            resourceFailures: []
        };
        
        this.init();
    }
    
    init() {
        this.setupErrorHandling();
        this.setupSecurityMonitoring();
        this.setupPerformanceMonitoring();
        this.validateEnvironment();
    }
    
    // Global error handling
    setupErrorHandling() {
        window.addEventListener('error', (event) => {
            this.logError('JavaScript Error', {
                message: event.message,
                filename: event.filename,
                line: event.lineno,
                column: event.colno,
                stack: event.error?.stack
            });
        });
        
        window.addEventListener('unhandledrejection', (event) => {
            this.logError('Unhandled Promise Rejection', {
                reason: event.reason,
                promise: event.promise
            });
        });
        
        // Resource loading errors
        window.addEventListener('error', (event) => {
            if (event.target !== window) {
                this.logResourceError(event.target);
            }
        }, true);
    }
    
    // Security monitoring
    setupSecurityMonitoring() {
        // Monitor for CSP violations
        document.addEventListener('securitypolicyviolation', (event) => {
            this.logSecurityViolation('CSP Violation', {
                violatedDirective: event.violatedDirective,
                blockedURI: event.blockedURI,
                originalPolicy: event.originalPolicy
            });
        });
        
        // Monitor for unusual script execution
        if (typeof MutationObserver !== 'undefined') {
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.type === 'childList') {
                        mutation.addedNodes.forEach((node) => {
                            if (node.tagName === 'SCRIPT' && !this.isWhitelistedScript(node)) {
                                this.logSecurityViolation('Unexpected Script', {
                                    src: node.src,
                                    content: node.textContent?.substring(0, 100)
                                });
                            }
                        });
                    }
                });
            });
            
            observer.observe(document.head, { childList: true, subtree: true });
            observer.observe(document.body, { childList: true, subtree: true });
        }
    }
    
    // Performance monitoring
    setupPerformanceMonitoring() {
        // Monitor page load performance
        window.addEventListener('load', () => {
            // Use setTimeout to ensure loadEventEnd is available
            setTimeout(() => {
                if (typeof performance !== 'undefined' && performance.timing) {
                    const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
                    
                    // Only log valid load times
                    if (loadTime > 0 && loadTime < 60000) { // Between 0 and 60 seconds
                        this.performanceMetrics.loadTime = loadTime;
                        console.log(`Well-Tegra load time: ${loadTime}ms`);
                    }
                }
            }, 100);
        });
        
        // Monitor service worker cache performance
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.ready.then(() => {
                this.monitorCachePerformance();
            });
        }
    }
    
    // Environment validation
    validateEnvironment() {
        const checks = {
            'Modern Browser': this.checkModernBrowser(),
            'Local Storage': this.checkLocalStorage(),
            'Service Worker': this.checkServiceWorker(),
            'ES6 Modules': this.checkES6Modules(),
            'HTTPS': this.checkHTTPS()
        };
        
        console.log('Environment validation:', checks);
        
        // Log any failed checks
        Object.entries(checks).forEach(([check, passed]) => {
            if (!passed) {
                this.logError('Environment Check Failed', { check });
            }
        });
    }
    
    // Error logging
    logError(type, details) {
        this.errorCount++;
        
        const error = {
            type,
            details,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href
        };
        
        console.error(`WellTegra ${type}:`, error);
        
        // Emergency fallback if too many errors
        if (this.errorCount > this.maxErrors) {
            this.emergencyFallback();
        }
        
        // Store for potential reporting
        this.storeError(error);
    }
    
    // Security violation logging
    logSecurityViolation(type, details) {
        const violation = {
            type,
            details,
            timestamp: new Date().toISOString(),
            url: window.location.href
        };
        
        this.securityViolations.push(violation);
        console.warn(`WellTegra Security: ${type}`, violation);
        
        // Take action if critical violation
        if (this.isCriticalViolation(type)) {
            this.handleCriticalViolation(violation);
        }
    }
    
    // Resource error logging
    logResourceError(element) {
        const resourceError = {
            tagName: element.tagName,
            src: element.src || element.href,
            timestamp: new Date().toISOString()
        };
        
        this.performanceMetrics.resourceFailures.push(resourceError);
        console.warn('Resource loading failed:', resourceError);
        
        // Attempt fallback for critical resources
        this.attemptResourceFallback(element);
    }
    
    // Environment checks
    checkModernBrowser() {
        return !!(window.fetch && window.Promise && window.Map && window.Set);
    }
    
    checkLocalStorage() {
        try {
            localStorage.setItem('test', 'test');
            localStorage.removeItem('test');
            return true;
        } catch {
            return false;
        }
    }
    
    checkServiceWorker() {
        return 'serviceWorker' in navigator;
    }
    
    checkES6Modules() {
        const script = document.createElement('script');
        return 'noModule' in script;
    }
    
    checkHTTPS() {
        return location.protocol === 'https:' || location.hostname === 'localhost';
    }
    
    // Security helpers
    isWhitelistedScript(script) {
        const whitelist = [
            'https://cdn.jsdelivr.net/npm/chart.js',
            '/js/',
            'data:',
            ''  // inline scripts we control
        ];
        
        return whitelist.some(allowed => 
            script.src.includes(allowed) || (!script.src && script.textContent?.includes('WellTegra'))
        );
    }
    
    isCriticalViolation(type) {
        const critical = ['Unexpected Script', 'XSS Attempt', 'Data Exfiltration'];
        return critical.includes(type);
    }
    
    handleCriticalViolation(violation) {
        console.error('CRITICAL SECURITY VIOLATION:', violation);
        
        // Could implement additional safety measures here
        // For now, just log and alert
        if (confirm('Security violation detected. Reload page for safety?')) {
            location.reload();
        }
    }
    
    // Fallback mechanisms
    attemptResourceFallback(element) {
        // For Chart.js specifically
        if (element.src && element.src.includes('chart.js')) {
            console.log('Attempting Chart.js fallback...');
            // Could load from backup CDN or show charts disabled message
        }
    }
    
    emergencyFallback() {
        console.error('Emergency fallback activated - too many errors');
        
        document.body.innerHTML = `
            <div style="
                position: fixed; 
                top: 0; left: 0; 
                width: 100%; height: 100%; 
                background: #0f172a; 
                color: white; 
                display: flex; 
                align-items: center; 
                justify-content: center;
                z-index: 9999;
            ">
                <div style="text-align: center; padding: 20px;">
                    <h1>System Error</h1>
                    <p>WellTegra encountered multiple errors and activated safety mode.</p>
                    <button onclick="location.reload()" style="
                        background: #3b82f6; 
                        color: white; 
                        border: none; 
                        padding: 10px 20px; 
                        border-radius: 5px; 
                        cursor: pointer;
                        margin-top: 10px;
                    ">Reload Application</button>
                </div>
            </div>
        `;
    }
    
    // Cache monitoring
    monitorCachePerformance() {
        // Simple cache hit rate estimation
        const originalFetch = window.fetch;
        let totalRequests = 0;
        let cacheHits = 0;
        
        window.fetch = function(...args) {
            totalRequests++;
            return originalFetch.apply(this, args).then(response => {
                if (response.headers.get('x-cache') === 'HIT') {
                    cacheHits++;
                }
                return response;
            });
        };
        
        // Report cache performance periodically
        setInterval(() => {
            if (totalRequests > 0) {
                this.performanceMetrics.cacheHitRate = (cacheHits / totalRequests) * 100;
                console.log(`Cache hit rate: ${this.performanceMetrics.cacheHitRate.toFixed(1)}%`);
            }
        }, 30000); // Every 30 seconds
    }
    
    // Store errors for potential reporting
    storeError(error) {
        try {
            const errors = JSON.parse(localStorage.getItem('welltegra_errors') || '[]');
            errors.push(error);
            
            // Keep only last 50 errors
            if (errors.length > 50) {
                errors.shift();
            }
            
            localStorage.setItem('welltegra_errors', JSON.stringify(errors));
        } catch (e) {
            console.warn('Could not store error:', e);
        }
    }
    
    // Public methods for manual reporting
    getErrorReport() {
        return {
            errors: JSON.parse(localStorage.getItem('welltegra_errors') || '[]'),
            securityViolations: this.securityViolations,
            performanceMetrics: this.performanceMetrics,
            environment: {
                userAgent: navigator.userAgent,
                url: window.location.href,
                timestamp: new Date().toISOString()
            }
        };
    }
    
    clearErrorLog() {
        localStorage.removeItem('welltegra_errors');
        this.securityViolations = [];
        this.errorCount = 0;
        console.log('Error log cleared');
    }
}

// Initialize security monitoring
const security = new WellTegraSecurity();

// Export for global access
window.WellTegraSecurity = security;

export default security;