


export interface InstalledApp {
  id: string;
  packageName: string;
  appName: string;
  installed: boolean;
  launchable: boolean;
}


export interface AppToCheck {
  id: string;
  packageName: string;
  appName: string;
}


export interface InstalledAppsModule {
  getInstalledApps(apps: AppToCheck[]): Promise<InstalledApp[]>;
}
