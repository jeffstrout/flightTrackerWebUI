// Flight Tracker Web UI Configuration
window.FLIGHT_TRACKER_CONFIG = {
  VERSION: {
    "version": "1.0.1",
    "commit": "dcc841d",
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
  CACHE_BUST: Date.now()
};