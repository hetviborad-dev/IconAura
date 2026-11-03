import React, { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  FlatList,
  Image,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'react-native';
import { BlurView } from '@sbaiahmed1/react-native-blur';
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
  preview?: string;
  theme: ThemeDefinition;
}

function LoadingSkeleton() {
  return (
    <FlatList
      data={[...Array(12)]}
      renderItem={() => (
        <View style={styles.wallpaperContainer}>
          <Skeleton borderRadius={Radius.sm} />
        </View>
      )}
      keyExtractor={(_, index) => `skeleton-${index}`}
      numColumns={2}
      contentContainerStyle={styles.grid}
      showsVerticalScrollIndicator={false}
      scrollEnabled={false}
      pointerEvents="none"
    />
  );
}

import { getCloudinaryImageUrl } from '../utils/helpers';
import FontText from '../components/FontText';

function flattenThemes(themes: ThemeDefinition[]): WallpaperItem[] {
  const items: WallpaperItem[] = [];
  themes.forEach(theme => {
    (theme.wallpapers || []).forEach(asset => {
      items.push({
        url: typeof asset === 'string' ? asset : asset.url,
        preview: typeof asset === 'string' ? undefined : asset.preview,
        theme,
      });
    });
  });
  return items;
}
const PAGE_SIZE = 20;

export default function WallpaperScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { isPremium } = useSubscription();
  const insets = useSafeAreaInsets();
  const [wallpapers, setWallpapers] = useState<WallpaperItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedWallpaper, setSelectedWallpaper] = useState<WallpaperItem | null>(null);

  const backgroundColor = Colors.background;
  const textColor = Colors.textPrimary;

  const loadWallpapers = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const result = await fetchPublicThemes(1, PAGE_SIZE);
      setWallpapers(flattenThemes(result.data));
      setPage(1);
      setHasMore(result.hasMore);
    } catch (e) {
      console.error('Failed to load wallpapers:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const loadMoreWallpapers = useCallback(async () => {
    if (loading || refreshing || loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const result = await fetchPublicThemes(nextPage, PAGE_SIZE);
      setWallpapers(prev => [...prev, ...flattenThemes(result.data)]);
      setPage(nextPage);
      setHasMore(result.hasMore);
    } catch (e) {
      console.error('Failed to load more wallpapers:', e);
    } finally {
      setLoadingMore(false);
    }
  }, [loading, refreshing, loadingMore, hasMore, page]);

  useFocusEffect(
    useCallback(() => {
      loadWallpapers(true);
      return undefined;
    }, [loadWallpapers]),
  );

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
      activeOpacity={1}
    >
      <Image source={{ uri: item.preview || getCloudinaryImageUrl(item.url, 360, 640) }} style={styles.wallpaperImage} />
      {item.theme.isPremium && !isPremium && (
        <View style={styles.premiumBadge}>
          <Icon name="lock-closed" size={9} color="white" />
          <FontText color="#FFFFFF" size={10} name="bold" style={styles.uppercaseText}>PRO</FontText>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['bottom', 'left', 'right']}>
      {/* @ts-ignore */}
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <View style={[styles.header, { paddingTop: insets.top + Spacing.sm, overflow: 'hidden', position: 'relative', minHeight: insets.top + Spacing.xl * 3 }]}>
        <Image
          source={{ uri: 'https://res.cloudinary.com/q1mpw8j0/image/upload/v1793720438/copy_of_59d85fdf5cd9aea7802a4b926ed2dd2b.jpg' }}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
        />
        <BlurView
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
          blurType="light"
          blurAmount={16}
          blurRounds={16}
          overlayColor="rgba(255,255,255,0.18)"
        />
        <FontText color={textColor} size={Typography.sizes.h1} name="bold">Wallpapers</FontText>
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
          onEndReached={loadMoreWallpapers}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loadingMore ? (
              <ActivityIndicator
                size="small"
                color={Colors.primary}
                style={styles.activityIndicator}
              />
            ) : undefined
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadWallpapers(true)}
              colors={[Colors.primary]}
              tintColor={Colors.primary}
            />
          }
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
    paddingVertical: Spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
    backgroundColor: 'transparent',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
  },
  uppercaseText: { textTransform: 'uppercase' },
  activityIndicator: { marginVertical: 16 },
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
});