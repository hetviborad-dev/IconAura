

export type AppId =
  | 'instagram' | 'whatsapp' | 'youtube' | 'spotify' | 'telegram' | 'facebook' | 'chrome' | 'gmail'
  | 'tiktok' | 'x' | 'discord' | 'reddit' | 'netflix' | 'snapchat' | 'uber' | 'paypal'
  | 'google-maps' | 'google-drive' | 'google-photos' | 'google-play' | 'google-calendar' | 'google-meet'
  | 'zoom' | 'pinterest' | 'twitch' | 'steam' | 'roblox' | 'airbnb' | 'doordash' | 'uber-eats'
  | 'etsy' | 'ebay' | 'cash-app' | 'venmo' | 'coinbase' | 'dropbox' | 'notion' | 'shazam'
  | 'soundcloud' | 'signal' | 'line' | 'viber' | 'wechat' | 'threads' | 'tinder' | 'duolingo'
  | 'strava' | 'fitbit' | 'wikipedia' | 'messenger'
  | 'calculator' | 'camera' | 'settings' | 'phone' | 'calendar' | 'clock' | 'contacts'
  | 'microphone' | 'files' | 'gallery' | 'messages'
  | 'weather' | 'music' | 'notes' | 'security';

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
  wallpapers: string[];
}


export interface IconAuraData {
  apps: Record<AppId, AppDefinition>;
  themes: Record<ThemeId, ThemeDefinition>;
}
