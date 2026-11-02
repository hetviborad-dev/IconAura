

import type { ThemeId, ThemeDefinition as DataThemeDefinition, AppId } from './data';

export type Theme = ThemeId;
export type ThemeDefinition = DataThemeDefinition;

export interface SupportedAppDefinition {
  id: AppId;
  name: string;
  packageName: string;
  description: string;
}
