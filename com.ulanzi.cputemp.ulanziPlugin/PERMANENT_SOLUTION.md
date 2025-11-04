# USD/BRL Exchange Rate Plugin - Permanent Solution

## 🚨 The Problem
UlanziDeck plugins show a **static icon/clock** when the plugin service isn't running. This is how UlanziDeck works - plugins need their service (app.html) running to show live data.

## ✅ Permanent Solution - Auto-Start with Windows

### One-Time Setup (Do This Once):

1. **Right-click** `install-auto-start.bat` and select **"Run as Administrator"**
2. **Click "Yes"** when Windows asks for permission
3. **Done!** The plugin service will now start automatically every time Windows boots

### What This Does:
- ✅ **Installs a silent auto-start script** in your Windows Startup folder
- ✅ **Starts the plugin service automatically** when Windows boots
- ✅ **Runs invisibly in background** - no windows or popups
- ✅ **Always shows live exchange rates** - never the clock icon again
- ✅ **Works permanently** - no manual intervention needed

## 🔧 Alternative Solutions

### Option 1: Manual Start (When Needed)
- **Double-click** `auto-start-service.vbs` 
- **Runs silently** - no windows shown
- **Starts the plugin service** immediately

### Option 2: Quick Batch File
- **Double-click** `start-plugin-service.bat`
- **Shows a window** briefly then closes
- **Good for testing** or occasional use

## 🛠️ Troubleshooting

### If You Still See the Clock Icon:

1. **Check if service is running**:
   - Open Task Manager (Ctrl+Shift+Esc)
   - Look for browser processes
   - The plugin service should be running in your default browser

2. **Restart the service**:
   - Double-click `auto-start-service.vbs`
   - Wait 10 seconds
   - Check your deck - should show live rate

3. **Verify auto-start installation**:
   - Press Win+R, type `shell:startup`, press Enter
   - Look for `USD-BRL-Plugin-AutoStart.vbs`
   - If not there, run `install-auto-start.bat` as Administrator

### If Auto-Start Doesn't Work:
- **Run as Administrator**: Right-click `install-auto-start.bat` → "Run as Administrator"
- **Check Windows Startup folder**: Win+R → `shell:startup` → should see the VBS file
- **Test manually**: Double-click `auto-start-service.vbs` to test

## 🗑️ To Remove Auto-Start
- **Run** `uninstall-auto-start.bat`
- **Or manually delete**: Go to Startup folder (Win+R → `shell:startup`) and delete `USD-BRL-Plugin-AutoStart.vbs`

## 📋 Files Explained

| File | Purpose |
|------|---------|
| `auto-start-service.vbs` | Silent service starter (no windows) |
| `install-auto-start.bat` | Installs auto-start with Windows |
| `uninstall-auto-start.bat` | Removes auto-start |
| `start-plugin-service.bat` | Manual starter (shows window) |

## 🎯 Recommended Setup

1. **Run** `install-auto-start.bat` **as Administrator** (one time only)
2. **Restart your computer** to test
3. **Your plugin will always show live rates** - never the clock again!

## ⚡ Why This Happens

UlanziDeck plugins work in two parts:
1. **Static files** (manifest, icons) - always available
2. **Dynamic service** (app.html) - needs to be running for live data

When the service isn't running, you see the static icon. When it's running, you see live exchange rates.

**The auto-start solution ensures the service is always running!** 🚀

## 🔍 Technical Details

- **VBS script runs silently** - no command windows
- **Starts with Windows** - automatic every boot
- **Uses default browser** - same as manual opening
- **Minimal resource usage** - just one browser tab
- **Works with all browsers** - Chrome, Edge, Firefox, etc.

Your USD/BRL plugin will now work **100% automatically** without any manual intervention! 🎉