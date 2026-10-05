/**
 * Hook for managing app installation detection
 *
 * Checks which apps are installed and provides status updates
 * for UI components to enable/disable apply buttons
 */

import { useEffect, useState } from 'react';
import type { AppId } from '../types/data';
import type { InstalledApp } from '../types/native';
import { checkInstalledApps } from '../services/appDetection';
import { getMvpApps } from '../data/apps';

/**
 * Represents app installation status for a single app
 */
export interface AppInstallationStatus {
  appId: AppId;
  packageName: string;
  appName: string;
  installed: boolean;
  loading: boolean;
  error: string | null;
}

/**
 * Hook to detect which apps are installed
 * @returns Object with installation statuses and loading/error states
 */
export function useAppDetection() {
  const [appStatus, setAppStatus] = useState<Record<AppId, AppInstallationStatus>>(() => {
    // Initialize with empty record, will be populated on mount
    const mvpApps = getMvpApps();
    const initial: Record<AppId, AppInstallationStatus> = {} as Record<AppId, AppInstallationStatus>;
    mvpApps.forEach((app) => {
      initial[app.id as AppId] = {
        appId: app.id as AppId,
        packageName: app.packageName,
        appName: app.name,
        installed: false,
        loading: true,
        error: null,
      };
    });
    return initial;
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const detectInstalledApps = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get MVP apps from data layer
        const mvpApps = getMvpApps();

        // Prepare data for native module
        const appsToCheck = mvpApps.map((app) => ({
          id: app.id,
          packageName: app.packageName,
          appName: app.name,
        }));

        // Call native module
        const installedApps = await checkInstalledApps(appsToCheck);

        // Build status map
        const statusMap: Record<AppId, AppInstallationStatus> = {} as Record<AppId, AppInstallationStatus>;

        mvpApps.forEach((app) => {
          const found = installedApps.find((ia) => ia.id === app.id);
          statusMap[app.id as AppId] = {
            appId: app.id as AppId,
            packageName: app.packageName,
            appName: app.name,
            installed: found ? found.installed : false,
            loading: false,
            error: null,
          };
        });

        setAppStatus(statusMap);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        console.error('App detection failed:', err);

        // Set all apps as not installed on error
        const mvpApps = getMvpApps();
        const statusMap: Record<AppId, AppInstallationStatus> = {} as Record<AppId, AppInstallationStatus>;

        mvpApps.forEach((app) => {
          statusMap[app.id as AppId] = {
            appId: app.id as AppId,
            packageName: app.packageName,
            appName: app.name,
            installed: false,
            loading: false,
            error: errorMessage,
          };
        });

        setAppStatus(statusMap);
      } finally {
        setLoading(false);
      }
    };

    detectInstalledApps();
  }, []);

  return { appStatus, loading, error };
}
