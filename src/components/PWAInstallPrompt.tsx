import React, { useState } from 'react';
import { Download, X } from 'lucide-react';
import { usePWA } from '../hooks/usePWA';

const PWAInstallPrompt: React.FC = () => {
  const { isInstallable, installApp } = usePWA();
  const [dismissed, setDismissed] = useState(false);

  if (!isInstallable || dismissed) {
    return null;
  }

  const handleInstall = async () => {
    await installApp();
    setDismissed(true);
  };

  const handleDismiss = () => {
    setDismissed(true);
  };

  return (
    <div className="fixed bottom-20 left-4 right-4 z-40 md:left-auto md:right-4 md:w-80">
      <div className="bg-primary text-primary-content rounded-lg shadow-lg p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-bold text-sm">Install App</h3>
            <p className="text-xs opacity-90 mt-1">
              Add to your home screen for quick access and offline browsing!
            </p>
          </div>
          <button
            onClick={handleDismiss}
            className="btn btn-ghost btn-xs p-1 ml-2"
            aria-label="Dismiss"
          >
            <X size={14} />
          </button>
        </div>
        
        <div className="flex space-x-2 mt-3">
          <button
            onClick={handleInstall}
            className="btn btn-secondary btn-xs flex-1"
          >
            <Download size={12} className="mr-1" />
            Install
          </button>
          <button
            onClick={handleDismiss}
            className="btn btn-ghost btn-xs text-primary-content hover:bg-primary-content/20"
          >
            Later
          </button>
        </div>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;