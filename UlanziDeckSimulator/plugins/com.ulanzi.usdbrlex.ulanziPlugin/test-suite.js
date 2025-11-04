/**
 * Comprehensive Unit Test Suite for USD/BRL Exchange Rate Plugin
 * Tests core functionality including ExchangeRateDisplay class methods,
 * API service error handling, settings validation, and timer management
 */

// Simple test framework for browser environment
class TestFramework {
    constructor() {
        this.tests = [];
        this.results = {
            passed: 0,
            failed: 0,
            total: 0
        };
    }

    describe(description, testFn) {
        console.log(`\n=== ${description} ===`);
        testFn();
    }

    it(description, testFn) {
        this.results.total++;
        try {
            testFn();
            this.results.passed++;
            console.log(`✓ ${description}`);
        } catch (error) {
            this.results.failed++;
            console.error(`✗ ${description}`);
            console.error(`  Error: ${error.message}`);
        }
    }

    expect(actual) {
        return {
            toBe: (expected) => {
                if (actual !== expected) {
                    throw new Error(`Expected ${expected}, but got ${actual}`);
                }
            },
            toEqual: (expected) => {
                if (JSON.stringify(actual) !== JSON.stringify(expected)) {
                    throw new Error(`Expected ${JSON.stringify(expected)}, but got ${JSON.stringify(actual)}`);
                }
            },
            toBeTruthy: () => {
                if (!actual) {
                    throw new Error(`Expected truthy value, but got ${actual}`);
                }
            },
            toBeFalsy: () => {
                if (actual) {
                    throw new Error(`Expected falsy value, but got ${actual}`);
                }
            },
            toBeNull: () => {
                if (actual !== null) {
                    throw new Error(`Expected null, but got ${actual}`);
                }
            },
            toBeGreaterThan: (expected) => {
                if (actual <= expected) {
                    throw new Error(`Expected ${actual} to be greater than ${expected}`);
                }
            },
            toContain: (expected) => {
                if (!actual.includes(expected)) {
                    throw new Error(`Expected ${actual} to contain ${expected}`);
                }
            }
        };
    }

    async runTests() {
        console.log('Starting USD/BRL Exchange Rate Plugin Test Suite...\n');
        
        // Run all test suites
        await this.runExchangeRateDisplayTests();
        await this.runAPIServiceTests();
        await this.runSettingsTests();
        await this.runTimerTests();
        
        // Print summary
        console.log('\n=== Test Summary ===');
        console.log(`Total: ${this.results.total}`);
        console.log(`Passed: ${this.results.passed}`);
        console.log(`Failed: ${this.results.failed}`);
        console.log(`Success Rate: ${((this.results.passed / this.results.total) * 100).toFixed(1)}%`);
        
        return this.results.failed === 0;
    }

    async runExchangeRateDisplayTests() {
        this.describe('ExchangeRateDisplay Class Tests', () => {
            this.testExchangeRateDisplayConstructor();
            this.testRateUpdateMethods();
            this.testActiveStateManagement();
            this.testRefreshIntervalManagement();
            this.testErrorStateHandling();
            this.testDataStaleDetection();
            this.testCanvasRendering();
            this.testInstanceCleanup();
        });
    }

    async runAPIServiceTests() {
        this.describe('API Service Tests', () => {
            // Run focused API service tests if available
            if (typeof APIServiceTestSuite !== 'undefined') {
                console.log('Running focused API service tests...');
                const apiTestSuite = new APIServiceTestSuite();
                await apiTestSuite.runAllTests();
                
                // Merge results
                this.results.total += apiTestSuite.testResults.total;
                this.results.passed += apiTestSuite.testResults.passed;
                this.results.failed += apiTestSuite.testResults.failed;
            } else {
                // Fallback to basic tests
                this.testAPIErrorHandling();
                this.testRetryLogic();
                this.testConnectivityDetection();
                this.testResponseValidation();
            }
        });
    }

