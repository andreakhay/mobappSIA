// src/config/env.js
/**
 * Configuration for backend API endpoints and environment variables.
 * 
 * In React Native / Expo, mobile applications connect to backend databases
 * via secure HTTPS REST API endpoints rather than direct MySQL TCP sockets.
 * This protects database credentials and works cross-platform on iOS, Android, and Web.
 * 
 * To point the mobile app to a different database or backend:
 * Simply set EXPO_PUBLIC_API_URL in your .env file or update the fallback below.
 */

export const ENV = {
  // Base URL for the Diocese REST API
  API_BASE_URL:
    process.env.EXPO_PUBLIC_API_URL || "https://diocese-of-daet.vercel.app/api",
  
  // App version
  APP_VERSION: "1.0.0",
};

export default ENV;
