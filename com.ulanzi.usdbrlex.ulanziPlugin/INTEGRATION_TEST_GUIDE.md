# USD/BRL Exchange Rate Plugin - Integration Test Guide

## Overview

This guide provides comprehensive instructions for testing the USD/BRL Exchange Rate plugin with the UlanziDeck Simulator. The integration tests validate all core functionality including plugin installation, settings configuration, refresh intervals, multiple instances, and cleanup processes.

## Prerequisites

1. **UlanziDeck Simulator**: Ensure the simulator is installed and running
2. **Plugin Files**: All plugin files must be present in the correct directory structure
3. **Network Connection**: Required for testing actual exchange rate API calls

## Test Setup

### 1. Start the UlanziDeck Simulator

```bash
cd UlanziDeckSimulator
npm install  # If not already installed
npm start
```

The simulator will start on `http://127.0.0.1:39069`

### 2. Verify Plugin Installation

1. Open the simulator in your browser: `http://127.0.0.1:39069`
2. Check that "USD/BRL Exchange Rate" appears in the plugin list on the left
3. If not visible, click "Refresh Plugin List" button

### 3. Start Plugin Main Service

1. Open the plugin main service: `com.ulanzi.usdbrlex.ulanziPlugin/plugin/app.html`
2. Check browser console for connection messages
3. Verify WebSocket connection to simulator is established

### 4. Run Integration Tests

Open the test runner: `com.ulanzi.usdbrlex.ulanziPlugin/integration-test-runner.html`

## Test Cases

### Test 1: Plugin Installation and Initialization

**Objective**: Verify plugin structure and basic initialization

**Automated Checks**:
- ✅ Manifest file validation
- ✅ Required file existence check
- ✅ UUID naming convention compliance
- ✅ Plugin structure validation

**Manual Verification**:
1. Drag the USD/BRL Exchange Rate plugin from the left panel to a deck position
2. Verify the plugin appears on the deck with the correct icon
3. Check that the plugin starts fetching exchange rate data immediately

**Expected Results**:
- Plugin appears in simulator plugin list
- Plugin can be added to deck positions
- Initial exchange rate fetch begins automatically
- No console errors during initialization

### Test 2: Settings Configuration Through Property Inspector

**Objective**: Test property inspector functionality and settings persistence

**Automated Checks**:
- ✅ Property inspector HTML structure
- ✅ Refresh interval dropdown options (1, 5, 10, 30 minutes)
- ✅ Default value validation (5 minutes)
- ✅ JavaScript file existence

**Manual Verification**:
1. Right-click on a plugin instance in the simulator
2. Select "Property Inspector" from context menu
3. Verify the refresh interval dropdown appears with correct options
4. Change the refresh interval and save settings
5. Verify settings are persisted when reopening property inspector

**Expected Results**:
- Property inspector opens without errors
- All refresh interval options are available
- Settings changes are saved and persisted
- Default refresh interval is 5 minutes

### Test 3: Refresh Interval Changes and Immediate Application

**Objective**: Verify that refresh interval changes take effect immediately

**Automated Checks**:
- ✅ Required event handlers present (`onParamFromApp`, `onSetSettings`)
- ✅ `setRefreshInterval` method exists in ExchangeRateDisplay

**Manual Verification**:
1. Add plugin to deck and note the current refresh behavior
2. Open property inspector and change refresh interval to 1 minute
3. Observe that the plugin immediately starts using the new interval
4. Change to 30 minutes and verify the longer interval is applied
5. Monitor browser console for timer restart messages

**Expected Results**:
- Refresh interval changes are applied immediately
- Old timers are cleared and new ones started
- No overlapping or duplicate refresh timers
- Console logs confirm interval changes

### Test 4: Multiple Button Instances

**Objective**: Validate independent operation of multiple plugin instances

**Automated Checks**:
- ✅ Instance management mechanism in app.js
- ✅ Context isolation in ExchangeRateDisplay
- ✅ Cleanup method availability

