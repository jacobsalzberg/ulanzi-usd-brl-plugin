/**
 * CPU Temperature Monitor Plugin for UlanziDeck
 * Displays real-time CPU temperature from HWiNFO
 */

// Global variables for plugin management
var instances = {};
var instanceStats = {
    created: 0,
    destroyed: 0,
    maxConcurrent: 0,
    createdAt: new Date(),
    currentActive: 0
};

/**
 * Plugin connection handler
 */
function connectUlanzideckPlugin(inPort, inUUID, inRegisterEvent, inInfo, inActionInfo) {
    console.log('CPU Temperature plugin connected to UlanziDeck');
    
    // Register for events
    $UD.on('com.ulanzi.ulanzideck.cputemp.monitor', 'willAppear', function (jsn) {
        onAdd(jsn);
    });

    $UD.on('com.ulanzi.ulanzideck.cputemp.monitor', 'willDisappear', function (jsn) {
        onRemove(jsn);
    });

    $UD.on('com.ulanzi.ulanzideck.cputemp.monitor', 'setactive', function (jsn) {
        onSetActive(jsn);
    });

    $UD.on('com.ulanzi.ulanzideck.cputemp.monitor', 'sendToPlugin', function (jsn) {
        onSendToPlugin(jsn);
    });
}

/**
 * Handle button addition
 */
function onAdd(jsn) {
    const context = jsn.context;
    console.log('Adding CPU temperature monitor to context:', context);

    try {
        // Create new CPUTempDisplay instance
        const instance = new CPUTempDisplay(context);
        instances[context] = instance;

        // Update statistics
        instanceStats.created++;
        instanceStats.currentActive++;
        instanceStats.maxConcurrent = Math.max(instanceStats.maxConcurrent, instanceStats.currentActive);

        console.log('Created new CPUTempDisplay instance for context:', context);
        console.log('Instance Statistics:', instanceStats);

        // Initialize the instance
        instance.initialize();

        console.log('CPUTempDisplay instance initialized for context:', context);

    } catch (error) {
        console.error('Failed to create CPUTempDisplay instance for context:', context, error);
    }
}

/**
 * Handle button removal
 */
function onRemove(jsn) {
    const context = jsn.context;
    console.log('Removing CPU temperature monitor from context:', context);

    if (instances[context]) {
        // Clean up the instance
        if (instances[context].cleanup) {
            instances[context].cleanup();
        }
        
        delete instances[context];
        instanceStats.destroyed++;
        instanceStats.currentActive--;

        console.log('Removed CPUTempDisplay instance for context:', context);
        console.log('Instance Statistics:', instanceStats);
    }
}

/**
 * Handle active state changes
 */
function onSetActive(jsn) {
    const context = jsn.context;
    const active = jsn.payload && jsn.payload.active;
    
    console.log('Setting active state for context:', context, 'active:', active);

    if (instances[context] && instances[context].setActive) {
        instances[context].setActive(active);
    }
}

/**
 * Handle messages from property inspector
 */
function onSendToPlugin(jsn) {
    const context = jsn.context;
    const payload = jsn.payload;

    console.log('Received message from property inspector:', payload);

    if (instances[context]) {
        // Handle refresh interval changes
        if (payload.refreshInterval !== undefined) {
            console.log('Updating refresh interval for context:', context, 'to', payload.refreshInterval, 'seconds');
            if (instances[context].setRefreshInterval) {
                instances[context].setRefreshInterval(payload.refreshInterval);
            }
        }
    }
}

// Initialize the plugin
connectUlanzideckPlugin();