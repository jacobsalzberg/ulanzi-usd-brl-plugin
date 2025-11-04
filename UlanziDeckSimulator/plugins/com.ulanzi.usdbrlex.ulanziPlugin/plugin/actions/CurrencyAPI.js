/**
 * CurrencyAPI - Service class for fetching USD to BRL exchange rates
 * Handles API communication with error handling and retry logic
 */
class CurrencyAPI {
    static API_ENDPOINT = 'https://api.exchangerate-api.com/v4/latest/USD';
    static REQUEST_TIMEOUT = 10000; // 10 seconds
    static MAX_RETRIES = 3;
    static RETRY_DELAYS = [1000, 2000, 4000]; // Exponential backoff in milliseconds
    
    // Network connectivity tracking
    static isOnline = navigator.onLine;
    static connectivityListeners = new Set();
    static lastConnectivityCheck = null;
    static connectivityCheckInterval = 30000; // 30 seconds
    
    // Initialize connectivity monitoring
    static {
        this.initializeConnectivityMonitoring();
    }

    /**
     * Fetches the current USD to BRL exchange rate
     * @param {boolean} waitForConnectivity - Whether to wait for network connectivity
     * @returns {Promise<{rate: number, timestamp: Date, source: string, success: boolean}>}
     */
    static async getUSDToBRL(waitForConnectivity = true) {
        try {
            // Use enhanced retry with connectivity awareness
            const response = await this.retryRequestWithConnectivity(
                () => this.makeAPIRequest(),
                this.MAX_RETRIES,
                waitForConnectivity
            );
            
            if (!response.success) {
                throw new Error('API request failed');
            }

            const rate = this.extractBRLRate(response.data);
            
            return {
                rate: rate,
                timestamp: new Date(),
                source: 'ExchangeRate-API',
                success: true,
                connectivityStatus: this.isOnline
            };
        } catch (error) {
            console.error('CurrencyAPI: Failed to fetch USD to BRL rate:', error);
            return {
                rate: null,
                timestamp: new Date(),
                source: 'ExchangeRate-API',
                success: false,
                error: error.message,
                connectivityStatus: this.isOnline
            };
        }
    }

    /**
     * Makes the actual API request with timeout handling
     * @returns {Promise<{success: boolean, data?: any, error?: string}>}
     */
    static async makeAPIRequest() {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.REQUEST_TIMEOUT);

