@echo off
REM USD/BRL Exchange Rate Plugin - Uninstall Auto-Start

echo Uninstalling USD/BRL Exchange Rate Plugin Auto-Start...

REM Remove the auto-start script from Windows Startup folder
del "%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup\USD-BRL-Plugin-AutoStart.vbs" 2>nul

if %ERRORLEVEL% EQU 0 (
    echo ✓ Auto-start uninstalled successfully!
    echo ✓ The plugin service will no longer start automatically
) else (
    echo ✓ Auto-start was not installed or already removed
)

echo.
echo You can reinstall auto-start anytime by running: install-auto-start.bat

pause