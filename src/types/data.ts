/**
 * Core type definitions for apps and themes
 */

export type AppId =
  | 'instagram' | 'whatsapp' | 'youtube' | 'spotify' | 'telegram' | 'facebook' | 'chrome' | 'gmail'
  | 'tiktok' | 'x' | 'discord' | 'reddit' | 'netflix' | 'snapchat' | 'uber' | 'paypal'
  | 'google-maps' | 'google-drive' | 'google-photos' | 'google-play' | 'google-calendar' | 'google-meet'
  | 'zoom' | 'pinterest' | 'twitch' | 'steam' | 'roblox' | 'airbnb' | 'doordash' | 'uber-eats'
  | 'etsy' | 'ebay' | 'cash-app' | 'venmo' | 'coinbase' | 'dropbox' | 'notion' | 'shazam'
  | 'soundcloud' | 'signal' | 'line' | 'viber' | 'wechat' | 'threads' | 'tinder' | 'duolingo'
  | 'strava' | 'fitbit' | 'wikipedia' | 'messenger';

export type ThemeId =
  | 'mono-light' | 'mono-white' | 'mono-grey'
  | 'midnight' | 'ocean' | 'rose' | 'forest' | 'lavender' | 'sunset' | 'leopard-print' | 'crimson-bloom';

/**
 * Represents an installed application that can have custom icons
 */
export interface AppDefinition {
  id: AppId;
  name: string;
  packageName: string;
  description: string;
  icon: {
    fallbackColor: string;
  };
}

/**
 * Represents a complete icon theme with colors and styling
 */
export type ThemeCategoryId = 'popular' | 'simple' | 'colorful' | 'light' | 'animal-print';

export interface ThemeLayer {
  type: 'color' | 'pattern';
  value: string; // Hex color code or Pattern ID
}

export interface ThemeDefinition {
  id: ThemeId;
  name: string;
  description: string;
  category: ThemeCategoryId;
  featuredApps: AppId[];
  icon: ThemeLayer;
  background: ThemeLayer;
  preview: {
    /**
     * Which apps to show in theme previews
     */
    featuredApps: AppId[];
    /**
     * Visual description for the preview
     */
    subtitle: string;
  };
}

/**
 * Collection of apps and themes
 */
export interface IconAuraData {
  apps: Record<AppId, AppDefinition>;
  themes: Record<ThemeId, ThemeDefinition>;
}