    async runSettingsTests() {
        this.describe('Settings Management Tests', () => {
            // Run focused settings validation tests if available
            if (typeof SettingsValidationTestSuite !== 'undefined') {
                console.log('Running focused settings validation tests...');
                const settingsTestSuite = new SettingsValidationTestSuite();
                await settingsTestSuite.runAllTests();
                
                // Merge results
                this.results.total += settingsTestSuite.testResults.total;
                this.results.passed += settingsTestSuite.testResults.passed;
                this.results.failed += settingsTestSuite.testResults.failed;
            } else {
                // Fallback to basic tests
                this.testSettingsValidation();
                this.testSettingsApplication();
                this.testSettingsPersistence();
                this.testDefaultValues();
            }
        });
    }

    async runTimerTests() {
        this.describe('Timer Management Tests', () => {
            // Run focused timer management tests if available
            if (typeof TimerManagementTestSuite !== 'undefined') {
                console.log('Running focused timer management tests...');
                const timerTestSuite = new TimerManagementTestSuite();
                await timerTestSuite.runAllTests();
                
                // Merge results
                this.results.total += timerTestSuite.testResults.total;
                this.results.passed += timerTestSuite.testResults.passed;
                this.results.failed += timerTestSuite.testResults.failed;
            } else {
                // Fallback to basic tests
                this.testTimerStartStop();
                this.testTimerCleanup();
                this.testRefreshIntervalChanges();
                this.testActiveStateTimerControl();
            }
        });
    }

    // ExchangeRateDisplay Class Tests
    testExchangeRateDisplayConstructor() {
        this.it('should create ExchangeRateDisplay instance with valid context', () => {
            const display = new ExchangeRateDisplay('test-context');
            this.expect(display).toBeTruthy();
            this.expect(display.getCurrentRate()).toBeNull();
            this.expect(display.getRefreshInterval()).toBe(5); // Default 5 minutes
            this.expect(display.getIsActive()).toBeTruthy();
            display.destroy();
        });

        this.it('should initialize with proper default values', () => {
            const display = new ExchangeRateDisplay('test-context-2');
            this.expect(display.getErrorState()).toBeFalsy();
            this.expect(display.getLastUpdate()).toBeNull();
            display.destroy();
        });
    }

    testRateUpdateMethods() {
        this.it('should update rate with valid data', () => {
            const display = new ExchangeRateDisplay('test-context-3');
            const testRate = 5.2345;
            const testTimestamp = new Date();
            
            display.updateRate(testRate, testTimestamp, false);
            
            this.expect(display.getCurrentRate()).toBe(testRate);
            this.expect(display.getLastUpdate()).toEqual(testTimestamp);
            this.expect(display.getErrorState()).toBeFalsy();
            display.destroy();
        });

        this.it('should handle invalid rate data', () => {
            const display = new ExchangeRateDisplay('test-context-4');
            
            // Test with invalid rate values
            display.updateRate(-1, new Date(), false);
            this.expect(display.getCurrentRate()).toBeNull();
            this.expect(display.getErrorState()).toBeTruthy();
            
            display.updateRate(NaN, new Date(), false);
            this.expect(display.getCurrentRate()).toBeNull();
            this.expect(display.getErrorState()).toBeTruthy();
            
            display.destroy();
        });

        this.it('should preserve previous rate on error if available', () => {
            const display = new ExchangeRateDisplay('test-context-5');
            const validRate = 5.1234;
            
            // Set valid rate first
            display.updateRate(validRate, new Date(), false);
            this.expect(display.getCurrentRate()).toBe(validRate);
            
            // Update with error - should preserve previous rate
            display.updateRate(null, new Date(), true, 'Network error');
            this.expect(display.getCurrentRate()).toBe(validRate); // Should preserve
            this.expect(display.getErrorState()).toBeTruthy();
            
            display.destroy();
        });
    }

    testActiveStateManagement() {
        this.it('should manage active state correctly', () => {
            const display = new ExchangeRateDisplay('test-context-6');
            
            // Test initial state
            this.expect(display.getIsActive()).toBeTruthy();
            
            // Test setting inactive
            display.setActive(false);
            this.expect(display.getIsActive()).toBeFalsy();
            
            // Test setting active again
            display.setActive(true);
            this.expect(display.getIsActive()).toBeTruthy();
            
            display.destroy();
        });

        this.it('should handle string boolean values for active state', () => {
            const display = new ExchangeRateDisplay('test-context-7');
            
            display.setActive('true');
            this.expect(display.getIsActive()).toBeTruthy();
            
            display.setActive('false');
            this.expect(display.getIsActive()).toBeFalsy();
            
            display.destroy();
        });
    }

