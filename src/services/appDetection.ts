

import { NativeModules } from 'react-native';
import type { InstalledApp, AppToCheck } from '../types/native';

const { InstalledApps } = NativeModules;

if (!InstalledApps) {
  throw new Error('InstalledApps native module not found');
}


export async function checkInstalledApps(apps: AppToCheck[]): Promise<InstalledApp[]> {
  try {
    const result = await InstalledApps.getInstalledApps(apps);
    return result;
  } catch (error) {
    console.error('Failed to check installed apps:', error);
    throw error;
  }
}


export async function fetchAllInstalledApps(): Promise<InstalledApp[]> {
  try {
    const result = await InstalledApps.getAllInstalledApps();
    return result;
  } catch (error) {
    console.error('Failed to fetch all installed apps:', error);
    return [];
  }
}


export async function isAppInstalled(
  id: string,
  packageName: string,
  appName: string
): Promise<boolean> {
  try {
    const result = await checkInstalledApps([{ id, packageName, appName }]);
    return result.length > 0 && result[0].installed;
  } catch (error) {
    console.error(`Failed to check if ${packageName} is installed:`, error);
    return false;
  }
}
