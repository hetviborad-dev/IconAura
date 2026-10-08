import React from 'react';
import { findNodeHandle } from 'react-native';
import ViewShot, { captureRef, type ViewShotRef } from 'react-native-view-shot';
import type { AppId } from '../types/data';
import type { ThemeDefinition } from '../types/data';
import IconCanvas from './IconCanvas';

interface ShortcutIconCaptureProps {
  appId: AppId;
  theme: ThemeDefinition;
  shape?: 'round' | 'square';
  onCaptureReady: (appId: AppId, capture: () => Promise<string>) => void;
}

export default function ShortcutIconCapture({
  appId,
  theme,
  shape = 'round',
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
  }, [appId, theme, shape, onCaptureReady]);

  return (
    <ViewShot ref={viewRef} style={styles.capture}>
      <IconCanvas appId={appId} theme={theme} size={1024} shape={shape} />
    </ViewShot>
  );
}
}

const styles = {
  capture: { position: 'absolute' as const, left: -600, top: 0, width: 1024, height: 1024 },
};
