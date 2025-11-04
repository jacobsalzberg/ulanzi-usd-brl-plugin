# Implementation Plan

- [x] 1. Set up plugin structure and manifest configuration



  - Create directory structure following UlanziDeck plugin conventions
  - Write manifest.json with proper UUIDs, metadata, and action definitions
  - Create placeholder icon files in assets/icons directory
  - _Requirements: 5.4_

- [x] 2. Create core ExchangeRateDisplay class with basic functionality





  - Implement ExchangeRateDisplay class constructor and basic properties
  - Add methods for context management and instance lifecycle
  - Create canvas rendering setup for 72x72px button display
  - _Requirements: 1.1, 1.4_

- [x] 3. Implement currency API service with error handling




  - Create CurrencyAPI class with getUSDToBRL method
  - Implement fetch request to ExchangeRate-API endpoint
  - Add retry logic with exponential backoff for failed requests
  - Implement response validation and error state handling
  - _Requirements: 1.3, 4.1, 4.2, 4.3_

- [x] 4. Add exchange rate display rendering




  - Implement renderRate method to draw rate on canvas
  - Add currency pair labels (USD/BRL) and rate formatting
  - Create visual states for loading, error, and stale data indicators
  - Apply UlanziDeck design standards (background color, font)
  - _Requirements: 1.1, 1.2, 5.1, 5.2_


- [x] 5. Implement automatic refresh timer system




  - Create startRefreshTimer and stopRefreshTimer methods
  - Add setRefreshInterval method to handle interval changes
  - Implement timer cleanup to prevent memory leaks
  - Ensure immediate refresh on plugin initialization
  - _Requirements: 2.1, 2.2, 2.4_
-

- [x] 6. Create property inspector for settings configuration




  - Build inspector.html with refresh interval dropdown options
  - Implement inspector.js for UlanziDeck communication
  - Add form handling for settings changes
  - Create options for 1, 5, 10, and 30-minute intervals with 5-minute default
  - _Requirements: 3.1, 3.3_

- [x] 7. Implement main service app.js with UlanziDeck event handling




  - Create main service connection to UlanziDeck
  - Implement onAdd event handler to create ExchangeRateDisplay instances
  - Add onClear event handler for proper cleanup
  - Implement onSetActive handler for active state management
  - Add settings update handlers (onParamFromApp, onParamFromPlugin)
  - _Requirements: 1.4, 3.2_

- [x] 8. Add settings persistence and application









  - Implement onSetSettings function to apply refresh interval changes
  - Add settings validation and default value handling
  - Ensure settings are applied immediately when changed
  - Store and retrieve user preferences correctly
  - _Requirements: 3.2, 3.3_
-

- [x] 9. Create app.html main service entry point




  - Build HTML structure with required script imports
  - Include UlanziDeck common library references
  - Add Source Han Sans SC font family styling
  - Import all plugin JavaScript modules
  - _Requirements: 5.3, 5.4_

- [x] 10. Implement network error recovery and retry mechanisms





  - Add network connectivity detection
  - Implement automatic recovery when connectivity restored
  - Create exponential backoff retry strategy
  - Add timeout handling for API requests
  - _Requirements: 4.1, 4.2, 4.3, 4.4_
-

- [x] 11. Add localization files for multi-language support




  - Create en.json with English translations for plugin name and descriptions
  - Create zh_CN.json with Chinese translations
  - Add localization keys for UI elements and error messages
  - _Requirements: 5.4_
-

- [x] 12. Create comprehensive error state handling




  - Implement visual error indicators on button display
  - Add stale data detection (older than 2x refresh interval)
  - Create fallback display for when API is unavailable
  - Implement graceful degradation for various error scenarios
  - _Requirements: 1.3, 4.2, 4.3_
-

- [x] 13. Add active state management and optimization




  - Implement setActive method to pause/resume refresh when button inactive
  - Optimize API calls by stopping refresh for inactive buttons
  - Ensure proper state restoration when button becomes active
  - _Requirements: 2.1, 2.2_
-

- [x] 14. Implement proper cleanup and memory management




  - Add destroy method to ExchangeRateDisplay class
  - Ensure all timers are cleared on plugin removal
  - Implement proper event listener cleanup
  - Add memory leak prevention for multiple instances
  - _Requirements: 2.1_
-

- [x] 15. Create unit tests for core functionality




  - Write tests for ExchangeRateDisplay class methods
  - Test API service error handling and retry logic
  - Add tests for settings validation and application
  - Test timer management and cleanup functionality
  - _Requirements: 1.1, 2.1, 3.1, 4.1_
 

- [x] 16. Integration testing with UlanziDeck simulator








  - Test plugin installation and initialization in simulator
  - Verify settings configuration through property inspector
  - Test refresh interval changes and immediate application
  - Validate multiple button instances work correctly
  - Test plugin removal and cleanup processes
  - _Requirements: 1.4, 2.4, 3.2_