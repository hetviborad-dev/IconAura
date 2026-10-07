/**
 * DynamicIconRenderer - Renders icons on-demand for any theme/icon combo
 */

import React from 'react';
import { findNodeHandle, View } from 'react-native';
import ViewShot, { captureRef, type ViewShotRef } from 'react-native-view-shot';
import type { AppId } from '../types/data';
import type { ThemeDefinition } from '../types/data';
import IconCanvas from './IconCanvas';

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

  return (
    <ViewShot ref={viewRef} style={styles.capture}>
      <IconCanvas
        appId={appId}
        theme={theme}
        size={1024}
      />
    </ViewShot>
  );
}

const styles = {
  capture: { position: 'absolute' as const, left: -2000, top: 0, width: 1024, height: 1024 },
};
