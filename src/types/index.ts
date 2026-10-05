/**
 * Core type definitions for IconAura
 */

export type Theme = 'mono-light' | 'mono-white' | 'mono-grey';

export type SupportedApp = 'instagram' | 'whatsapp';

export interface AppIcon {
  app: SupportedApp;
  theme: Theme;
  packageName: string;
  label: string;
}

export interface ThemeDefinition {
  id: Theme;
  name: string;
  description: string;
  iconColor: string;
  backgroundColor: string;
}

export interface SupportedAppDefinition {
  id: SupportedApp;
  name: string;
  packageName: string;
  description: string;
}
