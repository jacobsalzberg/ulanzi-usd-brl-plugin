// Integration Test Suite for USD/BRL Exchange Rate Plugin
class IntegrationTestSuite {
    constructor() {
        this.simulatorUrl = 'ws://127.0.0.1:39069';
        this.websocket = null;
        this.testResults = {};
        this.testContexts = new Set();
        this.initializeSimulatorConnection();
    }

    initializeSimulatorConnection() {
        try {
            // Check if simulator is running by attempting to connect
            fetch('http://127.0.0.1:39069')
                .then(response => {
                    if (response.ok) {
                        this.updateSimulatorStatus(true);
                        this.connectWebSocket();
                    } else {
                        this.updateSimulatorStatus(false);
                    }
                })
                .catch(() => {
                    this.updateSimulatorStatus(false);
                });
        } catch (error) {
            this.updateSimulatorStatus(false);
        }
    }

    connectWebSocket() {
        try {
            this.websocket = new WebSocket(this.simulatorUrl);
            
            this.websocket.onopen = () => {
                this.log('WebSocket connection established');
            };

            this.websocket.onmessage = (event) => {
                const message = JSON.parse(event.data);
                this.handleSimulatorMessage(message);
            };

            this.websocket.onerror = (error) => {
                this.log('WebSocket error: ' + error);
            };

            this.websocket.onclose = () => {
                this.log('WebSocket connection closed');
            };
        } catch (error) {
            this.log('Failed to connect WebSocket: ' + error);
        }
    }

    updateSimulatorStatus(connected) {
        const statusElement = document.getElementById('simulatorStatus');
        const statusText = document.getElementById('statusText');
        
        if (connected) {
            statusElement.className = 'simulator-status status-connected';
            statusText.textContent = 'Simulator Connected ✓';
        } else {
            statusElement.className = 'simulator-status status-disconnected';
            statusText.textContent = 'Simulator Not Connected ✗ - Please start the simulator first';
        }
    }

    handleSimulatorMessage(message) {
        this.log('Received message: ' + JSON.stringify(message));
        // Handle specific test-related messages here
    }

    log(message, testId = null) {
        const timestamp = new Date().toLocaleTimeString();
        const logMessage = `[${timestamp}] ${message}`;
        console.log(logMessage);
        
        if (testId) {
            const logElement = document.getElementById(`${testId}Log`);
            if (logElement) {
                logElement.style.display = 'block';
                logElement.innerHTML += logMessage + '\n';
                logElement.scrollTop = logElement.scrollHeight;
            }
        }
    }

    setTestResult(testId, passed, message) {
        const resultElement = document.getElementById(`${testId}Result`);
        if (resultElement) {
            resultElement.className = `test-result ${passed ? 'test-pass' : 'test-fail'}`;
            resultElement.textContent = message;
        }
        this.testResults[testId] = { passed, message };
    }

    // Test 1: Plugin Installation and Initialization
    async testPluginInstallation() {
        const testId = 'test1';
        this.log('Starting Plugin Installation Test', testId);
        
        try {
            // Check if plugin manifest exists and is valid
            const manifestResponse = await fetch('./manifest.json');
            if (!manifestResponse.ok) {
                throw new Error('Manifest file not found');
            }
            
            const manifest = await manifestResponse.json();
            this.log(`Plugin manifest loaded: ${manifest.Name} v${manifest.Version}`, testId);
            
            // Validate required manifest fields
            const requiredFields = ['UUID', 'Name', 'Actions', 'CodePath'];
            for (const field of requiredFields) {
                if (!manifest[field]) {
                    throw new Error(`Missing required manifest field: ${field}`);
                }
            }
            
            // Check if plugin files exist
            const requiredFiles = [
                'plugin/app.html',
                'plugin/app.js',
                'assets/icons/icon.png',
                'property-inspector/exchange/inspector.html'
            ];
            
            for (const file of requiredFiles) {
                try {
                    const response = await fetch(`./${file}`);
                    if (!response.ok) {
                        throw new Error(`Required file missing: ${file}`);
                    }
                    this.log(`✓ File exists: ${file}`, testId);
                } catch (error) {
                    throw new Error(`Required file missing or inaccessible: ${file}`);
                }
            }
            
            // Test plugin UUID format
            const uuidPattern = /^com\.ulanzi\./;
            if (!uuidPattern.test(manifest.UUID)) {
                throw new Error('Plugin UUID does not follow naming convention');
            }
            
            this.log('✓ Plugin structure validation passed', testId);
            this.setTestResult(testId, true, 'Plugin installation test passed - all required files and manifest structure valid');
            
        } catch (error) {
            this.log(`✗ Plugin installation test failed: ${error.message}`, testId);
            this.setTestResult(testId, false, `Plugin installation test failed: ${error.message}`);
        }
    }

