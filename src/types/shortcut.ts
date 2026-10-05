/**
 * TypeScript types for home-screen shortcut creation
 */

/**
 * Result from shortcut creation
 */
export interface ShortcutResult {
  shortcutId: string;
  appPackageName: string;
  label: string;
  success: boolean;
  message?: string;
  error?: string;
}

/**
 * Configuration for creating a shortcut
 */
export interface ShortcutConfig {
  appPackageName: string;
  shortcutId: string;
  label: string;
  iconColor: string; // Theme foreground color (hex)
  backgroundColor: string; // Theme background color (hex)
  themeId?: string;
}

/**
 * Type-safe wrapper around the native HomeShortcut module
 */
export interface HomeShortcutModule {
  createShortcut(config: ShortcutConfig): Promise<ShortcutResult>;
}
