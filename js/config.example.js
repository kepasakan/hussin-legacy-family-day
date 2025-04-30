// Example configuration file
// Copy this file to config.js and fill in your actual values

const config = {
  // Telegram Bot Configuration
  telegram: {
    botToken: "YOUR_BOT_TOKEN_HERE",
    chatId: "YOUR_CHAT_ID_HERE"
  },
  
  // Google Apps Script API Endpoints
  api: {
    // Add other API endpoints here as needed
  }
};

// Export the configuration
if (typeof module !== 'undefined' && module.exports) {
  module.exports = config;
} else {
  // For browser environment
  window.config = config;
} 