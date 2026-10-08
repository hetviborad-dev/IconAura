import React from 'react';
import { View, StyleSheet } from 'react-native';
import type { AppId } from '../types/data';
import type { ThemeDefinition } from '../types/data';
import BackgroundLayer from './BackgroundLayer';
import IconLayer from './IconLayer';

interface IconCanvasProps {
  appId: AppId;
  theme: ThemeDefinition;
  size: number;
  shape?: 'round' | 'square';
}

export default function IconCanvas({ appId, theme, size, shape = 'round' }: IconCanvasProps) {
  // We use a fixed size for the capture canvas (e.g., 1024)
  return (
    <View style={[
      styles.container,
      {
        width: size,
        height: size,
        borderRadius: shape === 'round' ? size : size * 0.05
      }
    ]}>
      <BackgroundLayer layer={theme.background} size={size} />
      <View style={styles.iconWrapper}>
        <IconLayer
          appId={appId}
          layer={theme.icon}
          size={size * 0.6} // Scale the icon to 60% of the canvas size
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
