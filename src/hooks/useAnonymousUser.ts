import { useState, useEffect } from 'react';
import { getAnonymousUserId } from '../utils';

export const useAnonymousUser = () => {
  const [userId, setUserId] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    try {
      const id = getAnonymousUserId();
      setUserId(id);
    } catch (error) {
      console.error('Failed to get anonymous user ID:', error);
      // Fallback to a simple timestamp-based ID if localStorage fails
      const fallbackId = `anon_${Date.now()}`;
      setUserId(fallbackId);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    userId,
    isLoading,
  };
};