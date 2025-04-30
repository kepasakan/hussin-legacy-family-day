const fs = require('fs');
const path = require('path');

// Path to config files
const configExamplePath = path.join(__dirname, 'js', 'config.example.js');
const configPath = path.join(__dirname, 'js', 'config.js');

// Check if config.js exists
if (!fs.existsSync(configPath)) {
  console.log('Config file not found. Creating from example...');
  
  // Check if config.example.js exists
  if (fs.existsSync(configExamplePath)) {
    // Copy config.example.js to config.js
    fs.copyFileSync(configExamplePath, configPath);
    console.log('✅ Config file created successfully!');
    console.log('⚠️ Please edit js/config.js with your actual values.');
  } else {
    console.error('❌ Error: config.example.js not found!');
    process.exit(1);
  }
} else {
  console.log('✅ Config file already exists.');
}

console.log('\nSetup complete! You can now run your project locally.'); 