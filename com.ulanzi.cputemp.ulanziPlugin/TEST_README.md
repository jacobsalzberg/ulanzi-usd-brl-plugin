# USD/BRL Exchange Rate Plugin - Unit Tests

This directory contains comprehensive unit tests for the USD/BRL Exchange Rate Plugin, covering all core functionality as specified in the requirements.

## Test Coverage

The test suite covers the following requirements:

- **Requirement 1.1**: Exchange rate display functionality
- **Requirement 2.1**: Automatic refresh timer system
- **Requirement 3.1**: Settings validation and configuration
- **Requirement 4.1**: API service error handling and retry logic

## Test Files

### Core Test Files

1. **`test-suite.js`** - Main comprehensive test framework
   - ExchangeRateDisplay class method tests
   - Canvas rendering tests
   - Instance lifecycle management
   - Integration tests

2. **`test-api-service.js`** - Focused API service tests
   - Network error handling
   - Retry logic with exponential backoff
   - Connectivity detection
   - Response validation
   - Rate limiting and server error handling

3. **`test-timer-management.js`** - Timer management tests
   - Timer creation and cleanup
   - Refresh interval changes
   - Active state timer control
   - Memory leak prevention
   - Multiple instance timer management

4. **`test-settings-validation.js`** - Settings validation tests
   - Input validation and normalization
   - Default value application
   - Settings persistence
   - Multiple context management

### Test Runners

5. **`test-runner.html`** - Browser-based test runner
   - Visual test execution interface
   - Console output capture
   - Test result export functionality
   - Individual test suite execution

6. **`run-tests.js`** - Programmatic test execution
   - Command-line compatible test runner
   - Environment dependency checking
   - Comprehensive result reporting

### Legacy Test Files

7. **`test-error-handling.js`** - Error state visual testing
8. **`test-settings.js`** - Settings functionality testing

## Running Tests

### Method 1: Browser Test Runner (Recommended)

1. Open `test-runner.html` in a web browser
2. Click "Run All Tests" to execute the complete test suite
3. View results in the console output area
4. Export results using the "Export Results" button

### Method 2: Browser Console

```javascript
// Load the plugin files first, then:
window.runAllPluginTests();

// Or run specific test suites:
window.runSpecificTestSuite('api');
window.runSpecificTestSuite('timer');
window.runSpecificTestSuite('settings');
```

### Method 3: Individual Test Files

Load individual test files in the browser console:

```javascript
// For API service tests
const apiTests = new APIServiceTestSuite();
apiTests.runAllTests();

// For timer management tests
const timerTests = new TimerManagementTestSuite();
timerTests.runAllTests();

// For settings validation tests
const settingsTests = new SettingsValidationTestSuite();
settingsTests.runAllTests();
```

## Test Environment Setup

### Required Dependencies

The tests require the following plugin files to be loaded:

- `libs/common.js` - UlanziDeck common library
- `plugin/actions/ExchangeRateDisplay.js` - Main display class
- `plugin/app.js` - Main service logic

### Mock Environment

The tests include comprehensive mocking for:

- UlanziDeck API (`$UD` object)
- Browser APIs (fetch, timers, canvas)
- Network connectivity status
- Local storage for settings persistence

## Test Structure

### Test Framework Features

- **Assertion Library**: Custom assertion methods (toBe, toEqual, toBeTruthy, etc.)
- **Async Support**: Full support for Promise-based testing
- **Mocking System**: Comprehensive mocking for external dependencies
- **Result Aggregation**: Automatic test result collection and reporting
- **Error Handling**: Graceful error handling with detailed error messages

### Test Categories

1. **Unit Tests**: Individual method and function testing
2. **Integration Tests**: Component interaction testing
3. **Error Handling Tests**: Comprehensive error scenario coverage
4. **Performance Tests**: Timer management and memory leak detection
5. **Configuration Tests**: Settings validation and persistence

## Expected Test Results

When all tests pass, you should see:

```
=== Test Summary ===
Total: 45+
Passed: 45+
Failed: 0
Success Rate: 100.0%
```

## Troubleshooting

### Common Issues

1. **"ExchangeRateDisplay not found"**
   - Ensure `plugin/actions/ExchangeRateDisplay.js` is loaded
   - Check browser console for loading errors

2. **"Settings functions not found"**
   - Ensure `plugin/app.js` is loaded
   - Verify all plugin dependencies are available

3. **"CurrencyAPI not found"**
   - Tests will use mock implementation automatically
   - This warning can be ignored for unit testing

### Debug Mode

Enable verbose logging by setting:

```javascript
TEST_CONFIG.verbose = true;
```

### Test Isolation

Each test runs in isolation with:
- Fresh mock environments
- Cleaned up timers and instances
- Reset state between tests

## Continuous Integration

The test suite is designed to be CI-friendly:

- No external dependencies required
- Deterministic test execution
- JSON result export capability
- Exit code support for automated testing

## Contributing

When adding new tests:

1. Follow the existing test structure
2. Include comprehensive error cases
3. Add appropriate mocking for external dependencies
4. Update this README with new test descriptions
5. Ensure tests are isolated and don't affect each other

## Test Metrics

The test suite provides detailed metrics:

- **Code Coverage**: Tests cover all major code paths
- **Error Scenarios**: Comprehensive error condition testing
- **Performance**: Timer and memory management validation
- **Integration**: Cross-component interaction testing

For questions or issues with the test suite, refer to the plugin documentation or create an issue in the project repository.