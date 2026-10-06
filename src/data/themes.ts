/**
 * Theme definitions - source of truth for icon themes
 */

import type { ThemeCategoryId, ThemeDefinition, ThemeId } from '../types/data';

/**
 * Available icon themes
 * Extend this object to add more themes without modifying UI components
 */
export const THEMES: Record<ThemeId, ThemeDefinition> = {
  'mono-light': {
    id: 'mono-light',
    name: 'Mono Light',
    description: 'Clean black icons on white.',
    category: 'simple',
    featuredApps: ['instagram', 'whatsapp', 'spotify', 'youtube'],
    colors: {
      icon: '#000000',
      background: '#FFFFFF',
    },
    preview: {
      featuredApps: ['instagram', 'whatsapp', 'spotify', 'youtube'],
      subtitle: 'Black on white',
    },
  },
  'mono-white': {
    id: 'mono-white',
    name: 'Mono White',
    description: 'White icons on a deep charcoal background.',
    category: 'light',
    featuredApps: ['instagram', 'whatsapp', 'spotify', 'youtube'],
    colors: {
      icon: '#FFFFFF',
      background: '#1A1A1A',
    },
    preview: {
      featuredApps: ['instagram', 'whatsapp', 'spotify', 'youtube'],
      subtitle: 'White on dark',
    },
  },
  'mono-grey': {
    id: 'mono-grey',
    name: 'Mono Grey',
    description: 'Bold black icons on soft grey.',
    category: 'simple',
    featuredApps: ['instagram', 'whatsapp', 'spotify', 'youtube'],
    colors: {
      icon: '#000000',
      background: '#bebebe',
    },
    preview: {
      featuredApps: ['instagram', 'whatsapp', 'spotify', 'youtube'],
      subtitle: 'Black on grey',
    },
  },
  midnight: {
    id: 'midnight',
    name: 'Midnight',
    description: 'Crisp white icons on true black.',
    category: 'popular',
    featuredApps: ['instagram', 'whatsapp', 'spotify', 'youtube'],
    colors: { icon: '#F7F7F7', background: '#08090D' },
    preview: { featuredApps: ['instagram', 'whatsapp', 'spotify', 'youtube'], subtitle: 'White on black' },
  },
  ocean: {
    id: 'ocean',
    name: 'Ocean Blue',
    description: 'Cool blue icons on a deep ocean backdrop.',
    category: 'colorful',
    featuredApps: ['instagram', 'whatsapp', 'spotify', 'youtube'],
    colors: { icon: '#77D7FF', background: '#102B46' },
    preview: { featuredApps: ['instagram', 'whatsapp', 'spotify', 'youtube'], subtitle: 'Cool blue' },
  },
  rose: {
    id: 'rose',
    name: 'Rose Quartz',
    description: 'Soft rose icons with a warm blush background.',
    category: 'popular',
    featuredApps: ['instagram', 'whatsapp', 'spotify', 'youtube'],
    colors: { icon: '#8B344F', background: '#F7DDE5' },
    preview: { featuredApps: ['instagram', 'whatsapp', 'spotify', 'youtube'], subtitle: 'Soft rose' },
  },
  forest: {
    id: 'forest',
    name: 'Forest',
    description: 'Fresh mint icons on a dark green base.',
    category: 'colorful',
    featuredApps: ['instagram', 'whatsapp', 'spotify', 'youtube'],
    colors: { icon: '#A8F0C6', background: '#173A30' },
    preview: { featuredApps: ['instagram', 'whatsapp', 'spotify', 'youtube'], subtitle: 'Mint on green' },
  },
  lavender: {
    id: 'lavender',
    name: 'Lavender',
    description: 'Lavender icons on a soft lilac background.',
    category: 'colorful',
    featuredApps: ['instagram', 'whatsapp', 'spotify', 'youtube'],
    colors: { icon: '#6849A8', background: '#E9E0FF' },
    preview: { featuredApps: ['instagram', 'whatsapp', 'spotify', 'youtube'], subtitle: 'Lilac' },
  },
  sunset: {
    id: 'sunset',
    name: 'Sunset Glow',
    description: 'Warm coral icons against a rich plum background.',
    category: 'colorful',
    featuredApps: ['instagram', 'whatsapp', 'spotify', 'youtube'],
    colors: { icon: '#FFB38A', background: '#48223D' },
    preview: { featuredApps: ['instagram', 'whatsapp', 'spotify', 'youtube'], subtitle: 'Warm sunset' },
  },
  'leopard-print': {
    id: 'leopard-print',
    name: 'Leopard Pink',
    description: 'Leopard texture inside icons on blush pink.',
    category: 'animal-print',
    featuredApps: ['instagram', 'whatsapp', 'spotify', 'youtube'],
    pattern: 'leopard',
    colors: { icon: '#422515', background: '#FFC5DC' },
    preview: { featuredApps: ['instagram', 'whatsapp', 'spotify', 'youtube'], subtitle: 'Leopard on blush' },
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

export const THEME_CATEGORIES: { id: ThemeCategoryId; title: string }[] = [
  { id: 'popular', title: 'Popular Icon Packs' },
  { id: 'simple', title: 'Simple' },
  { id: 'colorful', title: 'Colorful' },
  { id: 'light', title: 'Light & Dark' },
  { id: 'animal-print', title: 'Animal Print' },
];

export function getThemesByCategory(category: ThemeCategoryId): ThemeDefinition[] {
  return getAllThemes().filter((theme) => theme.category === category);
}
