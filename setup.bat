@echo off
setlocal
title BIOHAZARD BOTZ - Official Setup
:: ============================================================================
:: Name: setup.bat
:: Publisher: yemo-dev
:: Description: Professional deployment script for Biohazard Botz
:: Repository: https://github.com/yemo-dev/biohazard-botz
:: ============================================================================

:: Force UTF-8 encoding for better terminal support
chcp 65001 >nul

cls
echo.
echo   *******************************************************************
echo   *                                                                 *
echo   *                  B I O H A Z A R D - B O T Z                    *
echo   *                                                                 *
echo   *******************************************************************
echo.
echo   -------------------------------------------------------------------
echo   [ SYSTEM ] Official Setup by yemo-dev
echo   -------------------------------------------------------------------
echo.

:: Check for Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo   [!] ERROR: Node.js is not installed or not in PATH.
    echo   [!] Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo   [1/2] Installing core dependencies...
echo.
call npm install --no-fund --no-audit

if %errorlevel% neq 0 (
    echo.
    echo   [!] ERROR: Dependency installation failed.
    pause
    exit /b 1
)

echo.
echo   [2/2] System ready. Launching Biohazard Botz...
echo   -------------------------------------------------------------------
echo.
npm start

pause
endlocal
