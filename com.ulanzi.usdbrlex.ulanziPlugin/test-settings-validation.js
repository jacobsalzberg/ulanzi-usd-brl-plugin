/**
 * Focused Unit Tests for Settings Validation and Application
 * Tests Requirements: 3.1, 3.2, 3.3
 */

/**
 * Test suite for settings validation and application functionality
 */
class SettingsValidationTestSuite {
    constructor() {
        this.testResults = {
            passed: 0,
            failed: 0,
            total: 0
        };
        this.originalSetParam = null;
        this.originalGetParam = null;
        this.mockStorage = new Map();
    }

    async runAllTests() {
        console.log('=== Settings Validation Test Suite ===\n');
        
        this.setupMocks();
        
        await this.testBasicValidation();
        await this.testDefaultValues();
        await this.testInvalidInputHandling();
        await this.testEdgeCases();
        await this.testSettingsPersistence();
        await this.testSettingsApplication();
        await this.testSettingsRetrieval();
        await this.testMultipleContexts();
        await this.testSettingsNormalization();
        await this.testValidationRules();
        
        this.restoreMocks();
        this.printSummary();
        return this.testResults.failed === 0;
    }

    setupMocks() {
        // Mock UlanziDeck parameter storage
        if (typeof $UD !== 'undefined') {
            this.originalSetParam = $UD.setParam;
            this.originalGetParam = $UD.getParam;
            
            const self = this;
            $UD.setParam = function(context, params) {
                self.mockStorage.set(context, JSON.parse(JSON.stringify(params)));
            };
            
            $UD.getParam = function(context) {
                return self.mockStorage.get(context) || null;
            };
        }
    }

    restoreMocks() {
        if (this.originalSetParam && this.originalGetParam) {
            $UD.setParam = this.originalSetParam;
            $UD.getParam = this.originalGetParam;
        }
    }

    async testBasicValidation() {
        this.test('Basic Settings Validation', () => {
            // Test valid refresh intervals
            const validIntervals = ['1', '5', '10', '30'];
            
            validIntervals.forEach(interval => {
                const settings = validateAndNormalizeSettings({ refresh_interval: interval });
                this.assert(settings.refresh_interval === interval, 
                           `Valid interval ${interval} should be preserved`);
            });
        });
    }

    async testDefaultValues() {
        this.test('Default Value Application', () => {
            // Test empty settings object
            const emptySettings = validateAndNormalizeSettings({});
            this.assert(emptySettings.refresh_interval === '5', 
                       'Empty settings should default to 5 minutes');
            
            // Test null input
            const nullSettings = validateAndNormalizeSettings(null);
            this.assert(nullSettings.refresh_interval === '5', 
                       'Null settings should default to 5 minutes');
            
            // Test undefined input
            const undefinedSettings = validateAndNormalizeSettings(undefined);
            this.assert(undefinedSettings.refresh_interval === '5', 
                       'Undefined settings should default to 5 minutes');
        });
    }

    async testInvalidInputHandling() {
        this.test('Invalid Input Handling', () => {
            // Test invalid refresh intervals
            const invalidIntervals = ['0', '2', '15', '45', '60', 'abc', '', null, undefined];
            
            invalidIntervals.forEach(interval => {
                const settings = validateAndNormalizeSettings({ refresh_interval: interval });
                this.assert(settings.refresh_interval === '5', 
                           `Invalid interval ${interval} should default to 5 minutes`);
            });
        });
    }

    async testEdgeCases() {
        this.test('Edge Case Handling', () => {
            // Test numeric values (should be converted to strings)
            const numericSettings = validateAndNormalizeSettings({ refresh_interval: 10 });
            this.assert(numericSettings.refresh_interval === '10', 
                       'Numeric interval should be converted to string');
            
            // Test boolean values
            const booleanSettings = validateAndNormalizeSettings({ refresh_interval: true });
            this.assert(booleanSettings.refresh_interval === '5', 
                       'Boolean interval should default to 5 minutes');
            
            // Test object values
            const objectSettings = validateAndNormalizeSettings({ refresh_interval: {} });
            this.assert(objectSettings.refresh_interval === '5', 
                       'Object interval should default to 5 minutes');
            
            // Test array values
            const arraySettings = validateAndNormalizeSettings({ refresh_interval: ['5'] });
            this.assert(arraySettings.refresh_interval === '5', 
                       'Array interval should default to 5 minutes');
        });
    }

    async testSettingsPersistence() {
        this.test('Settings Persistence', () => {
            const testContext = 'test-persistence-context';
            const testSettings = { refresh_interval: '10' };
            
            // Apply settings
            const mockJsn = { context: testContext, param: testSettings };
            onSetSettings(mockJsn);
            
            // Verify persistence
            const storedSettings = $UD.getParam(testContext);
            this.assert(storedSettings !== null, 'Settings should be stored');
            this.assert(storedSettings.refresh_interval === '10', 
                       'Stored settings should match applied settings');
        });
    }

