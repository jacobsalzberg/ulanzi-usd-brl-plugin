@echo off
REM USD/BRL Exchange Rate Plugin Auto-Start Service
REM This batch file automatically starts the plugin service when Ulanzi Studio starts

echo Starting USD/BRL Exchange Rate Plugin Service...

REM Get the directory where this batch file is located
set PLUGIN_DIR=%~dp0

REM Start the plugin service in the default browser
start "" "%PLUGIN_DIR%plugin\app.html"

echo Plugin service started successfully!
echo You can now use the USD/BRL Exchange Rate plugin in Ulanzi Studio.

REM Keep the window open for 3 seconds to show the message
timeout /t 3 /nobreak >nul

exit