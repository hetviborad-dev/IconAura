import React, { useState, useEffect } from 'react';
import {
  View,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
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
import { useSubscription } from '../context/SubscriptionContext';
import type { ThemeDefinition } from '../types/data';
import WallpaperSelectionModal from '../components/WallpaperSelectionModal';
import Skeleton from '../components/Skeleton';
import Icon from 'react-native-vector-icons/Ionicons';

interface WallpaperItem {
  url: string;
  theme: ThemeDefinition;
}

function LoadingSkeleton() {
  return (
    <View style={styles.grid}>
      {[...Array(12)].map((_, i) => (
        <View key={i} style={styles.wallpaperContainer}>
          <Skeleton borderRadius={Radius.sm} />
        </View>
      ))}
    </View>
  );
}

export default function WallpaperScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { isPremium } = useSubscription();
  const [wallpapers, setWallpapers] = useState<WallpaperItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWallpaper, setSelectedWallpaper] = useState<WallpaperItem | null>(null);

  const backgroundColor = Colors.background;
  const textColor = Colors.textPrimary;

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
    if (selectedWallpaper?.theme.isPremium && !isPremium) {
      navigation.navigate('Premium');
      return;
    }
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
      {item.theme.isPremium && !isPremium && (
        <View style={styles.premiumBadge}>
          <Icon name="lock-closed" size={12} color="white" />
          <Text style={styles.premiumText}>Premium</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: textColor }]}>Wallpapers</Text>
      </View>
      {loading ? (
        <LoadingSkeleton />
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
          isPremiumTheme={selectedWallpaper.theme.isPremium}
          isUserPremium={isPremium}
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
    backgroundColor: Colors.surface,
    position: 'relative',
  },
  wallpaperImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  premiumBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    gap: 2,
    borderWidth: 1,
    borderColor: Colors.primary,
    zIndex: 10,
  },
  premiumText: {
    color: 'white',
    fontSize: 8,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
});
