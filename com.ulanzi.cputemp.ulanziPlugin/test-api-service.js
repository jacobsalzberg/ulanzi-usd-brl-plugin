/**
 * Focused Unit Tests for API Service Error Handling and Retry Logic
 * Tests Requirements: 4.1, 4.2, 4.3, 4.4
 */

// Mock fetch for testing
let mockFetchResponse = null;
let mockFetchError = null;
let fetchCallCount = 0;

const originalFetch = window.fetch;

function mockFetch(url, options) {
    fetchCallCount++;
    
    if (mockFetchError) {
        return Promise.reject(mockFetchError);
    }
    
    if (mockFetchResponse) {
        return Promise.resolve({
            ok: mockFetchResponse.ok || true,
            status: mockFetchResponse.status || 200,
            json: () => Promise.resolve(mockFetchResponse.data || {}),
            text: () => Promise.resolve(JSON.stringify(mockFetchResponse.data || {}))
        });
    }
    
    // Default successful response
    return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({
            rates: { BRL: 5.1234 },
            success: true,
            timestamp: Date.now()
        })
    });
}

// Replace fetch with mock
window.fetch = mockFetch;

/**
 * Test suite for API service functionality
 */
class APIServiceTestSuite {
    constructor() {
        this.testResults = {
            passed: 0,
            failed: 0,
            total: 0
        };
    }

    async runAllTests() {
        console.log('=== API Service Test Suite ===\n');
        
        await this.testBasicAPICall();
        await this.testNetworkErrorHandling();
        await this.testTimeoutHandling();
        await this.testRetryLogic();
        await this.testRateLimitHandling();
        await this.testServerErrorHandling();
        await this.testConnectivityDetection();
        await this.testResponseValidation();
        await this.testExponentialBackoff();
        await this.testMaxRetryLimit();
        
        this.printSummary();
        return this.testResults.failed === 0;
    }

    async testBasicAPICall() {
        this.test('Basic API Call Success', async () => {
            this.resetMocks();
            mockFetchResponse = {
                ok: true,
                status: 200,
                data: {
                    rates: { BRL: 5.2345 },
                    success: true,
                    timestamp: Date.now()
                }
            };

            const result = await CurrencyAPI.getUSDToBRL();
            
            this.assert(result.success === true, 'API call should succeed');
            this.assert(result.rate === 5.2345, 'Should return correct rate');
            this.assert(typeof result.timestamp === 'object', 'Should include timestamp');
        });
    }

    async testNetworkErrorHandling() {
        this.test('Network Error Handling', async () => {
            this.resetMocks();
            mockFetchError = new Error('Network connection failed');

            const result = await CurrencyAPI.getUSDToBRL();
            
            this.assert(result.success === false, 'Should fail on network error');
            this.assert(result.error.includes('Network') || result.error.includes('network'), 
                       'Error message should mention network');
        });
    }

    async testTimeoutHandling() {
        this.test('Request Timeout Handling', async () => {
            this.resetMocks();
            mockFetchError = new Error('Request timeout');

            const result = await CurrencyAPI.getUSDToBRL();
            
            this.assert(result.success === false, 'Should fail on timeout');
            this.assert(result.error.includes('timeout') || result.error.includes('Timeout'), 
                       'Error message should mention timeout');
        });
    }

    async testRetryLogic() {
        this.test('Retry Logic Implementation', async () => {
            this.resetMocks();
            
            // First two calls fail, third succeeds
            let callCount = 0;
            window.fetch = function(url, options) {
                callCount++;
                if (callCount <= 2) {
                    return Promise.reject(new Error('Temporary network error'));
                }
                return mockFetch(url, options);
            };

            mockFetchResponse = {
                ok: true,
                data: { rates: { BRL: 5.1111 }, success: true }
            };

            const result = await CurrencyAPI.getUSDToBRL();
            
            this.assert(result.success === true, 'Should succeed after retries');
            this.assert(callCount === 3, `Should retry exactly 2 times (total 3 calls), got ${callCount}`);
        });
    }

    async testRateLimitHandling() {
        this.test('Rate Limit Error Handling', async () => {
            this.resetMocks();
            mockFetchResponse = {
                ok: false,
                status: 429,
                data: { error: 'Rate limit exceeded' }
            };

            const result = await CurrencyAPI.getUSDToBRL();
            
            this.assert(result.success === false, 'Should fail on rate limit');
            this.assert(result.error.includes('rate limit') || result.error.includes('Rate limit'), 
                       'Error should mention rate limit');
        });
    }

    async testServerErrorHandling() {
        this.test('Server Error Handling (5xx)', async () => {
            this.resetMocks();
            mockFetchResponse = {
                ok: false,
                status: 500,
                data: { error: 'Internal server error' }
            };

            const result = await CurrencyAPI.getUSDToBRL();
            
            this.assert(result.success === false, 'Should fail on server error');
            this.assert(result.error.includes('server') || result.error.includes('Server'), 
                       'Error should mention server');
        });
    }