    // Test 2: Settings Configuration Through Property Inspector
    async testPropertyInspector() {
        const testId = 'test2';
        this.log('Starting Property Inspector Test', testId);
        
        try {
            // Load property inspector HTML
            const inspectorResponse = await fetch('./property-inspector/exchange/inspector.html');
            if (!inspectorResponse.ok) {
                throw new Error('Property inspector HTML not found');
            }
            
            const inspectorHtml = await inspectorResponse.text();
            this.log('✓ Property inspector HTML loaded', testId);
            
            // Check for required form elements
            const parser = new DOMParser();
            const doc = parser.parseFromString(inspectorHtml, 'text/html');
            
            const refreshSelect = doc.querySelector('select[name="refresh_interval"]');
            if (!refreshSelect) {
                throw new Error('Refresh interval select element not found');
            }
            
            // Validate refresh interval options
            const expectedOptions = ['1', '5', '10', '30'];
            const actualOptions = Array.from(refreshSelect.options).map(opt => opt.value);
            
            for (const expected of expectedOptions) {
                if (!actualOptions.includes(expected)) {
                    throw new Error(`Missing refresh interval option: ${expected} minutes`);
                }
            }
            
            this.log('✓ All required refresh interval options found', testId);
            
            // Test default value (should be 5 minutes)
            const defaultOption = refreshSelect.querySelector('option[selected]');
            if (!defaultOption || defaultOption.value !== '5') {
                this.log('⚠ Default refresh interval should be 5 minutes', testId);
            } else {
                this.log('✓ Default refresh interval is correctly set to 5 minutes', testId);
            }
            
            // Load and test property inspector JavaScript
            try {
                const inspectorJsResponse = await fetch('./property-inspector/exchange/inspector.js');
                if (inspectorJsResponse.ok) {
                    this.log('✓ Property inspector JavaScript file exists', testId);
                } else {
                    throw new Error('Property inspector JavaScript not found');
                }
            } catch (error) {
                throw new Error('Property inspector JavaScript not accessible');
            }
            
            this.setTestResult(testId, true, 'Property inspector test passed - all required elements and options present');
            
        } catch (error) {
            this.log(`✗ Property inspector test failed: ${error.message}`, testId);
            this.setTestResult(testId, false, `Property inspector test failed: ${error.message}`);
        }
    }

