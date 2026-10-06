/**
 * TypeScript types for installed app detection
 */

/**
 * Represents a single installed app with its status
 */
export interface InstalledApp {
  id: string;
  packageName: string;
  appName: string;
  installed: boolean;
  launchable: boolean;
}

/**
 * Represents app data to check (without installation status)
 */
export interface AppToCheck {
  id: string;
  packageName: string;
  appName: string;
}

/**
 * Type-safe wrapper around the native InstalledApps module
 */
export interface InstalledAppsModule {
  getInstalledApps(apps: AppToCheck[]): Promise<InstalledApp[]>;
}
