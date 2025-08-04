import { useState, useEffect, useCallback } from 'react';
import { remoteConfigService } from '../services/remoteConfig';

interface UseCheckoutStatusReturn {
  isCheckoutDisabled: boolean;
  isLoading: boolean;
  error: string | null;
  checkStatus: () => Promise<void>;
  forceRefresh: () => Promise<void>;
}

export const useCheckoutStatus = (): UseCheckoutStatusReturn => {
  const [isCheckoutDisabled, setIsCheckoutDisabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkStatus = useCallback(async () => {
    try {
      setError(null);
      const status = await remoteConfigService.checkCheckoutStatus();
      setIsCheckoutDisabled(status);
    } catch (err) {
      console.error('Failed to check checkout status:', err);
      setError('Failed to check checkout status');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const forceRefresh = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      await remoteConfigService.forceFetchConfig();
      const status = remoteConfigService.getCheckoutStatus();
      setIsCheckoutDisabled(status);
    } catch (err) {
      console.error('Failed to force refresh checkout status:', err);
      setError('Failed to refresh checkout status');
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
    isCheckoutDisabled,
    isLoading,
    error,
    checkStatus,
    forceRefresh
  };
};