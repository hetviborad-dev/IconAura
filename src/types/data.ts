/**
 * Core type definitions for apps and themes
 */

export type AppId = 'instagram' | 'whatsapp' | 'youtube' | 'spotify' | 'telegram' | 'facebook' | 'chrome' | 'gmail';

export type ThemeId = 'mono-light' | 'mono-white' | 'mono-grey';

/**
 * Represents an installed application that can have custom icons
 */
export interface AppDefinition {
  id: AppId;
  name: string;
  packageName: string;
  description: string;
  icon: {
    /**
     * Reference to icon asset - can be a URI, local path, or identifier
     * Examples: '@drawable/instagram', 'assets/icons/instagram.svg', etc.
     */
    assetId: string;
    /**
     * Fallback color if icon asset is not available
     */
    fallbackColor: string;
  };
}

/**
 * Represents a complete icon theme with colors and styling
 */
export interface ThemeDefinition {
  id: ThemeId;
  name: string;
  description: string;
  colors: {
    icon: string;
    background: string;
  };
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
 * Represents an icon styled with a specific theme
 * This is a computed result - not stored as data
 */
export interface ThemedIcon {
  appId: AppId;
  themeId: ThemeId;
  iconColor: string;
  backgroundColor: string;
  appName: string;
  packageName: string;
}

/**
 * Collection of apps and themes
 */
export interface IconAuraData {
  apps: Record<AppId, AppDefinition>;
  themes: Record<ThemeId, ThemeDefinition>;
}
