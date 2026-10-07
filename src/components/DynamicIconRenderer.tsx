/**
 * DynamicIconRenderer - Renders icons on-demand for any theme/icon combo
 * Replaces pre-generated PNG approach with on-demand rendering
 */

import React from 'react';
import { findNodeHandle, View } from 'react-native';
import ViewShot, { captureRef, type ViewShotRef } from 'react-native-view-shot';
import type { AppId } from '../types/data';
import AppSvgIcon from './AppSvgIcon';
import type { ThemeDefinition } from '../types/data';

interface DynamicIconRendererProps {
  appId: AppId;
  theme: ThemeDefinition;
  onReady: (capture: () => Promise<string>) => void;
}

export default function DynamicIconRenderer({
  appId,
  theme,
  onReady,
}: DynamicIconRendererProps) {
  const viewRef = React.useRef<ViewShotRef>(null);

  React.useEffect(() => {
    onReady(() => {
      if (!viewRef.current) return Promise.reject(new Error('Icon view not ready'));
      const viewHandle = findNodeHandle(viewRef.current);
      if (!viewHandle) return Promise.reject(new Error('Icon view not attached'));
      return captureRef(viewHandle, {
        format: 'png',
        result: 'base64',
        width: 1024,
        height: 1024,
      });
    });
  }, [appId, theme, onReady]);

  const bgColor = theme.pattern === 'crimson-bloom' ? 'transparent' : theme.colors.background;

  return (
    <ViewShot ref={viewRef} style={styles.capture}>
      <View
        style={[
          styles.canvas,
          { backgroundColor: bgColor },
        ]}
      >
        <AppSvgIcon
          appId={appId}
          iconColor={theme.colors.icon}
          size={1024}
          pattern={theme.pattern}
        />
      </View>
    </ViewShot>
  );
}

const styles = {
  capture: { position: 'absolute' as const, left: -2000, top: 0, width: 1024, height: 1024 },
  canvas: {
    width: 1024,
    height: 1024,
    padding: 0,
    margin: 0,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
};
