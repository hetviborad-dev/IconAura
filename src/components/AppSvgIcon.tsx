import React from 'react';
import { View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { ICON_PATHS } from '../data/icon-paths';

export interface AppSvgIconProps {
  appName: string;
  iconId?: string;
  iconColor: string;
  size?: number;
}

const FALLBACK_ICON = ICON_PATHS.instagram;

export default function AppSvgIcon({ appName, iconId, iconColor, size = 24 }: AppSvgIconProps) {
  const paths = ICON_PATHS[iconId ?? appName.toLowerCase()] ?? FALLBACK_ICON;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} viewBox="0 0 24 24">
        {paths.map((path, index) => (
          <Path key={index} d={path} fill={iconColor} />
        ))}
      </Svg>
    </View>
  );
}
