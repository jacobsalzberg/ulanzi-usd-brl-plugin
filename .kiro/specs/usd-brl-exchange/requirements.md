# Requirements Document

## Introduction

This feature will create a USD to BRL currency exchange rate plugin for the ULANZI D200 Deck. The plugin will display the current exchange rate between US Dollar (USD) and Brazilian Real (BRL) on a deck button, with automatic refresh capabilities at user-configurable intervals. This plugin follows the UlanziDeck HTML plugin architecture and will integrate with the existing plugin ecosystem.

## Requirements

### Requirement 1

**User Story:** As a ULANZI D200 Deck user, I want to see the current USD to BRL exchange rate displayed on my deck button, so that I can quickly monitor currency fluctuations without opening external applications.

#### Acceptance Criteria

1. WHEN the plugin is loaded THEN the system SHALL display the current USD to BRL exchange rate on the deck button
2. WHEN the exchange rate is displayed THEN the system SHALL show both the rate value and currency symbols (USD/BRL)
3. WHEN the rate cannot be fetched THEN the system SHALL display an error indicator or fallback message
4. WHEN the plugin starts THEN the system SHALL immediately fetch and display the current exchange rate

### Requirement 2

**User Story:** As a user, I want the exchange rate to automatically refresh at regular intervals, so that I always see up-to-date information without manual intervention.

#### Acceptance Criteria

1. WHEN the plugin is active THEN the system SHALL automatically refresh the exchange rate at the configured interval
2. WHEN a refresh occurs THEN the system SHALL update the display with the new rate value
3. WHEN a refresh fails THEN the system SHALL retry after a shorter interval and maintain the previous rate display
4. WHEN the plugin is first loaded THEN the system SHALL start the automatic refresh cycle immediately

### Requirement 3

**User Story:** As a user, I want to customize how often the exchange rate refreshes, so that I can balance between having current information and not overloading the currency API.

#### Acceptance Criteria

1. WHEN accessing plugin settings THEN the system SHALL provide options for refresh intervals (1 minute, 5 minutes, 10 minutes, 30 minutes)
2. WHEN I change the refresh interval THEN the system SHALL immediately apply the new interval to the refresh cycle
3. WHEN the plugin starts THEN the system SHALL use the previously saved refresh interval setting
4. IF no interval is configured THEN the system SHALL default to 5 minutes refresh interval

### Requirement 4

**User Story:** As a user, I want the plugin to handle network issues gracefully, so that temporary connectivity problems don't break the plugin functionality.

#### Acceptance Criteria

1. WHEN a network request fails THEN the system SHALL retry up to 3 times with exponential backoff
2. WHEN all retries fail THEN the system SHALL display the last known rate with an indicator showing data staleness
3. WHEN network connectivity is restored THEN the system SHALL resume normal refresh operations
4. WHEN the plugin cannot connect initially THEN the system SHALL show a "connecting" or "loading" state

### Requirement 5

**User Story:** As a user, I want the plugin to follow UlanziDeck design standards, so that it integrates seamlessly with my other deck plugins.

#### Acceptance Criteria

1. WHEN the plugin is displayed THEN the system SHALL use the standard UlanziDeck background color (#282828)
2. WHEN displaying text THEN the system SHALL use the Source Han Sans SC font family
3. WHEN the plugin is packaged THEN the system SHALL follow the com.ulanzi.pluginName.ulanziPlugin naming convention
4. WHEN the plugin is structured THEN the system SHALL include all required directories (assets, libs, plugin, property-inspector) and files (manifest.json, localization files)