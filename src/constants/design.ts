

export const Colors = {
  
  primary: '#FF007A', 
  secondary: '#00F5D4', 
  tertiary: '#7B2CBF', 

  
  background: '#0A0A0B',
  backgroundSecondary: '#141416',
  surface: '#1C1C1E',

  
  textPrimary: '#FFFFFF',
  textSecondary: '#A0A0A0',
  textTertiary: '#666666',

  
  border: '#2C2C2E',
  divider: '#1C1C1E',

  
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',

  
  dark: {
    background: '#0A0A0B',
    backgroundSecondary: '#141416',
    surface: '#1C1C1E',
    border: '#2C2C2E',
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
  min: 44, 
};

export const Layout = {
  screenPadding: Spacing.lg,
  maxContentWidth: 600,
  cardSpacing: Spacing.md,
};
