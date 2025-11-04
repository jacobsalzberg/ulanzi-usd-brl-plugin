# 💱 USD/BRL Exchange Rate Plugin for Ulanzi Deck

A real-time USD to BRL (Brazilian Real) exchange rate display plugin for Ulanzi Deck devices.

![Plugin Preview](https://img.shields.io/badge/Status-Working-success)
![Version](https://img.shields.io/badge/Version-1.0.0-blue)
![License](https://img.shields.io/badge/License-MIT-green)

> ⚠️ **Important Note**: This plugin is not yet published in the official Ulanzi Plugin Store. As a workaround, you need to keep the `app.html` page open in your browser for the plugin to work. Once published officially, this won't be necessary - the plugin will run as a background service automatically.

## 📦 What's in this Repository

- **`com.ulanzi.usdbrlex.ulanziPlugin/`** - The main USD/BRL plugin (this is what you need!)
- **`demo/`** - Example plugins for reference
- **`UlanziDeckSimulator/`** - Local testing environment
- **`com.ulanzi.cputemp.ulanziPlugin/`** - Bonus CPU temperature plugin

> 💡 **Just want the USD/BRL plugin?** Download only the `com.ulanzi.usdbrlex.ulanziPlugin` folder.

## ✨ Features

- 📊 **Real-time Exchange Rates** - Shows current USD/BRL rate (~5.39 BRL)
- 🔄 **Auto-refresh** - Updates every 60 minutes (configurable)
- 🎨 **Clean Display** - Large, easy-to-read numbers on your deck
- 🔌 **Simple Setup** - Just open the HTML file and you're ready
- 🌐 **Free API** - Uses AwesomeAPI (no registration required)
- 💪 **Reliable** - Auto-recovery from network issues

## 🚀 Quick Start

### Installation

1. **Download the plugin folder**:
   - Clone this repository or download as ZIP
   - Extract the `com.ulanzi.usdbrlex.ulanziPlugin` folder

2. **Copy to Ulanzi plugins folder**:
   - Open File Explorer and paste this path in the address bar:
     ```
     %APPDATA%\Ulanzi\UlanziDeck\Plugins\
     ```
   - Copy the entire `com.ulanzi.usdbrlex.ulanziPlugin` folder here

3. **Start the plugin service**:
   - Navigate to the plugin folder you just copied
   - Double-click `start-plugin-service.bat`
   - A browser window will open - **keep it open**

4. **Add to your deck**:
   - Open Ulanzi Studio app
   - Find "USD/BRL Exchange Rate" in the plugin list
   - Drag it to a button on your deck

5. **Done!** You should see the current USD/BRL rate (~5.39) on your deck

> ⚠️ **Important**: Keep the browser tab open for the plugin to work. This is temporary until the plugin is officially published.

> 💡 **Tip**: Use the auto-start feature (see below) to automatically open this page when Windows starts.

### Auto-Start (Recommended)

To avoid manually starting the plugin service every time:

1. Navigate to: `%APPDATA%\Ulanzi\UlanziDeck\Plugins\com.ulanzi.usdbrlex.ulanziPlugin\`
2. Double-click `install-auto-start.bat`
3. The plugin will now start automatically when Windows boots
4. The browser window opens minimized in the background

**To remove auto-start:**
- Run `uninstall-auto-start.bat` from the same folder

> 📌 **Note**: This workaround won't be needed once the plugin is officially published in the Ulanzi Plugin Store.

## 📖 How It Works

The plugin uses the [AwesomeAPI](https://economia.awesomeapi.com.br) to fetch USD/BRL exchange rates. It calculates the average between the `bid` (buy) and `high` (daily high) prices to approximate retail exchange rates shown on Google.

**Current Architecture (Unpublished Plugin):**
- The `app.html` page runs in your browser and acts as a bridge
- It fetches exchange rates from the API
- Communicates with Ulanzi Deck via WebSocket
- Updates the button display in real-time

**API Usage:**
- 1 request per hour (default)
- ~720 requests/month
- Well within the free tier (100,000 requests/month)

> 🔮 **Future**: Once published officially, the plugin will run as a native background service without needing a browser.

## 🎮 Usage

- **Automatic Updates**: The rate refreshes every 60 minutes
- **Manual Refresh**: Click the physical button on your Ulanzi Deck
- **Change Interval**: Right-click the button in Ulanzi Studio → Settings

## 🛠️ For Developers

### Project Structure

```
com.ulanzi.usdbrlex.ulanziPlugin/
├── plugin/
│   ├── app.html                    # Main entry point (must stay open)
│   ├── app.js                      # Instance manager
│   └── actions/
│       ├── SimpleAPI.js            # API integration (bid+high)/2
│       └── ExchangeRateDisplay.js  # Canvas rendering
├── property-inspector/             # Settings UI
├── assets/                         # Icons
├── libs/                           # UlanziDeck SDK
└── manifest.json                   # Plugin configuration
```

### Editing the Plugin

1. Edit files directly in the plugin folder:
   ```
   %APPDATA%\Ulanzi\UlanziDeck\Plugins\com.ulanzi.usdbrlex.ulanziPlugin\
   ```
2. Refresh (F5) the app.html page in your browser to see changes
3. Changes take effect immediately

### API Configuration

The plugin uses AwesomeAPI by default. To change the API or calculation:

Edit `plugin/actions/SimpleAPI.js`:

```javascript
// Current: Average of bid and high
const average = (bid + high) / 2;

// Alternative: Use only bid price
return { success: true, rate: bid, timestamp: new Date() };
```

## 📚 Documentation

- **QUICK_START_GUIDE.md** - Comprehensive user guide
- **PERMANENT_SOLUTION.md** - Technical implementation details
- **ERROR_HANDLING.md** - Error recovery strategies
- **NETWORK_RECOVERY.md** - Network issue handling

## 🐛 Troubleshooting

### Plugin shows clock icon instead of rate
**Cause**: The browser page isn't running
- Make sure `app.html` is open in your browser
- Run `start-plugin-service.bat` to open it
- Wait 10 seconds and press the physical button
- Consider using the auto-start feature to avoid this issue

### Rate doesn't match Google
**This is normal**: The plugin uses average of bid and high prices
- Should show ~5.39 BRL (close to Google's rate)
- Rates update in real-time and may vary slightly
- Different sources may show slightly different rates

### Plugin stops working after closing browser
**Cause**: The plugin needs the browser page to stay open (temporary limitation)
- Run `start-plugin-service.bat` again
- Use the auto-start feature to keep it running
- This limitation will be removed once the plugin is officially published

### Browser page closes accidentally
- Run `start-plugin-service.bat` to restart
- The plugin will reconnect automatically
- Your settings are preserved

## 🔧 Requirements

- **Ulanzi Deck** device
- **Ulanzi Studio** app installed
- **Web browser** (Chrome, Edge, Firefox)
- **Windows** (tested on Windows 10/11)

## 📝 License

MIT License - Feel free to use and modify

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest features
- Submit pull requests

## 🔗 Links

- [AwesomeAPI Documentation](https://docs.awesomeapi.com.br/)
- [Ulanzi Deck SDK](https://github.com/ulanzi/UlanziDeckPlugin-SDK)
- [Ulanzi Official Website](https://www.ulanzi.com/)

## 💡 Tips

- **For Trading**: Set refresh interval to 5 minutes for more frequent updates
- **For General Use**: Keep default 60-minute interval to save bandwidth
- **Multiple Instances**: You can add multiple buttons with different settings
- **Manual Refresh**: Press the physical button anytime for instant update

---

Made with ❤️ for the Ulanzi Deck community
