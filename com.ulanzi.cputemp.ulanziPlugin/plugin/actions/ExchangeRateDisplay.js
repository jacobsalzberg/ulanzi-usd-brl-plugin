/**
 * ExchangeRateDisplay - Core class for USD to BRL exchange rate display
 * Manages individual button instances, canvas rendering, and lifecycle
 */
function ExchangeRateDisplay(ctx) {
    var context = ctx,
        canvas = null,
        canvasContext = null,
        currentRate = null,
        lastUpdate = null,
        refreshTimer = 0,
        refreshInterval = 5, // Default 5 minutes

        isActive = true,
        retryCount = 0,
        errorState = false,
        allowSend = true, // Whether can send messages to UlanziDeck
        connectivityListener = null, // Listener for connectivity changes
        recoveryTimer = 0, // Timer for automatic recovery attempts
        lastConnectivityStatus = true; // Track connectivity status changes

    /**
     * Initialize the exchange rate display
     * Creates canvas and sets up initial rendering
     */
    function initialize() {
        // Create 512x512px canvas for button display (UlanziDeck scales it down for crisp display)
        canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        canvasContext = canvas.getContext('2d');

        // Set up canvas rendering properties
        setupCanvasStyle();

        // Render initial loading state
        renderLoadingState();

        // Set up connectivity monitoring
        setupConnectivityMonitoring();

        // Start automatic refresh timer with immediate refresh
        // Note: startRefreshTimer() will check isActive before starting
        startRefreshTimer();
    }

    /**
     * Set up canvas styling following UlanziDeck standards
     */
    function setupCanvasStyle() {
        if (!canvasContext) return;

        // Set font to Source Han Sans SC (UlanziDeck standard)
        canvasContext.font = '12px Source Han Sans SC, sans-serif';
        canvasContext.textAlign = 'center';
        canvasContext.textBaseline = 'middle';

        // Set default colors
        canvasContext.fillStyle = '#FFFFFF'; // White text
        canvasContext.strokeStyle = '#FFFFFF';
    }

    /**
     * Render loading state on canvas with enhanced visual feedback
     */
    function renderLoadingState() {
        if (!canvasContext || !allowSend) return;

        // Clear canvas with UlanziDeck standard background (512x512)
        canvasContext.fillStyle = '#282828';
        canvasContext.fillRect(0, 0, 512, 512);

        const currentFontSize = getFontSize();

        if (currentFontSize === 'large') {
            // Large font loading state (512x512)
            canvasContext.fillStyle = '#FFFFFF';
            canvasContext.font = 'bold 200px Source Han Sans SC, sans-serif';
            canvasContext.fillText('Loading', 256, 300);

            canvasContext.fillStyle = '#CCCCCC';
            canvasContext.font = '60px Source Han Sans SC, sans-serif';
            canvasContext.fillText('USD/BRL', 256, 80);
        } else if (currentFontSize === 'medium') {
            // Medium font loading state (512x512)
            canvasContext.fillStyle = '#CCCCCC';
            canvasContext.font = '70px Source Han Sans SC, sans-serif';
            canvasContext.fillText('USD/BRL', 256, 110);

            canvasContext.fillStyle = '#FFFFFF';
            canvasContext.font = 'bold 140px Source Han Sans SC, sans-serif';
            canvasContext.fillText('Loading...', 256, 300);
        } else {
            // Small font loading state (512x512)
            canvasContext.fillStyle = '#CCCCCC';
            canvasContext.font = '70px Source Han Sans SC, sans-serif';
            canvasContext.fillText('USD/BRL', 256, 100);

            canvasContext.fillStyle = '#FFFFFF';
            canvasContext.font = 'bold 110px Source Han Sans SC, sans-serif';
            canvasContext.fillText('Loading...', 256, 260);
        }

        // Show retry status if needed (always at bottom)
        if (retryCount > 0) {
            canvasContext.fillStyle = '#CCCCCC';
            canvasContext.font = '50px Source Han Sans SC, sans-serif';
            canvasContext.fillText(`Retry ${retryCount}`, 256, 460);
        }

        // Update button display
        updateButtonDisplay();
    }

    /**
     * Render exchange rate on canvas with comprehensive error state handling
     * @param {number} rate - The exchange rate value
     * @param {Date} timestamp - When the rate was fetched
     */
    function renderRate(rate, timestamp) {
        if (!canvasContext || !allowSend) return;

        // Clear canvas with UlanziDeck standard background (512x512)
        canvasContext.fillStyle = '#282828';
        canvasContext.fillRect(0, 0, 512, 512);

        // Determine display state and colors
        const isStale = isDataStale(timestamp);
        const hasValidRate = rate !== null && rate !== undefined && !isNaN(rate);
        const isInErrorState = errorState !== false;
        const isOffline = false; // We don't have connectivity checking in simple API

        // Choose appropriate colors based on state
        let primaryColor = '#FFFFFF';  // Default white
        let secondaryColor = '#CCCCCC'; // Light gray for secondary text
        let accentColor = '#FF4444';   // Red for errors

        if (isInErrorState && !hasValidRate) {
            primaryColor = accentColor; // Red for critical errors
        } else if (isStale || isOffline) {
            primaryColor = '#FFAA00'; // Orange for warnings
        }

        if (hasValidRate) {
            // Display valid exchange rate data
            renderValidRateDisplay(rate, timestamp, isStale, isOffline, primaryColor, secondaryColor, accentColor);
        } else {
            // Display error state
            renderErrorStateDisplay(isOffline, primaryColor, secondaryColor, accentColor);
        }

        // Update button display
        updateButtonDisplay();
    }

    /**
     * Render display when we have valid rate data
     * @param {number} rate - The exchange rate value
     * @param {Date} timestamp - When the rate was fetched
     * @param {boolean} isStale - Whether data is stale
     * @param {boolean} isOffline - Whether we're offline
     * @param {string} primaryColor - Primary text color
     * @param {string} secondaryColor - Secondary text color
     * @param {string} accentColor - Accent color for warnings/errors
     */
    function renderValidRateDisplay(rate, timestamp, isStale, isOffline, primaryColor, secondaryColor, accentColor) {
        // Simple, clean display - 10% bigger than before (512x512)
        canvasContext.fillStyle = primaryColor;
        canvasContext.font = 'bold 200px Source Han Sans SC, sans-serif'; // 180px + 10% = 200px
        canvasContext.fillText(rate.toFixed(2), 256, 280);

        // Small currency label at top
        canvasContext.fillStyle = secondaryColor;
        canvasContext.font = '44px Source Han Sans SC, sans-serif'; // 40px + 10% = 44px
        canvasContext.fillText('USD/BRL', 256, 60);

        // Only show critical errors
        if (isOffline) {
            canvasContext.fillStyle = accentColor;
            canvasContext.font = '35px Source Han Sans SC, sans-serif';
            canvasContext.fillText('OFFLINE', 256, 400);
        }

    }

    /**
     * Render display when in error state (no valid data)
     * @param {boolean} isOffline - Whether we're offline
     * @param {string} primaryColor - Primary text color
     * @param {string} secondaryColor - Secondary text color
     * @param {string} accentColor - Accent color for warnings/errors
     */
    function renderErrorStateDisplay(isOffline, primaryColor, secondaryColor, accentColor) {
        // Draw error icon (simple exclamation mark)
        canvasContext.fillStyle = accentColor;
        canvasContext.font = 'bold 16px Source Han Sans SC, sans-serif';
        canvasContext.fillText('!', 36, 20);

        // Determine primary error message
        let errorMessage = 'Error';
        let detailMessage = '';

        if (isOffline) {
            errorMessage = 'Offline';
            detailMessage = 'No connection';
        } else if (typeof errorState === 'string' && errorState !== 'true' && errorState !== 'false') {
            // Parse specific error messages
            const errorText = errorState.toLowerCase();
            if (errorText.includes('timeout')) {
                errorMessage = 'Timeout';
                detailMessage = 'Request timed out';
            } else if (errorText.includes('network')) {
                errorMessage = 'Network';
                detailMessage = 'Connection failed';
            } else if (errorText.includes('rate limit')) {
                errorMessage = 'Rate Limit';
                detailMessage = 'API limit exceeded';
            } else if (errorText.includes('server')) {
                errorMessage = 'Server Error';
                detailMessage = 'API unavailable';
            } else {
                errorMessage = 'API Error';
                detailMessage = errorState.length > 12 ? errorState.substring(0, 12) + '...' : errorState;
            }
        } else {
            detailMessage = 'No data available';
        }

        const currentFontSize = getFontSize();

        if (currentFontSize === 'large') {
            // Large font error display (512x512)
            canvasContext.fillStyle = primaryColor;
            canvasContext.font = 'bold 200px Source Han Sans SC, sans-serif';
            canvasContext.fillText(errorMessage, 256, 300);

            if (detailMessage) {
                canvasContext.fillStyle = secondaryColor;
                canvasContext.font = '50px Source Han Sans SC, sans-serif';
                canvasContext.fillText(detailMessage, 256, 460);
            }
        } else if (currentFontSize === 'medium') {
            // Medium font error display (512x512)
            canvasContext.fillStyle = primaryColor;
            canvasContext.font = 'bold 140px Source Han Sans SC, sans-serif';
            canvasContext.fillText(errorMessage, 256, 300);

            if (detailMessage) {
                canvasContext.fillStyle = secondaryColor;
                canvasContext.font = '55px Source Han Sans SC, sans-serif';
                canvasContext.fillText(detailMessage, 256, 420);
            }
        } else {
            // Small font error display (512x512)
            canvasContext.fillStyle = primaryColor;
            canvasContext.font = 'bold 110px Source Han Sans SC, sans-serif';
            canvasContext.fillText(errorMessage, 256, 280);

            if (detailMessage) {
                canvasContext.fillStyle = secondaryColor;
                canvasContext.font = '55px Source Han Sans SC, sans-serif';
                canvasContext.fillText(detailMessage, 256, 380);
            }
        }

        // Show retry information if available (always at bottom)
        if (retryCount > 0) {
            canvasContext.fillStyle = secondaryColor;
            canvasContext.font = '40px Source Han Sans SC, sans-serif';
            canvasContext.fillText(`Retry ${retryCount}`, 256, 480);
        }
    }

    /**
     * Check if data is stale (older than 2x refresh interval)
     * @param {Date} timestamp - The timestamp to check
     * @returns {boolean} True if data is stale
     */
    function isDataStale(timestamp) {
        if (!timestamp) return true;

        const now = new Date();
        const staleThreshold = refreshInterval * 2 * 60 * 1000; // 2x refresh interval in ms
        const age = now - timestamp;

        // Consider data stale if:
        // 1. It's older than 2x the refresh interval
        // 2. It's older than 30 minutes (absolute maximum)
        // 3. We're offline and data is older than 5 minutes
        const maxAge = Math.min(staleThreshold, 30 * 60 * 1000); // Max 30 minutes
        const offlineMaxAge = 5 * 60 * 1000; // 5 minutes when offline

        // Always use normal max age since we don't have connectivity checking
        // if (!CurrencyAPI.getConnectivityStatus()) {
        //     return age > offlineMaxAge;
        // }

        return age > maxAge;
    }

    /**
     * Get a human-readable description of the data age
     * @param {Date} timestamp - The timestamp to describe
     * @returns {string} Description of data age
     */
    function getDataAgeDescription(timestamp) {
        if (!timestamp) return 'No data';

        const now = new Date();
        const ageMs = now - timestamp;
        const ageMinutes = Math.floor(ageMs / (60 * 1000));
        const ageHours = Math.floor(ageMinutes / 60);

        if (ageMinutes < 1) {
            return 'Just now';
        } else if (ageMinutes < 60) {
            return `${ageMinutes}m ago`;
        } else if (ageHours < 24) {
            return `${ageHours}h ago`;
        } else {
            return 'Very old';
        }
    }

    /**
     * Update the button display with current canvas content
     */
    function updateButtonDisplay() {
        if (!canvas || !allowSend) return;

        try {
            const imageData = canvas.toDataURL('image/png');
            $UD.setBaseDataIcon(context, imageData, '');
        } catch (error) {
            console.error('Failed to update button display:', error);
        }
    }

    /**
     * Set the active state of the display
     * Optimizes API calls by pausing/resuming refresh based on button visibility
     * @param {boolean} active - Whether the button is active
     */
    function setActive(active) {
        const wasActive = isActive;
        isActive = active && active.toString() === "true";
        allowSend = isActive;

        console.log(`Setting active state for context ${context}: ${wasActive} -> ${isActive}`);

        if (isActive && !wasActive) {
            // Button became active - resume operations
            console.log(`Button became active for context ${context} - resuming refresh`);

            // Restore display with current data
            if (currentRate !== null) {
                renderRate(currentRate, lastUpdate);
            } else {
                renderLoadingState();
            }

            // Resume refresh timer if it was stopped
            if (refreshTimer === 0) {
                startRefreshTimer();
            }

            // If data is stale or we're in error state, trigger immediate refresh
            const shouldRefreshImmediately =
                currentRate === null ||
                errorState !== false ||
                (lastUpdate && isDataStale(lastUpdate));

            if (shouldRefreshImmediately) {
                console.log(`Triggering immediate refresh on activation - stale data or error state`);
                // Small delay to ensure display is ready
                setTimeout(() => {
                    triggerRefresh();
                }, 100);
            }

        } else if (!isActive && wasActive) {
            // Button became inactive - pause operations to optimize performance
            console.log(`Button became inactive for context ${context} - pausing refresh`);

            // Stop refresh timer to save resources
            stopRefreshTimer();

            // Stop recovery timer as well since we don't need to recover when inactive
            stopRecoveryTimer();

            // Note: We keep the current data in memory so we can restore it quickly
            // when the button becomes active again
        }

        // Log current state for debugging
        console.log(`Active state updated for context ${context}:`, {
            isActive: isActive,
            hasCurrentRate: currentRate !== null,
            lastUpdate: lastUpdate ? lastUpdate.toISOString() : null,
            errorState: errorState,
            refreshTimerRunning: refreshTimer !== 0,
            recoveryTimerRunning: recoveryTimer !== 0
        });
    }

    /**
     * Set the refresh interval in minutes
     * Respects active state when restarting timer
     * @param {number} minutes - Refresh interval in minutes
     */
    function setRefreshInterval(minutes) {
        const newInterval = parseFloat(minutes) || 5;
        if (newInterval !== refreshInterval) {
            const oldInterval = refreshInterval;
            refreshInterval = newInterval;

            console.log(`Refresh interval changed for context ${context}: ${oldInterval} -> ${newInterval} minutes`);

            // Restart timer with new interval if currently running and button is active
            if (refreshTimer !== 0) {
                stopRefreshTimer();
                // Only restart if button is active
                if (isActive) {
                    startRefreshTimer();
                } else {
                    console.log(`Not restarting timer for context ${context} - button is inactive`);
                }
            } else if (isActive) {
                // Timer wasn't running but button is active - start it
                console.log(`Starting timer for context ${context} after interval change - button is active`);
                startRefreshTimer();
            }
        }
    }

    /**
     * Start the automatic refresh timer
     * Only starts if button is active to optimize API usage
     * Triggers immediate refresh and then sets up interval
     */
    function startRefreshTimer() {
        // Don't start timer if button is not active (optimization)
        if (!isActive) {
            console.log(`Skipping refresh timer start for context ${context} - button is inactive`);
            return;
        }

        if (refreshTimer !== 0) {
            stopRefreshTimer();
        }

        console.log(`Starting refresh timer for context ${context} with ${refreshInterval} minute interval`);

        // Trigger immediate refresh on initialization
        triggerRefresh();

        // Convert minutes to milliseconds
        const intervalMs = refreshInterval * 60 * 1000;

        refreshTimer = setInterval(function () {
            // Double-check active state before each refresh (safety check)
            if (isActive) {
                triggerRefresh();
            } else {
                // If button became inactive, stop the timer
                console.log(`Button became inactive during timer execution - stopping refresh for context ${context}`);
                stopRefreshTimer();
            }
        }, intervalMs);

        console.log(`Refresh timer started for context ${context} - next refresh in ${refreshInterval} minutes`);
    }

    /**
     * Trigger a refresh of the exchange rate with comprehensive error handling
     * Calls the CurrencyAPI with enhanced error handling and recovery
     */
    function triggerRefresh() {
        if (!isActive) {
            console.log('Skipping refresh - display is not active');
            return;
        }

        console.log(`Triggering exchange rate refresh for context: ${context} (attempt ${retryCount + 1})`);

        // Show loading state during refresh if we have no current data
        if (currentRate === null && errorState === false) {
            renderLoadingState();
        }

        // Call the simple API function
        console.log('*** USING SIMPLE API ***');
        fetchUSDToBRL().then(response => {
            if (response.success && response.rate !== null && !isNaN(response.rate)) {
                console.log('Exchange rate fetched successfully:', response.rate);
                updateRate(response.rate, response.timestamp, false);

                // Reset retry count on success
                retryCount = 0;
            } else {
                console.error('Failed to fetch exchange rate:', response.error || 'Unknown error');
                const errorMessage = response.error ?
                    CurrencyAPI.handleAPIErrorWithConnectivity(new Error(response.error)) :
                    'API request failed';
                updateRate(null, new Date(), true, errorMessage);
            }
        }).catch(error => {
            console.error('Exchange rate fetch error:', error);
            const errorMessage = error.message || 'API request failed';
            updateRate(null, new Date(), true, errorMessage);
        });
    }

    /**
     * Stop the automatic refresh timer
     * Ensures proper cleanup to prevent memory leaks
     */
    function stopRefreshTimer() {
        if (refreshTimer !== 0) {
            try {
                clearInterval(refreshTimer);
                console.log('Refresh timer cleared for context:', context);
            } catch (error) {
                console.warn('Error clearing refresh timer:', error);
            }
            refreshTimer = 0;
        }
    }

    /**
     * Update the current rate and refresh display with comprehensive error handling
     * @param {number} rate - The new exchange rate
     * @param {Date} timestamp - When the rate was fetched
     * @param {boolean} hasError - Whether there was an error fetching
     * @param {string} errorMessage - Optional error message for display
     */
    function updateRate(rate, timestamp, hasError = false, errorMessage = null) {
        const previousRate = currentRate;
        const previousErrorState = errorState;

        // Validate rate data
        if (rate !== null && rate !== undefined) {
            if (typeof rate !== 'number' || isNaN(rate) || rate <= 0) {
                console.warn('Invalid rate data received:', rate);
                hasError = true;
                errorMessage = errorMessage || 'Invalid rate data';
                rate = null;
            }
        }

        // Update rate only if we have valid new data or this is the first update
        if (rate !== null && !hasError) {
            currentRate = rate;
            lastUpdate = timestamp || new Date();
            errorState = false;
            retryCount = 0; // Reset retry count on successful update

            console.log(`Rate updated successfully: ${rate} at ${lastUpdate.toISOString()}`);
        } else {
            // Handle error cases
            if (hasError) {
                retryCount = Math.min(retryCount + 1, CurrencyAPI.MAX_RETRIES + 1);

                // Store detailed error information
                if (errorMessage) {
                    errorState = errorMessage;
                } else {
                    errorState = 'Update failed';
                }

                // Update timestamp to track when the error occurred
                lastUpdate = timestamp || new Date();

                console.warn(`Rate update failed (attempt ${retryCount}): ${errorState}`);

                // If we have no previous rate data, this is a critical error
                if (currentRate === null) {
                    console.error('No fallback rate data available');
                }
            }
        }

        // Log state changes for debugging
        if (previousErrorState !== errorState) {
            if (errorState === false) {
                console.log('Error state cleared - rate update successful');
            } else {
                console.log('Entered error state:', errorState);
            }
        }

        // Always render the current state
        renderRate(currentRate, lastUpdate);

        // Trigger recovery actions if needed
        handleErrorRecovery(hasError, errorMessage);
    }

    /**
     * Handle error recovery actions based on error type
     * @param {boolean} hasError - Whether there was an error
     * @param {string} errorMessage - The error message
     */
    function handleErrorRecovery(hasError, errorMessage) {
        if (!hasError) {
            // Clear any recovery timers on successful update
            stopRecoveryTimer();
            return;
        }

        const errorText = (errorMessage || '').toLowerCase();

        // Handle specific error types
        if (errorText.includes('network') || errorText.includes('offline')) {
            // Network errors - start connectivity monitoring
            if (!recoveryTimer) {
                console.log('Network error detected - starting recovery monitoring');
                startRecoveryTimer();
            }
        } else if (errorText.includes('rate limit')) {
            // Rate limiting - extend refresh interval temporarily
            console.log('Rate limit detected - extending refresh interval');
            const originalInterval = refreshInterval;
            setRefreshInterval(Math.min(refreshInterval * 2, 30)); // Double interval, max 30 minutes

            // Reset to original interval after 1 hour
            setTimeout(() => {
                if (refreshInterval > originalInterval) {
                    console.log('Resetting refresh interval after rate limit recovery');
                    setRefreshInterval(originalInterval);
                }
            }, 60 * 60 * 1000); // 1 hour
        } else if (errorText.includes('timeout')) {
            // Timeout errors - might indicate slow network, be more patient
            console.log('Timeout error detected - will retry with normal interval');
        } else if (errorText.includes('server') || errorText.includes('5')) {
            // Server errors - back off more aggressively
            console.log('Server error detected - backing off');
            if (!recoveryTimer) {
                startRecoveryTimer();
            }
        }

        // If we've exceeded max retries, enter degraded mode
        if (retryCount > CurrencyAPI.MAX_RETRIES) {
            enterDegradedMode();
        }
    }

    /**
     * Enter degraded mode when all retry attempts have failed
     * Only starts degraded mode recovery if button is active
     */
    function enterDegradedMode() {
        console.log(`Entering degraded mode for context ${context} - all retry attempts failed`);

        // Stop normal refresh timer
        stopRefreshTimer();

        // Start a slower recovery timer (every 5 minutes) only if active
        if (recoveryTimer) {
            stopRecoveryTimer();
        }

        // Don't start degraded mode recovery if button is inactive
        if (!isActive) {
            console.log(`Not starting degraded mode recovery for context ${context} - button is inactive`);
            return;
        }

        console.log(`Starting degraded mode recovery timer for context ${context}`);

        recoveryTimer = setInterval(function () {
            // Double-check active state before each degraded mode recovery attempt
            if (!isActive) {
                console.log(`Button became inactive during degraded mode - stopping recovery for context ${context}`);
                stopRecoveryTimer();
                return;
            }

            console.log(`Degraded mode recovery attempt for context ${context}`);

            // Reset retry count for recovery attempt
            const originalRetryCount = retryCount;
            retryCount = 0;

            // Try to fetch data
            triggerRefresh();

            // If still failing after this attempt, restore retry count
            setTimeout(() => {
                if (errorState !== false) {
                    retryCount = originalRetryCount;
                }
            }, 10000); // Wait 10 seconds to see if the refresh succeeded

        }, 5 * 60 * 1000); // Every 5 minutes in degraded mode
    }

    /**
     * Exit degraded mode and resume normal operation
     * Only resumes normal refresh timer if button is active
     */
    function exitDegradedMode() {
        console.log(`Exiting degraded mode for context ${context} - resuming normal operation`);

        stopRecoveryTimer();
        retryCount = 0;

        // Resume normal refresh timer only if button is active
        if (isActive) {
            console.log(`Resuming normal refresh timer for context ${context} - button is active`);
            startRefreshTimer();
        } else {
            console.log(`Not resuming refresh timer for context ${context} - button is inactive`);
        }
    }

    /**
     * Get the current rate value
     * @returns {number|null} The current exchange rate
     */
    function getCurrentRate() {
        return currentRate;
    }

    /**
     * Get the last update timestamp
     * @returns {Date|null} The last update timestamp
     */
    function getLastUpdate() {
        return lastUpdate;
    }

    /**
     * Get the current refresh interval
     * @returns {number} Refresh interval in minutes
     */
    function getRefreshInterval() {
        return refreshInterval;
    }

    /**
     * Get the current font size setting (simplified - always returns 'large')
     * @returns {string} Font size ('large')
     */
    function getFontSize() {
        return 'large';
    }

    /**
     * Set the font size for display
     * @param {string} size - Font size ('small', 'medium', 'large')
     */
    function setFontSize(size) {
        const validSizes = ['small', 'medium', 'large'];
        const newSize = validSizes.includes(size) ? size : 'large';

        if (newSize !== fontSize) {
            const oldSize = fontSize;
            fontSize = newSize;

            console.log(`Font size changed for context ${context}: ${oldSize} -> ${newSize}`);

            // Re-render with new font size if we have current data
            if (currentRate !== null) {
                renderRate(currentRate, lastUpdate);
            } else if (errorState !== false) {
                renderRate(null, lastUpdate);
            } else {
                renderLoadingState();
            }
        }
    }

    /**
     * Check if the display is currently active
     * @returns {boolean} True if active
     */
    function getIsActive() {
        return isActive;
    }

    /**
     * Get the current error state
     * @returns {boolean} True if in error state
     */
    function getErrorState() {
        return errorState;
    }

    /**
     * Set up connectivity monitoring for automatic recovery
     */
    function setupConnectivityMonitoring() {
        // Create connectivity change listener
        connectivityListener = function (isOnline) {
            console.log('Connectivity changed for context:', context, 'online:', isOnline, 'active:', isActive);

            const wasOffline = !lastConnectivityStatus;
            lastConnectivityStatus = isOnline;

            if (isOnline && wasOffline) {
                // Connectivity restored - trigger immediate recovery only if active
                if (isActive) {
                    console.log('Network connectivity restored and button is active - triggering recovery refresh');
                    stopRecoveryTimer(); // Stop any existing recovery attempts

                    // Trigger immediate refresh when connectivity is restored
                    setTimeout(() => {
                        triggerRefresh();
                    }, 1000); // Small delay to ensure connection is stable
                } else {
                    console.log('Network connectivity restored but button is inactive - not triggering refresh');
                    stopRecoveryTimer(); // Still stop recovery timer to clean up
                }
            } else if (!isOnline) {
                // Connectivity lost - start recovery monitoring only if active
                if (isActive) {
                    console.log('Network connectivity lost and button is active - starting recovery monitoring');
                    startRecoveryTimer();
                } else {
                    console.log('Network connectivity lost but button is inactive - not starting recovery monitoring');
                }
            }
        };

        // Register the listener with CurrencyAPI
        if (typeof CurrencyAPI !== 'undefined' && CurrencyAPI.addConnectivityListener) {
            CurrencyAPI.addConnectivityListener(connectivityListener);
            lastConnectivityStatus = CurrencyAPI.getConnectivityStatus();
        }
    }

    /**
     * Start recovery timer for automatic retry when offline
     * Only starts if button is active to optimize resource usage
     */
    function startRecoveryTimer() {
        // Don't start recovery timer if button is not active
        if (!isActive) {
            console.log(`Skipping recovery timer start for context ${context} - button is inactive`);
            return;
        }

        if (recoveryTimer !== 0) {
            stopRecoveryTimer();
        }

        console.log(`Starting recovery timer for context ${context}`);

        // Try to recover every 30 seconds when offline
        recoveryTimer = setInterval(function () {
            // Double-check active state before each recovery attempt
            if (!isActive) {
                console.log(`Button became inactive during recovery - stopping recovery timer for context ${context}`);
                stopRecoveryTimer();
                return;
            }

            console.log('Attempting recovery refresh for context:', context);

            // Check if we can make a request (this will also update connectivity status)
            if (typeof CurrencyAPI !== 'undefined') {
                CurrencyAPI.checkConnectivity().then(isOnline => {
                    if (isOnline && isActive) { // Double-check active state
                        console.log('Connectivity restored during recovery check - triggering refresh');
                        triggerRefresh();
                        stopRecoveryTimer(); // Stop recovery timer since we're back online
                    }
                });
            }
        }, 30000); // 30 seconds
    }

    /**
     * Stop recovery timer
     * Ensures proper cleanup to prevent memory leaks
     */
    function stopRecoveryTimer() {
        if (recoveryTimer !== 0) {
            try {
                clearInterval(recoveryTimer);
                console.log('Recovery timer cleared for context:', context);
            } catch (error) {
                console.warn('Error clearing recovery timer:', error);
            }
            recoveryTimer = 0;
        }
    }

    /**
     * Destroy the display instance and clean up resources
     * Ensures complete cleanup to prevent memory leaks
     */
    function destroy() {
        console.log('Destroying ExchangeRateDisplay instance for context:', context);

        // Stop all timers first to prevent any further execution
        stopRefreshTimer();
        stopRecoveryTimer();

        // Remove connectivity listener to prevent callback execution
        if (connectivityListener && typeof CurrencyAPI !== 'undefined' && CurrencyAPI.removeConnectivityListener) {
            try {
                CurrencyAPI.removeConnectivityListener(connectivityListener);
                console.log('Connectivity listener removed for context:', context);
            } catch (error) {
                console.warn('Error removing connectivity listener:', error);
            }
        }

        // Clear canvas and context references
        if (canvasContext) {
            try {
                // Clear any pending canvas operations
                canvasContext.clearRect(0, 0, 72, 72);
            } catch (error) {
                console.warn('Error clearing canvas context:', error);
            }
            canvasContext = null;
        }

        if (canvas) {
            // Remove canvas from DOM if it was added
            if (canvas.parentNode) {
                canvas.parentNode.removeChild(canvas);
            }
            canvas = null;
        }

        // Clear all state variables to prevent memory leaks
        currentRate = null;
        lastUpdate = null;
        allowSend = false;
        connectivityListener = null;
        errorState = false;
        retryCount = 0;

        // Clear the context reference to break any circular references
        context = null;

        console.log('ExchangeRateDisplay instance destroyed and cleaned up');
    }

    // Initialize the display
    initialize();

    // Return public interface
    return {
        // Core methods
        renderRate: renderRate,
        updateRate: updateRate,
        setActive: setActive,
        setRefreshInterval: setRefreshInterval,
        startRefreshTimer: startRefreshTimer,
        stopRefreshTimer: stopRefreshTimer,
        triggerRefresh: triggerRefresh,
        destroy: destroy,

        // Getters
        getCurrentRate: getCurrentRate,
        getLastUpdate: getLastUpdate,
        getRefreshInterval: getRefreshInterval,
        getFontSize: getFontSize,
        setFontSize: setFontSize,
        getIsActive: getIsActive,
        getErrorState: getErrorState,

        // Network recovery methods
        setupConnectivityMonitoring: setupConnectivityMonitoring,
        startRecoveryTimer: startRecoveryTimer,
        stopRecoveryTimer: stopRecoveryTimer,

        // Error handling methods
        handleErrorRecovery: handleErrorRecovery,
        enterDegradedMode: enterDegradedMode,
        exitDegradedMode: exitDegradedMode,

        // Utility methods
        isDataStale: isDataStale,
        getDataAgeDescription: getDataAgeDescription,

        // Properties for debugging/testing
        context: context,
        canvas: canvas
    };
}