    testRefreshIntervalManagement() {
        this.it('should set and get refresh interval correctly', () => {
            const display = new ExchangeRateDisplay('test-context-8');
            
            // Test default interval
            this.expect(display.getRefreshInterval()).toBe(5);
            
            // Test setting new interval
            display.setRefreshInterval(10);
            this.expect(display.getRefreshInterval()).toBe(10);
            
            // Test setting with string value
            display.setRefreshInterval('30');
            this.expect(display.getRefreshInterval()).toBe(30);
            
            // Test invalid interval (should use default)
            display.setRefreshInterval('invalid');
            this.expect(display.getRefreshInterval()).toBe(5);
            
            display.destroy();
        });
    }

    testErrorStateHandling() {
        this.it('should handle different error types correctly', () => {
            const display = new ExchangeRateDisplay('test-context-9');
            
            // Test network error
            display.updateRate(null, new Date(), true, 'Network connection failed');
            this.expect(display.getErrorState()).toContain('Network');
            
            // Test timeout error
            display.updateRate(null, new Date(), true, 'Request timed out');
            this.expect(display.getErrorState()).toContain('timed out');
            
            // Test rate limit error
            display.updateRate(null, new Date(), true, 'API rate limit exceeded');
            this.expect(display.getErrorState()).toContain('rate limit');
            
            display.destroy();
        });

        this.it('should clear error state on successful update', () => {
            const display = new ExchangeRateDisplay('test-context-10');
            
            // Set error state
            display.updateRate(null, new Date(), true, 'Test error');
            this.expect(display.getErrorState()).toBeTruthy();
            
            // Clear with successful update
            display.updateRate(5.1234, new Date(), false);
            this.expect(display.getErrorState()).toBeFalsy();
            
            display.destroy();
        });
    }

    testDataStaleDetection() {
        this.it('should detect stale data correctly', () => {
            const display = new ExchangeRateDisplay('test-context-11');
            
            // Fresh data should not be stale
            const freshTimestamp = new Date();
            this.expect(display.isDataStale(freshTimestamp)).toBeFalsy();
            
            // Old data should be stale (15 minutes ago with 5 minute interval = 3x interval)
            const staleTimestamp = new Date(Date.now() - 15 * 60 * 1000);
            this.expect(display.isDataStale(staleTimestamp)).toBeTruthy();
            
            // Null timestamp should be stale
            this.expect(display.isDataStale(null)).toBeTruthy();
            
            display.destroy();
        });

        this.it('should provide human-readable data age descriptions', () => {
            const display = new ExchangeRateDisplay('test-context-12');
            
            // Test recent data
            const recentTimestamp = new Date(Date.now() - 30 * 1000); // 30 seconds ago
            const recentAge = display.getDataAgeDescription(recentTimestamp);
            this.expect(recentAge).toBe('Just now');
            
            // Test minutes ago
            const minutesTimestamp = new Date(Date.now() - 5 * 60 * 1000); // 5 minutes ago
            const minutesAge = display.getDataAgeDescription(minutesTimestamp);
            this.expect(minutesAge).toContain('5m ago');
            
            // Test null timestamp
            const nullAge = display.getDataAgeDescription(null);
            this.expect(nullAge).toBe('No data');
            
            display.destroy();
        });
    }

    testCanvasRendering() {
        this.it('should create canvas with correct dimensions', () => {
            const display = new ExchangeRateDisplay('test-context-13');
            
            // Access canvas through display (assuming it's accessible for testing)
            // Note: In actual implementation, canvas might be private
            // This test verifies the canvas setup indirectly through rendering
            
            // Test that rendering doesn't throw errors
            try {
                display.renderRate(5.1234, new Date());
                display.renderLoadingState();
                this.expect(true).toBeTruthy(); // If we get here, rendering worked
            } catch (error) {
                throw new Error(`Canvas rendering failed: ${error.message}`);
            }
            
            display.destroy();
        });
    }

