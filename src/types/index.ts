/**
 * Core type definitions for IconAura
 */

import type { ThemeId, ThemeDefinition as DataThemeDefinition } from './data';

export type Theme = ThemeId;
export type ThemeDefinition = DataThemeDefinition;

export interface SupportedAppDefinition {
  id: SupportedApp;
  name: string;
  packageName: string;
  description: string;
}
