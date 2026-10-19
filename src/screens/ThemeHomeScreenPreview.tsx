import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  Dimensions,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { ThemeDefinition, AppId } from '../types/data';
import { Spacing, Typography, Radius, Layout } from '../constants/design';
import IconCanvas from '../components/IconCanvas';

const { width, height } = Dimensions.get('window');

// Default wallpaper asset
const DEFAULT_WALLPAPER = require('../assets/images/wallpaper/image.jpeg');

interface Props {
  navigation: NativeStackNavigationProp<RootStackParamList, 'ThemeHomeScreenPreview'>;
  route: {
    params: {
      theme: ThemeDefinition;
    };
  };
}

const DOCK_APPS: AppId[] = ['camera', 'phone', 'messages', 'chrome'];

export default function ThemeHomeScreenPreview({ navigation, route }: Props) {
  const { theme } = route.params;
  const [wallpaperIndex, setWallpaperIndex] = useState(0);

  // Use theme wallpapers if available, otherwise use the default one
  const wallpapers = (theme.wallpapers && theme.wallpapers.length > 0)
    ? theme.wallpapers
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
    flex: 1,
    backgroundColor: 'black',
  },
  backgroundLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  wallpaper: {
    width: width,
    height: height,
  },
  uiLayer: {
    ...StyleSheet.absoluteFillObject,
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
