/**
 * Service for creating home-screen shortcuts
 *
 * Bridges React Native JS to native Kotlin module for creating
 * shortcuts that launch applications directly.
 */

import { NativeModules, NativeEventEmitter } from 'react-native';
import type { ShortcutConfig, ShortcutResult } from '../types/shortcut';

const { HomeShortcut } = NativeModules;

if (!HomeShortcut) {
  throw new Error('HomeShortcut native module not found');
}

// Create event emitter for listening to Android shortcuts confirming
const shortcutEmitter = new NativeEventEmitter(HomeShortcut);

/**
 * Create a home-screen shortcut for an application
 *
 * @param config Shortcut configuration
 * @returns Promise resolving to creation result
 */
export async function createShortcut(config: ShortcutConfig): Promise<ShortcutResult> {
  try {
    const result = await HomeShortcut.createShortcut(config);
    return result;
  } catch (error) {
    console.error('Failed to create shortcut:', error);
    throw error;
  }
}

/**
 * Listen for when Android confirms the shortcut was actually pinned
 *
 * @param callback Callback fired when shortcut is successfully pinned
 * @returns Subscription object to remove the listener
 */
export function onShortcutPinned(callback: (event: any) => void) {
  return shortcutEmitter.addListener('ShortcutPinned', callback);
}

/**
 * Generate a stable shortcut ID from app package and theme
 *
 * @param appPackageName App package name
 * @param themeId Theme identifier
 * @returns Unique shortcut ID
 */
export function generateShortcutId(appPackageName: string, themeId: string): string {
  // Create a stable ID from app package and theme
  const appPart = appPackageName.split('.').pop() || 'app';
  return `${appPart}_${themeId}`;
}
