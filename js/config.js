// Configuration file for sensitive information
// This file should be added to .gitignore to prevent it from being committed to GitHub

const config = {
  // Telegram Bot Configuration
  telegram: {
    botToken: "7740099280:AAGy5g6SME7yeuxXUgSSnSUwma6uJyH-g94",
    chatId: "-1002518767864"
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