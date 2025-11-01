/**
 * Test Execution Script for USD/BRL Exchange Rate Plugin
 * Can be run in browser console or Node.js environment
 */

// Configuration
const TEST_CONFIG = {
    runAllTests: true,
    runFocusedTests: true,
    verbose: true,
    exitOnFailure: false
};

/**
 * Main test runner function
 */
async function runAllPluginTests() {
    console.log('🚀 Starting USD/BRL Exchange Rate Plugin Test Suite');
    console.log('=' .repeat(60));
    
    const startTime = Date.now();
    let totalResults = {
        passed: 0,
        failed: 0,
        total: 0,
        suites: []
    };
    
    try {
        // Run main test suite
        if (typeof testFramework !== 'undefined') {
            console.log('\n📋 Running Main Test Suite...');
            const mainResults = await testFramework.runTests();
            totalResults.suites.push({
                name: 'Main Test Suite',
                results: testFramework.results,
                success: mainResults
            });
            
            totalResults.passed += testFramework.results.passed;
            totalResults.failed += testFramework.results.failed;
            totalResults.total += testFramework.results.total;
        }
        
        // Run focused API service tests
        if (typeof APIServiceTestSuite !== 'undefined') {
            console.log('\n🌐 Running API Service Tests...');
            const apiTestSuite = new APIServiceTestSuite();
            const apiResults = await apiTestSuite.runAllTests();
            totalResults.suites.push({
                name: 'API Service Tests',
                results: apiTestSuite.testResults,
                success: apiResults
            });
            
            totalResults.passed += apiTestSuite.testResults.passed;
            totalResults.failed += apiTestSuite.testResults.failed;
            totalResults.total += apiTestSuite.testResults.total;
        }
        
        // Run focused timer management tests
        if (typeof TimerManagementTestSuite !== 'undefined') {
            console.log('\n⏰ Running Timer Management Tests...');
            const timerTestSuite = new TimerManagementTestSuite();
            const timerResults = await timerTestSuite.runAllTests();
            totalResults.suites.push({
                name: 'Timer Management Tests',
                results: timerTestSuite.testResults,
                success: timerResults
            });
            
            totalResults.passed += timerTestSuite.testResults.passed;
            totalResults.failed += timerTestSuite.testResults.failed;
            totalResults.total += timerTestSuite.testResults.total;
        }
        
        // Run focused settings validation tests
        if (typeof SettingsValidationTestSuite !== 'undefined') {
            console.log('\n⚙️ Running Settings Validation Tests...');
            const settingsTestSuite = new SettingsValidationTestSuite();
            const settingsResults = await settingsTestSuite.runAllTests();
            totalResults.suites.push({
                name: 'Settings Validation Tests',
                results: settingsTestSuite.testResults,
                success: settingsResults
            });
            
            totalResults.passed += settingsTestSuite.testResults.passed;
            totalResults.failed += settingsTestSuite.testResults.failed;
            totalResults.total += settingsTestSuite.testResults.total;
        }
        
        // Print comprehensive summary
        printComprehensiveSummary(totalResults, startTime);
        
        return totalResults.failed === 0;
        
    } catch (error) {
        console.error('❌ Test execution failed:', error);
        return false;
    }
}

/**
 * Print comprehensive test summary
 */
function printComprehensiveSummary(results, startTime) {
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 COMPREHENSIVE TEST SUMMARY');
    console.log('='.repeat(60));
    
    // Overall statistics
    const successRate = results.total > 0 ? ((results.passed / results.total) * 100).toFixed(1) : 0;
    console.log(`⏱️  Duration: ${duration}s`);
    console.log(`📈 Overall Success Rate: ${successRate}%`);
    console.log(`✅ Total Passed: ${results.passed}`);
    console.log(`❌ Total Failed: ${results.failed}`);
    console.log(`📋 Total Tests: ${results.total}`);
    
    // Per-suite breakdown
    if (results.suites.length > 0) {
        console.log('\n📊 Test Suite Breakdown:');
        results.suites.forEach(suite => {
            const suiteSuccessRate = suite.results.total > 0 ? 
                ((suite.results.passed / suite.results.total) * 100).toFixed(1) : 0;
            const status = suite.success ? '✅' : '❌';
            
            console.log(`  ${status} ${suite.name}:`);
            console.log(`     Passed: ${suite.results.passed}/${suite.results.total} (${suiteSuccessRate}%)`);
            if (suite.results.failed > 0) {
                console.log(`     Failed: ${suite.results.failed}`);
            }
        });
    }
    
    // Final verdict
    console.log('\n' + '='.repeat(60));
    if (results.failed === 0) {
        console.log('🎉 ALL TESTS PASSED! Plugin is ready for deployment.');
    } else {
        console.log(`⚠️  ${results.failed} TEST(S) FAILED. Please review and fix issues.`);
    }
    console.log('='.repeat(60));
}

