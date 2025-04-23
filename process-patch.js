const fs = require('fs');
const path = require('path');

console.log('Patching process/browser references...');

// Function to fix a file
function fixFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`File not found: ${filePath}`);
      return;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace import 'process/browser' with import 'process/browser.js'
    content = content.replace(/(['"])process\/browser\1/g, '$1process/browser.js$1');
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Patched: ${filePath}`);
  } catch (error) {
    console.error(`Error patching ${filePath}:`, error);
  }
}

// Find all potential problematic files
function findAndFixFiles(dir) {
  if (!fs.existsSync(dir)) {
    console.log(`Directory not found: ${dir}`);
    return;
  }

  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Skip node_modules inside node_modules
      if (dir.includes('node_modules') && file === 'node_modules') {
        continue;
      }
      
      findAndFixFiles(filePath);
    } else if (file.endsWith('.js') || file.endsWith('.ts') || file.endsWith('.jsx') || file.endsWith('.tsx')) {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Check if file contains problematic import
      if (content.includes('process/browser') && !content.includes('process/browser.js')) {
        fixFile(filePath);
      }
    }
  }
}

// The problematic files from the error messages
const specificFiles = [
  './node_modules/@reown/appkit-controllers/dist/esm/src/utils/ConstantsUtil.js',
  './node_modules/@reown/appkit-scaffold-ui/dist/esm/src/utils/ConstantsUtil.js',
  './node_modules/@reown/appkit-wallet/dist/esm/src/W3mFrameConstants.js'
];

// Try to fix specific files first
for (const file of specificFiles) {
  if (fs.existsSync(file)) {
    fixFile(file);
  }
}

// Also check @reown directories
const directories = [
  './node_modules/@reown',
  './node_modules/@walletconnect'
];

for (const dir of directories) {
  if (fs.existsSync(dir)) {
    findAndFixFiles(dir);
  }
}

console.log('Patching complete!'); 