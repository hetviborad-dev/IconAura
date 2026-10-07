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
    icon: { type: 'color', value: '#000000' },
    background: { type: 'color', value: '#FFFFFF' },
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
    icon: { type: 'color', value: '#FFFFFF' },
    background: { type: 'color', value: '#1A1A1A' },
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
    icon: { type: 'color', value: '#000000' },
    background: { type: 'color', value: '#bebebe' },
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
    icon: { type: 'color', value: '#F7F7F7' },
    background: { type: 'color', value: '#08090D' },
    preview: { featuredApps: ['instagram', 'whatsapp', 'spotify', 'youtube'], subtitle: 'White on black' },
  },
  'crimson-bloom': {
    id: 'crimson-bloom',
    name: 'Crimson Bloom',
    description: 'A floral collage background with a white app mark.',
    category: 'colorful',
    featuredApps: ['instagram', 'whatsapp', 'spotify', 'youtube'],
    icon: { type: 'color', value: '#FFFFFF' },
    background: { type: 'pattern', value: 'crimson-bloom' },
    preview: { featuredApps: ['instagram', 'whatsapp', 'spotify', 'youtube'], subtitle: 'Flowers behind white icons' },
  },
  ocean: {
    id: 'ocean',
    name: 'Ocean Blue',
    description: 'Cool blue icons on a deep ocean backdrop.',
    category: 'colorful',
    featuredApps: ['instagram', 'whatsapp', 'spotify', 'youtube'],
    icon: { type: 'color', value: '#77D7FF' },
    background: { type: 'color', value: '#102B46' },
    preview: { featuredApps: ['instagram', 'whatsapp', 'spotify', 'youtube'], subtitle: 'Cool blue' },
  },
  rose: {
    id: 'rose',
    name: 'Rose Quartz',
    description: 'Soft rose icons with a warm blush background.',
    category: 'popular',
    featuredApps: ['instagram', 'whatsapp', 'spotify', 'youtube'],
    icon: { type: 'color', value: '#8B344F' },
    background: { type: 'color', value: '#F7DDE5' },
    preview: { featuredApps: ['instagram', 'whatsapp', 'spotify', 'youtube'], subtitle: 'Soft rose' },
  },
  forest: {
    id: 'forest',
    name: 'Forest',
    description: 'Fresh mint icons on a dark green base.',
    category: 'colorful',
    featuredApps: ['instagram', 'whatsapp', 'spotify', 'youtube'],
    icon: { type: 'color', value: '#A8F0C6' },
    background: { type: 'color', value: '#173A30' },
    preview: { featuredApps: ['instagram', 'whatsapp', 'spotify', 'youtube'], subtitle: 'Mint on green' },
  },
  lavender: {
    id: 'lavender',
    name: 'Lavender',
    description: 'Lavender icons on a soft lilac background.',
    category: 'colorful',
    featuredApps: ['instagram', 'whatsapp', 'spotify', 'youtube'],
    icon: { type: 'color', value: '#6849A8' },
    background: { type: 'color', value: '#E9E0FF' },
    preview: { featuredApps: ['instagram', 'whatsapp', 'spotify', 'youtube'], subtitle: 'Lilac' },
  },
  sunset: {
    id: 'sunset',
    name: 'Sunset Glow',
    description: 'Warm coral icons against a rich plum background.',
    category: 'colorful',
    featuredApps: ['instagram', 'whatsapp', 'spotify', 'youtube'],
    icon: { type: 'color', value: '#FFB38A' },
    background: { type: 'color', value: '#48223D' },
    preview: { featuredApps: ['instagram', 'whatsapp', 'spotify', 'youtube'], subtitle: 'Warm sunset' },
  },
  'leopard-print': {
    id: 'leopard-print',
    name: 'Leopard Pink',
    description: 'Leopard texture inside icons on blush pink.',
    category: 'animal-print',
    featuredApps: ['instagram', 'whatsapp', 'spotify', 'youtube'],
    icon: { type: 'pattern', value: 'leopard' },
    background: { type: 'color', value: '#FFC5DC' },
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
