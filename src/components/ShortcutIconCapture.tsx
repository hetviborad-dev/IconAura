import React from 'react';
import { findNodeHandle, View } from 'react-native';
import ViewShot, { captureRef, type ViewShotRef } from 'react-native-view-shot';
import type { AppId } from '../types/data';
import AppSvgIcon from './AppSvgIcon';

interface ShortcutIconCaptureProps {
  appId: AppId;
  iconColor: string;
  backgroundColor: string;
  pattern?: 'leopard' | 'crimson-bloom';
  onCaptureReady: (appId: AppId, capture: () => Promise<string>) => void;
}

export default function ShortcutIconCapture({
  appId,
  iconColor,
  backgroundColor,
  pattern,
  onCaptureReady,
}: ShortcutIconCaptureProps) {
  const viewRef = React.useRef<ViewShotRef>(null);

  React.useEffect(() => {
    onCaptureReady(appId, () => {
      if (!viewRef.current) return Promise.reject(new Error('Icon view is not ready'));
      const viewHandle = findNodeHandle(viewRef.current);
      if (!viewHandle) return Promise.reject(new Error('Icon view is not attached to the native tree'));
      return captureRef(viewHandle, { format: 'png', result: 'base64', width: 1024, height: 1024 });
    });
  }, [appId, onCaptureReady]);

  return (
    <ViewShot ref={viewRef} style={styles.capture}>
      <View style={[styles.iconCanvas, { backgroundColor: pattern === 'crimson-bloom' ? 'transparent' : backgroundColor }]}>
        <AppSvgIcon appId={appId} iconColor={iconColor} size={1024} pattern={pattern} fullSize={true} />
      </View>
    </ViewShot>
  );
}

const styles = {
  capture: { position: 'absolute' as const, left: -600, top: 0, width: 1024, height: 1024 },
  iconCanvas: {
    width: 1024,
    height: 1024,
    padding: 0,
    margin: 0,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
};
