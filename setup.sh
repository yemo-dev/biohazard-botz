#!/bin/bash

# ============================================================================
# BIOHAZARD BOTZ - Official Linux Setup
# Publisher: yemo-dev
# ============================================================================

clear
echo "  *******************************************************************"
echo "  *                                                                 *"
echo "  *                  B I O H A Z A R D - B O T Z                    *"
echo "  *                                                                 *"
echo "  *******************************************************************"
echo ""
echo "  -------------------------------------------------------------------"
echo "  [ SYSTEM ] Official Setup by yemo-dev"
echo "  -------------------------------------------------------------------"
echo ""

# Check for Node.js
if ! command -v node &> /dev/null
then
    echo "  [!] ERROR: Node.js is not installed."
    echo "  [!] Please install Node.js (v20+) to continue."
    exit 1
fi

# Check for Node.js v20+ using node itself for reliability
node -e "if(parseInt(process.versions.node.split('.')[0]) < 20) process.exit(1)" > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "  [!] ERROR: Node.js v20 or higher is required."
    echo "  [!] Current version: $(node -v)"
    echo "  [!] Please update your Node.js installation."
    exit 1
fi

echo "  [1/2] Installing core dependencies (Silent)..."
npm install --no-fund --no-audit > /dev/null 2>&1

if [ $? -ne 0 ]; then
    echo ""
    echo "  [!] ERROR: Dependency installation failed."
    echo "  [!] Please check your internet connection and try again."
    exit 1
fi

echo ""
echo "  [2/2] System ready. Launching Biohazard Botz..."
echo "  -------------------------------------------------------------------"
echo ""
node index.js
