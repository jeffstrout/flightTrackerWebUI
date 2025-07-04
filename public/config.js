// Flight Tracker Web UI Configuration
window.FLIGHT_TRACKER_CONFIG = {
  VERSION: {
    "version": "1.0.9",
    "commit": "2aa6967",
    "branch": "main",
    "clean": false,
    "buildTime": new Date().toISOString(),
    "environment": "production"
  },
  
  // Application metadata
  APP_INFO: {
    "name": "Flight Tracker Web UI",
    "description": "Real-time flight tracking interface",
    "author": "Flight Tracker Team"
  },
  
  // Force cache busting - updated API URL
  CACHE_BUST: Date.now(),
  DEPLOY_TIME: new Date().toISOString(),
  API_URL_FIXED: true
};