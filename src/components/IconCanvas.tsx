import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import type { AppId } from '../types/data';
import type { ThemeDefinition } from '../types/data';
import BackgroundLayer from './BackgroundLayer';
import IconLayer from './IconLayer';

interface IconCanvasProps {
  appId: AppId;
  theme: ThemeDefinition;
  size: number;
  isCapture?: boolean;
  shape?: 'round' | 'square';
}

export default function IconCanvas({ appId, theme, size, isCapture = false, shape }: IconCanvasProps) {

  const borderRadius = useMemo(() => {
    if (shape === 'round') return size / 2;
    if (shape === 'square') return size * 0.1;
    return isCapture ? 0 : size * 0.22;
  }, [shape, size, isCapture]);

  return (
    <View style={[
      styles.container,
      {
        width: size,
        height: size,
        borderRadius: borderRadius
      }
    ]}>
      <BackgroundLayer layer={theme.background} size={size} />
      <View style={styles.iconWrapper}>
        <IconLayer
          appId={appId}
          layer={theme.icon}
          size={size * 0.6}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  iconWrapper: {
    zIndex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
