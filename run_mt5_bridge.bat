@echo off
title MaxFunded MT5 Live Bridge Poller
color 0A

echo ============================================================
echo   MaxFunded MT5 Local Bridge Service
echo   Connects live demo/evaluation MT5 to your Dashboard
echo ============================================================
echo.

cd /d "%~dp0\backend"

:: Check if Python is available
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python is not found in PATH.
    echo Please install Python 3.10+ and check 'Add Python to PATH'.
    pause
    exit /b 1
)

echo Starting MT5 Poller Service (polling every 3 seconds)...
echo To stop, press Ctrl+C in this window.
echo.

python mt5_poller.py --interval 3

pause
