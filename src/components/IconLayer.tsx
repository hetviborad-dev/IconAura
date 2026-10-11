import React from 'react';
import { Image, StyleSheet } from 'react-native';
import type { AppId } from '../types/data';
import type { ThemeLayer } from '../types/data';
import { APP_ICON_COMPONENTS } from '../data/app-icons';
import PatternedIcon from './PatternedIcon';

const PATTERN_URLS: Record<string, string> = {
  leopard: 'https://nekvkaquyfvygstytbfv.supabase.co/storage/v1/object/public/theme-previews/leopard_print.png',
};

interface IconLayerProps {
  appId: AppId;
  layer: ThemeLayer;
  size: number;
}

export default function IconLayer({ appId, layer, size }: IconLayerProps) {
  // Handle Pattern-based Icons (e.g., Leopard Print)
  if (layer.type === 'pattern') {
    // If the value is a URL, use it directly. Otherwise, look up the pattern keyword.
    const patternUrl = PATTERN_URLS[layer.value];

    if (!patternUrl) {
      console.warn(`Icon pattern not found: ${layer.value}`);
      return null;
    }

    return <PatternedIcon appId={appId} patternImage={{ uri: patternUrl }} size={size} />;
  }

  // Handle Color-based Icons (SVGs)
  if (!appId) return null;
  const Icon = APP_ICON_COMPONENTS[appId];
  if (typeof Icon !== 'function') {
    console.warn(`SVG icon for "${appId}" did not resolve to a component.`);
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
