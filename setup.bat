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

:: Check for Node.js v20+
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo   [!] ERROR: Node.js is not installed.
    pause
    exit /b 1
)

for /f "tokens=1 delims=." %%a in ('node -v') do set node_ver=%%a
set node_ver=%node_ver:~1%

if %node_ver% lss 20 (
    echo   [!] ERROR: Node.js v20 or higher is required.
    echo   [!] Current version: v%node_ver% (Recommended: v20+)
    pause
    exit /b 1
)

echo   [1/2] Installing core dependencies (Silent)...
call npm install --no-fund --no-audit >nul 2>&1

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
node index.js

pause
endlocal
