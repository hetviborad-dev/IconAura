

import { NativeModules, NativeEventEmitter } from 'react-native';
import type { ShortcutConfig, ShortcutResult } from '../types/shortcut';

const { HomeShortcut } = NativeModules;

if (!HomeShortcut) {
  throw new Error('HomeShortcut native module not found');
}


const shortcutEmitter = new NativeEventEmitter(HomeShortcut);


export async function createShortcut(config: ShortcutConfig): Promise<ShortcutResult> {
  try {
    const result = await HomeShortcut.createShortcut(config);
    return result;
  } catch (error) {
    console.error('Failed to create shortcut:', error);
    throw error;
  }
}

export async function createSquareWidget(config: ShortcutConfig): Promise<ShortcutResult> {
  try {
    const result = await HomeShortcut.createSquareWidget(config);
    return result;
  } catch (error) {
    console.error('Failed to create square widget:', error);
    throw error;
  }
}


export function onShortcutPinned(callback: (event: any) => void) {
  return shortcutEmitter.addListener('ShortcutPinned', callback);
}


export function generateShortcutId(appPackageName: string, themeId: string): string {
  
  const appPart = appPackageName.split('.').pop() || 'app';
  return `${appPart}_${themeId}`;
}
