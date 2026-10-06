/**
 * TypeScript types for home-screen shortcut creation
 */

export interface ShortcutResult {
  shortcutId: string;
  appPackageName: string;
  label: string;
  success: boolean;
  message?: string;
  error?: string;
}

export interface ShortcutConfig {
  appPackageName: string;
  shortcutId: string;
  label: string;
  iconColor: string;
  backgroundColor: string;
  iconPaths: string[];
  themeId?: string;
}

/**
 * Type-safe wrapper around the native HomeShortcut module
 */
export interface HomeShortcutModule {
  createShortcut(config: ShortcutConfig): Promise<ShortcutResult>;
}
