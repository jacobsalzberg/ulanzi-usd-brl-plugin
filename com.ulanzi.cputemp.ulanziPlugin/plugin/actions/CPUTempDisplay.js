/**
 * CPUTempDisplay - Core class for CPU temperature display
 * Based on the working ExchangeRateDisplay but adapted for temperature monitoring
 */
function CPUTempDisplay(ctx) {
    var context = ctx,
        canvas = null,
        canvasContext = null,
        currentTemp = null,
        lastUpdate = null,
        refreshTimer = 0,
        refreshInterval = 10, // 10 seconds for temperature monitoring

        isActive = true,
        retryCount = 0,
        errorState = false,
        allowSend = true;

    /**
     * Initialize the CPU temperature display
     */
    function initialize() {
        // Create 512x512px canvas for button display
        canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        canvasContext = canvas.getContext('2d');

        // Set up canvas rendering properties
        setupCanvasStyle();

        // Render initial loading state
        renderLoadingState();

        // Start automatic refresh timer
        startRefreshTimer();
    }

    /**
     * Set up canvas styling
     */
    function setupCanvasStyle() {
        if (!canvasContext) return;

        canvasContext.font = '12px Source Han Sans SC, sans-serif';
        canvasContext.textAlign = 'center';
        canvasContext.textBaseline = 'middle';
        canvasContext.fillStyle = '#FFFFFF';
        canvasContext.strokeStyle = '#FFFFFF';
    }

    /**
     * Render loading state
     */
    function renderLoadingState() {
        if (!canvasContext || !allowSend) return;

        // Clear canvas
        canvasContext.fillStyle = '#282828';
        canvasContext.fillRect(0, 0, 512, 512);

        // Show loading text
        canvasContext.fillStyle = '#FFFFFF';
        canvasContext.font = 'bold 140px Source Han Sans SC, sans-serif';
        canvasContext.fillText('Loading...', 256, 300);

        canvasContext.fillStyle = '#CCCCCC';
        canvasContext.font = '60px Source Han Sans SC, sans-serif';
        canvasContext.fillText('CPU TEMP', 256, 80);

        updateButtonDisplay();
    }

    /**
     * Render CPU temperature
     */
    function renderTemperature(temp, timestamp) {
        if (!canvasContext || !allowSend) return;

        // Clear canvas
        canvasContext.fillStyle = '#282828';
        canvasContext.fillRect(0, 0, 512, 512);

        const hasValidTemp = temp !== null && temp !== undefined && !isNaN(temp);

        if (hasValidTemp) {
            // Choose color based on temperature
            let tempColor = '#00FF00'; // Green for cool
            if (temp > 70) tempColor = '#FFAA00'; // Orange for warm
            if (temp > 85) tempColor = '#FF4444'; // Red for hot

            // Display temperature
            canvasContext.fillStyle = tempColor;
            canvasContext.font = 'bold 200px Source Han Sans SC, sans-serif';
            canvasContext.fillText(temp + '°C', 256, 300);

            // Small CPU label at top
            canvasContext.fillStyle = '#CCCCCC';
            canvasContext.font = '44px Source Han Sans SC, sans-serif';
            canvasContext.fillText('CPU TEMP', 256, 80);

            // Show source at bottom
            canvasContext.fillStyle = '#888888';
            canvasContext.font = '30px Source Han Sans SC, sans-serif';
            canvasContext.fillText('14700K', 256, 450);

        } else {
            // Error state
            canvasContext.fillStyle = '#FF4444';
            canvasContext.font = 'bold 140px Source Han Sans SC, sans-serif';
            canvasContext.fillText('Error', 256, 300);

            canvasContext.fillStyle = '#CCCCCC';
            canvasContext.font = '50px Source Han Sans SC, sans-serif';
            canvasContext.fillText('No temp data', 256, 400);
        }

        updateButtonDisplay();
    }

    /**
     * Update the button display
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
     * Start the refresh timer
     */
    function startRefreshTimer() {
        if (!isActive) return;

        if (refreshTimer !== 0) {
            stopRefreshTimer();
        }

        console.log(`Starting CPU temp refresh timer with ${refreshInterval} second interval`);

        // Trigger immediate refresh
        triggerRefresh();

        // Set up interval
        const intervalMs = refreshInterval * 1000;
        refreshTimer = setInterval(function () {
            if (isActive) {
                triggerRefresh();
            } else {
                stopRefreshTimer();
            }
        }, intervalMs);
    }

    /**
     * Trigger a temperature refresh
     */
    function triggerRefresh() {
        if (!isActive) return;

        console.log('*** FETCHING CPU TEMPERATURE ***');
        
        fetchCPUTemperature().then(response => {
            if (response.success && response.temperature !== null && !isNaN(response.temperature)) {
                console.log('CPU temperature fetched successfully:', response.temperature + '°C');
                updateTemperature(response.temperature, response.timestamp, false);
            } else {
                console.error('Failed to fetch CPU temperature:', response.error || 'Unknown error');
                updateTemperature(null, new Date(), true, response.error || 'Fetch failed');
            }
        }).catch(error => {
            console.error('CPU temperature fetch error:', error);
            updateTemperature(null, new Date(), true, error.message || 'Request failed');
        });
    }

    /**
     * Update the current temperature
     */
    function updateTemperature(temp, timestamp, hasError = false, errorMessage = null) {
        if (temp !== null && !hasError) {
            currentTemp = temp;
            lastUpdate = timestamp || new Date();
            errorState = false;
            retryCount = 0;
            console.log(`Temperature updated successfully: ${temp}°C at ${lastUpdate.toISOString()}`);
        } else {
            if (hasError) {
                retryCount = Math.min(retryCount + 1, 5);
                errorState = errorMessage || 'Update failed';
                lastUpdate = timestamp || new Date();
                console.warn(`Temperature update failed (attempt ${retryCount}): ${errorState}`);
            }
        }

        renderTemperature(currentTemp, lastUpdate);
    }

    /**
     * Stop the refresh timer
     */
    function stopRefreshTimer() {
        if (refreshTimer !== 0) {
            clearInterval(refreshTimer);
            refreshTimer = 0;
        }
    }

    /**
     * Set active state
     */
    function setActive(active) {
        const wasActive = isActive;
        isActive = active && active.toString() === "true";
        allowSend = isActive;

        console.log(`Setting CPU temp active state: ${wasActive} -> ${isActive}`);

        if (isActive && !wasActive) {
            if (currentTemp !== null) {
                renderTemperature(currentTemp, lastUpdate);
            } else {
                renderLoadingState();
            }
            if (refreshTimer === 0) {
                startRefreshTimer();
            }
        } else if (!isActive && wasActive) {
            stopRefreshTimer();
        }
    }

    /**
     * Set refresh interval
     */
    function setRefreshInterval(seconds) {
        const newInterval = parseFloat(seconds) || 10;
        if (newInterval !== refreshInterval) {
            refreshInterval = newInterval;
            if (refreshTimer !== 0) {
                stopRefreshTimer();
                if (isActive) {
                    startRefreshTimer();
                }
            }
        }
    }

    // Public interface
    return {
        initialize: initialize,
        setActive: setActive,
        setRefreshInterval: setRefreshInterval,
        getCurrentTemp: function() { return currentTemp; },
        getLastUpdate: function() { return lastUpdate; }
    };
}