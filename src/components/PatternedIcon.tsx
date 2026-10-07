import React, { useMemo, memo } from 'react';
import { Svg, Defs, Pattern, Image, Mask, Rect, G } from 'react-native-svg';
import type { AppId } from '../types/data';
import { APP_ICON_COMPONENTS } from '../data/app-icons';
import type { ImageSourcePropType } from 'react-native';

interface PatternedIconProps {
  appId: AppId;
  patternImage: ImageSourcePropType;
  size: number;
}

const PatternedIcon = memo(function PatternedIcon({ appId, patternImage, size }: PatternedIconProps) {
  const Icon = APP_ICON_COMPONENTS[appId];
  if (typeof Icon !== 'function') {
    console.error(`SVG icon for "${appId}" did not resolve to a component.`);
    return null;
  }

  const patternSize = size;
  const uniqueId = useMemo(() => `pattern-${appId}`, [appId]);
  const maskId = useMemo(() => `mask-${appId}`, [appId]);

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <Defs>
        <Pattern
          id={uniqueId}
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

        <Mask id={maskId}>
          <G fill="white">
            <Icon
              width={size}
              height={size}
              fill="white"
              color="white"
            />
          </G>
        </Mask>
      </Defs>

      <Rect
        width={size}
        height={size}
        fill={`url(#${uniqueId})`}
        mask={`url(#${maskId})`}
      />
    </Svg>
  );
});

export default PatternedIcon;
