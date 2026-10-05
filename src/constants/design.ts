/**
 * Design system constants for IconAura
 * Premium, minimal, modern aesthetic
 */

export const Colors = {
  // Primary
  primary: '#000000',

  // Backgrounds
  background: '#FFFFFF',
  backgroundSecondary: '#F8F8F8',

  // Text
  textPrimary: '#000000',
  textSecondary: '#666666',
  textTertiary: '#999999',

  // Borders & Dividers
  border: '#E8E8E8',
  divider: '#F0F0F0',

  // Semantic colors
  success: '#34C759',
  error: '#FF3B30',
  warning: '#FF9500',
  info: '#0A84FF',

  // Theme-specific
  mono: {
    light: {
      icon: '#000000',
      background: '#FFFFFF',
    },
    white: {
      icon: '#FFFFFF',
      background: '#FFFFFF',
    },
    grey: {
      icon: '#000000',
      background: '#E8E8E8',
    },
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const Typography = {
  fontFamily: 'System',
  sizes: {
    h1: 32,
    h2: 28,
    h3: 24,
    h4: 20,
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
};

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  full: 999,
};

export const Shadows = {
  sm: {
    elevation: 2,
  },
  md: {
    elevation: 4,
  },
  lg: {
    elevation: 8,
  },
};

export const Layout = {
  screenPadding: Spacing.lg,
  maxContentWidth: 600,
};
