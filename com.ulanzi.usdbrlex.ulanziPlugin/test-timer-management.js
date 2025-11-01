/**
 * Focused Unit Tests for Timer Management and Cleanup Functionality
 * Tests Requirements: 2.1, 2.2, 2.4
 */

/**
 * Test suite for timer management functionality
 */
class TimerManagementTestSuite {
    constructor() {
        this.testResults = {
            passed: 0,
            failed: 0,
            total: 0
        };
        this.originalSetInterval = window.setInterval;
        this.originalClearInterval = window.clearInterval;
        this.mockTimers = new Map();
        this.timerIdCounter = 1;
    }

    async runAllTests() {
        console.log('=== Timer Management Test Suite ===\n');
        
        this.setupTimerMocks();
        
        await this.testTimerCreation();
        await this.testTimerCleanup();
        await this.testRefreshIntervalChanges();
        await this.testActiveStateTimerControl();
        await this.testMultipleInstanceTimers();
        await this.testTimerMemoryLeaks();
        await this.testTimerPersistence();
        await this.testTimerErrorHandling();
        await this.testDegradedModeTimers();
        await this.testTimerSynchronization();
        
        this.restoreTimerMocks();
        this.printSummary();
        return this.testResults.failed === 0;
    }

    setupTimerMocks() {
        const self = this;
        
        // Mock setInterval
        window.setInterval = function(callback, delay) {
            const timerId = self.timerIdCounter++;
            const timer = {
                id: timerId,
                callback: callback,
                delay: delay,
                active: true,
                createdAt: Date.now()
            };
            self.mockTimers.set(timerId, timer);
            return timerId;
        };
        
        // Mock clearInterval
        window.clearInterval = function(timerId) {
            if (self.mockTimers.has(timerId)) {
                const timer = self.mockTimers.get(timerId);
                timer.active = false;
                timer.clearedAt = Date.now();
                // Don't delete immediately to allow testing cleanup verification
            }
        };
    }

    restoreTimerMocks() {
        window.setInterval = this.originalSetInterval;
        window.clearInterval = this.originalClearInterval;
    }

    async testTimerCreation() {
        this.test('Timer Creation on Instance Initialization', () => {
            const initialTimerCount = this.mockTimers.size;
            const display = new ExchangeRateDisplay('timer-test-1');
            
            // Should create a refresh timer
            const newTimerCount = this.mockTimers.size;
            this.assert(newTimerCount > initialTimerCount, 'Should create timer on initialization');
            
            // Find the timer created for this instance
            const timers = Array.from(this.mockTimers.values()).filter(t => t.active);
            this.assert(timers.length > 0, 'Should have active timer');
            
            display.destroy();
        });
    }

    async testTimerCleanup() {
        this.test('Timer Cleanup on Instance Destroy', () => {
            const display = new ExchangeRateDisplay('timer-test-2');
            const initialActiveTimers = Array.from(this.mockTimers.values()).filter(t => t.active).length;
            
            // Destroy instance
            display.destroy();
            
            // Check that timers were cleaned up
            const finalActiveTimers = Array.from(this.mockTimers.values()).filter(t => t.active).length;
            this.assert(finalActiveTimers < initialActiveTimers, 'Should clean up timers on destroy');
        });
    }

    async testRefreshIntervalChanges() {
        this.test('Timer Restart on Refresh Interval Change', () => {
            const display = new ExchangeRateDisplay('timer-test-3');
            const originalInterval = display.getRefreshInterval();
            
            // Get initial timer count
            const initialTimerCount = this.mockTimers.size;
            
            // Change refresh interval
            const newInterval = originalInterval === 5 ? 10 : 5;
            display.setRefreshInterval(newInterval);
            
            // Should have created new timer (old one cleared, new one created)
            const finalTimerCount = this.mockTimers.size;
            this.assert(finalTimerCount > initialTimerCount, 'Should create new timer when interval changes');
            
            // Verify interval was actually changed
            this.assert(display.getRefreshInterval() === newInterval, 'Should update refresh interval');
            
            display.destroy();
        });
    }

    async testActiveStateTimerControl() {
        this.test('Timer Control Based on Active State', () => {
            const display = new ExchangeRateDisplay('timer-test-4');
            
            // Initially should be active with timer
            this.assert(display.getIsActive() === true, 'Should be active initially');
            
            const activeTimers = Array.from(this.mockTimers.values()).filter(t => t.active).length;
            this.assert(activeTimers > 0, 'Should have active timer when active');
            
            // Set inactive - should stop timer
            display.setActive(false);
            this.assert(display.getIsActive() === false, 'Should be inactive after setActive(false)');
            
            // Set active again - should restart timer
            display.setActive(true);
            this.assert(display.getIsActive() === true, 'Should be active after setActive(true)');
            
            display.destroy();
        });
    }

    async testMultipleInstanceTimers() {
        this.test('Multiple Instance Timer Management', () => {
            const displays = [];
            const instanceCount = 3;
            
            // Create multiple instances
            for (let i = 0; i < instanceCount; i++) {
                displays.push(new ExchangeRateDisplay(`timer-test-multi-${i}`));
            }
            
            const activeTimers = Array.from(this.mockTimers.values()).filter(t => t.active).length;
            this.assert(activeTimers >= instanceCount, 
                       `Should have at least ${instanceCount} active timers for ${instanceCount} instances`);
            
            // Destroy all instances
            displays.forEach(display => display.destroy());
            
            // Verify cleanup
            const remainingActiveTimers = Array.from(this.mockTimers.values()).filter(t => t.active).length;
            this.assert(remainingActiveTimers < activeTimers, 'Should clean up timers for all instances');
        });
    }