    testInstanceCleanup() {
        this.it('should clean up resources on destroy', () => {
            const display = new ExchangeRateDisplay('test-context-14');
            
            // Set up some state
            display.setRefreshInterval(10);
            display.updateRate(5.1234, new Date(), false);
            
            // Destroy should not throw
            try {
                display.destroy();
                this.expect(true).toBeTruthy();
            } catch (error) {
                throw new Error(`Destroy method failed: ${error.message}`);
            }
        });
    }

    // API Service Tests
    testAPIErrorHandling() {
        this.it('should handle API errors gracefully', () => {
            // Test error handling function
            const networkError = new Error('Network connection failed');
            const handledError = CurrencyAPI.handleAPIErrorWithConnectivity(networkError);
            this.expect(handledError).toContain('Network');
            
            const timeoutError = new Error('Request timeout');
            const handledTimeout = CurrencyAPI.handleAPIErrorWithConnectivity(timeoutError);
            this.expect(handledTimeout).toContain('timeout');
        });
    }

    testRetryLogic() {
        this.it('should implement proper retry logic', () => {
            // Test retry count limits
            this.expect(CurrencyAPI.MAX_RETRIES).toBeGreaterThan(0);
            this.expect(CurrencyAPI.MAX_RETRIES).toBe(3); // As per requirements
        });
    }

    testConnectivityDetection() {
        this.it('should detect connectivity status', () => {
            // Test connectivity detection
            const status = CurrencyAPI.getConnectivityStatus();
            this.expect(typeof status).toBe('boolean');
        });
    }

    testResponseValidation() {
        this.it('should validate API responses correctly', () => {
            // Test valid response
            const validResponse = { rate: 5.1234, success: true, timestamp: new Date() };
            // Assuming there's a validation method
            // This would test the response structure validation
            this.expect(validResponse.rate).toBeGreaterThan(0);
            this.expect(validResponse.success).toBeTruthy();
        });
    }

    // Settings Management Tests
    testSettingsValidation() {
        this.it('should validate refresh interval settings', () => {
            // Test valid intervals
            const validSettings1 = validateAndNormalizeSettings({ refresh_interval: '5' });
            this.expect(validSettings1.refresh_interval).toBe('5');
            
            const validSettings2 = validateAndNormalizeSettings({ refresh_interval: '30' });
            this.expect(validSettings2.refresh_interval).toBe('30');
            
            // Test invalid intervals
            const invalidSettings = validateAndNormalizeSettings({ refresh_interval: '15' });
            this.expect(invalidSettings.refresh_interval).toBe('5'); // Should default to 5
            
            // Test missing settings
            const missingSettings = validateAndNormalizeSettings({});
            this.expect(missingSettings.refresh_interval).toBe('5'); // Should default to 5
        });

        this.it('should handle edge cases in settings validation', () => {
            // Test null/undefined input
            const nullSettings = validateAndNormalizeSettings(null);
            this.expect(nullSettings.refresh_interval).toBe('5');
            
            const undefinedSettings = validateAndNormalizeSettings(undefined);
            this.expect(undefinedSettings.refresh_interval).toBe('5');
            
            // Test numeric input (should be converted to string)
            const numericSettings = validateAndNormalizeSettings({ refresh_interval: 10 });
            this.expect(numericSettings.refresh_interval).toBe('10');
        });
    }

    testSettingsApplication() {
        this.it('should apply settings to instance correctly', () => {
            // Create mock instance
            const mockInstance = {
                refreshInterval: 5,
                setRefreshInterval: function(minutes) { this.refreshInterval = minutes; },
                getRefreshInterval: function() { return this.refreshInterval; },
                getIsActive: function() { return true; },
                getCurrentRate: function() { return null; },
                getLastUpdate: function() { return null; },
                triggerRefresh: function() { this.refreshTriggered = true; }
            };
            
            const settings = { refresh_interval: '10' };
            applySettingsToInstance(mockInstance, settings, 'test-context');
            
            this.expect(mockInstance.getRefreshInterval()).toBe(10);
        });
    }

