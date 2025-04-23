#!/bin/bash

# Clean up problematic modules
echo "Cleaning up problematic modules..."

# Function to remove package if it exists
remove_if_exists() {
  if [ -d "node_modules/$1" ]; then
    echo "Removing $1 packages..."
    rm -rf "node_modules/$1"
  fi
}

# Remove problematic packages
remove_if_exists "@reown"
remove_if_exists "@solana-mobile"
remove_if_exists "@walletconnect"
remove_if_exists "@keystonehq"
remove_if_exists "@fractalwagmi"
remove_if_exists "@solana/wallet-adapter-react-ui"

# Create process/browser.js file as a fallback
mkdir -p node_modules/process
echo "// process/browser.js fallback
var process = module.exports = {};
process.browser = true;
process.env = {};
process.nextTick = function(fn) {
    setTimeout(fn, 0);
};
process.title = 'browser';
process.argv = [];
process.version = '';
process.versions = {};
" > node_modules/process/browser.js

# Clean cache
echo "Cleaning cache..."
rm -rf node_modules/.cache
rm -rf ./.parcel-cache 2>/dev/null

echo "Done!" 