import React from 'react';
import type { AppId } from '../types/data';
import { APP_ICON_COMPONENTS } from '../data/app-icons';

export interface AppSvgIconProps {
  appId: AppId;
  iconColor: string;
  size?: number;
}

export default function AppSvgIcon({ appId, iconColor, size = 24 }: AppSvgIconProps) {
  const Icon = APP_ICON_COMPONENTS[appId];

  if (typeof Icon !== 'function') {
    throw new Error(`SVG icon for "${appId}" did not resolve to a component.`);
  }

  return <Icon width={size} height={size} color={iconColor} fill={iconColor} />;
}
