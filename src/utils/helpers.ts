


export function formatAppName(name: string): string {
  return name.charAt(0).toUpperCase() + name.slice(1);
}

export function getContrastColor(hexColor: string): string {
  if (!hexColor || hexColor.length < 7) return '#FFFFFF';

  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);

  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
}


export function isValidPackageName(packageName: string): boolean {
  return packageName.length > 0;
}


export function generateShortcutId(): string {
  return `shortcut_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}


export function getCloudinaryImageUrl(
  url: string,
  width?: number,
  height?: number,
  quality: string = 'auto',
): string {
  if (!url || !url.includes('/upload/')) return url;

  const transforms = [
    'c_fill',
    width ? `w_${width}` : '',
    height ? `h_${height}` : '',
    `q_${quality}`,
    'f_auto',
  ].filter(Boolean).join(',');

  return url.replace('/upload/', `/upload/${transforms}/`);
}
