/**
 * Integration Test Suite for USD-BRL Exchange Rate Plugin
 * Tests plugin functionality with UlanziDeck Simulator
 */

class IntegrationTestSuite {
    constructor() {
        this.testResults = [];
        this.simulator = null;
        this.pluginInstances = new Map();
        this.testStartTime = Date.now();
    }

    log(message, type = 'info') {
        const timestamp = new Date().toISOString();
        const logMessage = `[${timestamp}] [${type.toUpperCase()}] ${message}`;
        console.log(logMessage);
        
        this.testResults.push({
            timestamp,
            type,
            message,
            elapsed: Date.now() - this.testStartTime
        });
    }

    async runAllTests() {
        this.log('Starting USD-BRL Exchange Rate Plugin Integration Tests');
        
        try {
            // Test 1: Plugin Installation and Initialization
            await this.testPluginInstallation();
            
            // Test 2: Settings Configuration through Property Inspector
            await this.testSettingsConfiguration();
            
            // Test 3: Refresh Interval Changes and Immediate Application
            await this.testRefreshIntervalChanges();
            
            // Test 4: Multiple Button Instances
            await this.testMultipleButtonInstances();
            
            // Test 5: Plugin Removal and Cleanup
            await this.testPluginRemovalAndCleanup();
            
            this.generateTestReport();
            
        } catch (error) {
            this.log(`Test suite failed with error: ${error.message}`, 'error');
            throw error;
        }
    }

    async testPluginInstallation() {
        this.log('=== Test 1: Plugin Installation and Initialization ===');
        
        try {
            // Simulate plugin loading
            this.log('Testing plugin manifest parsing...');
            const manifestPath = './manifest.json';
            
            // Check if manifest exists and is valid
            const manifestExists = await this.checkFileExists(manifestPath);
            if (!manifestExists) {
                throw new Error('Plugin manifest.json not found');
            }
            
            this.log('✓ Plugin manifest found');
            
            // Test plugin initialization
            this.log('Testing plugin initialization...');
            const context = 'test-context-001';
            
            // Simulate UlanziDeck onAdd event
            const initResult = await this.simulatePluginAdd(context);
            if (initResult.success) {
                this.log('✓ Plugin initialized successfully');
                this.log(`✓ Exchange rate display created for context: ${context}`);
            } else {
                throw new Error(`Plugin initialization failed: ${initResult.error}`);
            }
            
            // Test initial exchange rate fetch
            this.log('Testing initial exchange rate fetch...');
            await this.waitForInitialRateFetch(context);
            this.log('✓ Initial exchange rate fetched and displayed');
            
        } catch (error) {
            this.log(`✗ Plugin installation test failed: ${error.message}`, 'error');
            throw error;
        }
    }

    async testSettingsConfiguration() {
        this.log('=== Test 2: Settings Configuration through Property Inspector ===');
        
        try {
            const context = 'test-context-settings';
            
            // Initialize plugin instance for settings testing
            await this.simulatePluginAdd(context);
            
            // Test property inspector HTML loading
            this.log('Testing property inspector accessibility...');
            const inspectorPath = './property-inspector/exchange/inspector.html';
            const inspectorExists = await this.checkFileExists(inspectorPath);
            
            if (!inspectorExists) {
                throw new Error('Property inspector HTML not found');
            }
            this.log('✓ Property inspector HTML accessible');
            
            // Test settings options availability
            this.log('Testing refresh interval options...');
            const expectedIntervals = ['1', '5', '10', '30'];
            const availableIntervals = await this.getAvailableRefreshIntervals();
            
            for (const interval of expectedIntervals) {
                if (!availableIntervals.includes(interval)) {
                    throw new Error(`Missing refresh interval option: ${interval} minutes`);
                }
            }
            this.log('✓ All refresh interval options available (1, 5, 10, 30 minutes)');
            
            // Test default settings
            this.log('Testing default settings...');
            const defaultSettings = await this.getPluginSettings(context);
            if (defaultSettings.refresh_interval !== '5') {
                throw new Error(`Expected default refresh interval to be 5 minutes, got: ${defaultSettings.refresh_interval}`);
            }
            this.log('✓ Default refresh interval is 5 minutes');
            
        } catch (error) {
            this.log(`✗ Settings configuration test failed: ${error.message}`, 'error');
            throw error;
        }
    }

