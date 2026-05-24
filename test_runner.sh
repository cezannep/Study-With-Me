#!/bin/bash

# Load Node.js v24.11.1 path (NVM)
export PATH="/home/cezan/.nvm/versions/node/v24.11.1/bin:$PATH"

echo "=========================================================="
echo " Starting Study With Me (ICSI Prep) Dev Server... "
echo "=========================================================="
echo "Node version: $(node -v)"
echo "NPM version:  $(npm -v)"
echo ""
echo "Attempting to start on http://localhost:3005..."
echo "=========================================================="

npm run dev -- -p 3005