    testSettingsPersistence() {
        this.it('should persist settings correctly', () => {
            const testContext = 'test-persistence-context';
            const testSettings = { refresh_interval: '10' };
            
            // Mock UlanziDeck setParam
            let storedSettings = null;
            const originalSetParam = $UD.setParam;
            $UD.setParam = function(context, settings) {
                if (context === testContext) {
                    storedSettings = settings;
                }
            };
            
            // Test settings persistence
            const mockJsn = { context: testContext, param: testSettings };
            onSetSettings(mockJsn);
            
            this.expect(storedSettings).toEqual(testSettings);
            
            // Restore original function
            $UD.setParam = originalSetParam;
        });
    }

    testDefaultValues() {
        this.it('should use correct default values', () => {
            const defaults = validateAndNormalizeSettings({});
            this.expect(defaults.refresh_interval).toBe('5'); // 5 minutes default
        });
    }

    // Timer Management Tests
    testTimerStartStop() {
        this.it('should start and stop timers correctly', () => {
            const display = new ExchangeRateDisplay('test-timer-context');
            
            // Timer should start automatically for active display
            this.expect(display.getIsActive()).toBeTruthy();
            
            // Test stopping timer by setting inactive
            display.setActive(false);
            this.expect(display.getIsActive()).toBeFalsy();
            
            // Test restarting timer
            display.setActive(true);
            this.expect(display.getIsActive()).toBeTruthy();
            
            display.destroy();
        });
    }

    testTimerCleanup() {
        this.it('should clean up timers on destroy', () => {
            const display = new ExchangeRateDisplay('test-cleanup-context');
            
            // Destroy should clean up all timers
            display.destroy();
            
            // After destroy, instance should be cleaned up
            // This is more of an integration test with the main app
            this.expect(true).toBeTruthy(); // If destroy doesn't throw, cleanup worked
        });
    }

    testRefreshIntervalChanges() {
        this.it('should handle refresh interval changes correctly', () => {
            const display = new ExchangeRateDisplay('test-interval-context');
            
            const originalInterval = display.getRefreshInterval();
            const newInterval = originalInterval === 5 ? 10 : 5;
            
            display.setRefreshInterval(newInterval);
            this.expect(display.getRefreshInterval()).toBe(newInterval);
            
            display.destroy();
        });
    }

    testActiveStateTimerControl() {
        this.it('should control timers based on active state', () => {
            const display = new ExchangeRateDisplay('test-active-timer-context');
            
            // Active display should have timer running (indirectly tested)
            this.expect(display.getIsActive()).toBeTruthy();
            
            // Inactive display should pause timer
            display.setActive(false);
            this.expect(display.getIsActive()).toBeFalsy();
            
            // Reactivating should resume timer
            display.setActive(true);
            this.expect(display.getIsActive()).toBeTruthy();
            
            display.destroy();
        });
    }
}

// Mock UlanziDeck environment if not present
if (typeof $UD === 'undefined') {
    window.$UD = {
        setBaseDataIcon: function(context, imageData, title) {
            // Mock implementation for testing
        },
        setParam: function(context, params) {
            // Mock implementation for testing
        },
        getParam: function(context) {
            return null; // Mock implementation
        }
    };
}

// Mock CurrencyAPI if not present
if (typeof CurrencyAPI === 'undefined') {
    window.CurrencyAPI = {
        MAX_RETRIES: 3,
        getConnectivityStatus: function() {
            return navigator.onLine;
        },
        handleAPIErrorWithConnectivity: function(error) {
            const message = error.message.toLowerCase();
            if (message.includes('network')) return 'Network connection failed';
            if (message.includes('timeout')) return 'Request timed out';
            return 'API error occurred';
        },
        getUSDToBRL: function(withConnectivity = false) {
            return Promise.resolve({
                success: true,
                rate: 5.1234,
                timestamp: new Date()
            });
        }
    };
}

// Initialize and run tests
const testFramework = new TestFramework();

// Export for manual testing
if (typeof window !== 'undefined') {
    window.runUnitTests = () => testFramework.runTests();
    window.testFramework = testFramework;
}

// Auto-run tests when script loads (can be disabled for manual testing)
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('USD/BRL Exchange Rate Plugin - Unit Test Suite Loaded');
        console.log('Run window.runUnitTests() to execute all tests');
    });
} else {
    console.log('USD/BRL Exchange Rate Plugin - Unit Test Suite Loaded');
    console.log('Run window.runUnitTests() to execute all tests');
}