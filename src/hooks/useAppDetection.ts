/** Hook for checking which supported apps can be launched on this device. */

import { useCallback, useState } from 'react';
import type { AppId } from '../types/data';
import type { InstalledApp } from '../types/native';
import { checkInstalledApps } from '../services/appDetection';
import { getAllApps } from '../data/apps';

const SUPPORTED_APPS = getAllApps();

export interface AppInstallationStatus {
  appId: AppId;
  packageName: string;
  appName: string;
  installed: boolean;
  loading: boolean;
  error: string | null;
}

function createStatus(installedApps: InstalledApp[], error: string | null = null) {
  const statusMap: Record<AppId, AppInstallationStatus> = {} as Record<AppId, AppInstallationStatus>;

  SUPPORTED_APPS.forEach((app) => {
    const found = installedApps.find((item) => item.id === app.id);
    statusMap[app.id] = {
      appId: app.id,
      packageName: app.packageName,
      appName: app.name,
      installed: found?.installed === true && found.launchable !== false,
      loading: false,
      error,
    };
  });

  return statusMap;
}

export function useAppDetection() {
  const [appStatus, setAppStatus] = useState<Record<AppId, AppInstallationStatus>>({} as Record<AppId, AppInstallationStatus>);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const appsToCheck = SUPPORTED_APPS.map((app) => ({
        id: app.id,
        packageName: app.packageName,
        appName: app.name,
      }));
      const detectedApps = await checkInstalledApps(appsToCheck);
      setAppStatus(createStatus(detectedApps));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      console.error('App detection failed:', err);
      setAppStatus(createStatus([], errorMessage));
    } finally {
      setLoading(false);
    }
  }, []);

  return { appStatus, loading, error, refresh };
}
