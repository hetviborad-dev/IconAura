import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AppId } from '../../types/data';
import { getAllApps } from '../../data/apps';

const STORAGE_KEY = '@icon_aura_enabled_icons';

export async function getEnabledIcons(): Promise<Set<AppId>> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (stored) {
      return new Set(JSON.parse(stored));
    }
    // Default to all apps enabled initially
    return new Set(getAllApps().map(app => app.id));
  } catch (e) {
    console.error('Failed to fetch enabled icons', e);
    return new Set(getAllApps().map(app => app.id));
  }
}

export async function toggleIconEnabled(appId: AppId, enabled: boolean): Promise<void> {
  try {
    const current = await getEnabledIcons();
    if (enabled) {
      current.add(appId);
    } else {
      current.delete(appId);
    }
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(current)));
  } catch (e) {
    console.error('Failed to toggle icon status', e);
  }
}

export async function setAllIconsEnabled(enabled: boolean): Promise<void> {
  try {
    const apps = getAllApps().map(app => app.id);
    if (enabled) {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(apps));
    } else {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    }
  } catch (e) {
    console.error('Failed to set all icons status', e);
  }
}
