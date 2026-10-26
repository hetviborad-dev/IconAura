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
  isCapture?: boolean;
}

export default function IconCanvas({ appId, theme, size, isCapture = false }: IconCanvasProps) {
  
  return (
    <View style={[
      styles.container,
      {
        width: size,
        height: size,
        borderRadius: isCapture ? 0 : size * 0.22
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
