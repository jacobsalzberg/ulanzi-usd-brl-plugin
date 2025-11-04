/**
 * USD to BRL Exchange Rate Plugin - Main Service
 * Handles UlanziDeck events and manages ExchangeRateDisplay instances
 */

// Cache for storing active plugin instances
const ACTION_CACHES = {};

// Track instance creation for memory leak detection
const INSTANCE_STATS = {
    created: 0,
    destroyed: 0,
    maxConcurrent: 0,
    createdAt: new Date()
};

/**
 * Get current instance statistics for debugging
 * @returns {Object} Instance statistics
 */
function getInstanceStats() {
    const currentCount = Object.keys(ACTION_CACHES).length;
    return {
        ...INSTANCE_STATS,
        currentActive: currentCount,
        contexts: Object.keys(ACTION_CACHES)
    };
}

/**
 * Log instance statistics for monitoring
 */
function logInstanceStats() {
    const stats = getInstanceStats();
    console.log('Instance Statistics:', stats);
    
    // Warn if we have too many instances (potential memory leak)
    if (stats.currentActive > 10) {
        console.warn('High number of active instances detected:', stats.currentActive);
        console.warn('Active contexts:', stats.contexts);
    }
}

// Connect to UlanziDeck with plugin UUID
$UD.connect('com.ulanzi.ulanzideck.usdbrlex');

// Handle successful connection to UlanziDeck
$UD.onConnected(conn => {
    console.log('USD/BRL Exchange Rate plugin connected to UlanziDeck');
});

/**
 * Handle adding plugin to a deck button
 * Creates new ExchangeRateDisplay instance and applies settings
 */
$UD.onAdd(jsn => {
    const context = jsn.context; // Unique button identifier
    console.log('Adding USD/BRL exchange rate to context:', context);
    
    // Check if instance already exists
    const existingInstance = ACTION_CACHES[context];
    if (!existingInstance) {
        try {
            // Create new ExchangeRateDisplay instance
            ACTION_CACHES[context] = new ExchangeRateDisplay(context);
            
            // Update instance statistics
            INSTANCE_STATS.created++;
            const currentCount = Object.keys(ACTION_CACHES).length;
            INSTANCE_STATS.maxConcurrent = Math.max(INSTANCE_STATS.maxConcurrent, currentCount);
            
            console.log('Created new ExchangeRateDisplay instance for context:', context);
            logInstanceStats();
            
            // Apply stored settings (this handles both new and restored settings)
            // The jsn.param will contain previously saved settings if they exist
            onSetSettings(jsn);
            
            console.log('ExchangeRateDisplay instance initialized with settings for context:', context);
        } catch (error) {
            console.error('Failed to create ExchangeRateDisplay instance for context:', context, error);
            
            // Clean up any partial instance that might have been created
            if (ACTION_CACHES[context]) {
                cleanupInstance(context);
            }
        }
    } else {
        // Instance exists, apply any updated settings and trigger refresh
        console.log('ExchangeRateDisplay instance already exists for context:', context);
        
        // Validate that the existing instance is still functional
        if (typeof existingInstance.triggerRefresh !== 'function') {
            console.warn('Existing instance appears corrupted, recreating for context:', context);
            cleanupInstance(context);
            
            // Recursively call onAdd to recreate the instance
            $UD.onAdd(jsn);
            return;
        }
        
        // Apply settings in case they were updated
        if (jsn.param) {
            onSetSettings(jsn);
        }
        
        // Trigger a refresh to show current data
        try {
            existingInstance.triggerRefresh();
        } catch (error) {
            console.error('Error triggering refresh on existing instance:', context, error);
            
            // If the instance is broken, recreate it
            cleanupInstance(context);
            $UD.onAdd(jsn);
        }
    }
});

/**
 * Handle setting active state for plugin button
 * Manages refresh timer based on button visibility
 */
