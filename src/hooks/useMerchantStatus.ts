import { useState, useEffect, useCallback } from 'react';
import { remoteConfigService, MerchantStatus } from '../services/remoteConfig';

interface UseMerchantStatusReturn {
  merchantStatus: MerchantStatus;
  isLoading: boolean;
  error: string | null;
  checkStatus: () => Promise<void>;
  forceRefresh: () => Promise<void>;
}

export const useMerchantStatus = (): UseMerchantStatusReturn => {
  const [merchantStatus, setMerchantStatus] = useState<MerchantStatus>({
    isClose: false,
    closeMessage: 'Sorry, we are temporarily closed. Please try again later.',
    closeTitle: 'Store Temporarily Closed'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkStatus = useCallback(async () => {
    try {
      setError(null);
      const status = await remoteConfigService.checkMerchantStatus();
      setMerchantStatus(status);
    } catch (err) {
      console.error('Failed to check merchant status:', err);
      setError('Failed to check store status');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const forceRefresh = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      await remoteConfigService.forceFetchConfig();
      const status = remoteConfigService.getMerchantStatus();
      setMerchantStatus(status);
    } catch (err) {
      console.error('Failed to force refresh merchant status:', err);
      setError('Failed to refresh store status');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkStatus();

    // Set up interval to check status every 30 minutes
    const interval = setInterval(() => {
      checkStatus();
    }, 30 * 60 * 1000); // 30 minutes

    return () => clearInterval(interval);
  }, [checkStatus]);

  // Also check when the app becomes visible again
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        checkStatus();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [checkStatus]);

  return {
    merchantStatus,
    isLoading,
    error,
    checkStatus,
    forceRefresh
  };
};