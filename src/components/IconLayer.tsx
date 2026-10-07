import React from 'react';
import { Image, StyleSheet } from 'react-native';
import type { AppId } from '../types/data';
import type { ThemeLayer } from '../types/data';
import { APP_ICON_COMPONENTS } from '../data/app-icons';
import { ICON_PATTERNS } from '../data/patterns';
import { Radius } from '../constants/design';

interface IconLayerProps {
  appId: AppId;
  layer: ThemeLayer;
  size: number;
}

export default function IconLayer({ appId, layer, size }: IconLayerProps) {
  // Handle Pattern-based Icons (e.g., Leopard Print)
  if (layer.type === 'pattern') {
    const patternSet = ICON_PATTERNS[layer.value];
    if (!patternSet) {
      console.warn(`Icon pattern set not found: ${layer.value}`);
      return null;
    }

    const image = patternSet[appId];
    if (!image) {
      console.warn(`Icon image for app ${appId} not found in pattern ${layer.value}`);
      return null;
    }

    return <Image source={image} style={{ width: size, height: size }} resizeMode="contain" />;
  }

  // Handle Color-based Icons (SVGs)
  const Icon = APP_ICON_COMPONENTS[appId];
  if (typeof Icon !== 'function') {
    console.error(`SVG icon for "${appId}" did not resolve to a component.`);
    return null;
  }

  return (
    <Icon
      width={size}
      height={size}
      color={layer.value}
      fill={layer.value}
    />
  );
}