    // Test 3: Refresh Interval Changes and Immediate Application
    async testRefreshIntervalChanges() {
        const testId = 'test3';
        this.log('Starting Refresh Interval Changes Test', testId);
        
        try {
            // This test requires manual verification in the simulator
            // We'll provide instructions and validate the mechanism exists
            
            this.log('Testing refresh interval change mechanism...', testId);
            
            // Check if the main app.js has the required event handlers
            const appJsResponse = await fetch('./plugin/app.js');
            if (!appJsResponse.ok) {
                throw new Error('Main app.js file not found');
            }
            
            const appJsContent = await appJsResponse.text();
            
            // Check for required event handlers
            const requiredHandlers = [
                'onParamFromApp',
                'onParamFromPlugin',
                'onSetSettings'
            ];
            
            for (const handler of requiredHandlers) {
                if (!appJsContent.includes(handler)) {
                    throw new Error(`Missing required event handler: ${handler}`);
                }
            }
            
            this.log('✓ All required event handlers found in app.js', testId);
            
            // Check if ExchangeRateDisplay has setRefreshInterval method
            const exchangeRateResponse = await fetch('./plugin/actions/ExchangeRateDisplay.js');
            if (!exchangeRateResponse.ok) {
                throw new Error('ExchangeRateDisplay.js file not found');
            }
            
            const exchangeRateContent = await exchangeRateResponse.text();
            
            if (!exchangeRateContent.includes('setRefreshInterval')) {
                throw new Error('setRefreshInterval method not found in ExchangeRateDisplay');
            }
            
            this.log('✓ setRefreshInterval method found in ExchangeRateDisplay', testId);
            
            // Manual test instructions
            this.log('Manual verification required:', testId);
            this.log('1. Add plugin to simulator deck', testId);
            this.log('2. Right-click and open property inspector', testId);
            this.log('3. Change refresh interval and verify immediate application', testId);
            this.log('4. Check that timer restarts with new interval', testId);
            
            this.setTestResult(testId, true, 'Refresh interval change mechanism validated - manual testing required in simulator');
            
        } catch (error) {
            this.log(`✗ Refresh interval test failed: ${error.message}`, testId);
            this.setTestResult(testId, false, `Refresh interval test failed: ${error.message}`);
        }
    }

    // Test 4: Multiple Button Instances
    async testMultipleInstances() {
        const testId = 'test4';
        this.log('Starting Multiple Instances Test', testId);
        
        try {
            // Check if the app.js properly handles multiple contexts
            const appJsResponse = await fetch('./plugin/app.js');
            const appJsContent = await appJsResponse.text();
            
            // Look for context management
            if (!appJsContent.includes('exchangeRateInstances') && !appJsContent.includes('instances')) {
                throw new Error('No instance management found in app.js');
            }
            
            this.log('✓ Instance management mechanism found', testId);
            
            // Check if ExchangeRateDisplay is properly isolated per instance
            const exchangeRateResponse = await fetch('./plugin/actions/ExchangeRateDisplay.js');
            const exchangeRateContent = await exchangeRateResponse.text();
            
            // Check for context-based isolation
            if (!exchangeRateContent.includes('this.context')) {
                throw new Error('Context isolation not implemented in ExchangeRateDisplay');
            }
            
            this.log('✓ Context isolation implemented', testId);
            
            // Check for proper cleanup methods
            if (!exchangeRateContent.includes('destroy') && !exchangeRateContent.includes('cleanup')) {
                throw new Error('No cleanup method found in ExchangeRateDisplay');
            }
            
            this.log('✓ Cleanup method found', testId);
            
            // Manual test instructions
            this.log('Manual verification steps:', testId);
            this.log('1. Add multiple instances of the plugin to different deck positions', testId);
            this.log('2. Configure different refresh intervals for each instance', testId);
            this.log('3. Verify each instance operates independently', testId);
            this.log('4. Check that settings changes only affect the specific instance', testId);
            
            this.setTestResult(testId, true, 'Multiple instances support validated - manual testing required in simulator');
            
        } catch (error) {
            this.log(`✗ Multiple instances test failed: ${error.message}`, testId);
            this.setTestResult(testId, false, `Multiple instances test failed: ${error.message}`);
        }
    }

