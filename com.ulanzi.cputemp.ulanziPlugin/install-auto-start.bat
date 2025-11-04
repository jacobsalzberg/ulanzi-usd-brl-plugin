@echo off
REM USD/BRL Exchange Rate Plugin - Install Auto-Start
REM This installs the plugin to start automatically with Windows

echo Installing USD/BRL Exchange Rate Plugin Auto-Start...

REM Get current directory
set PLUGIN_DIR=%~dp0

REM Copy the auto-start script to Windows Startup folder
copy "%PLUGIN_DIR%auto-start-service.vbs" "%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup\USD-BRL-Plugin-AutoStart.vbs"

if %ERRORLEVEL% EQU 0 (
    echo ✓ Auto-start installed successfully!
    echo ✓ The plugin service will now start automatically when Windows boots
    echo ✓ Your USD/BRL exchange rate will always show live data
    echo.
    echo You can now close this window and restart your computer to test.
    echo Or run the service now by double-clicking: auto-start-service.vbs
) else (
    echo ✗ Failed to install auto-start
    echo Please run this as Administrator
)

pause