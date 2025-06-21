// Flight Tracker Web UI Configuration
window.FLIGHT_TRACKER_CONFIG = {
  VERSION: {
    "version": "1.0.5",
    "commit": "6e61ee3",
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
  
  // Cache busting timestamp  
  CACHE_BUST: Date.now(),
  DEPLOY_TIME: "2025-06-21T20:38:00Z"
};