    // Test 5: Plugin Removal and Cleanup
    async testPluginCleanup() {
        const testId = 'test5';
        this.log('Starting Plugin Cleanup Test', testId);
        
        try {
            // Check if app.js has onClear event handler
            const appJsResponse = await fetch('./plugin/app.js');
            const appJsContent = await appJsResponse.text();
            
            if (!appJsContent.includes('onClear')) {
                throw new Error('onClear event handler not found in app.js');
            }
            
            this.log('✓ onClear event handler found', testId);
            
            // Check if ExchangeRateDisplay has proper cleanup
            const exchangeRateResponse = await fetch('./plugin/actions/ExchangeRateDisplay.js');
            const exchangeRateContent = await exchangeRateResponse.text();
            
            // Check for timer cleanup
            if (!exchangeRateContent.includes('clearInterval') && !exchangeRateContent.includes('clearTimeout')) {
                throw new Error('Timer cleanup not implemented');
            }
            
            this.log('✓ Timer cleanup implemented', testId);
            
            // Check for destroy/cleanup method
            if (!exchangeRateContent.includes('destroy')) {
                throw new Error('Destroy method not found');
            }
            
            this.log('✓ Destroy method implemented', testId);
            
            // Check for proper instance removal in app.js
            if (!appJsContent.includes('delete') || !appJsContent.includes('instances')) {
                this.log('⚠ Instance removal mechanism should be verified', testId);
            } else {
                this.log('✓ Instance removal mechanism found', testId);
            }
            
            // Manual test instructions
            this.log('Manual verification steps:', testId);
            this.log('1. Add plugin instances to deck', testId);
            this.log('2. Verify they are running (fetching exchange rates)', testId);
            this.log('3. Remove instances from deck', testId);
            this.log('4. Check browser console for any errors or memory leaks', testId);
            this.log('5. Verify timers are properly cleared', testId);
            
            this.setTestResult(testId, true, 'Plugin cleanup mechanism validated - manual testing required in simulator');
            
        } catch (error) {
            this.log(`✗ Plugin cleanup test failed: ${error.message}`, testId);
            this.setTestResult(testId, false, `Plugin cleanup test failed: ${error.message}`);
        }
    }

    // Run all tests sequentially
    async runAllTests() {
        console.log('Running all integration tests...');
        
        await this.testPluginInstallation();
        await new Promise(resolve => setTimeout(resolve, 1000)); // Brief pause between tests
        
        await this.testPropertyInspector();
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        await this.testRefreshIntervalChanges();
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        await this.testMultipleInstances();
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        await this.testPluginCleanup();
        
        // Summary
        const results = Object.values(this.testResults);
        const passed = results.filter(r => r.passed).length;
        const total = results.length;
        
        console.log(`Integration tests completed: ${passed}/${total} tests passed`);
        
        if (passed === total) {
            alert(`All integration tests passed! (${passed}/${total})`);
        } else {
            alert(`Integration tests completed with issues: ${passed}/${total} tests passed`);
        }
    }

    // Reset all test results
    resetTests() {
        this.testResults = {};
        
        for (let i = 1; i <= 5; i++) {
            const resultElement = document.getElementById(`test${i}Result`);
            const logElement = document.getElementById(`test${i}Log`);
            
            if (resultElement) {
                resultElement.className = 'test-result test-pending';
                resultElement.textContent = 'Test not run';
            }
            
            if (logElement) {
                logElement.style.display = 'none';
                logElement.innerHTML = '';
            }
        }
        
        console.log('All test results reset');
    }
}

// Global test suite instance
let testSuite;

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    testSuite = new IntegrationTestSuite();
});

// Global functions for button clicks
function testPluginInstallation() {
    testSuite.testPluginInstallation();
}

function testPropertyInspector() {
    testSuite.testPropertyInspector();
}

function testRefreshIntervalChanges() {
    testSuite.testRefreshIntervalChanges();
}

function testMultipleInstances() {
    testSuite.testMultipleInstances();
}

function testPluginCleanup() {
    testSuite.testPluginCleanup();
}

function runAllTests() {
    testSuite.runAllTests();
}

function resetTests() {
    testSuite.resetTests();
}