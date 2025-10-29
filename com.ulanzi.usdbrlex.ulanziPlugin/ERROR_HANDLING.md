# Comprehensive Error State Handling

This document describes the comprehensive error state handling implemented in the USD to BRL Exchange Rate plugin.

## Overview

The plugin implements robust error handling to provide a reliable user experience even when network conditions are poor or API services are unavailable. The error handling system includes visual indicators, stale data detection, fallback displays, and graceful degradation.

## Error States and Visual Indicators

### 1. Normal Operation
- **Display**: Exchange rate with white text on dark background
- **Indicators**: Currency pair (USD/BRL), rate value, last update time
- **Color Scheme**: White text (#FFFFFF) on dark background (#282828)

### 2. Stale Data Warning
- **Trigger**: Data older than 2x refresh interval OR older than 30 minutes absolute
- **Display**: Rate shown in orange (#FFAA00) with "STALE DATA" indicator
- **Behavior**: Continues showing last known rate with warning
- **Special Case**: When offline, data is considered stale after 5 minutes

### 3. Network Connectivity Issues
- **Offline State**: Shows "OFFLINE" indicator in red
- **Display**: Last known rate (if available) with offline warning
- **Recovery**: Automatically detects when connectivity is restored
- **Fallback**: Shows connection instructions if no cached data

### 4. API Errors
Different API errors are handled with specific visual feedback:

#### Network Errors
- **Display**: "Network" error with "Connection failed" detail
- **Color**: Red text (#FF4444)
- **Recovery**: Automatic retry with exponential backoff

#### Timeout Errors
- **Display**: "Timeout" error with "Request timed out" detail
- **Recovery**: Retry with same interval (timeouts may be temporary)

#### Rate Limiting
- **Display**: "Rate Limit" error with "API limit exceeded" detail
- **Recovery**: Automatically extends refresh interval to reduce API calls
- **Behavior**: Doubles refresh interval, resets after 1 hour

#### Server Errors
- **Display**: "Server Error" with "API unavailable" detail
- **Recovery**: Aggressive backoff with recovery monitoring

### 5. Loading States
- **Initial Load**: Shows "Loading..." with currency pair
- **Retry Attempts**: Shows retry count during subsequent attempts
- **Offline Loading**: Shows "Waiting for connection" when offline

## Stale Data Detection

### Criteria for Stale Data
1. **Normal Operation**: Data older than 2x refresh interval
2. **Absolute Maximum**: Data older than 30 minutes (regardless of refresh interval)
3. **Offline Mode**: Data older than 5 minutes when no connectivity

### Data Age Descriptions
- **Just now**: Less than 1 minute old
- **Xm ago**: X minutes ago (for data less than 1 hour old)
- **Xh ago**: X hours ago (for data less than 24 hours old)
- **Very old**: Data older than 24 hours

## Error Recovery Mechanisms

### 1. Exponential Backoff Retry
- **Initial Delay**: 1 second
- **Progression**: 1s → 2s → 4s
- **Maximum Retries**: 3 attempts
- **Jitter**: Random delay added to prevent thundering herd

### 2. Connectivity Monitoring
- **Browser Events**: Listens to online/offline events
- **Periodic Checks**: Lightweight connectivity tests every 30 seconds
- **Automatic Recovery**: Immediate refresh when connectivity restored

### 3. Degraded Mode
- **Trigger**: All retry attempts exhausted
- **Behavior**: Stops normal refresh, switches to 5-minute recovery attempts
- **Recovery**: Automatically exits when successful refresh occurs
- **Display**: Shows degraded state with recovery instructions

### 4. Error-Specific Recovery
- **Rate Limiting**: Extends refresh interval temporarily
- **Network Errors**: Activates connectivity monitoring
- **Server Errors**: Uses aggressive backoff strategy
- **Timeouts**: Maintains normal retry pattern (may be temporary)

## Fallback Display Strategies

### 1. Cached Data Fallback
- **Behavior**: Shows last known rate with appropriate warnings
- **Indicators**: Stale data warning, offline indicator, error context
- **Duration**: Maintains cached data until fresh data available

### 2. No Data Fallback
- **Display**: Clear error message with troubleshooting hints
- **Information**: Error type, retry count, connectivity status
- **Instructions**: "Check connection" guidance for user

### 3. Progressive Degradation
1. **Normal**: Full functionality with real-time data
2. **Warning**: Stale data with visual indicators
3. **Error**: Cached data with error context
4. **Critical**: No data with clear error messaging and recovery guidance

## Visual Design Standards

### Color Coding
- **Normal**: White (#FFFFFF) - All systems operational
- **Warning**: Orange (#FFAA00) - Stale data or offline with cache
- **Error**: Red (#FF4444) - Critical errors or no data
- **Secondary**: Light gray (#CCCCCC) - Timestamps and details

### Typography
- **Primary Rate**: Bold 14px Source Han Sans SC
- **Currency Pair**: 8px Source Han Sans SC
- **Status Text**: 6-7px Source Han Sans SC
- **Error Details**: 5-7px Source Han Sans SC

### Layout Priority
1. **Error Icon**: Exclamation mark for critical states
2. **Primary Message**: Main error or rate display
3. **Detail Message**: Specific error information
4. **Status Indicators**: Retry count, connectivity, age
5. **Recovery Hints**: User guidance when appropriate

## Testing and Validation

### Test Scenarios Covered
1. **Valid Rate Display**: Normal operation with fresh data
2. **Stale Data**: Old timestamps with warning indicators
3. **Network Errors**: Connection failures with retry logic
4. **API Timeouts**: Request timeouts with appropriate handling
5. **Rate Limiting**: API limits with interval adjustment
6. **Server Errors**: 5xx responses with backoff strategy
7. **Offline Cached**: Offline state with cached data
8. **Offline No Data**: Offline state without cached data
9. **Degraded Mode**: Multiple failures leading to degraded operation

### Validation Points
- Visual indicators match error states
- Color coding follows design standards
- Recovery mechanisms activate appropriately
- Stale data detection works correctly
- Fallback displays provide useful information
- Memory cleanup prevents leaks

## Configuration Options

### Refresh Intervals
- **1 minute**: Stale threshold = 2 minutes
- **5 minutes**: Stale threshold = 10 minutes (default)
- **10 minutes**: Stale threshold = 20 minutes
- **30 minutes**: Stale threshold = 30 minutes (capped at absolute maximum)

### Error Handling Parameters
- **Max Retries**: 3 attempts with exponential backoff
- **Request Timeout**: 10 seconds
- **Connectivity Check**: Every 30 seconds
- **Degraded Mode Recovery**: Every 5 minutes
- **Rate Limit Recovery**: 1 hour reset period

## Implementation Notes

### Performance Considerations
- Efficient canvas rendering with minimal redraws
- Proper timer cleanup to prevent memory leaks
- Lightweight connectivity checks to avoid overhead
- Intelligent retry logic to avoid API abuse

### Accessibility
- Clear visual indicators for different states
- Readable error messages with actionable information
- Consistent color coding for state recognition
- Appropriate contrast ratios for text visibility

### Extensibility
- Modular error handling functions for easy maintenance
- Configurable thresholds and timeouts
- Pluggable recovery strategies
- Comprehensive logging for debugging

This comprehensive error handling system ensures that users always have clear feedback about the plugin's state and any issues that may occur, while implementing robust recovery mechanisms to maintain functionality even under adverse conditions.