        try {
            const response = await fetch(this.API_ENDPOINT, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'User-Agent': 'UlanziDeck-USD-BRL-Plugin/1.0'
                },
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            
            // Validate response structure
            if (!this.validateAPIResponse(data)) {
                throw new Error('Invalid API response structure');
            }

            return {
                success: true,
                data: data
            };
        } catch (error) {
            clearTimeout(timeoutId);
            
            if (error.name === 'AbortError') {
                throw new Error('Request timeout');
            }
            
            throw error;
        }
    }

    /**
     * Implements retry logic with exponential backoff
     * @param {Function} requestFn - Function that makes the API request
     * @param {number} maxRetries - Maximum number of retry attempts
     * @returns {Promise<any>}
     */
    static async retryRequest(requestFn, maxRetries = this.MAX_RETRIES) {
        let lastError;

        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                const result = await requestFn();
                return result;
            } catch (error) {
                lastError = error;
                
                // Don't retry on the last attempt
                if (attempt === maxRetries) {
                    break;
                }

                // Calculate delay for exponential backoff
                const delay = this.RETRY_DELAYS[attempt] || this.RETRY_DELAYS[this.RETRY_DELAYS.length - 1];
                
                console.warn(`CurrencyAPI: Request failed (attempt ${attempt + 1}/${maxRetries + 1}), retrying in ${delay}ms:`, error.message);
                
                // Wait before retrying
                await this.sleep(delay);
            }
        }

        throw lastError;
    }

    /**
     * Validates the structure of the API response
     * @param {any} data - Response data to validate
     * @returns {boolean}
     */
    static validateAPIResponse(data) {
        if (!data || typeof data !== 'object') {
            return false;
        }

        // Check for required fields
        if (!data.rates || typeof data.rates !== 'object') {
            return false;
        }

        // Check if BRL rate exists and is a valid number
        if (!data.rates.BRL || typeof data.rates.BRL !== 'number' || data.rates.BRL <= 0) {
            return false;
        }

        // Check for base currency (should be USD)
        if (data.base && data.base !== 'USD') {
            console.warn('CurrencyAPI: Unexpected base currency:', data.base);
        }

        return true;
    }

    /**
     * Extracts the BRL exchange rate from the API response
     * @param {any} data - API response data
     * @returns {number}
     */
    static extractBRLRate(data) {
        const rate = data.rates.BRL;
        
        // Round to 4 decimal places for display consistency
        return Math.round(rate * 10000) / 10000;
    }

    /**
     * Handles different types of API errors and provides appropriate error messages
     * @param {Error} error - The error to handle
     * @returns {string}
     */
    static handleAPIError(error) {
        if (!error) {
            return 'Unknown error occurred';
        }

        const message = error.message || error.toString();

        // Network-related errors
        if (message.includes('fetch') || message.includes('network') || message.includes('NetworkError')) {
            return 'Network connection failed';
        }

        // Timeout errors
        if (message.includes('timeout') || message.includes('AbortError')) {
            return 'Request timed out';
        }

        // HTTP errors
        if (message.includes('HTTP 4')) {
            return 'API request error (client)';
        }

        if (message.includes('HTTP 5')) {
            return 'API server error';
        }

        // Rate limiting
        if (message.includes('429') || message.includes('rate limit')) {
            return 'API rate limit exceeded';
        }

        // Invalid response
        if (message.includes('Invalid') || message.includes('parse')) {
            return 'Invalid API response';
        }

        // Generic fallback
        return 'API request failed';
    }

    /**
     * Initialize network connectivity monitoring
     */
    static initializeConnectivityMonitoring() {
        // Listen for online/offline events
        window.addEventListener('online', () => {
            console.log('CurrencyAPI: Network connectivity restored');
            this.isOnline = true;
            this.notifyConnectivityChange(true);
        });

        window.addEventListener('offline', () => {
            console.log('CurrencyAPI: Network connectivity lost');
            this.isOnline = false;
            this.notifyConnectivityChange(false);
        });

        // Periodic connectivity check for more reliable detection
        setInterval(() => {
            this.checkConnectivity();
        }, this.connectivityCheckInterval);
    }

    /**
     * Check network connectivity by attempting a lightweight request
     * @returns {Promise<boolean>}
     */
    static async checkConnectivity() {
        try {
            // Use a lightweight endpoint for connectivity check
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

            const response = await fetch('https://httpbin.org/status/200', {
                method: 'HEAD',
                mode: 'no-cors',
                signal: controller.signal
            });

            clearTimeout(timeoutId);
            
            const wasOnline = this.isOnline;
            this.isOnline = true;
            this.lastConnectivityCheck = new Date();

            // Notify if connectivity was restored
            if (!wasOnline) {
                console.log('CurrencyAPI: Network connectivity restored (detected via check)');
                this.notifyConnectivityChange(true);
            }

            return true;
        } catch (error) {
            const wasOnline = this.isOnline;
            this.isOnline = false;
            this.lastConnectivityCheck = new Date();

            // Notify if connectivity was lost
            if (wasOnline) {
                console.log('CurrencyAPI: Network connectivity lost (detected via check)');
                this.notifyConnectivityChange(false);
            }

            return false;
        }
    }

    /**
     * Register a listener for connectivity changes
     * @param {Function} callback - Function to call when connectivity changes
     */
    static addConnectivityListener(callback) {
        if (typeof callback === 'function') {
            this.connectivityListeners.add(callback);
        }
    }

    /**
     * Remove a connectivity change listener
     * @param {Function} callback - Function to remove
     */
    static removeConnectivityListener(callback) {
        this.connectivityListeners.delete(callback);
    }

    /**
     * Notify all listeners of connectivity changes
     * @param {boolean} isOnline - Current connectivity status
     */
    static notifyConnectivityChange(isOnline) {
        this.connectivityListeners.forEach(callback => {
            try {
                callback(isOnline);
            } catch (error) {
                console.error('CurrencyAPI: Error in connectivity listener:', error);
            }
        });
    }

    /**
     * Get current connectivity status
     * @returns {boolean}
     */
    static getConnectivityStatus() {
        return this.isOnline;
    }

    /**
     * Wait for network connectivity to be restored
     * @param {number} maxWaitTime - Maximum time to wait in milliseconds
     * @returns {Promise<boolean>}
     */
    static async waitForConnectivity(maxWaitTime = 60000) {
        if (this.isOnline) {
            return true;
        }

        return new Promise((resolve) => {
            const startTime = Date.now();
            
            const checkConnectivity = () => {
                if (this.isOnline) {
                    resolve(true);
                    return;
                }

                if (Date.now() - startTime >= maxWaitTime) {
                    resolve(false);
                    return;
                }

                // Check again in 1 second
                setTimeout(checkConnectivity, 1000);
            };

            // Start checking
            checkConnectivity();
        });
    }

    /**
     * Enhanced retry request with connectivity awareness
     * @param {Function} requestFn - Function that makes the API request
     * @param {number} maxRetries - Maximum number of retry attempts
     * @param {boolean} waitForConnectivity - Whether to wait for connectivity before retrying
     * @returns {Promise<any>}
     */
    static async retryRequestWithConnectivity(requestFn, maxRetries = this.MAX_RETRIES, waitForConnectivity = true) {
        let lastError;

        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                // Check connectivity before making request
                if (!this.isOnline && waitForConnectivity) {
                    console.log(`CurrencyAPI: No connectivity detected, waiting for network (attempt ${attempt + 1}/${maxRetries + 1})`);
                    
                    // Wait for connectivity to be restored (up to 30 seconds per attempt)
                    const connectivityRestored = await this.waitForConnectivity(30000);
                    
                    if (!connectivityRestored) {
                        throw new Error('Network connectivity not available');
                    }
                }

                const result = await requestFn();
                return result;
            } catch (error) {
                lastError = error;
                
                // Don't retry on the last attempt
                if (attempt === maxRetries) {
                    break;
                }

                // Check if this is a recoverable error
                if (!this.isRecoverableError(error)) {
                    console.log('CurrencyAPI: Non-recoverable error, stopping retries:', error.message);
                    break;
                }

                // Calculate delay for exponential backoff with jitter
                const baseDelay = this.RETRY_DELAYS[attempt] || this.RETRY_DELAYS[this.RETRY_DELAYS.length - 1];
                const jitter = Math.random() * 1000; // Add up to 1 second of jitter
                const delay = baseDelay + jitter;
                
                console.warn(`CurrencyAPI: Request failed (attempt ${attempt + 1}/${maxRetries + 1}), retrying in ${Math.round(delay)}ms:`, error.message);
                
                // Wait before retrying
                await this.sleep(delay);
            }
        }

        throw lastError;
    }

    /**
     * Utility function to create a delay
     * @param {number} ms - Milliseconds to sleep
     * @returns {Promise<void>}
     */
    static sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Checks if the error is recoverable (should retry)
     * @param {Error} error - The error to check
     * @returns {boolean}
     */
    static isRecoverableError(error) {
        if (!error) return false;

        const message = error.message || error.toString();

        // Don't retry on client errors (4xx) except for rate limiting
        if (message.includes('HTTP 4') && !message.includes('429')) {
            return false;
        }

        // Don't retry on invalid API response structure
        if (message.includes('Invalid API response structure')) {
            return false;
        }

        // Don't retry if explicitly marked as non-recoverable
        if (message.includes('Non-recoverable')) {
            return false;
        }

        // Retry on network, timeout, server errors, and connectivity issues
        return true;
    }

    /**
     * Enhanced error handling with connectivity awareness
     * @param {Error} error - The error to handle
     * @returns {string}
     */
    static handleAPIErrorWithConnectivity(error) {
        if (!error) {
            return 'Unknown error occurred';
        }

        const message = error.message || error.toString();

        // Network connectivity errors
        if (!this.isOnline || message.includes('Network connectivity not available')) {
            return 'No network connection';
        }

        // Use existing error handling for other cases
        return this.handleAPIError(error);
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CurrencyAPI;
}