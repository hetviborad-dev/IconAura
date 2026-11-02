import { useEffect, useState } from 'react';
import { checkForAppUpdate, VersionCheckResult } from '../services/versionCheck';

export function useForceUpdate() {
  const [result, setResult] = useState<VersionCheckResult | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    let cancelled = false;
    checkForAppUpdate().then((res) => {
      if (cancelled) return;
      setResult(res);
      setChecked(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return {
    checked,
    required: Boolean(result?.required),
    storeUrl: result?.storeUrl ?? null,
    message: result?.message ?? null,
    latestVersion: result?.latestVersion ?? null,
    currentVersion: result?.currentVersion ?? '',
    error: result?.error ?? null,
  };
}