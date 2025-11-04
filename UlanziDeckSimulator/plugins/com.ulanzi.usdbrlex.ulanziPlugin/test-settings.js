/**
 * Test script for settings persistence and application
 * This script can be run in the browser console to test settings functionality
 */

// Mock UlanziDeck API for testing
if (typeof $UD === 'undefined') {
    window.$UD = {
        setParam: function(context, params) {
            console.log('Mock $UD.setParam called:', context, params);
            // Store in localStorage for persistence testing
            localStorage.setItem(`usd-brl-settings-${context}`, JSON.stringify(params));
        },
        
        getParam: function(context) {
            const stored = localStorage.getItem(`usd-brl-settings-${context}`);
            return stored ? JSON.parse(stored) : null;
        }
    };
}

// Test settings validation
function testSettingsValidation() {
    console.log('=== Testing Settings Validation ===');
    
    // Test valid settings
    const validSettings = validateAndNormalizeSettings({
        refresh_interval: '10'
    });
    console.log('Valid settings test:', validSettings);
    console.assert(validSettings.refresh_interval === '10', 'Valid interval should be preserved');
    
    // Test invalid settings
    const invalidSettings = validateAndNormalizeSettings({
        refresh_interval: '15' // Invalid value
    });
    console.log('Invalid settings test:', invalidSettings);
    console.assert(invalidSettings.refresh_interval === '5', 'Invalid interval should default to 5');
    
    // Test missing settings
    const missingSettings = validateAndNormalizeSettings({});
    console.log('Missing settings test:', missingSettings);
    console.assert(missingSettings.refresh_interval === '5', 'Missing interval should default to 5');
    
    console.log('Settings validation tests completed');
}

// Test settings persistence
function testSettingsPersistence() {
    console.log('=== Testing Settings Persistence ===');
    
    const testContext = 'test-context-123';
    const testSettings = {
        refresh_interval: '10'
    };
    
    // Simulate settings change
    const mockJsn = {
        context: testContext,
        param: testSettings
    };
    
    // Test onSetSettings without instance (should store for later)
    onSetSettings(mockJsn);
    
    // Check if settings were stored
    const storedSettings = $UD.getParam(testContext);
    console.log('Stored settings:', storedSettings);
    console.assert(storedSettings && storedSettings.refresh_interval === '10', 'Settings should be persisted');
    
    console.log('Settings persistence tests completed');
}

// Test settings application to instance
function testSettingsApplication() {
    console.log('=== Testing Settings Application ===');
    
    const testContext = 'test-context-456';
    
    // Create a mock instance
    const mockInstance = {
        refreshInterval: 5,
        setRefreshInterval: function(minutes) {
            this.refreshInterval = minutes;
            console.log('Mock instance refresh interval set to:', minutes);
        },
        getRefreshInterval: function() {
            return this.refreshInterval;
        },
        getIsActive: function() { return true; },
        getCurrentRate: function() { return null; },
        getLastUpdate: function() { return null; },
        triggerRefresh: function() {
            console.log('Mock instance refresh triggered');
        }
    };
    
    // Add to cache
    ACTION_CACHES[testContext] = mockInstance;
    
    // Test settings application
    const testSettings = {
        refresh_interval: '30'
    };
    
    applySettingsToInstance(mockInstance, testSettings, testContext);
    
    console.assert(mockInstance.getRefreshInterval() === 30, 'Settings should be applied to instance');
    
    // Clean up
    delete ACTION_CACHES[testContext];
    
    console.log('Settings application tests completed');
}

// Run all tests
function runAllTests() {
    console.log('Starting USD/BRL Exchange Rate Settings Tests...');
    
    try {
        testSettingsValidation();
        testSettingsPersistence();
        testSettingsApplication();
        
        console.log('✅ All settings tests passed!');
    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

// Export test functions for manual testing
if (typeof window !== 'undefined') {
    window.testUSDRBLSettings = {
        runAllTests,
        testSettingsValidation,
        testSettingsPersistence,
        testSettingsApplication
    };
}

console.log('Settings test script loaded. Run testUSDRBLSettings.runAllTests() to test.');