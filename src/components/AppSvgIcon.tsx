import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import type { AppId } from '../types/data';
import { APP_ICON_COMPONENTS } from '../data/app-icons';
import { LEOPARD_ICON_IMAGES } from '../data/leopard-icons';
import { Radius } from '../constants/design';

export interface AppSvgIconProps {
  appId: AppId;
  iconColor: string;
  size?: number;
  pattern?: 'leopard' | 'crimson-bloom';
}

const FLOWER_BACKGROUND = require('../assets/image/crystle_flower.png');
const CRIMSON_ICON_SCALE = 0.72;
export default function AppSvgIcon({ appId, iconColor, size = 28, pattern }: AppSvgIconProps) {
  const Icon = APP_ICON_COMPONENTS[appId];
  if (typeof Icon !== 'function') {
    throw new Error(`SVG icon for "${appId}" did not resolve to a component.`);
  }

  if (pattern === 'leopard') {
    return <Image source={LEOPARD_ICON_IMAGES[appId]} style={{ width: size, height: size }} resizeMode="contain" />;
  }

  if (pattern === 'crimson-bloom') {
    const markSize = size * CRIMSON_ICON_SCALE;
    return (
      <View style={[styles.tile, { width: size, height: size, borderRadius: Radius.md,
           }]}>
        <Image source={FLOWER_BACKGROUND} style={StyleSheet.absoluteFill} resizeMode='center' />
        <Icon
          width={markSize}
          height={markSize}
          fill={iconColor}
          color={iconColor}
        />
      </View>
    );
  }

  return <Icon width={size} height={size} color={iconColor} fill={iconColor} />;
}

const styles = StyleSheet.create({
  tile: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
});