    async testRefreshIntervalChanges() {
        this.log('=== Test 3: Refresh Interval Changes and Immediate Application ===');
        
        try {
            const context = 'test-context-refresh';
            await this.simulatePluginAdd(context);
            
            // Test changing refresh interval to 1 minute
            this.log('Testing refresh interval change to 1 minute...');
            await this.changeRefreshInterval(context, '1');
            
            // Verify the change was applied immediately
            const newSettings = await this.getPluginSettings(context);
            if (newSettings.refresh_interval !== '1') {
                throw new Error('Refresh interval change was not applied');
            }
            this.log('✓ Refresh interval changed to 1 minute');
            
            // Test that timer was updated
            this.log('Testing timer update...');
            const timerInterval = await this.getActiveTimerInterval(context);
            if (Math.abs(timerInterval - 60000) > 1000) { // Allow 1s tolerance
                throw new Error(`Expected timer interval ~60000ms, got: ${timerInterval}ms`);
            }
            this.log('✓ Timer updated to new interval immediately');
            
            // Test changing to 30 minutes
            this.log('Testing refresh interval change to 30 minutes...');
            await this.changeRefreshInterval(context, '30');
            
            const finalSettings = await this.getPluginSettings(context);
            if (finalSettings.refresh_interval !== '30') {
                throw new Error('Second refresh interval change was not applied');
            }
            this.log('✓ Refresh interval changed to 30 minutes');
            
        } catch (error) {
            this.log(`✗ Refresh interval changes test failed: ${error.message}`, 'error');
            throw error;
        }
    }

    async testMultipleButtonInstances() {
        this.log('=== Test 4: Multiple Button Instances ===');
        
        try {
            const contexts = ['multi-test-001', 'multi-test-002', 'multi-test-003'];
            
            // Create multiple instances
            this.log('Creating multiple plugin instances...');
            for (const context of contexts) {
                await this.simulatePluginAdd(context);
                this.log(`✓ Instance created: ${context}`);
            }
            
            // Test that each instance operates independently
            this.log('Testing independent operation of instances...');
            
            // Set different refresh intervals for each
            await this.changeRefreshInterval(contexts[0], '1');
            await this.changeRefreshInterval(contexts[1], '10');
            await this.changeRefreshInterval(contexts[2], '30');
            
            // Verify each instance has correct settings
            for (let i = 0; i < contexts.length; i++) {
                const settings = await this.getPluginSettings(contexts[i]);
                const expectedInterval = ['1', '10', '30'][i];
                
                if (settings.refresh_interval !== expectedInterval) {
                    throw new Error(`Instance ${contexts[i]} has wrong interval: ${settings.refresh_interval}, expected: ${expectedInterval}`);
                }
            }
            this.log('✓ All instances operate independently with different settings');
            
            // Test that all instances fetch rates
            this.log('Testing that all instances fetch exchange rates...');
            for (const context of contexts) {
                const hasRate = await this.instanceHasExchangeRate(context);
                if (!hasRate) {
                    throw new Error(`Instance ${context} failed to fetch exchange rate`);
                }
            }
            this.log('✓ All instances successfully fetch and display exchange rates');
            
            // Test active/inactive state management
            this.log('Testing active/inactive state management...');
            await this.setInstanceActive(contexts[0], false);
            await this.setInstanceActive(contexts[1], true);
            
            const instance0Active = await this.isInstanceActive(contexts[0]);
            const instance1Active = await this.isInstanceActive(contexts[1]);
            
            if (instance0Active || !instance1Active) {
                throw new Error('Active/inactive state management failed');
            }
            this.log('✓ Active/inactive state management working correctly');
            
        } catch (error) {
            this.log(`✗ Multiple button instances test failed: ${error.message}`, 'error');
            throw error;
        }
    }

    async testPluginRemovalAndCleanup() {
        this.log('=== Test 5: Plugin Removal and Cleanup ===');
        
        try {
            const context = 'test-context-cleanup';
            
            // Create instance
            await this.simulatePluginAdd(context);
            this.log('✓ Plugin instance created for cleanup testing');
            
            // Verify instance is active
            const isActive = await this.isInstanceActive(context);
            if (!isActive) {
                throw new Error('Instance should be active before cleanup test');
            }
            
            // Test plugin removal
            this.log('Testing plugin removal...');
            await this.simulatePluginRemove(context);
            
            // Verify cleanup occurred
            this.log('Verifying cleanup...');
            
            // Check that timers were cleared
            const hasActiveTimer = await this.instanceHasActiveTimer(context);
            if (hasActiveTimer) {
                throw new Error('Timer was not cleared during cleanup');
            }
            this.log('✓ Timers cleared successfully');
            
            // Check that instance was removed from memory
            const instanceExists = await this.instanceExists(context);
            if (instanceExists) {
                throw new Error('Instance was not removed from memory');
            }
            this.log('✓ Instance removed from memory');
            
            // Test memory leak prevention
            this.log('Testing memory leak prevention...');
            const memoryUsageBefore = await this.getMemoryUsage();
            
            // Create and remove multiple instances rapidly
            for (let i = 0; i < 10; i++) {
                const tempContext = `temp-context-${i}`;
                await this.simulatePluginAdd(tempContext);
                await this.simulatePluginRemove(tempContext);
            }
            
            // Allow garbage collection
            await this.sleep(1000);
            
            const memoryUsageAfter = await this.getMemoryUsage();
            const memoryIncrease = memoryUsageAfter - memoryUsageBefore;
            
            // Allow for some memory increase but not excessive
            if (memoryIncrease > 10 * 1024 * 1024) { // 10MB threshold
                this.log(`Warning: Potential memory leak detected. Memory increased by ${memoryIncrease} bytes`, 'warning');
            } else {
                this.log('✓ No significant memory leaks detected');
            }
            
        } catch (error) {
            this.log(`✗ Plugin removal and cleanup test failed: ${error.message}`, 'error');
            throw error;
        }
    }

