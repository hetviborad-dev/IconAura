import React from 'react';
import { Image } from 'react-native';
import type { AppId } from '../types/data';
import { APP_ICON_COMPONENTS } from '../data/app-icons';
import { LEOPARD_ICON_IMAGES } from '../data/leopard-icons';

export interface AppSvgIconProps {
  appId: AppId;
  iconColor: string;
  size?: number;
  pattern?: 'leopard';
}

export default function AppSvgIcon({ appId, iconColor, size = 24, pattern }: AppSvgIconProps) {
  if (pattern === 'leopard') {
    return <Image source={LEOPARD_ICON_IMAGES[appId]} style={{ width: size, height: size }} resizeMode="contain" />;
  }

  const Icon = APP_ICON_COMPONENTS[appId];
  if (typeof Icon !== 'function') {
    throw new Error(`SVG icon for "${appId}" did not resolve to a component.`);
  }

  return <Icon width={size} height={size} color={iconColor} fill={iconColor} />;
}
