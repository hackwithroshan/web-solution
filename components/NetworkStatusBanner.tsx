import React, { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';

const NetworkStatusBanner: React.FC = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOffline = () => setIsOffline(true);
    const handleOnline = () => setIsOffline(false);

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  if (!isOffline) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-red-600 text-white p-3 text-center text-sm z-[200] flex items-center justify-center">
      <WifiOff size={18} className="mr-2" />
      You are currently offline. Please check your internet connection.
    </div>
  );
};

export default NetworkStatusBanner;