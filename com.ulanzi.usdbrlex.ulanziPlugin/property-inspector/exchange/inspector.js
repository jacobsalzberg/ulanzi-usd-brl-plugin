let ACTION_SETTING = {}
let form = ''

// Connect to UlanziDeck with the action UUID
$UD.connect('com.ulanzi.ulanzideck.usdbrlex.exchange')

$UD.onConnected(conn => {
  // Get the form element
  form = document.querySelector('#property-inspector');

  // Show the configuration panel once connected
  const el = document.querySelector('.udpi-wrapper');
  el.classList.remove('hidden');

  // Listen for form changes and send parameters to the main app
  form.addEventListener(
    'input',
    Utils.debounce(() => {
      const formValue = Utils.getFormValue(form);
      
      // Validate and normalize the form values
      ACTION_SETTING = validateAndNormalizeInspectorSettings(formValue);
      
      console.log('Form changed - sending updated settings:', ACTION_SETTING);
      
      // Send the validated settings to the plugin for immediate application
      $UD.sendParamFromPlugin(ACTION_SETTING);
    }, 150) // Slightly longer debounce to prevent excessive updates
  );
  
  // Also listen for change events (for dropdowns)
  form.addEventListener(
    'change',
    () => {
      const formValue = Utils.getFormValue(form);
      
      // Validate and normalize the form values
      ACTION_SETTING = validateAndNormalizeInspectorSettings(formValue);
      
      console.log('Form selection changed - sending updated settings:', ACTION_SETTING);
      
      // Send immediately for dropdown changes (no debounce needed)
      $UD.sendParamFromPlugin(ACTION_SETTING);
    }
  );
});

// Handle initial parameters when action is added
$UD.onAdd(jsonObj => {
  if (jsonObj && jsonObj.param) {
    settingSaveParam(jsonObj.param);
  }
});

// Handle parameters from the main app
$UD.onParamFromApp(jsonObj => {
  if (jsonObj && jsonObj.param) {
    settingSaveParam(jsonObj.param);
  }
});

// Function to save and apply parameters to the form
function settingSaveParam(params) {
  try {
    // Validate and normalize the incoming parameters
    ACTION_SETTING = validateAndNormalizeInspectorSettings(params || {});

    console.log('Inspector applying settings:', ACTION_SETTING);

    // Apply the validated settings to the form
    Utils.setFormValue(ACTION_SETTING, form);
    
    // Ensure the form reflects the current settings
    updateFormDisplay();
    
    // Verify that the form was updated correctly
    const formValue = Utils.getFormValue(form);
    if (formValue.refresh_interval !== ACTION_SETTING.refresh_interval) {
      console.warn('Form update verification failed - retrying');
      // Retry the form update
      setTimeout(() => {
        Utils.setFormValue(ACTION_SETTING, form);
        updateFormDisplay();
      }, 100);
    }
  } catch (error) {
    console.error('Error in settingSaveParam:', error);
    
    // Apply default settings as fallback
    try {
      ACTION_SETTING = validateAndNormalizeInspectorSettings({});
      Utils.setFormValue(ACTION_SETTING, form);
      updateFormDisplay();
    } catch (fallbackError) {
      console.error('Error applying fallback settings:', fallbackError);
    }
  }
}

/**
 * Validate and normalize settings in the property inspector
 * Ensures consistent settings format between inspector and main plugin
 * @param {Object} params - Raw parameters from UlanziDeck
 * @returns {Object} Validated and normalized settings
 */
function validateAndNormalizeInspectorSettings(params) {
  const settings = {};
  
  // Handle null or undefined params
  if (!params || typeof params !== 'object') {
    console.log('Invalid or missing params in inspector, using defaults');
    params = {};
  }
  
  // Validate refresh interval
  const validIntervals = ['1', '5', '10', '30'];
  const validIntervalsNumbers = [1, 5, 10, 30];
  const refreshInterval = params.refresh_interval;
  
  // Handle both string and number inputs
  let intervalValue = null;
  if (typeof refreshInterval === 'string' && validIntervals.includes(refreshInterval)) {
    intervalValue = refreshInterval;
  } else if (typeof refreshInterval === 'number' && validIntervalsNumbers.includes(refreshInterval)) {
    intervalValue = String(refreshInterval);
  } else if (refreshInterval !== null && refreshInterval !== undefined) {
    // Try to parse as number and check if it's valid
    const parsedInterval = parseInt(refreshInterval);
    if (!isNaN(parsedInterval) && validIntervalsNumbers.includes(parsedInterval)) {
      intervalValue = String(parsedInterval);
    }
  }
  
  if (intervalValue) {
    settings.refresh_interval = intervalValue;
    console.log('Inspector: Valid refresh interval found:', intervalValue, 'minutes');
  } else {
    // Use default value
    settings.refresh_interval = '5';
    if (refreshInterval !== null && refreshInterval !== undefined) {
      console.warn('Inspector: Invalid refresh interval:', refreshInterval, 'using default 5 minutes');
    } else {
      console.log('Inspector: No refresh interval specified, using default 5 minutes');
    }
  }
  
  // Final validation
  if (!validIntervals.includes(settings.refresh_interval)) {
    console.error('Inspector: Settings validation failed - invalid final refresh interval:', settings.refresh_interval);
    settings.refresh_interval = '5'; // Force default as last resort
  }
  
  console.log('Inspector settings validation complete:', {
    input: params,
    output: settings
  });
  
  return settings;
}

/**
 * Update the form display to reflect current settings
 * Ensures the UI shows the correct selected values
 */
function updateFormDisplay() {
  if (!form || !ACTION_SETTING) {
    console.warn('Cannot update form display - missing form or settings');
    return;
  }
  
  try {
    // Update the refresh interval dropdown
    const refreshSelect = form.querySelector('select[name="refresh_interval"]');
    if (refreshSelect && ACTION_SETTING.refresh_interval) {
      const previousValue = refreshSelect.value;
      refreshSelect.value = ACTION_SETTING.refresh_interval;
      
      // Verify the update was successful
      if (refreshSelect.value !== ACTION_SETTING.refresh_interval) {
        console.warn('Failed to update refresh interval dropdown - value not set correctly');
        console.warn('Expected:', ACTION_SETTING.refresh_interval, 'Actual:', refreshSelect.value);
        
        // Try to find the option and select it manually
        const targetOption = refreshSelect.querySelector(`option[value="${ACTION_SETTING.refresh_interval}"]`);
        if (targetOption) {
          targetOption.selected = true;
          console.log('Manually selected refresh interval option:', ACTION_SETTING.refresh_interval);
        } else {
          console.error('Refresh interval option not found:', ACTION_SETTING.refresh_interval);
        }
      } else {
        console.log('Updated refresh interval display from', previousValue, 'to:', ACTION_SETTING.refresh_interval);
      }
    } else {
      console.warn('Cannot update refresh interval display - missing select element or setting value');
    }
    
    // Trigger a change event to ensure any listeners are notified
    if (refreshSelect) {
      const changeEvent = new Event('change', { bubbles: true });
      refreshSelect.dispatchEvent(changeEvent);
    }
    
  } catch (error) {
    console.error('Error updating form display:', error);
  }
}