/**
 * Design system constants for IconAura
 * Premium, minimal, modern aesthetic
 */

export const Colors = {
  // Primary
  primary: '#000000',

  // Backgrounds
  background: '#FFFFFF',
  backgroundSecondary: '#FAFAFA',

  // Text
  textPrimary: '#000000',
  textSecondary: '#666666',
  textTertiary: '#999999',

  // Borders & Dividers
  border: '#E5E5E5',
  divider: '#F0F0F0',

  // Semantic colors
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',

  // Dark mode
  dark: {
    background: '#000000',
    backgroundSecondary: '#1A1A1A',
    surface: '#1F1F1F',
    border: '#2A2A2A',
    textPrimary: '#FFFFFF',
    textSecondary: '#A0A0A0',
    textTertiary: '#666666',
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const Typography = {
  fontFamily: 'System',
  sizes: {
    h1: 28,
    h2: 24,
    h3: 20,
    h4: 18,
    body: 16,
    bodySmall: 14,
    caption: 12,
  },
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.6,
  },
};

export const Radius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 999,
};

export const TouchTarget = {
  min: 44, // Minimum touch target size for accessibility
};

export const Layout = {
  screenPadding: Spacing.lg,
  maxContentWidth: 600,
  cardSpacing: Spacing.md,
};
