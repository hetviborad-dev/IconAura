import { useCallback, useEffect, useState } from 'react';

const CHECK_URL = 'https://www.google.com/generate_204';
const CHECK_TIMEOUT = 5000;
const POLL_INTERVAL = 5000;

export function useNetworkStatus() {
  const [isConnected, setIsConnected] = useState(true);
  const [isChecking, setIsChecking] = useState(false);

  const checkConnection = useCallback(async () => {
    setIsChecking(true);
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), CHECK_TIMEOUT);
      const response = await fetch(CHECK_URL, {
        method: 'GET',
        cache: 'no-store',
        signal: controller.signal,
      });
      clearTimeout(timeout);
      // 204 is expected, but any non-error response means we have internet.
      setIsConnected(response.ok || response.status === 204 || response.status < 500);
    } catch {
      setIsConnected(false);
    } finally {
      setIsChecking(false);
    }
  }, []);

  useEffect(() => {
    checkConnection();
    const interval = setInterval(checkConnection, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [checkConnection]);

  return { isConnected, isChecking, retry: checkConnection };
}