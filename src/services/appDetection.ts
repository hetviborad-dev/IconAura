/**
 * Service for app installation detection
 *
 * Bridges React Native JS to native Kotlin module for checking
 * which supported apps are installed on the device.
 */

import { NativeModules } from 'react-native';
import type { InstalledApp, AppToCheck } from '../types/native';

const { InstalledApps } = NativeModules;

if (!InstalledApps) {
  throw new Error('InstalledApps native module not found');
}

/**
 * Check installation status of supported applications
 *
 * @param apps Array of apps to check (id, packageName, appName)
 * @returns Promise resolving to array of apps with installation status
 */
export async function checkInstalledApps(apps: AppToCheck[]): Promise<InstalledApp[]> {
  try {
    const result = await InstalledApps.getInstalledApps(apps);
    return result;
  } catch (error) {
    console.error('Failed to check installed apps:', error);
    throw error;
  }
}

/**
 * Check if a single app is installed
 *
 * @param id App identifier
 * @param packageName Android package name
 * @param appName Display name
 * @returns Promise resolving to installation status
 */
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
