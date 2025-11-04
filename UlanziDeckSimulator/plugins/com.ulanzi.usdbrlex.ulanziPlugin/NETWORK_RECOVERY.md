# Network Error Recovery and Retry Mechanisms

This document describes the network error recovery and retry mechanisms implemented in the USD/BRL Exchange Rate plugin.

## Features Implemented

### 1. Network Connectivity Detection

- **Real-time monitoring**: Uses browser `online`/`offline` events to detect connectivity changes
- **Periodic checks**: Performs lightweight connectivity checks every 30 seconds using httpbin.org
- **Status tracking**: Maintains current connectivity status accessible via `CurrencyAPI.getConnectivityStatus()`

### 2. Automatic Recovery When Connectivity Restored

- **Event-driven recovery**: Automatically triggers refresh when connectivity is restored
- **Listener system**: Plugin instances register for connectivity change notifications
- **Immediate response**: Triggers refresh within 1 second of connectivity restoration
- **Recovery timer**: Falls back to periodic recovery attempts every 30 seconds when offline

### 3. Enhanced Exponential Backoff Retry Strategy

- **Connectivity-aware retries**: Waits for network connectivity before attempting retries
- **Exponential backoff**: Uses delays of 1s, 2s, 4s with added jitter (up to 1s random)
- **Maximum retries**: Configurable maximum retry attempts (default: 3)
- **Smart retry logic**: Only retries recoverable errors (network, timeout, 5xx, 429)

### 4. Timeout Handling for API Requests

- **Request timeout**: 10-second timeout for all API requests
- **Abort controller**: Uses AbortController for proper request cancellation
- **Timeout detection**: Distinguishes timeout errors from other network errors
- **Graceful handling**: Provides user-friendly timeout error messages

## Implementation Details

### CurrencyAPI Enhancements

```javascript
// New methods added:
- initializeConnectivityMonitoring()
- checkConnectivity()
- addConnectivityListener(callback)
- removeConnectivityListener(callback)
- waitForConnectivity(maxWaitTime)
- retryRequestWithConnectivity(requestFn, maxRetries, waitForConnectivity)
- handleAPIErrorWithConnectivity(error)
```

### ExchangeRateDisplay Enhancements

```javascript
// New methods added:
- setupConnectivityMonitoring()
- startRecoveryTimer()
- stopRecoveryTimer()

// Enhanced methods:
- updateRate() - now accepts error messages
- renderRate() - displays detailed error information
- destroy() - properly cleans up connectivity listeners
```

## Error Handling Improvements

### Error Classification

- **Recoverable errors**: Network, timeout, 5xx HTTP, 429 rate limiting
- **Non-recoverable errors**: 4xx client errors (except 429), invalid API responses
- **Connectivity errors**: Specifically handled with "No network connection" message

### Visual Error Indicators

- **Error state display**: Shows specific error messages on button
- **Retry counter**: Displays retry attempt count for multiple failures
- **Stale data indicator**: Shows when data is older than 2x refresh interval
- **Loading states**: Clear loading indicators during refresh attempts

## Recovery Behavior

### When Connectivity is Lost

1. Plugin detects offline status
2. Starts recovery timer (30-second intervals)
3. Displays last known rate with error indicator
4. Continues attempting connectivity checks

### When Connectivity is Restored

1. Connectivity change event triggers
2. Stops recovery timer
3. Triggers immediate refresh (1-second delay)
4. Updates display with fresh data
5. Resets error state and retry counters

## Configuration

### Timeouts
- API request timeout: 10 seconds
- Connectivity check timeout: 5 seconds
- Recovery check interval: 30 seconds

### Retry Settings
- Maximum retries: 3
- Retry delays: [1000ms, 2000ms, 4000ms] + jitter
- Connectivity wait time: 30 seconds per attempt

## Testing

The implementation can be tested by:

1. **Simulating network disconnection**: Disable network adapter
2. **API endpoint failures**: Block access to exchangerate-api.com
3. **Timeout scenarios**: Use network throttling tools
4. **Recovery testing**: Re-enable network and verify automatic refresh

## Requirements Satisfied

- ✅ **4.1**: Network request retry with exponential backoff (up to 3 times)
- ✅ **4.2**: Display last known rate with staleness indicator on failure
- ✅ **4.3**: Resume normal operations when connectivity restored
- ✅ **4.4**: Show loading/connecting state when unable to connect initially

## Future Enhancements

- Configurable retry settings through property inspector
- Alternative API endpoints for failover
- Offline mode with cached exchange rates
- Network quality detection and adaptive refresh intervals