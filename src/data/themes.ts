/**
 * Theme definitions - source of truth for icon themes
 */

import { ThemeDefinition, ThemeId } from '../types/data';

/**
 * Available icon themes
 * Extend this object to add more themes without modifying UI components
 */
export const THEMES: Record<ThemeId, ThemeDefinition> = {
  'mono-light': {
    id: 'mono-light',
    name: 'Mono Light',
    description: 'Clean black icons on white.',
    colors: {
      icon: '#000000',
      background: '#FFFFFF',
    },
    preview: {
      featuredApps: ['instagram', 'whatsapp'],
      subtitle: 'Black on white',
    },
  },
  'mono-white': {
    id: 'mono-white',
    name: 'Mono White',
    description: 'Subtle white icons on soft light grey.',
    colors: {
      icon: '#FFFFFF',
      background: '#1A1A1A',
    },
    preview: {
      featuredApps: ['instagram', 'whatsapp'],
      subtitle: 'White on dark',
    },
  },
  'mono-grey': {
    id: 'mono-grey',
    name: 'Mono Grey',
    description: 'Bold black icons on soft grey.',
    colors: {
      icon: '#000000',
      background: '#bebebe',
    },
    preview: {
      featuredApps: ['instagram', 'whatsapp'],
      subtitle: 'Black on grey',
    },
  },
};

/**
 * Get theme definition by ID
 * @throws Error if theme not found
 */
export function getTheme(themeId: ThemeId): ThemeDefinition {
  const theme = THEMES[themeId];
  if (!theme) {
    throw new Error(`Theme not found: ${themeId}`);
  }
  return theme;
}

/**
 * Get all available themes as an array
 */
export function getAllThemes(): ThemeDefinition[] {
  return Object.values(THEMES);
}

/**
 * Get MVP themes (all 3 themes for MVP)
 */
export function getMvpThemes(): ThemeDefinition[] {
  return getAllThemes();
}
