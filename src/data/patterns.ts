import type { ImageSourcePropType } from 'react-native';

/**
 * Map of Pattern IDs to a single tiling texture image.
 * This image is used as a mask fill for any app icon.
 */
export const ICON_PATTERNS: Record<string, ImageSourcePropType> = {
  leopard: require('../assets/image/leopard_print.png'),
};

/**
 * Map of Pattern IDs to Background Image sources
 */
export const BACKGROUND_PATTERNS: Record<string, ImageSourcePropType> = {
  'crimson-bloom': require('../assets/image/crystle_flower.png'),
};