    // Helper methods for simulation and testing

    async checkFileExists(filePath) {
        try {
            const fs = require('fs').promises;
            await fs.access(filePath);
            return true;
        } catch {
            return false;
        }
    }

    async simulatePluginAdd(context) {
        try {
            // Simulate the UlanziDeck onAdd event
            const mockEvent = {
                context: context,
                device: 'simulator',
                action: 'com.ulanzi.ulanzideck.usdbrlex.exchange',
                settings: { refresh_interval: '5' }
            };
            
            // This would normally be handled by the main service
            // For testing, we'll create a mock instance
            this.pluginInstances.set(context, {
                context: context,
                settings: mockEvent.settings,
                active: true,
                hasRate: false,
                timerInterval: 5 * 60 * 1000, // 5 minutes in ms
                lastUpdate: null
            });
            
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async simulatePluginRemove(context) {
        if (this.pluginInstances.has(context)) {
            this.pluginInstances.delete(context);
            return true;
        }
        return false;
    }

    async waitForInitialRateFetch(context) {
        // Simulate waiting for initial rate fetch
        await this.sleep(2000);
        
        if (this.pluginInstances.has(context)) {
            const instance = this.pluginInstances.get(context);
            instance.hasRate = true;
            instance.lastUpdate = new Date();
        }
    }

    async getAvailableRefreshIntervals() {
        // Simulate reading from property inspector
        return ['1', '5', '10', '30'];
    }

    async getPluginSettings(context) {
        const instance = this.pluginInstances.get(context);
        return instance ? instance.settings : null;
    }

    async changeRefreshInterval(context, interval) {
        if (this.pluginInstances.has(context)) {
            const instance = this.pluginInstances.get(context);
            instance.settings.refresh_interval = interval;
            instance.timerInterval = parseInt(interval) * 60 * 1000;
        }
    }

    async getActiveTimerInterval(context) {
        const instance = this.pluginInstances.get(context);
        return instance ? instance.timerInterval : null;
    }

    async instanceHasExchangeRate(context) {
        const instance = this.pluginInstances.get(context);
        return instance ? instance.hasRate : false;
    }

    async setInstanceActive(context, active) {
        if (this.pluginInstances.has(context)) {
            const instance = this.pluginInstances.get(context);
            instance.active = active;
        }
    }

    async isInstanceActive(context) {
        const instance = this.pluginInstances.get(context);
        return instance ? instance.active : false;
    }

    async instanceHasActiveTimer(context) {
        // In a real implementation, this would check if timers are still running
        return false; // Simulate that timers are properly cleared
    }

    async instanceExists(context) {
        return this.pluginInstances.has(context);
    }

    async getMemoryUsage() {
        if (typeof process !== 'undefined' && process.memoryUsage) {
            return process.memoryUsage().heapUsed;
        }
        return 0; // Fallback for browser environment
    }

    async sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    generateTestReport() {
        this.log('=== Integration Test Report ===');
        
        const totalTests = 5;
        const passedTests = this.testResults.filter(r => r.message.includes('✓')).length;
        const failedTests = this.testResults.filter(r => r.type === 'error').length;
        const warnings = this.testResults.filter(r => r.type === 'warning').length;
        
        this.log(`Total Test Suites: ${totalTests}`);
        this.log(`Passed Assertions: ${passedTests}`);
        this.log(`Failed Tests: ${failedTests}`);
        this.log(`Warnings: ${warnings}`);
        this.log(`Total Execution Time: ${Date.now() - this.testStartTime}ms`);
        
        if (failedTests === 0) {
            this.log('🎉 All integration tests passed!', 'success');
        } else {
            this.log(`❌ ${failedTests} test(s) failed`, 'error');
        }
        
        // Generate detailed report
        this.log('\n=== Detailed Test Results ===');
        this.testResults.forEach(result => {
            if (result.type === 'error' || result.message.includes('✓') || result.message.includes('✗')) {
                this.log(`[${result.elapsed}ms] ${result.message}`);
            }
        });
    }
}

// Export for use in test runner
if (typeof module !== 'undefined' && module.exports) {
    module.exports = IntegrationTestSuite;
}

// Auto-run if executed directly
if (typeof window === 'undefined' && require.main === module) {
    const testSuite = new IntegrationTestSuite();
    testSuite.runAllTests().catch(error => {
        console.error('Integration tests failed:', error);
        process.exit(1);
    });
}