#!/usr/bin/env node

/**
 * USD/BRL Exchange Rate Plugin - Integration Test Runner
 * Command-line test runner for validating plugin structure and basic functionality
 */

const fs = require('fs');
const path = require('path');
const http = require('http');

class PluginIntegrationTester {
    constructor() {
        this.pluginPath = __dirname;
        this.testResults = [];
        this.simulatorUrl = 'http://127.0.0.1:39069';
    }

    log(message, type = 'INFO') {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] [${type}] ${message}`);
    }

    async runTests() {
        this.log('Starting USD/BRL Exchange Rate Plugin Integration Tests');
        this.log(`Plugin path: ${this.pluginPath}`);

        try {
            await this.testPluginStructure();
            await this.testManifestValidation();
            await this.testRequiredFiles();
            await this.testPropertyInspector();
            await this.testSimulatorConnection();
            
            this.printTestSummary();
        } catch (error) {
            this.log(`Test execution failed: ${error.message}`, 'ERROR');
            process.exit(1);
        }
    }

    async testPluginStructure() {
        this.log('Testing plugin directory structure...');
        
        const requiredDirs = [
            'assets/icons',
            'plugin',
            'plugin/actions',
            'property-inspector/exchange'
        ];

        let passed = true;
        for (const dir of requiredDirs) {
            const dirPath = path.join(this.pluginPath, dir);
            if (fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()) {
                this.log(`✓ Directory exists: ${dir}`);
            } else {
                this.log(`✗ Missing directory: ${dir}`, 'ERROR');
                passed = false;
            }
        }

        this.testResults.push({
            name: 'Plugin Structure',
            passed,
            message: passed ? 'All required directories present' : 'Missing required directories'
        });
    }

    async testManifestValidation() {
        this.log('Testing manifest.json validation...');
        
        try {
            const manifestPath = path.join(this.pluginPath, 'manifest.json');
            if (!fs.existsSync(manifestPath)) {
                throw new Error('manifest.json not found');
            }

            const manifestContent = fs.readFileSync(manifestPath, 'utf8');
            const manifest = JSON.parse(manifestContent);

            // Validate required fields
            const requiredFields = ['UUID', 'Name', 'Actions', 'CodePath', 'Version'];
            for (const field of requiredFields) {
                if (!manifest[field]) {
                    throw new Error(`Missing required field: ${field}`);
                }
            }

            // Validate UUID format
            if (!manifest.UUID.startsWith('com.ulanzi.')) {
                throw new Error('UUID does not follow naming convention');
            }

            // Validate Actions array
            if (!Array.isArray(manifest.Actions) || manifest.Actions.length === 0) {
                throw new Error('Actions array is empty or invalid');
            }

            // Validate first action
            const action = manifest.Actions[0];
            const requiredActionFields = ['Name', 'UUID', 'Icon', 'PropertyInspectorPath'];
            for (const field of requiredActionFields) {
                if (!action[field]) {
                    throw new Error(`Missing required action field: ${field}`);
                }
            }

            this.log('✓ Manifest validation passed');
            this.testResults.push({
                name: 'Manifest Validation',
                passed: true,
                message: 'Manifest structure and content valid'
            });

        } catch (error) {
            this.log(`✗ Manifest validation failed: ${error.message}`, 'ERROR');
            this.testResults.push({
                name: 'Manifest Validation',
                passed: false,
                message: error.message
            });
        }
    }

    async testRequiredFiles() {
        this.log('Testing required file existence...');
        
        const requiredFiles = [
            'plugin/app.html',
            'plugin/app.js',
            'plugin/actions/ExchangeRateDisplay.js',
            'property-inspector/exchange/inspector.html',
            'property-inspector/exchange/inspector.js',
            'assets/icons/icon.png',
            'assets/icons/actionIcon.png',
            'assets/icons/categoryIcon.png',
            'en.json',
            'zh_CN.json'
        ];

        let passed = true;
        for (const file of requiredFiles) {
            const filePath = path.join(this.pluginPath, file);
            if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
                this.log(`✓ File exists: ${file}`);
            } else {
                this.log(`✗ Missing file: ${file}`, 'ERROR');
                passed = false;
            }
        }

        this.testResults.push({
            name: 'Required Files',
            passed,
            message: passed ? 'All required files present' : 'Missing required files'
        });
    }

    async testPropertyInspector() {
        this.log('Testing property inspector configuration...');
        
        try {
            const inspectorPath = path.join(this.pluginPath, 'property-inspector/exchange/inspector.html');
            const inspectorContent = fs.readFileSync(inspectorPath, 'utf8');

            // Check for refresh interval select element
            if (!inspectorContent.includes('refresh_interval')) {
                throw new Error('Refresh interval configuration not found');
            }

            // Check for required options
            const requiredOptions = ['1', '5', '10', '30'];
            for (const option of requiredOptions) {
                if (!inspectorContent.includes(`value="${option}"`)) {
                    throw new Error(`Missing refresh interval option: ${option} minutes`);
                }
            }

            this.log('✓ Property inspector validation passed');
            this.testResults.push({
                name: 'Property Inspector',
                passed: true,
                message: 'Property inspector structure valid'
            });

        } catch (error) {
            this.log(`✗ Property inspector validation failed: ${error.message}`, 'ERROR');
            this.testResults.push({
                name: 'Property Inspector',
                passed: false,
                message: error.message
            });
        }
    }

    async testSimulatorConnection() {
        this.log('Testing UlanziDeck Simulator connection...');
        
        return new Promise((resolve) => {
            const req = http.get(this.simulatorUrl, (res) => {
                if (res.statusCode === 200) {
                    this.log('✓ UlanziDeck Simulator is running and accessible');
                    this.testResults.push({
                        name: 'Simulator Connection',
                        passed: true,
                        message: 'Simulator is running on port 39069'
                    });
                } else {
                    this.log(`✗ Simulator returned status code: ${res.statusCode}`, 'WARN');
                    this.testResults.push({
                        name: 'Simulator Connection',
                        passed: false,
                        message: `Simulator returned status code: ${res.statusCode}`
                    });
                }
                resolve();
            });

            req.on('error', (error) => {
                this.log(`✗ Cannot connect to UlanziDeck Simulator: ${error.message}`, 'WARN');
                this.testResults.push({
                    name: 'Simulator Connection',
                    passed: false,
                    message: 'Simulator not running or not accessible'
                });
                resolve();
            });

            req.setTimeout(5000, () => {
                req.destroy();
                this.log('✗ Simulator connection timeout', 'WARN');
                this.testResults.push({
                    name: 'Simulator Connection',
                    passed: false,
                    message: 'Connection timeout'
                });
                resolve();
            });
        });
    }

    printTestSummary() {
        this.log('\n=== Integration Test Summary ===');
        
        let totalTests = this.testResults.length;
        let passedTests = this.testResults.filter(r => r.passed).length;
        let failedTests = totalTests - passedTests;

        this.log(`Total Tests: ${totalTests}`);
        this.log(`Passed: ${passedTests}`);
        this.log(`Failed: ${failedTests}`);

        if (failedTests > 0) {
            this.log('\nFailed Tests:');
            this.testResults.filter(r => !r.passed).forEach(test => {
                this.log(`  ✗ ${test.name}: ${test.message}`, 'ERROR');
            });
        }

        if (passedTests === totalTests) {
            this.log('\n🎉 All integration tests passed!', 'SUCCESS');
            this.log('\nNext steps:');
            this.log('1. Start UlanziDeck Simulator: cd UlanziDeckSimulator && npm start');
            this.log('2. Open simulator: http://127.0.0.1:39069');
            this.log('3. Open plugin main service: plugin/app.html');
            this.log('4. Run manual tests: integration-test-runner.html');
        } else {
            this.log('\n❌ Some integration tests failed. Please fix the issues before proceeding.', 'ERROR');
            process.exit(1);
        }
    }
}

// Run tests if this script is executed directly
if (require.main === module) {
    const tester = new PluginIntegrationTester();
    tester.runTests().catch(error => {
        console.error('Test runner failed:', error);
        process.exit(1);
    });
}

module.exports = PluginIntegrationTester;