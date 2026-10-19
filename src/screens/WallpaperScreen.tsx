import React, { useState, useEffect } from 'react';
import {
  View,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  useColorScheme,
  StyleSheet,
  Text,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography, Layout, Radius } from '../constants/design';
import { RootStackParamList } from '../types/navigation';
import { fetchPublicThemes } from '../services/themeService';
import { setWallpaper } from '../services/wallpaperService';
import type { ThemeDefinition } from '../types/data';
import WallpaperSelectionModal from '../components/WallpaperSelectionModal';

interface WallpaperItem {
  url: string;
  theme: ThemeDefinition;
}

export default function WallpaperScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const isDarkMode = useColorScheme() === 'dark';
  const [wallpapers, setWallpapers] = useState<WallpaperItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWallpaper, setSelectedWallpaper] = useState<WallpaperItem | null>(null);

  const backgroundColor = isDarkMode ? Colors.dark.background : Colors.background;
  const textColor = isDarkMode ? Colors.dark.textPrimary : Colors.textPrimary;

  useEffect(() => {
    async function loadWallpapers() {
      try {
        setLoading(true);
        const result = await fetchPublicThemes();
        const themes = result.data;
        const allWallpapers: WallpaperItem[] = [];

        themes.forEach(theme => {
          (theme.wallpapers || []).forEach(url => {
            allWallpapers.push({ url, theme });
          });
        });

        setWallpapers(allWallpapers);
      } catch (e) {
        console.error('Failed to load wallpapers:', e);
      } finally {
        setLoading(false);
      }
    }
    loadWallpapers();
  }, []);

  const handleApplyWallpaper = async (target: 'home' | 'lock' | 'both') => {
    const result = await setWallpaper(selectedWallpaper!.url, target);
    if (result.success) {
      Alert.alert('Success', `Wallpaper applied to ${target} screen!`);
    } else {
      Alert.alert('Error', result.error || 'Failed to apply wallpaper');
    }
    setSelectedWallpaper(null);
  };

  const renderWallpaper = ({ item }: { item: WallpaperItem }) => (
    <TouchableOpacity
      style={styles.wallpaperContainer}
      onPress={() => setSelectedWallpaper(item)}
      activeOpacity={0.8}
    >
      <Image source={{ uri: item.url }} style={styles.wallpaperImage} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: textColor }]}>Wallpapers</Text>
      </View>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={wallpapers}
          renderItem={renderWallpaper}
          keyExtractor={(item, index) => `${item.url}-${index}`}
          numColumns={2}
          contentContainerStyle={styles.grid}
          showsVerticalScrollIndicator={false}
        />
      )}

      {selectedWallpaper && (
        <WallpaperSelectionModal
          visible={!!selectedWallpaper}
          wallpaperUrl={selectedWallpaper.url}
          isDarkMode={isDarkMode}
          onClose={() => setSelectedWallpaper(null)}
          onApply={handleApplyWallpaper}
          showApplyTheme={true}
          onApplyTheme={() => {
            setSelectedWallpaper(null);
            navigation.navigate('ThemeDetail', { theme: selectedWallpaper.theme });
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: Layout.screenPadding,
    paddingVertical: Spacing.xl,
  },
  title: {
    fontSize: Typography.sizes.h1,
    fontWeight: Typography.weights.bold,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  grid: {
    paddingHorizontal: Layout.screenPadding,
    paddingBottom: Spacing.xxxl,
  },
  wallpaperContainer: {
    flex: 1,
    margin: Spacing.xs / 2,
    aspectRatio: 9 / 16,
    borderRadius: Radius.sm,
    overflow: 'hidden',
    backgroundColor: '#eee',
  },
  wallpaperImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
});
