/**
 * Utility functions and helpers
 */

/**
 * Formats an app name for display
 */
export function formatAppName(name: string): string {
  return name.charAt(0).toUpperCase() + name.slice(1);
}

/**
 * Validates if a package name is installed
 * Note: Actual detection will be implemented later
 */
export function isValidPackageName(packageName: string): boolean {
  return packageName.length > 0;
}

/**
 * Generates a unique ID for shortcuts
 */
export function generateShortcutId(): string {
  return `shortcut_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
