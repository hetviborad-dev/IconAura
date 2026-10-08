/** Types for home-screen shortcut creation. */
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
  iconPngBase64: string;
  shape: 'round' | 'square';
  withAppIcon: boolean;
  themeId?: string;
}

export interface HomeShortcutModule {
  createShortcut(config: ShortcutConfig): Promise<ShortcutResult>;
}
