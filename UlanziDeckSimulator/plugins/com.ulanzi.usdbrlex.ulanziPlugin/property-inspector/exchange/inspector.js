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
  // Validate and normalize the incoming parameters
  ACTION_SETTING = validateAndNormalizeInspectorSettings(params || {});

  console.log('Inspector applying settings:', ACTION_SETTING);

  // Apply the validated settings to the form
  Utils.setFormValue(ACTION_SETTING, form);
  
  // Ensure the form reflects the current settings
  updateFormDisplay();
}

/**
 * Validate and normalize settings in the property inspector
 * Ensures consistent settings format between inspector and main plugin
 * @param {Object} params - Raw parameters from UlanziDeck
 * @returns {Object} Validated and normalized settings
 */
function validateAndNormalizeInspectorSettings(params) {
  const settings = {};
  
  // Validate refresh interval
  const validIntervals = ['1', '5', '10', '30'];
  const refreshInterval = params.refresh_interval;
  
  if (refreshInterval && validIntervals.includes(String(refreshInterval))) {
    settings.refresh_interval = String(refreshInterval);
  } else {
    // Use default value
    settings.refresh_interval = '5';
    console.log('Using default refresh interval: 5 minutes');
  }
  
  return settings;
}

/**
 * Update the form display to reflect current settings
 * Ensures the UI shows the correct selected values
 */
function updateFormDisplay() {
  if (!form || !ACTION_SETTING) return;
  
  // Update the refresh interval dropdown
  const refreshSelect = form.querySelector('select[name="refresh_interval"]');
  if (refreshSelect && ACTION_SETTING.refresh_interval) {
    refreshSelect.value = ACTION_SETTING.refresh_interval;
    console.log('Updated refresh interval display to:', ACTION_SETTING.refresh_interval);
  }
}