import { useState, useEffect } from 'react';

interface VersionInfo {
  version: string;
  commit: string;
  branch: string;
  clean: boolean;
  buildTime: string;
  environment: string;
}

declare global {
  interface Window {
    FLIGHT_TRACKER_CONFIG?: {
      VERSION: VersionInfo;
    };
  }
}

export const useVersion = () => {
  const [version, setVersion] = useState<VersionInfo | null>(null);
  const [isNewVersion, setIsNewVersion] = useState(false);

  const fetchVersion = async () => {
    try {
      const response = await fetch(`/config.js?t=${Date.now()}`);
      const text = await response.text();

      // Execute the config.js to load into window object
      eval(text);
      
      // Get version info from the loaded config
      const versionInfo = window.FLIGHT_TRACKER_CONFIG?.VERSION;
      if (versionInfo) {
        // Check if this is a new version
        const currentVersion = localStorage.getItem('app_version');
        if (currentVersion && currentVersion !== versionInfo.commit) {
          setIsNewVersion(true);
        }

        // Store current version
        localStorage.setItem('app_version', versionInfo.commit);
        setVersion(versionInfo);

        // Log to console
        console.log('🚀 App Version:', versionInfo);
      }
    } catch (error) {
      console.error('Failed to fetch version:', error);
    }
  };

  useEffect(() => {
    fetchVersion();

    // Check for updates every 5 minutes
    const interval = setInterval(fetchVersion, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return { version, isNewVersion, refreshApp: () => window.location.reload() };
};