    async testSettingsApplication() {
        this.test('Settings Application to Instance', () => {
            // Create mock instance
            const mockInstance = {
                refreshInterval: 5,
                setRefreshInterval: function(minutes) { 
                    this.refreshInterval = minutes; 
                    this.lastIntervalChange = Date.now();
                },
                getRefreshInterval: function() { return this.refreshInterval; },
                getIsActive: function() { return true; },
                getCurrentRate: function() { return null; },
                getLastUpdate: function() { return null; },
                triggerRefresh: function() { 
                    this.refreshTriggered = true; 
                    this.lastRefreshTrigger = Date.now();
                }
            };
            
            const testContext = 'test-application-context';
            const testSettings = { refresh_interval: '30' };
            
            // Apply settings to instance
            applySettingsToInstance(mockInstance, testSettings, testContext);
            
            // Verify application
            this.assert(mockInstance.getRefreshInterval() === 30, 
                       'Settings should be applied to instance');
            this.assert(mockInstance.lastIntervalChange !== undefined, 
                       'Interval change should be recorded');
        });
    }

    async testSettingsRetrieval() {
        this.test('Settings Retrieval', () => {
            const testContext = 'test-retrieval-context';
            
            // Create mock instance with known state
            const mockInstance = {
                refreshInterval: 15,
                isActive: true,
                currentRate: 5.1234,
                lastUpdate: new Date(),
                errorState: false,
                getRefreshInterval: function() { return this.refreshInterval; },
                getIsActive: function() { return this.isActive; },
                getCurrentRate: function() { return this.currentRate; },
                getLastUpdate: function() { return this.lastUpdate; },
                getErrorState: function() { return this.errorState; }
            };
            
            // Add to cache
            ACTION_CACHES[testContext] = mockInstance;
            
            // Retrieve current settings
            const currentSettings = getCurrentSettings(testContext);
            
            this.assert(currentSettings !== null, 'Should retrieve settings for existing instance');
            this.assert(currentSettings.refresh_interval === '15', 
                       'Should return correct refresh interval as string');
            this.assert(currentSettings.isActive === true, 'Should return correct active state');
            this.assert(currentSettings.currentRate === 5.1234, 'Should return correct rate');
            
            // Clean up
            delete ACTION_CACHES[testContext];
        });
    }

    async testMultipleContexts() {
        this.test('Multiple Context Settings Management', () => {
            const contexts = ['context-1', 'context-2', 'context-3'];
            const intervals = ['1', '10', '30'];
            
            // Apply different settings to different contexts
            contexts.forEach((context, index) => {
                const settings = { refresh_interval: intervals[index] };
                const mockJsn = { context: context, param: settings };
                onSetSettings(mockJsn);
            });
            
            // Verify each context has correct settings
            contexts.forEach((context, index) => {
                const storedSettings = $UD.getParam(context);
                this.assert(storedSettings.refresh_interval === intervals[index], 
                           `Context ${context} should have interval ${intervals[index]}`);
            });
        });
    }

    async testSettingsNormalization() {
        this.test('Settings Normalization Process', () => {
            // Test various input formats that should be normalized
            const testCases = [
                { input: { refresh_interval: '5' }, expected: '5' },
                { input: { refresh_interval: 5 }, expected: '5' },
                { input: { refresh_interval: '10' }, expected: '10' },
                { input: { refresh_interval: 10 }, expected: '10' },
                { input: { refresh_interval: '30' }, expected: '30' },
                { input: { refresh_interval: 30 }, expected: '30' },
                { input: { refresh_interval: '1' }, expected: '1' },
                { input: { refresh_interval: 1 }, expected: '1' }
            ];
            
            testCases.forEach(testCase => {
                const normalized = validateAndNormalizeSettings(testCase.input);
                this.assert(normalized.refresh_interval === testCase.expected, 
                           `Input ${JSON.stringify(testCase.input)} should normalize to ${testCase.expected}`);
            });
        });
    }

    async testValidationRules() {
        this.test('Validation Rules Enforcement', () => {
            // Test that only valid intervals are accepted
            const validIntervals = ['1', '5', '10', '30'];
            const invalidIntervals = ['2', '3', '4', '6', '7', '8', '9', '11', '15', '20', '25', '45', '60'];
            
            // Valid intervals should pass
            validIntervals.forEach(interval => {
                const settings = validateAndNormalizeSettings({ refresh_interval: interval });
                this.assert(validIntervals.includes(settings.refresh_interval), 
                           `Valid interval ${interval} should be accepted`);
            });
            
            // Invalid intervals should be rejected and default to '5'
            invalidIntervals.forEach(interval => {
                const settings = validateAndNormalizeSettings({ refresh_interval: interval });
                this.assert(settings.refresh_interval === '5', 
                           `Invalid interval ${interval} should be rejected and default to 5`);
            });
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

    printSummary() {
        console.log('\n=== Settings Validation Test Summary ===');
        console.log(`Total: ${this.testResults.total}`);
        console.log(`Passed: ${this.testResults.passed}`);
        console.log(`Failed: ${this.testResults.failed}`);
        console.log(`Success Rate: ${((this.testResults.passed / this.testResults.total) * 100).toFixed(1)}%`);
        
        // Additional storage statistics
        console.log(`Mock Storage Entries: ${this.mockStorage.size}`);
        if (this.mockStorage.size > 0) {
            console.log('Stored Contexts:', Array.from(this.mockStorage.keys()));
        }
    }
}

// Export for use in main test suite
if (typeof window !== 'undefined') {
    window.SettingsValidationTestSuite = SettingsValidationTestSuite;
}

// Auto-run if loaded directly
if (typeof validateAndNormalizeSettings !== 'undefined') {
    const testSuite = new SettingsValidationTestSuite();
    testSuite.runAllTests().then(success => {
        console.log(success ? 'All settings validation tests passed!' : 'Some settings validation tests failed!');
    });
} else {
    console.warn('Settings validation functions not loaded - tests cannot run');
}