# Design Document

## Overview

The USD to BRL Exchange Rate plugin is an HTML-based UlanziDeck plugin that displays real-time currency exchange rates between US Dollar and Brazilian Real. The plugin follows the UlanziDeck Plugin Development Protocol V1.2.2 and integrates with the existing plugin ecosystem. It features automatic refresh capabilities, configurable update intervals, and robust error handling for network issues.

The plugin will use a free currency exchange API (ExchangeRate-API or similar) to fetch current rates and display them in a clean, readable format on the deck button. The design prioritizes simplicity, reliability, and adherence to UlanziDeck design standards.

## Architecture

### Plugin Structure
Following the standard UlanziDeck plugin architecture:

```
com.ulanzi.usdbrlex.ulanziPlugin/
├── assets/
│   └── icons/
│       ├── icon.png (72x72px)
│       ├── actionIcon.png (20x20px)
│       └── categoryIcon.png (28x28px)
├── libs/ (UlanziDeck common library)
├── plugin/
│   ├── actions/
│   │   └── ExchangeRateDisplay.js
│   ├── app.html (main service entry point)
│   └── app.js (main service logic)
├── property-inspector/
│   └── exchange/
│       ├── inspector.html (settings UI)
│       └── inspector.js (settings logic)
├── manifest.json
├── en.json (English localization)
└── zh_CN.json (Chinese localization)
```

### System Components

1. **Main Service (app.js)**: Manages plugin lifecycle, handles UlanziDeck events, and coordinates exchange rate instances
2. **Exchange Rate Display (ExchangeRateDisplay.js)**: Core class managing individual button instances, API calls, and display rendering
3. **Property Inspector**: Configuration interface for refresh intervals
4. **API Service**: Handles currency exchange API communication with error handling and retry logic

### Data Flow

1. User adds plugin to deck button → Main service creates ExchangeRateDisplay instance
2. Instance fetches initial exchange rate → Renders rate on button
3. Timer triggers periodic refresh → API call → Update display
4. User changes settings → Property inspector sends new config → Instance updates refresh interval

## Components and Interfaces

### ExchangeRateDisplay Class

```javascript
class ExchangeRateDisplay {
  constructor(context)
  
  // Core methods
  async fetchExchangeRate()
  renderRate(rate, timestamp)
  startRefreshTimer()
  stopRefreshTimer()
  setRefreshInterval(minutes)
  setActive(isActive)
  destroy()
  
  // Properties
  context: string
  currentRate: number
  lastUpdate: Date
  refreshInterval: number (minutes)
  refreshTimer: Timer
  isActive: boolean
  retryCount: number
}
```

### API Service Interface

```javascript
class CurrencyAPI {
  static async getUSDToBRL()
  static async retryRequest(requestFn, maxRetries = 3)
  static handleAPIError(error)
}
```

### Settings Configuration

```javascript
// Property inspector settings
{
  refresh_interval: "5" // Options: "1", "5", "10", "30"
}
```

## Data Models

### Exchange Rate Response
```javascript
{
  rate: number,        // Exchange rate (e.g., 5.23)
  timestamp: Date,     // When rate was fetched
  source: string,      // API source identifier
  success: boolean     // Request success status
}
```

### Plugin State
```javascript
{
  context: string,           // Unique button identifier
  settings: {
    refresh_interval: string // "1", "5", "10", or "30"
  },
  currentRate: number,       // Latest exchange rate
  lastUpdate: Date,          // Last successful update
  isActive: boolean,         // Button active state
  errorState: boolean        // Whether in error state
}
```

### Display Format
The button will display:
- **Primary**: Exchange rate (e.g., "5.23")
- **Secondary**: Currency pair label ("USD/BRL")
- **Indicator**: Last update time or error state

## Error Handling

### Network Error Strategy
1. **Retry Logic**: Up to 3 attempts with exponential backoff (1s, 2s, 4s)
2. **Fallback Display**: Show last known rate with staleness indicator
3. **Error States**: 
   - "Loading..." - Initial fetch
   - "Error" - All retries failed
   - "Stale" - Data older than 2x refresh interval

### API Error Handling
- **Rate Limiting**: Respect API limits, extend refresh interval if needed
- **Invalid Response**: Validate response structure before processing
- **Timeout**: 10-second timeout for API requests
- **Offline Mode**: Detect network connectivity issues

### User Experience
- Graceful degradation when API is unavailable
- Clear visual indicators for different states
- Maintain functionality during temporary network issues
- Automatic recovery when connectivity restored

## Testing Strategy

### Unit Testing
- ExchangeRateDisplay class methods
- API service error handling
- Settings validation and application
- Timer management and cleanup

### Integration Testing
- UlanziDeck event handling (onAdd, onClear, onSetActive)
- Property inspector communication
- Settings persistence and retrieval
- Plugin lifecycle management

### Manual Testing with Simulator
1. **Setup**: Use UlanziDeckSimulator for development testing
2. **Test Scenarios**:
   - Plugin installation and initialization
   - Settings configuration through property inspector
   - Refresh interval changes
   - Network error simulation
   - Multiple button instances
   - Plugin removal and cleanup

### API Testing
- Test with actual currency API endpoints
- Validate response parsing
- Test error scenarios (invalid API key, rate limits)
- Performance testing for refresh intervals

## Implementation Notes

### Currency API Selection
Primary choice: **ExchangeRate-API** (exchangerate-api.com)
- Free tier: 1,500 requests/month
- No API key required for basic usage
- Reliable uptime and fast response
- Fallback: Fixer.io or CurrencyAPI.com

### Canvas Rendering
The plugin will use HTML5 Canvas for button display:
- 72x72px button size
- Background: #282828 (UlanziDeck standard)
- Font: Source Han Sans SC
- Text color: White (#FFFFFF)
- Error state: Red accent (#FF4444)

### Performance Considerations
- Minimize API calls through intelligent caching
- Efficient canvas rendering updates
- Proper timer cleanup to prevent memory leaks
- Lazy loading of non-critical components

### Localization Support
- English (en.json): Default language
- Chinese (zh_CN.json): Secondary language
- Extensible for additional languages
- Currency formatting respects locale conventions