/**
 * Application definitions - source of truth for supported apps
 */

import { AppDefinition, AppId } from '../types/data';

/**
 * Supported applications with real Android package names
 * Extend this object to add more apps without modifying UI components
 */
export const APPS: Record<AppId, AppDefinition> = {
  instagram: {
    id: 'instagram',
    name: 'Instagram',
    packageName: 'com.instagram.android',
    description: 'Connect with friends and share your moments',
    icon: {
      assetId: '@drawable/ic_instagram',
      fallbackColor: '#E4405F',
    },
  },
  whatsapp: {
    id: 'whatsapp',
    name: 'WhatsApp',
    packageName: 'com.whatsapp',
    description: 'Send messages and make calls',
    icon: {
      assetId: '@drawable/ic_whatsapp',
      fallbackColor: '#25D366',
    },
  },
  youtube: {
    id: 'youtube',
    name: 'YouTube',
    packageName: 'com.google.android.youtube',
    description: 'Watch and share videos',
    icon: {
      assetId: '@drawable/ic_youtube',
      fallbackColor: '#FF0000',
    },
  },
  spotify: {
    id: 'spotify',
    name: 'Spotify',
    packageName: 'com.spotify.music',
    description: 'Stream music and podcasts',
    icon: {
      assetId: '@drawable/ic_spotify',
      fallbackColor: '#1DB954',
    },
  },
  telegram: {
    id: 'telegram',
    name: 'Telegram',
    packageName: 'org.telegram.messenger',
    description: 'Fast and secure messaging',
    icon: {
      assetId: '@drawable/ic_telegram',
      fallbackColor: '#0088CC',
    },
  },
  facebook: {
    id: 'facebook',
    name: 'Facebook',
    packageName: 'com.facebook.katana',
    description: 'Connect with people you know',
    icon: {
      assetId: '@drawable/ic_facebook',
      fallbackColor: '#1877F2',
    },
  },
  chrome: {
    id: 'chrome',
    name: 'Chrome',
    packageName: 'com.android.chrome',
    description: 'Browse the web fast',
    icon: {
      assetId: '@drawable/ic_chrome',
      fallbackColor: '#4285F4',
    },
  },
  gmail: {
    id: 'gmail',
    name: 'Gmail',
    packageName: 'com.google.android.gm',
    description: 'Email from Google',
    icon: {
      assetId: '@drawable/ic_gmail',
      fallbackColor: '#EA4335',
    },
  },
};

/**
 * Get app definition by ID
 * @throws Error if app not found
 */
export function getApp(appId: AppId): AppDefinition {
  const app = APPS[appId];
  if (!app) {
    throw new Error(`App not found: ${appId}`);
  }
  return app;
}

/**
 * Get all supported apps as an array
 */
export function getAllApps(): AppDefinition[] {
  return Object.values(APPS);
}

/**
 * Get MVP apps (first 2 supported apps)
 */
export function getMvpApps(): AppDefinition[] {
  return [APPS.instagram, APPS.whatsapp];
}
