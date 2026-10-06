/**
 * Core type definitions for IconAura
 */

import type { ThemeId } from './data';

export type Theme = ThemeId;

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
