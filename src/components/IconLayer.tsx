import React from 'react';
import { Image, StyleSheet } from 'react-native';
import type { AppId } from '../types/data';
import type { ThemeLayer } from '../types/data';
import { APP_ICON_COMPONENTS } from '../data/app-icons';
import { ICON_PATTERNS } from '../data/patterns';
import PatternedIcon from './PatternedIcon';

interface IconLayerProps {
  appId: AppId;
  layer: ThemeLayer;
  size: number;
}

export default function IconLayer({ appId, layer, size }: IconLayerProps) {
  // Handle Pattern-based Icons (e.g., Leopard Print)
  if (layer.type === 'pattern') {
    const patternImage = ICON_PATTERNS[layer.value];
    if (!patternImage) {
      console.warn(`Icon pattern not found: ${layer.value}`);
      return null;
    }

    return <PatternedIcon appId={appId} patternImage={patternImage} size={size} />;
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