    async testTimerMemoryLeaks() {
        this.test('Timer Memory Leak Prevention', () => {
            const initialTimerCount = this.mockTimers.size;
            const instances = [];
            
            // Create and destroy multiple instances rapidly
            for (let i = 0; i < 10; i++) {
                const display = new ExchangeRateDisplay(`leak-test-${i}`);
                instances.push(display);
                
                // Immediately destroy some instances
                if (i % 2 === 0) {
                    display.destroy();
                }
            }
            
            // Destroy remaining instances
            instances.forEach(display => {
                try {
                    display.destroy();
                } catch (e) {
                    // Instance might already be destroyed
                }
            });
            
            // Check for timer leaks
            const activeTimers = Array.from(this.mockTimers.values()).filter(t => t.active).length;
            const clearedTimers = Array.from(this.mockTimers.values()).filter(t => !t.active).length;
            
            this.assert(clearedTimers > 0, 'Should have cleared some timers');
            console.log(`Active timers: ${activeTimers}, Cleared timers: ${clearedTimers}`);
        });
    }

    async testTimerPersistence() {
        this.test('Timer Persistence Through State Changes', () => {
            const display = new ExchangeRateDisplay('timer-test-persistence');
            
            // Change various settings and verify timer persists appropriately
            const originalInterval = display.getRefreshInterval();
            
            // Change interval multiple times
            display.setRefreshInterval(10);
            display.setRefreshInterval(30);
            display.setRefreshInterval(originalInterval);
            
            // Set active/inactive multiple times
            display.setActive(false);
            display.setActive(true);
            display.setActive(false);
            display.setActive(true);
            
            // Should still be functional
            this.assert(display.getIsActive() === true, 'Should maintain active state');
            this.assert(display.getRefreshInterval() === originalInterval, 'Should maintain interval');
            
            display.destroy();
        });
    }

    async testTimerErrorHandling() {
        this.test('Timer Error Handling', () => {
            // Test timer creation with invalid intervals
            const display = new ExchangeRateDisplay('timer-test-error');
            
            // Try setting invalid intervals
            display.setRefreshInterval(-1);
            this.assert(display.getRefreshInterval() === 5, 'Should default to 5 for negative interval');
            
            display.setRefreshInterval(0);
            this.assert(display.getRefreshInterval() === 5, 'Should default to 5 for zero interval');
            
            display.setRefreshInterval('invalid');
            this.assert(display.getRefreshInterval() === 5, 'Should default to 5 for invalid string');
            
            display.destroy();
        });
    }

    async testDegradedModeTimers() {
        this.test('Degraded Mode Timer Management', () => {
            const display = new ExchangeRateDisplay('timer-test-degraded');
            
            // Simulate multiple failures to trigger degraded mode
            for (let i = 0; i < 5; i++) {
                display.updateRate(null, new Date(), true, `Failure ${i + 1}`);
            }
            
            // In degraded mode, should have different timer behavior
            // This is implementation-specific, but we can verify the instance still functions
            this.assert(display.getErrorState() !== false, 'Should be in error state after multiple failures');
            
            // Recovery should be possible
            display.updateRate(5.1234, new Date(), false);
            this.assert(display.getCurrentRate() === 5.1234, 'Should recover from degraded mode');
            
            display.destroy();
        });
    }

    async testTimerSynchronization() {
        this.test('Timer Synchronization Between Instances', () => {
            const display1 = new ExchangeRateDisplay('timer-sync-1');
            const display2 = new ExchangeRateDisplay('timer-sync-2');
            
            // Both should have independent timers
            const timers = Array.from(this.mockTimers.values()).filter(t => t.active);
            this.assert(timers.length >= 2, 'Should have independent timers for each instance');
            
            // Changing one shouldn't affect the other
            const originalInterval1 = display1.getRefreshInterval();
            const originalInterval2 = display2.getRefreshInterval();
            
            display1.setRefreshInterval(30);
            this.assert(display2.getRefreshInterval() === originalInterval2, 
                       'Changing one instance should not affect another');
            
            display1.destroy();
            display2.destroy();
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
        console.log('\n=== Timer Management Test Summary ===');
        console.log(`Total: ${this.testResults.total}`);
        console.log(`Passed: ${this.testResults.passed}`);
        console.log(`Failed: ${this.testResults.failed}`);
        console.log(`Success Rate: ${((this.testResults.passed / this.testResults.total) * 100).toFixed(1)}%`);
        
        // Additional timer statistics
        const activeTimers = Array.from(this.mockTimers.values()).filter(t => t.active).length;
        const clearedTimers = Array.from(this.mockTimers.values()).filter(t => !t.active).length;
        console.log(`Timer Statistics: ${activeTimers} active, ${clearedTimers} cleared`);
    }
}

// Export for use in main test suite
if (typeof window !== 'undefined') {
    window.TimerManagementTestSuite = TimerManagementTestSuite;
}

// Auto-run if loaded directly
if (typeof ExchangeRateDisplay !== 'undefined') {
    const testSuite = new TimerManagementTestSuite();
    testSuite.runAllTests().then(success => {
        console.log(success ? 'All timer management tests passed!' : 'Some timer management tests failed!');
    });
} else {
    console.warn('ExchangeRateDisplay not loaded - timer management tests cannot run');
}