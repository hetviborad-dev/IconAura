

export type AppId = string;

export type ThemeId =
  | 'mono-light' | 'mono-white' | 'mono-grey'
  | 'midnight' | 'ocean' | 'rose' | 'forest' | 'lavender' | 'sunset' | 'leopard-print' | 'crimson-bloom'
  | string;


export interface AppDefinition {
  id: AppId;
  name: string;
  packageName: string;
  packageAlternatives?: Record<string, string>;
  description: string;
  icon: {
    fallbackColor: string;
  };
}


export type ThemeCategoryId = 'popular' | 'simple' | 'colorful' | 'light' | 'animal-print' | string;

export interface ThemeLayer {
  type: 'color' | 'pattern';
  value: string; 
}

export interface WallpaperAsset {
  url: string;
  preview?: string;
}

export interface ThemeDefinition {
  id: ThemeId;
  name: string;
  description: string;
  category: ThemeCategoryId;
  featuredApps: AppId[];
  icon: ThemeLayer;
  background: ThemeLayer;
  isPremium: boolean;
  color_tags?: string[];
  theme_tags?: string[];
  previewUrl?: string;
  preview: {
    
    featuredApps: AppId[];
    
    subtitle: string;
  };
  wallpapers: WallpaperAsset[];
}


export interface IconAuraData {
  apps: Record<AppId, AppDefinition>;
  themes: Record<ThemeId, ThemeDefinition>;
}
