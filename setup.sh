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
    echo "  [!] Please install Node.js to continue."
    exit 1
fi

echo "  [1/2] Installing core dependencies (Silent)..."
npm install --no-fund --no-audit > /dev/null 2>&1

if [ $? -ne 0 ]; then
    echo ""
    echo "  [!] ERROR: Dependency installation failed."
    exit 1
fi

echo ""
echo "  [2/2] System ready. Launching Biohazard Botz..."
echo "  -------------------------------------------------------------------"
echo ""
node index.js