$UD.onSetActive(jsn => {
    const context = jsn.context;
    const instance = ACTION_CACHES[context];
    
    if (instance) {
        console.log('Setting active state for context:', context, 'active:', jsn.active);
        instance.setActive(jsn.active);
    }
});

/**
 * Handle button press events
 * For exchange rate display, this triggers an immediate refresh
 */
$UD.onRun(jsn => {
    const context = jsn.context;
    const instance = ACTION_CACHES[context];
    
    if (!instance) {
        // Instance doesn't exist, trigger add event
        $UD.emit('add', jsn);
    } else {
        // Trigger immediate refresh on button press
        console.log('Manual refresh triggered for context:', context);
        instance.triggerRefresh();
    }
});

/**
 * Handle removing plugin from deck buttons
 * Cleans up instances and prevents memory leaks
 */
$UD.onClear(jsn => {
    if (jsn.param) {
        for (let i = 0; i < jsn.param.length; i++) {
            const context = jsn.param[i].context;
            console.log('Clearing USD/BRL exchange rate from context:', context);
            
            // Clean up instance if it exists
            cleanupInstance(context);
        }
    }
});

/**
 * Handle settings changes from UlanziDeck app
 * Updates plugin configuration when changed through property inspector
 */
$UD.onParamFromApp(jsn => {
    console.log('Settings updated from app for context:', jsn.context);
    onSetSettings(jsn);
});

/**
 * Handle settings changes from plugin
 * Updates plugin configuration when changed programmatically
 */
$UD.onParamFromPlugin(jsn => {
    console.log('Settings updated from plugin for context:', jsn.context);
    onSetSettings(jsn);
});

/**
 * Apply settings to plugin instance
 * Handles refresh interval configuration and other settings
 * @param {Object} jsn - Settings object from UlanziDeck
 */
function onSetSettings(jsn) {
    const context = jsn.context;
    const instance = ACTION_CACHES[context];
    
    // Validate input parameters
    if (!jsn || !context) {
        console.error('Invalid settings object - missing context:', jsn);
        return;
    }
    
    // Get settings with proper fallback handling
    const settings = validateAndNormalizeSettings(jsn.param || {});
    
    console.log('Applying settings for context:', context, settings);
    
    // If instance doesn't exist yet, store settings for when it's created
    if (!instance) {
        console.log('Instance not found for context:', context, '- settings will be applied when instance is created');
        // Store settings in UlanziDeck for persistence
        $UD.setParam(context, settings);
        return;
    }
    
    // Apply settings to existing instance
    applySettingsToInstance(instance, settings, context);
    
    // Persist settings to UlanziDeck for future use
    $UD.setParam(context, settings);
    
    console.log('Settings successfully applied and persisted for context:', context);
}

/**
 * Validate and normalize settings object
 * Ensures all settings have valid values with proper defaults
 * @param {Object} settings - Raw settings object
 * @returns {Object} Validated and normalized settings
 */
function validateAndNormalizeSettings(settings) {
    const normalizedSettings = {};
    
    // Validate refresh interval setting
    const refreshInterval = settings.refresh_interval;
    const validIntervals = ['1', '5', '10', '30'];
    
    if (refreshInterval && validIntervals.includes(String(refreshInterval))) {
        normalizedSettings.refresh_interval = String(refreshInterval);
        console.log('Valid refresh interval found:', refreshInterval);
    } else {
        // Use default value for invalid or missing refresh interval
        normalizedSettings.refresh_interval = '5';
        if (refreshInterval) {
            console.warn('Invalid refresh interval:', refreshInterval, 'using default 5 minutes');
        } else {
            console.log('No refresh interval specified, using default 5 minutes');
        }
    }
    
    // Add validation for future settings here
    // Example:
    // if (settings.hasOwnProperty('future_setting')) {
    //     normalizedSettings.future_setting = validateFutureSetting(settings.future_setting);
    // }
    
    return normalizedSettings;
}

