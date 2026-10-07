import React from 'react';
import { Svg, Defs, Pattern, Image, Mask, Rect } from 'react-native-svg';
import type { AppId } from '../types/data';
import { APP_ICON_COMPONENTS } from '../data/app-icons';
import type { ImageSourcePropType } from 'react-native';

interface PatternedIconProps {
  appId: AppId;
  patternImage: ImageSourcePropType;
  size: number;
}

export default function PatternedIcon({ appId, patternImage, size }: PatternedIconProps) {
  const Icon = APP_ICON_COMPONENTS[appId];
  if (typeof Icon !== 'function') {
    console.error(`SVG icon for "${appId}" did not resolve to a component.`);
    return null;
  }

  // Pattern size (tiling size)
  const patternSize = size * 0.2;

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <Defs>
        {/* 1. The tiling texture pattern */}
        <Pattern
          id="iconPattern"
          patternUnits="userSpaceOnUse"
          width={patternSize}
          height={patternSize}
        >
          <Image
            href={patternImage}
            width={patternSize}
            height={patternSize}
            preserveAspectRatio="xMidYMid slice"
          />
        </Pattern>

        {/* 2. The mask based on the App's SVG shape */}
        <Mask id="iconMask">
          {/* Render the icon in white to define the mask area */}
          <Icon
            width={size}
            height={size}
            fill="white"
            color="white"
          />
        </Mask>
      </Defs>

      {/* 3. Render a rectangle that is filled with the pattern and clipped by the mask */}
      <Rect
        width={size}
        height={size}
        fill="url(#iconPattern)"
        mask="url(#iconMask)"
      />
    </Svg>
  );
}