/**
 * Run specific test suite
 */
async function runSpecificTestSuite(suiteName) {
    console.log(`🎯 Running specific test suite: ${suiteName}`);
    
    switch (suiteName.toLowerCase()) {
        case 'api':
        case 'api-service':
            if (typeof APIServiceTestSuite !== 'undefined') {
                const suite = new APIServiceTestSuite();
                return await suite.runAllTests();
            }
            break;
            
        case 'timer':
        case 'timer-management':
            if (typeof TimerManagementTestSuite !== 'undefined') {
                const suite = new TimerManagementTestSuite();
                return await suite.runAllTests();
            }
            break;
            
        case 'settings':
        case 'settings-validation':
            if (typeof SettingsValidationTestSuite !== 'undefined') {
                const suite = new SettingsValidationTestSuite();
                return await suite.runAllTests();
            }
            break;
            
        case 'main':
        case 'core':
            if (typeof testFramework !== 'undefined') {
                return await testFramework.runTests();
            }
            break;
            
        default:
            console.error(`❌ Unknown test suite: ${suiteName}`);
            return false;
    }
    
    console.error(`❌ Test suite ${suiteName} not available`);
    return false;
}

/**
 * Check test environment and dependencies
 */
function checkTestEnvironment() {
    console.log('🔍 Checking test environment...');
    
    const checks = [
        { name: 'ExchangeRateDisplay', available: typeof ExchangeRateDisplay !== 'undefined' },
        { name: 'CurrencyAPI', available: typeof CurrencyAPI !== 'undefined' },
        { name: 'validateAndNormalizeSettings', available: typeof validateAndNormalizeSettings !== 'undefined' },
        { name: 'UlanziDeck API ($UD)', available: typeof $UD !== 'undefined' },
        { name: 'Main Test Framework', available: typeof testFramework !== 'undefined' },
        { name: 'API Service Tests', available: typeof APIServiceTestSuite !== 'undefined' },
        { name: 'Timer Management Tests', available: typeof TimerManagementTestSuite !== 'undefined' },
        { name: 'Settings Validation Tests', available: typeof SettingsValidationTestSuite !== 'undefined' }
    ];
    
    let allAvailable = true;
    checks.forEach(check => {
        const status = check.available ? '✅' : '❌';
        console.log(`  ${status} ${check.name}`);
        if (!check.available) allAvailable = false;
    });
    
    if (!allAvailable) {
        console.warn('⚠️  Some dependencies are missing. Tests may not run completely.');
    } else {
        console.log('✅ All dependencies available!');
    }
    
    return allAvailable;
}

// Export functions for use in different environments
if (typeof window !== 'undefined') {
    // Browser environment
    window.runAllPluginTests = runAllPluginTests;
    window.runSpecificTestSuite = runSpecificTestSuite;
    window.checkTestEnvironment = checkTestEnvironment;
    
    // Auto-check environment when loaded
    document.addEventListener('DOMContentLoaded', () => {
        console.log('🔧 USD/BRL Plugin Test Runner Loaded');
        checkTestEnvironment();
        console.log('💡 Run window.runAllPluginTests() to execute all tests');
        console.log('💡 Run window.runSpecificTestSuite("api") to run specific suite');
    });
} else if (typeof module !== 'undefined' && module.exports) {
    // Node.js environment
    module.exports = {
        runAllPluginTests,
        runSpecificTestSuite,
        checkTestEnvironment
    };
}

// Auto-run in browser if not in test runner page
if (typeof window !== 'undefined' && 
    !window.location.pathname.includes('test-runner.html') && 
    document.readyState === 'complete') {
    console.log('🚀 Auto-running tests...');
    setTimeout(() => runAllPluginTests(), 1000);
}