/**
 * Apply validated settings to a plugin instance
 * Handles immediate application of settings changes
 * @param {Object} instance - ExchangeRateDisplay instance
 * @param {Object} settings - Validated settings object
 * @param {string} context - Button context identifier
 */
function applySettingsToInstance(instance, settings, context) {
    const previousInterval = instance.getRefreshInterval();
    
    // Apply refresh interval setting
    if (settings.refresh_interval) {
        const newInterval = parseInt(settings.refresh_interval);
        console.log('Applying refresh interval change:', previousInterval, '->', newInterval, 'minutes');
        
        // Set the new refresh interval (this will restart the timer if needed)
        instance.setRefreshInterval(newInterval);
        
        // If the interval changed, trigger an immediate refresh to show responsiveness
        if (previousInterval !== newInterval) {
            console.log('Refresh interval changed - triggering immediate refresh for context:', context);
            instance.triggerRefresh();
        }
    }
    
    // Apply additional settings here as they are added
    // This provides a centralized place for all settings application logic
    
    // Log the final state after settings application
    console.log('Instance state after settings application:', {
        context: context,
        refreshInterval: instance.getRefreshInterval(),
        isActive: instance.getIsActive(),
        currentRate: instance.getCurrentRate(),
        lastUpdate: instance.getLastUpdate(),
        settingsApplied: settings
    });
}

/**
 * Retrieve and apply stored settings for a context
 * Used when creating new instances to restore previous settings
 * @param {string} context - Button context identifier
 * @param {Object} instance - ExchangeRateDisplay instance
 */
function applyStoredSettings(context, instance) {
    // This will be called by UlanziDeck automatically when the plugin is added
    // The onAdd event will include any previously stored settings
    console.log('Stored settings will be applied via onAdd event for context:', context);
}

/**
 * Get current settings for a specific context (for debugging)
 * @param {string} context - Button context identifier
 * @returns {Object|null} Current settings or null if instance doesn't exist
 */
function getCurrentSettings(context) {
    const instance = ACTION_CACHES[context];
    if (!instance) {
        console.log('No instance found for context:', context);
        return null;
    }
    
    return {
        refresh_interval: String(instance.getRefreshInterval()),
        isActive: instance.getIsActive(),
        currentRate: instance.getCurrentRate(),
        lastUpdate: instance.getLastUpdate(),
        errorState: instance.getErrorState()
    };
}

/**
 * Global error handler for unhandled plugin errors
 * Prevents plugin crashes from affecting UlanziDeck
 */
const globalErrorHandler = function(event) {
    console.error('USD/BRL Exchange Rate Plugin Error:', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error
    });
    
    // Prevent error from bubbling up to UlanziDeck
    event.preventDefault();
};

window.addEventListener('error', globalErrorHandler);

/**
 * Clean up a specific instance and remove it from cache
 * Centralized cleanup function to ensure consistent cleanup
 * @param {string} context - Button context identifier
 */
function cleanupInstance(context) {
    if (!context) {
        console.warn('Cannot cleanup instance - no context provided');
        return;
    }
    
    const instance = ACTION_CACHES[context];
    if (instance) {
        try {
            console.log('Cleaning up instance for context:', context);
            
            // Call destroy method to clean up resources
            if (typeof instance.destroy === 'function') {
                instance.destroy();
            } else {
                console.warn('Instance does not have destroy method:', context);
            }
            
            // Remove from cache
            delete ACTION_CACHES[context];
            
            // Update instance statistics
            INSTANCE_STATS.destroyed++;
            
            console.log('Instance successfully cleaned up for context:', context);
            logInstanceStats();
        } catch (error) {
            console.error('Error during instance cleanup for context:', context, error);
            
            // Force removal from cache even if cleanup failed
            delete ACTION_CACHES[context];
            INSTANCE_STATS.destroyed++;
        }
    } else {
        console.log('No instance found to cleanup for context:', context);
    }
}

/**
 * Clean up all instances
 * Used during plugin shutdown or emergency cleanup
 */
