# USD/BRL Exchange Rate Plugin - Quick Start Guide

> ⚠️ **Important**: This plugin is not yet published in the Ulanzi Plugin Store. You need to keep the browser page open for it to work. This is a temporary workaround - once officially published, it will run as a background service automatically.

## 🚀 Auto-Start Solution (Workaround)

Since the plugin requires a browser page to stay open, here's how to make it start automatically:

### Option 1: Manual Auto-Start (Recommended)
1. **Double-click** `start-plugin-service.bat` in your plugin folder
2. This will automatically open the plugin service in your browser
3. Your plugin will now show live exchange rates instead of the clock icon

### Option 2: Windows Startup (Advanced)
1. Press `Win + R`, type `shell:startup`, press Enter
2. Copy `start-plugin-service.bat` to the Startup folder
3. The plugin service will start automatically when Windows boots

## ⚡ New 30-Second Refresh Option

Your plugin now supports these refresh intervals:
- **30 seconds** (NEW!) - For real-time trading
- 1 minute
- 5 minutes (default)
- 10 minutes  
- 30 minutes

To change the refresh interval:
1. Right-click your plugin button in Ulanzi Studio
2. Select "Settings" or "Property Inspector"
3. Choose "30 seconds" from the dropdown
4. The plugin will immediately start refreshing every 30 seconds

## 📊 Current Features

✅ **Accurate Exchange Rate**: Uses AwesomeAPI with bid+high average (matches Google ~5.39)  
✅ **Large, Clear Display**: 20px font, easy to read on your deck  
✅ **30-Second Updates**: Perfect for active trading  
✅ **Auto-Recovery**: Handles network issues gracefully  
✅ **Multiple Instances**: Add to multiple deck positions independently  

## 🔧 Troubleshooting

**If you see a clock icon instead of numbers:**
- **Cause**: The browser page isn't running (temporary limitation)
- **Solution**: 
  1. Run `start-plugin-service.bat` 
  2. Wait 10 seconds for the service to connect
  3. Press the physical button to trigger a manual refresh
- **Prevention**: Use the auto-start feature above

**If the rate seems wrong:**
- The plugin uses AwesomeAPI (economia.awesomeapi.com.br)
- Calculates average between bid and high prices
- Should show ~5.39 BRL (close to Google's rate)
- Rates update in real-time and may vary slightly

**If the plugin stops working after closing browser:**
- **Cause**: The plugin needs the browser page to stay open (until officially published)
- **Solution**: 
  1. Run `start-plugin-service.bat` again
  2. The plugin will reconnect automatically
  3. Your settings are preserved
- **Future**: This won't be needed once the plugin is in the official store

## 💡 Pro Tips

- **For Trading**: Use 30-second refresh for real-time monitoring
- **For General Use**: Use 5-minute refresh to save bandwidth
- **Multiple Rates**: Add multiple instances with different refresh intervals
- **Manual Refresh**: Press the physical button anytime for instant update

## 📁 File Locations

- **Plugin Folder**: `%APPDATA%\Ulanzi\UlanziDeck\Plugins\com.ulanzi.usdbrlex.ulanziPlugin`
- **Auto-Start Script**: `start-plugin-service.bat`
- **Plugin Service**: `plugin\app.html`

Your USD/BRL Exchange Rate plugin is now ready for professional use! 🎉