**Manual Verification**:
1. Add multiple USD/BRL Exchange Rate plugins to different deck positions
2. Configure different refresh intervals for each instance (e.g., 1 min, 5 min, 10 min)
3. Verify each instance operates independently:
   - Different refresh timers
   - Independent settings
   - Separate API calls
4. Check that changing settings on one instance doesn't affect others

**Expected Results**:
- Multiple instances can be added simultaneously
- Each instance maintains independent settings
- Refresh intervals work independently
- No cross-instance interference

### Test 5: Plugin Removal and Cleanup

**Objective**: Test proper cleanup when plugin instances are removed

**Automated Checks**:
- ✅ `onClear` event handler in app.js
- ✅ Timer cleanup implementation
- ✅ Destroy method in ExchangeRateDisplay
- ✅ Instance removal mechanism

**Manual Verification**:
1. Add several plugin instances to the deck
2. Verify they are actively fetching exchange rates
3. Remove instances one by one from the deck
4. Check browser console for:
   - No error messages
   - Cleanup confirmation messages
   - No memory leak warnings
5. Verify that removed instances stop making API calls

**Expected Results**:
- Plugin instances can be removed without errors
- All timers are properly cleared
- No memory leaks or orphaned processes
- API calls stop for removed instances
- Console shows proper cleanup messages

## Test Execution Checklist

### Pre-Test Setup
- [ ] UlanziDeck Simulator is running on port 39069
- [ ] Plugin main service (app.html) is loaded and connected
- [ ] Browser developer tools are open for monitoring
- [ ] Network connection is available for API testing

### Automated Test Execution
- [ ] Run Test 1: Plugin Installation and Initialization
- [ ] Run Test 2: Settings Configuration Through Property Inspector
- [ ] Run Test 3: Refresh Interval Changes and Immediate Application
- [ ] Run Test 4: Multiple Button Instances
- [ ] Run Test 5: Plugin Removal and Cleanup

### Manual Verification Steps
- [ ] Verify plugin appears in simulator plugin list
- [ ] Test drag-and-drop plugin installation
- [ ] Confirm property inspector functionality
- [ ] Test refresh interval changes with immediate effect
- [ ] Validate multiple instance independence
- [ ] Confirm proper cleanup on plugin removal

### Post-Test Validation
- [ ] No console errors during any test
- [ ] All timers properly cleaned up
- [ ] Memory usage remains stable
- [ ] API calls behave as expected
- [ ] Settings persistence works correctly

## Troubleshooting

### Common Issues

**Plugin Not Appearing in Simulator**:
- Verify manifest.json is valid JSON
- Check that plugin is in UlanziDeckSimulator/plugins directory
- Click "Refresh Plugin List" in simulator
- Verify all required files are present

**WebSocket Connection Issues**:
- Ensure simulator is running on correct port (39069)
- Check firewall settings
- Verify app.html is loaded and connected
- Look for connection errors in browser console

**Property Inspector Not Opening**:
- Verify inspector.html exists in correct path
- Check for JavaScript errors in console
- Ensure UlanziDeck common libraries are loaded
- Verify WebSocket connection is active

**API Calls Failing**:
- Check network connectivity
- Verify API endpoint is accessible
- Look for CORS issues in browser console
- Check API rate limiting

### Debug Information

Monitor these browser console messages during testing:
- WebSocket connection status
- Plugin initialization messages
- API request/response logs
- Timer creation/cleanup messages
- Settings change confirmations
- Error messages and stack traces

## Success Criteria

The integration tests are considered successful when:

1. **All automated checks pass** (green status in test runner)
2. **Manual verification steps complete** without errors
3. **No console errors** during test execution
4. **Proper cleanup** is confirmed for all instances
5. **Settings persistence** works correctly
6. **Multiple instances** operate independently
7. **API integration** functions as expected

## Reporting Issues

If any tests fail, document:
- Specific test case that failed
- Error messages from browser console
- Steps to reproduce the issue
- Expected vs. actual behavior
- Browser and simulator version information

This comprehensive testing ensures the USD/BRL Exchange Rate plugin meets all requirements and functions correctly within the UlanziDeck ecosystem.