/**
 * Utilities for working with themed icons
 */

import { AppId, ThemeId, ThemedIcon } from '../types/data';
import { getApp, getMvpApps, getAllApps } from './apps';
import { getTheme } from './themes';

/**
 * Create a themed icon by combining app and theme
 */
export function createThemedIcon(appId: AppId, themeId: ThemeId): ThemedIcon {
  const app = getApp(appId);
  const theme = getTheme(themeId);

  return {
    appId,
    themeId,
    iconColor: theme.colors.icon,
    backgroundColor: theme.colors.background,
    appName: app.name,
    packageName: app.packageName,
  };
}

/**
 * Create themed icons for a specific theme across all apps
 */
export function createThemedIconsForTheme(themeId: ThemeId): ThemedIcon[] {
  const apps = getAllApps();
  return apps.map((app) => createThemedIcon(app.id, themeId));
}

/**
 * Create themed icons for a specific app across all themes
 */
export function createThemedIconsForApp(appId: AppId): ThemedIcon[] {
  const themes = Object.keys(THEMES) as ThemeId[];
  return themes.map((themeId) => createThemedIcon(appId, themeId));
}

/**
 * Get MVP themed icons (all MVP apps with MVP themes)
 */
export function getMvpThemedIcons(): ThemedIcon[] {
  const mvpApps = getMvpApps();
  const mvpThemeIds = Object.keys(THEMES) as ThemeId[];

  const themedIcons: ThemedIcon[] = [];
  for (const app of mvpApps) {
    for (const themeId of mvpThemeIds) {
      themedIcons.push(createThemedIcon(app.id, themeId));
    }
  }
  return themedIcons;
}

// Import themes for internal use
import { THEMES } from './themes';
