import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Image,
  ScrollView,
  Dimensions,
  Text,
} from 'react-native';
import { ThemeDefinition, AppId } from '../types/data';
import { Layout, Colors } from '../constants/design';
import IconCanvas from './IconCanvas';
import Icon from 'react-native-vector-icons/Ionicons';

const { width, height } = Dimensions.get('window');


const DEFAULT_WALLPAPER = require('../assets/images/wallpaper/image.jpeg');

const DOCK_APPS: AppId[] = ['camera', 'phone', 'messages', 'chrome'];

import { getCloudinaryImageUrl } from '../utils/helpers';

interface Props {
  theme: ThemeDefinition;
}

export default function ThemePreviewCard({ theme }: Props) {
  const [wallpaperIndex, setWallpaperIndex] = useState(0);

  
  const wallpapers = (theme.wallpapers && theme.wallpapers.length > 0)
    ? theme.wallpapers.map((w) => getCloudinaryImageUrl(typeof w === 'string' ? w : w.url, 720, 1280))
    : [DEFAULT_WALLPAPER];

  const handleWallpaperScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / width);
    setWallpaperIndex(index);
  };

  return (
    <View style={styles.container}>
      <View style={styles.backgroundLayer}>
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleWallpaperScroll}
          scrollEventThrottle={16}
        >
          {wallpapers.map((url, index) => (
            <Image
              key={index}
              source={typeof url === 'string' ? { uri: url } : url}
              style={styles.wallpaper}
              resizeMode="cover"
            />
          ))}
        </ScrollView>
      </View>

      <View style={styles.uiLayer}>
        <View style={styles.bottomContainer}>
          {wallpapers.length > 1 && (
            <View style={styles.pageIndicator}>
              {wallpapers.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.dot,
                    { backgroundColor: wallpaperIndex === index ? 'white' : 'rgba(255,255,255,0.5)' },
                  ]}
                />
              ))}
            </View>
          )}

          <View style={styles.dock}>
            {DOCK_APPS.map((appId) => (
              <View key={appId} style={styles.dockAppContainer}>
                <IconCanvas appId={appId} theme={theme} size={60} />
              </View>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: width,
    height: height,
    backgroundColor: 'black',
  },
  backgroundLayer: {
    ...StyleSheet.absoluteFill,
    zIndex: 1,
  },
  wallpaper: {
    width: width,
    height: height,
  },
  uiLayer: {
    ...StyleSheet.absoluteFill,
    zIndex: 10,
    pointerEvents: 'box-none',
  },
  bottomContainer: {
    position: 'absolute',
    bottom: height * 0.08,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 15,
  },
  premiumBadge: {
    position: 'absolute',
    top: 80,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.8)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    borderWidth: 2,
    borderColor: '#FFD700',
    zIndex: 999,
  },
  premiumText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  pageIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginBottom: 20,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dock: {
    flexDirection: 'row',
    padding: 12,
    gap: 30,
  },
  dockAppContainer: {
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