    async testConnectivityDetection() {
        this.test('Connectivity Status Detection', () => {
            // Test online status
            const originalOnLine = navigator.onLine;
            
            // Mock online
            Object.defineProperty(navigator, 'onLine', {
                get: () => true,
                configurable: true
            });
            
            let status = CurrencyAPI.getConnectivityStatus();
            this.assert(status === true, 'Should detect online status');
            
            // Mock offline
            Object.defineProperty(navigator, 'onLine', {
                get: () => false,
                configurable: true
            });
            
            status = CurrencyAPI.getConnectivityStatus();
            this.assert(status === false, 'Should detect offline status');
            
            // Restore original
            Object.defineProperty(navigator, 'onLine', {
                get: () => originalOnLine,
                configurable: true
            });
        });
    }

    async testResponseValidation() {
        this.test('Response Validation', async () => {
            this.resetMocks();
            
            // Test invalid response structure
            mockFetchResponse = {
                ok: true,
                data: { invalid: 'response' } // Missing required fields
            };

            const result = await CurrencyAPI.getUSDToBRL();
            
            this.assert(result.success === false, 'Should fail on invalid response structure');
            
            // Test valid response structure
            mockFetchResponse = {
                ok: true,
                data: {
                    rates: { BRL: 5.4321 },
                    success: true,
                    timestamp: Date.now()
                }
            };

            const validResult = await CurrencyAPI.getUSDToBRL();
            this.assert(validResult.success === true, 'Should succeed with valid response');
            this.assert(validResult.rate === 5.4321, 'Should extract rate correctly');
        });
    }

    async testExponentialBackoff() {
        this.test('Exponential Backoff Implementation', async () => {
            this.resetMocks();
            
            const startTime = Date.now();
            const retryTimes = [];
            
            // Mock that fails multiple times to test backoff
            let attemptCount = 0;
            window.fetch = function(url, options) {
                attemptCount++;
                retryTimes.push(Date.now() - startTime);
                
                if (attemptCount <= CurrencyAPI.MAX_RETRIES) {
                    return Promise.reject(new Error('Temporary failure'));
                }
                
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({
                        rates: { BRL: 5.0000 },
                        success: true
                    })
                });
            };

            await CurrencyAPI.getUSDToBRL();
            
            // Check that delays increase (exponential backoff)
            if (retryTimes.length >= 3) {
                const delay1 = retryTimes[1] - retryTimes[0];
                const delay2 = retryTimes[2] - retryTimes[1];
                
                this.assert(delay2 > delay1, 
                           `Second delay (${delay2}ms) should be longer than first (${delay1}ms)`);
            }
            
            this.assert(attemptCount <= CurrencyAPI.MAX_RETRIES + 1, 
                       'Should not exceed maximum retry attempts');
        });
    }

    async testMaxRetryLimit() {
        this.test('Maximum Retry Limit Enforcement', async () => {
            this.resetMocks();
            
            let attemptCount = 0;
            window.fetch = function(url, options) {
                attemptCount++;
                return Promise.reject(new Error('Persistent failure'));
            };

            const result = await CurrencyAPI.getUSDToBRL();
            
            this.assert(result.success === false, 'Should fail after max retries');
            this.assert(attemptCount === CurrencyAPI.MAX_RETRIES + 1, 
                       `Should make exactly ${CurrencyAPI.MAX_RETRIES + 1} attempts, made ${attemptCount}`);
        });
    }

    // Test utilities
    test(name, testFn) {
        this.testResults.total++;
        try {
            const result = testFn();
            if (result instanceof Promise) {
                return result.then(() => {
                    this.testResults.passed++;
                    console.log(`✓ ${name}`);
                }).catch(error => {
                    this.testResults.failed++;
                    console.error(`✗ ${name}: ${error.message}`);
                });
            } else {
                this.testResults.passed++;
                console.log(`✓ ${name}`);
            }
        } catch (error) {
            this.testResults.failed++;
            console.error(`✗ ${name}: ${error.message}`);
        }
    }

    assert(condition, message) {
        if (!condition) {
            throw new Error(message);
        }
    }

    resetMocks() {
        mockFetchResponse = null;
        mockFetchError = null;
        fetchCallCount = 0;
        window.fetch = mockFetch;
    }

    printSummary() {
        console.log('\n=== API Service Test Summary ===');
        console.log(`Total: ${this.testResults.total}`);
        console.log(`Passed: ${this.testResults.passed}`);
        console.log(`Failed: ${this.testResults.failed}`);
        console.log(`Success Rate: ${((this.testResults.passed / this.testResults.total) * 100).toFixed(1)}%`);
    }
}

// Export for use in main test suite
if (typeof window !== 'undefined') {
    window.APIServiceTestSuite = APIServiceTestSuite;
}

// Auto-run if loaded directly
if (typeof CurrencyAPI !== 'undefined') {
    const testSuite = new APIServiceTestSuite();
    testSuite.runAllTests().then(success => {
        console.log(success ? 'All API service tests passed!' : 'Some API service tests failed!');
    });
} else {
    console.warn('CurrencyAPI not loaded - API service tests cannot run');
}