function cleanupAllInstances() {
    console.log('Cleaning up all USD/BRL Exchange Rate plugin instances');
    
    const contexts = Object.keys(ACTION_CACHES);
    let cleanedCount = 0;
    let errorCount = 0;
    
    contexts.forEach(context => {
        try {
            cleanupInstance(context);
            cleanedCount++;
        } catch (error) {
            console.error('Failed to cleanup instance:', context, error);
            errorCount++;
        }
    });
    
    // Clear the entire cache as a safety measure
    Object.keys(ACTION_CACHES).forEach(key => {
        delete ACTION_CACHES[key];
    });
    
    console.log(`Cleanup complete: ${cleanedCount} instances cleaned, ${errorCount} errors`);
}

/**
 * Handle plugin unload/cleanup
 * Ensures all instances are properly destroyed
 */
const beforeUnloadHandler = function() {
    console.log('USD/BRL Exchange Rate plugin unloading - cleaning up instances');
    cleanupHealthCheck();
    cleanupAllInstances();
    cleanupEventListeners();
};

window.addEventListener('beforeunload', beforeUnloadHandler);

/**
 * Periodic memory and instance health check
 * Runs every 5 minutes to detect potential memory leaks
 */
let healthCheckInterval = setInterval(function() {
    const stats = getInstanceStats();
    
    // Log stats periodically for monitoring
    if (stats.currentActive > 0) {
        console.log('Periodic health check:', stats);
    }
    
    // Check for potential memory leaks
    if (stats.currentActive > 20) {
        console.error('Potential memory leak detected - too many active instances:', stats.currentActive);
        console.error('Active contexts:', stats.contexts);
        
        // Could implement automatic cleanup here if needed
        // For now, just log the issue for debugging
    }
    
    // Check for zombie instances (instances that should have been cleaned up)
    Object.keys(ACTION_CACHES).forEach(context => {
        const instance = ACTION_CACHES[context];
        if (!instance || typeof instance.getCurrentRate !== 'function') {
            console.warn('Zombie instance detected for context:', context);
            cleanupInstance(context);
        }
    });
    
}, 5 * 60 * 1000); // Every 5 minutes

/**
 * Clean up the health check interval
 */
function cleanupHealthCheck() {
    if (healthCheckInterval) {
        clearInterval(healthCheckInterval);
        healthCheckInterval = null;
        console.log('Health check interval cleaned up');
    }
}

/**
 * Handle page visibility changes to optimize resource usage
 * Pause/resume operations when page becomes hidden/visible
 */
const visibilityChangeHandler = function() {
    const isHidden = document.hidden;
    console.log('Page visibility changed:', isHidden ? 'hidden' : 'visible');
    
    // When page becomes hidden, we could optionally pause all instances
    // When page becomes visible, resume operations
    // This is handled by the individual instances through their setActive method
    // but we could add global optimization here if needed
    
    if (isHidden) {
        console.log('Page hidden - instances will be managed by UlanziDeck setActive events');
    } else {
        console.log('Page visible - instances will resume through UlanziDeck setActive events');
    }
};

document.addEventListener('visibilitychange', visibilityChangeHandler);

/**
 * Clean up global event listeners
 * Called during plugin shutdown to prevent memory leaks
 */
function cleanupEventListeners() {
    try {
        window.removeEventListener('error', globalErrorHandler);
        document.removeEventListener('visibilitychange', visibilityChangeHandler);
        console.log('Global event listeners cleaned up');
    } catch (error) {
        console.warn('Error cleaning up event listeners:', error);
    }
}

// Export for debugging/testing purposes
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        ACTION_CACHES,
        INSTANCE_STATS,
        onSetSettings,
        validateAndNormalizeSettings,
        applySettingsToInstance,
        applyStoredSettings,
        getCurrentSettings,
        cleanupInstance,
        cleanupAllInstances,
        cleanupEventListeners,
        cleanupHealthCheck,
        getInstanceStats,
        logInstanceStats
    };
}