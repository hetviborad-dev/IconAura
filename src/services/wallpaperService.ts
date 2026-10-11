import { NativeModules } from 'react-native';

const { WallpaperModule } = NativeModules;

export type WallpaperTarget = 'home' | 'lock' | 'both';

export async function setWallpaper(url: string, target: WallpaperTarget): Promise<{ success: boolean; error?: string }> {
  try {
    if (!WallpaperModule) {
      throw new Error('WallpaperModule is not available');
    }

    if (target === 'both') {
      await WallpaperModule.setWallpaper(url, 'home');
      await WallpaperModule.setWallpaper(url, 'lock');
    } else {
      await WallpaperModule.setWallpaper(url, target);
    }

    return { success: true };
  } catch (e: any) {
    console.error('[WallpaperService] Error setting wallpaper:', e);
    return { success: false, error: e.message };
  }
}
