import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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

interface AppDetectionContextType {
  appStatus: Record<AppId, AppInstallationStatus>;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

const AppDetectionContext = createContext<AppDetectionContextType | undefined>(undefined);

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

export const AppDetectionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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

  useEffect(() => {
    // Run detection once when the app opens
    refresh();
  }, [refresh]);

  return (
    <AppDetectionContext.Provider value={{ appStatus, loading, error, refresh }}>
      {children}
    </AppDetectionContext.Provider>
  );
};

export function useAppDetection() {
  const context = useContext(AppDetectionContext);
  if (context === undefined) {
    throw new Error('useAppDetection must be used within an AppDetectionProvider');
  }
  return context;
}
