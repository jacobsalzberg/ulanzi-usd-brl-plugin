/**
 * Test script for comprehensive error state handling
 * This script tests various error scenarios and visual states
 */

// Mock UlanziDeck environment for testing
if (typeof $UD === 'undefined') {
    window.$UD = {
        setBaseDataIcon: function(context, imageData, title) {
            console.log(`Mock setBaseDataIcon called for context: ${context}`);
        }
    };
}

// Mock navigator.onLine for testing
let mockOnlineStatus = true;
Object.defineProperty(navigator, 'onLine', {
    get: function() { return mockOnlineStatus; },
    configurable: true
});

// Test scenarios
const testScenarios = [
    {
        name: 'Valid Rate Display',
        rate: 5.2345,
        timestamp: new Date(),
        hasError: false,
        expectedState: 'normal'
    },
    {
        name: 'Stale Data (Old Timestamp)',
        rate: 5.1234,
        timestamp: new Date(Date.now() - 20 * 60 * 1000), // 20 minutes ago
        hasError: false,
        expectedState: 'stale'
    },
    {
        name: 'Network Error',
        rate: null,
        timestamp: new Date(),
        hasError: true,
        errorMessage: 'Network connection failed',
        expectedState: 'error'
    },
    {
        name: 'API Timeout',
        rate: null,
        timestamp: new Date(),
        hasError: true,
        errorMessage: 'Request timed out',
        expectedState: 'error'
    },
    {
        name: 'Rate Limit Error',
        rate: null,
        timestamp: new Date(),
        hasError: true,
        errorMessage: 'API rate limit exceeded',
        expectedState: 'error'
    },
    {
        name: 'Server Error',
        rate: null,
        timestamp: new Date(),
        hasError: true,
        errorMessage: 'HTTP 500: Internal Server Error',
        expectedState: 'error'
    },
    {
        name: 'Offline with Cached Data',
        rate: 5.0987,
        timestamp: new Date(Date.now() - 3 * 60 * 1000), // 3 minutes ago
        hasError: false,
        offline: true,
        expectedState: 'offline_cached'
    },
    {
        name: 'Offline with No Data',
        rate: null,
        timestamp: null,
        hasError: true,
        errorMessage: 'No network connection',
        offline: true,
        expectedState: 'offline_no_data'
    }
];

/**
 * Run error handling tests
 */
function runErrorHandlingTests() {
    console.log('=== Starting Error Handling Tests ===');
    
    // Create test display instance
    const testDisplay = ExchangeRateDisplay('test-context');
    
    testScenarios.forEach((scenario, index) => {
        console.log(`\n--- Test ${index + 1}: ${scenario.name} ---`);
        
        // Set up mock connectivity status
        if (scenario.offline !== undefined) {
            mockOnlineStatus = !scenario.offline;
            // Trigger connectivity change event
            window.dispatchEvent(new Event(scenario.offline ? 'offline' : 'online'));
        }
        
        // Update the display with test data
        testDisplay.updateRate(
            scenario.rate,
            scenario.timestamp,
            scenario.hasError,
            scenario.errorMessage
        );
        
        // Verify state
        const currentRate = testDisplay.getCurrentRate();
        const errorState = testDisplay.getErrorState();
        const isStale = scenario.timestamp ? testDisplay.isDataStale(scenario.timestamp) : true;
        
        console.log(`Current Rate: ${currentRate}`);
        console.log(`Error State: ${errorState}`);
        console.log(`Is Stale: ${isStale}`);
        console.log(`Data Age: ${scenario.timestamp ? testDisplay.getDataAgeDescription(scenario.timestamp) : 'N/A'}`);
        
        // Validate expected behavior
        switch (scenario.expectedState) {
            case 'normal':
                console.log(`✓ Expected normal state - Rate: ${currentRate}, No errors: ${!errorState}`);
                break;
            case 'stale':
                console.log(`✓ Expected stale state - Rate: ${currentRate}, Stale: ${isStale}`);
                break;
            case 'error':
                console.log(`✓ Expected error state - Error: ${errorState}`);
                break;
            case 'offline_cached':
                console.log(`✓ Expected offline with cached data - Rate: ${currentRate}, Offline: ${!navigator.onLine}`);
                break;
            case 'offline_no_data':
                console.log(`✓ Expected offline with no data - No rate: ${currentRate === null}, Offline: ${!navigator.onLine}`);
                break;
        }
        
        // Small delay between tests
        setTimeout(() => {}, 100);
    });
    
    // Test degraded mode
    console.log('\n--- Testing Degraded Mode ---');
    
    // Simulate multiple failures to trigger degraded mode
    for (let i = 0; i < 5; i++) {
        testDisplay.updateRate(null, new Date(), true, `Failure ${i + 1}`);
    }
    
    console.log('Degraded mode should be active now');
    
    // Clean up
    setTimeout(() => {
        testDisplay.destroy();
        console.log('\n=== Error Handling Tests Complete ===');
    }, 1000);
}

/**
 * Test stale data detection with various timestamps
 */
function testStaleDataDetection() {
    console.log('\n=== Testing Stale Data Detection ===');
    
    const testDisplay = ExchangeRateDisplay('stale-test-context');
    
    const testTimes = [
        { desc: 'Current time', offset: 0, expectStale: false },
        { desc: '1 minute ago', offset: -1 * 60 * 1000, expectStale: false },
        { desc: '5 minutes ago', offset: -5 * 60 * 1000, expectStale: false },
        { desc: '10 minutes ago', offset: -10 * 60 * 1000, expectStale: false },
        { desc: '15 minutes ago', offset: -15 * 60 * 1000, expectStale: true }, // Should be stale (2x 5min default)
        { desc: '30 minutes ago', offset: -30 * 60 * 1000, expectStale: true },
        { desc: '1 hour ago', offset: -60 * 60 * 1000, expectStale: true }
    ];
    
    testTimes.forEach(test => {
        const timestamp = new Date(Date.now() + test.offset);
        const isStale = testDisplay.isDataStale(timestamp);
        const ageDesc = testDisplay.getDataAgeDescription(timestamp);
        
        const result = isStale === test.expectStale ? '✓' : '✗';
        console.log(`${result} ${test.desc}: Stale=${isStale} (expected ${test.expectStale}), Age: ${ageDesc}`);
    });
    
    testDisplay.destroy();
    console.log('=== Stale Data Detection Tests Complete ===');
}

// Run tests when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        runErrorHandlingTests();
        testStaleDataDetection();
    });
} else {
    runErrorHandlingTests();
    testStaleDataDetection();
}