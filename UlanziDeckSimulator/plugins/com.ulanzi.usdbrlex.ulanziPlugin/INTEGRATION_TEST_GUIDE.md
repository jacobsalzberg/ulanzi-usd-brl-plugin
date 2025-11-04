# USD-BRL Exchange Rate Plugin - Integration Test Guide

## Overview

This guide provides comprehensive instructions for running integration tests for the USD-BRL Exchange Rate plugin using the UlanziDeck Simulator. The integration tests verify all aspects of plugin functionality including installation, settings configuration, refresh intervals, multiple instances, and cleanup processes.

## Test Coverage

The integration tests cover the following requirements:

- **Requirement 1.4**: Plugin lifecycle management and UlanziDeck event handling
- **Requirement 2.4**: Immediate refresh cycle start on plugin load  
- **Requirement 3.2**: Settings changes applied immediately through property inspector

## Prerequisites

### 1. UlanziDeck Simulator Setup

1. Navigate to the `UlanziDeckSimulator` directory
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the simulator:
   ```bash
   npm start
   ```
4. Open browser to `http://127.0.0.1:39069`

### 2. Plugin Installation

1. Ensure the plugin is copied to the simulator plugins directory:
   ```bash
   # From project root
   xcopy "com.ulanzi.usdbrlex.ulanziPlugin" "UlanziDeckSimulator\plugins\com.ulanzi.usdbrlex.ulanziPlugin" /E /I /Y
   ```

2. In the simulator web interface:
   - Click "Refresh Plugin List" to load the plugin
   - Verify the USD-BRL Exchange Rate plugin appears in the left panel

### 3. Plugin Main Service

1. Start the plugin's main service by opening:
   ```
   http://127.0.0.1:39069/plugins/com.ulanzi.usdbrlex.ulanziPlugin/plugin/app.html
   ```
2. Verify the service connects successfully (check browser console for connection messages)

## Running Integration Tests

### Method 1: Web-Based Test Runner (Recommended)

1. Open the integration test runner:
   ```
   http://127.0.0.1:39069/plugins/com.ulanzi.usdbrlex.ulanziPlugin/integration-test-runner.html
   ```

2. Use the test interface:
   - **Run All Integration Tests**: Executes the complete test suite
   - **Individual Test Buttons**: Run specific test categories
   - **Clear Output**: Clears the test output window

3. Monitor test results in real-time through the web interface

### Method 2: Node.js Test Runner

1. Navigate to the plugin directory:
   ```bash
   cd com.ulanzi.usdbrlex.ulanziPlugin
   ```

2. Run the integration tests:
   ```bash
   node integration-test.js
   ```

## Test Scenarios

### Test 1: Plugin Installation and Initialization

**Purpose**: Verify plugin loads correctly and initializes properly

**Test Steps**:
- ✅ Check plugin manifest accessibility
- ✅ Verify main service (app.html) loads
- ✅ Test plugin assets (icons) are accessible
- ✅ Simulate plugin instance creation
- ✅ Verify initial exchange rate fetch

**Expected Results**:
- Plugin manifest loads without errors
- All required assets are accessible
- Plugin instances initialize successfully
- Initial exchange rate is fetched and displayed

### Test 2: Settings Configuration through Property Inspector

**Purpose**: Verify settings interface works correctly

**Test Steps**:
- ✅ Check property inspector HTML accessibility
- ✅ Verify all refresh interval options (1, 5, 10, 30 minutes)
- ✅ Test default setting (5 minutes)
- ✅ Verify property inspector JavaScript loads

**Expected Results**:
- Property inspector interface loads correctly
- All refresh interval options are available
- Default setting is properly configured
- Settings interface is functional

### Test 3: Refresh Interval Changes and Immediate Application

**Purpose**: Verify settings changes are applied immediately

**Test Steps**:
- ✅ Simulate changing refresh interval from 5 to 1 minute
- ✅ Verify timer interval updates immediately
- ✅ Test changing to 30 minutes
- ✅ Confirm immediate application of changes

**Expected Results**:
- Settings changes are applied without delay
- Timer intervals update correctly
- No restart required for settings to take effect

### Test 4: Multiple Button Instances

**Purpose**: Verify multiple plugin instances work independently

**Test Steps**:
- ✅ Create multiple plugin instances
- ✅ Set different refresh intervals for each
- ✅ Test independent operation
- ✅ Verify active/inactive state management
- ✅ Confirm all instances fetch exchange rates

**Expected Results**:
- Multiple instances operate independently
- Each instance maintains its own settings
- Active/inactive states work correctly
- All instances successfully fetch and display rates

### Test 5: Plugin Removal and Cleanup

**Purpose**: Verify proper cleanup when plugin is removed

**Test Steps**:
- ✅ Create plugin instance
- ✅ Simulate plugin removal
- ✅ Verify timer cleanup
- ✅ Check memory cleanup
- ✅ Test event listener removal
- ✅ Verify no memory leaks

**Expected Results**:
- All timers are properly cleared
- Memory is freed correctly
- Event listeners are removed
- No memory leaks detected

## Manual Testing with Simulator

### Adding Plugin to Deck

1. In the simulator interface:
   - Drag the USD-BRL Exchange Rate plugin from the left panel
   - Drop it onto a deck button position
   - Verify the plugin initializes and shows exchange rate

### Testing Settings Changes

1. Right-click on the plugin button
2. Select "Property Inspector" or similar option
3. Change the refresh interval setting
4. Verify the change is applied immediately
5. Monitor the button for updated refresh behavior

### Testing Multiple Instances

1. Add the plugin to multiple deck positions
2. Configure different refresh intervals for each
3. Verify each instance operates independently
4. Test active/inactive states by switching between buttons

### Testing Plugin Removal

1. Right-click on a plugin button
2. Select "Remove" or similar option
3. Verify the plugin is removed cleanly
4. Check that no errors appear in browser console

## Troubleshooting

### Common Issues

1. **Plugin Not Loading**:
   - Verify plugin is in correct directory
   - Check manifest.json syntax
   - Refresh plugin list in simulator

2. **Main Service Connection Failed**:
   - Ensure simulator is running on port 39069
   - Check browser console for WebSocket errors
   - Verify app.html is accessible

3. **Tests Failing**:
   - Check browser console for JavaScript errors
   - Verify all plugin files are present
   - Ensure simulator is properly connected

### Debug Information

- Browser console logs provide detailed error information
- Network tab shows failed resource requests
- Simulator console shows WebSocket communication

## Test Results Interpretation

### Success Indicators
- ✅ Green checkmarks indicate passed tests
- All test scenarios complete without errors
- Plugin functions correctly in simulator

### Failure Indicators
- ❌ Red X marks indicate failed tests
- Error messages provide specific failure details
- Browser console shows additional error information

### Warnings
- ⚠️ Yellow warnings indicate non-critical issues
- Tests may pass with warnings
- Review warnings for potential improvements

## Automated Test Execution

For continuous integration, the tests can be automated using headless browser testing:

```bash
# Example using Puppeteer (requires additional setup)
npm install puppeteer
node automated-integration-test.js
```

## Performance Considerations

- Tests simulate network delays for realistic conditions
- Memory usage is monitored during cleanup tests
- Timer accuracy is verified within acceptable tolerances
- Multiple instance tests check for resource conflicts

## Conclusion

The integration test suite provides comprehensive coverage of the USD-BRL Exchange Rate plugin functionality. Regular execution of these tests ensures the plugin maintains compatibility with the UlanziDeck platform and meets all specified requirements.

For questions or issues with the integration tests, refer to the plugin documentation or check the browser console for detailed error information.