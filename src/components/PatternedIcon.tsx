
import React, { memo } from 'react';
import {
  Svg,
  Defs,
  Pattern,
  Image,
  Mask,
  Rect,
  G,
} from 'react-native-svg';

import type { AppId } from '../types/data';
import { APP_ICON_COMPONENTS } from '../data/app-icons';
import type { ImageSourcePropType } from 'react-native';

interface PatternedIconProps {
  appId: AppId;
  patternImage: ImageSourcePropType;
  size: number;
}

const PatternedIcon = memo(function PatternedIcon({
  appId,
  patternImage,
  size,
}: PatternedIconProps) {
  const Icon = APP_ICON_COMPONENTS[appId];

  if (typeof Icon !== 'function') {
    console.error(
      `SVG icon for "${appId}" did not resolve to a component.`
    );
    return null;
  }

  // IDs must be unique when multiple icons render together.
  const uniqueId = `pattern-${appId}-${size}`;
  const maskId = `mask-${appId}-${size}`;

  return (
    <Svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
    >
      <Defs>
        <Pattern
          id={uniqueId}
          patternUnits="userSpaceOnUse"
          width={size}
          height={size}
        >
          <Image
            href={patternImage}
            width={size}
            height={size}
            preserveAspectRatio="xMidYMid slice"
          />
        </Pattern>
      </Defs>

      {/* Keep the mask outside Defs to avoid the native
          DefsView-to-RenderableView cast failure. */}
      <Mask
  id={maskId}
  x="0"
  y="0"
  width={size}
  height={size}
  maskUnits="userSpaceOnUse"
>
  <Rect
    x={0}
    y={0}
    width={size}
    height={size}
    fill="black"
  />

  <G fill="white" color="white">
    <Icon
      width={size}
      height={size}
      fill="white"
      color="white"
    />
  </G>
</Mask>

      <Rect
        x={0}
        y={0}
        width={size}
        height={size}
        fill={`url(#${uniqueId})`}
        mask={`url(#${maskId})`}
      />
    </Svg>
  );
});

export default PatternedIcon;
