import React from 'react';
import { useVersion } from '../hooks/useVersion';

export const VersionInfo = () => {
  const { version, isNewVersion, refreshApp } = useVersion();

  if (!version) return null;

  return (
    <div className="version-info">
      {isNewVersion && (
        <div className="update-banner">
          <span>New version available!</span>
          <button onClick={refreshApp}>Refresh</button>
        </div>
      )}

      <div className="version-display">
        <small>
          v{version.version} • {version.commit} • {version.branch}
          {!version.clean && ' (dev)'}
        </small>
      </div>
    </div>
  );
};