import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Dimensions,
  ActivityIndicator,
  TouchableOpacity,
  Text,
  useColorScheme,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { ThemeDefinition } from '../types/data';
import { fetchPublicThemes } from '../services/themeService';
import ThemePreviewCard from '../components/ThemePreviewCard';
import WallpaperSelectionModal from '../components/WallpaperSelectionModal';
import { setWallpaper } from '../services/wallpaperService';
import Icon from 'react-native-vector-icons/Ionicons';

const { height } = Dimensions.get('window');

export default function ThemeExploreScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const isDarkMode = useColorScheme() === 'dark';
  const [themes, setThemes] = useState<ThemeDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentThemeIndex, setCurrentThemeIndex] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  const captureIcons = useRef<Partial<Record<string, () => Promise<string>>>>({});

  useEffect(() => {
    async function loadThemes() {
      try {
        const publicThemes = await fetchPublicThemes();
        setThemes(publicThemes);
      } catch (error) {
        console.error('Failed to load themes for explore:', error);
      } finally {
        setLoading(false);
      }
    }

    loadThemes();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleScroll = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const index = Math.round(offsetY / height);
    if (index !== currentThemeIndex && index >= 0 && index < themes.length) {
      setCurrentThemeIndex(index);
    }
  };

  const handleApplyWallpaper = async (target: 'home' | 'lock' | 'both') => {
    const theme = themes[currentThemeIndex];
    const wallpaperUrl = (theme.wallpapers && theme.wallpapers.length > 0)
      ? theme.wallpapers[0]
      : '';

    if (!wallpaperUrl) {
      Alert.alert('Error', 'No wallpaper available for this theme');
      return;
    }

    const result = await setWallpaper(wallpaperUrl, target);
    if (result.success) {
      Alert.alert('Success', `Wallpaper applied to ${target} screen!`);
    } else {
      Alert.alert('Error', result.error || 'Failed to apply wallpaper');
    }
    setModalVisible(false);
  };

  const handleNavigateToDetail = () => {
    const theme = themes[currentThemeIndex];
    if (theme) {
      setModalVisible(false);
      navigation.navigate('ThemeDetail', { theme });
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="white" />
      </View>
    );
  }

  const currentTheme = themes[currentThemeIndex];

  return (
    <View style={styles.container}>
      <FlatList
        data={themes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ThemePreviewCard theme={item} />
        )}
        pagingEnabled
        vertical
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        snapToInterval={height}
        snapToAlignment="start"
        decelerationRate="fast"
      />

      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => navigation.navigate('Home')}
      >
        <Icon name="close" size={28} color="white" />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.applyIconButton}
        onPress={() => setModalVisible(true)}
      >
        <Icon name="checkmark-circle" size={28} color="white" />
      </TouchableOpacity>

      <View style={styles.clockContainer}>
        <Icon name="time" size={24} color="white" />
        <Text style={styles.clockText}>{currentTime}</Text>
      </View>

      <WallpaperSelectionModal
        visible={modalVisible}
        isDarkMode={isDarkMode}
        wallpaperUrl={(currentTheme?.wallpapers && currentTheme.wallpapers.length > 0)
          ? currentTheme.wallpapers[0]
          : ''}
        onClose={() => setModalVisible(false)}
        onApply={handleApplyWallpaper}
        showApplyTheme={true}
        onApplyTheme={handleNavigateToDetail}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  center: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 100,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  applyIconButton: {
    position: 'absolute',
    top: 50,
    right: 74, // Offset from close button
    zIndex: 100,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  clockContainer: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 100,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 22,
  },
  clockText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
