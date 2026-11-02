import React from 'react';
import type { AppId } from '../types/data';
import type { ThemeLayer } from '../types/data';
import { APP_ICON_COMPONENTS } from '../data/app-icons';
import PatternedIcon from './PatternedIcon';

interface IconLayerProps {
  appId: AppId;
  layer: ThemeLayer;
  size: number;
}

export default function IconLayer({ appId, layer, size }: IconLayerProps) {
  
  if (layer.type === 'pattern') {
    const patternUrl = layer.value.startsWith('http') ? layer.value : null;

    if (!patternUrl) {
      console.warn(`Icon pattern URL not found in layer value: ${layer.value}`);
      return null;
    }

    return <PatternedIcon appId={appId} patternImage={{ uri: patternUrl }} size={size} />;
  }

  
  if (!appId) return null;
  const rawIcon = APP_ICON_COMPONENTS[appId];
  const Icon = typeof rawIcon === 'function' ? rawIcon : (rawIcon as any)?.default;
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
