


export function formatAppName(name: string): string {
  return name.charAt(0).toUpperCase() + name.slice(1);
}


export function isValidPackageName(packageName: string): boolean {
  return packageName.length > 0;
}


export function generateShortcutId(): string {
  return `shortcut_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
