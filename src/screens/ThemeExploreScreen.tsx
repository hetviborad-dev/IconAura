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
import { useSubscription } from '../context/SubscriptionContext';
import { fetchPublicThemes } from '../services/themeService';
import ThemePreviewCard from '../components/ThemePreviewCard';
import WallpaperSelectionModal from '../components/WallpaperSelectionModal';
import { setWallpaper } from '../services/wallpaperService';
import { saveTheme, unsaveTheme, getSavedThemes } from '../services/local/themeStorage';
import { useInterstitialAd } from '../hooks/useInterstitialAd';
import Icon from 'react-native-vector-icons/Ionicons';
import Skeleton from '../components/Skeleton';

const { height } = Dimensions.get('window');

function LoadingSkeleton() {
  return (
    <View style={styles.container}>
      <Skeleton height={height} />

      <View style={styles.closeButton}>
        <Skeleton width={44} height={44} borderRadius={22} />
      </View>

      <View style={styles.applyIconButton}>
        <Skeleton width={44} height={44} borderRadius={22} />
      </View>

      <View style={styles.saveIconButton}>
        <Skeleton width={44} height={44} borderRadius={22} />
      </View>

      <View style={styles.clockContainer}>
        <Skeleton width={24} height={24} borderRadius={12} />
        <Skeleton width={60} height={20} borderRadius={10} />
      </View>
    </View>
  );
}

export default function ThemeExploreScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const isDarkMode = useColorScheme() === 'dark';
  const { isPremium } = useSubscription();
  const [themes, setThemes] = useState<ThemeDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [currentThemeIndex, setCurrentThemeIndex] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  const [savedThemeIds, setSavedThemeIds] = useState<Set<string>>(new Set());
  const captureIcons = useRef<Partial<Record<string, () => Promise<string>>>>({});
  const lastAdIndex = useRef<number>(-1);
  const { showAd } = useInterstitialAd();

  useEffect(() => {
    async function initialize() {
      try {
        const [result, savedThemes] = await Promise.all([
          fetchPublicThemes(1, 20),
          getSavedThemes(),
        ]);
        setThemes(result.data);
        setHasMore(result.hasMore);
        setSavedThemeIds(new Set(savedThemes.map(t => t.id)));
      } catch (error) {
        console.error('Failed to initialize explore screen:', error);
      } finally {
        setLoading(false);
      }
    }

    initialize();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLoadMore = async () => {
    if (!hasMore || loadingMore) return;

    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const result = await fetchPublicThemes(nextPage, 20);

      setThemes(prev => [...prev, ...result.data]);
      setHasMore(result.hasMore);
      setPage(nextPage);
    } catch (error) {
      console.error('Failed to load more themes:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleScroll = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const index = Math.round(offsetY / height);
    if (index !== currentThemeIndex && index >= 0 && index < themes.length) {
      setCurrentThemeIndex(index);

      // Trigger interstitial ad every 5 themes
      if (index > 0 && index % 5 === 0 && index !== lastAdIndex.current && !isPremium) {
        showAd();
        lastAdIndex.current = index;
      }
    }
  };

  const handleToggleSave = async () => {
    const theme = themes[currentThemeIndex];
    if (!theme) return;

    const isCurrentlySaved = savedThemeIds.has(theme.id);
    const nextSavedIds = new Set(savedThemeIds);

    if (isCurrentlySaved) {
      const success = await unsaveTheme(theme.id);
      if (success) {
        nextSavedIds.delete(theme.id);
        setSavedThemeIds(nextSavedIds);
      }
    } else {
      const result = await saveTheme(theme);
      if (result.success) {
        nextSavedIds.add(theme.id);
        setSavedThemeIds(nextSavedIds);
      }
    }
  };

  const handleApplyWallpaper = async (target: 'home' | 'lock' | 'both') => {
    if (!isPremium) {
      navigation.navigate('Premium');
      return;
    }
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
    return <LoadingSkeleton />;
  }

  const currentTheme = themes[currentThemeIndex];
  const isSaved = currentTheme ? savedThemeIds.has(currentTheme.id) : false;

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
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={() => (
          loadingMore ? (
            <View style={styles.footerLoader}>
              <ActivityIndicator size="small" color="white" />
            </View>
          ) : null
        )}
      />

      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => navigation.navigate('Home')}
      >
        <Icon name="close" size={28} color="white" />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.applyIconButton}
        onPress={() => {
          if (currentTheme?.wallpapers && currentTheme.wallpapers.length > 0) {
            setModalVisible(true);
          } else {
            handleNavigateToDetail();
          }
        }}
      >
        <Icon name="checkmark-circle" size={28} color="white" />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.saveIconButton}
        onPress={handleToggleSave}
        >
        <View style={styles.saveIconContainer}>
          <Icon
            name={isSaved ? 'heart' : 'heart-outline'}
            size={28}
            color={isSaved ? '#FF4B4B' : 'white'}
            />
        </View>
      </TouchableOpacity>

      {(currentTheme?.isPremium && !isPremium) && (
        <View style={styles.premiumIndicator}>
          <Icon name="lock-closed" size={16} color="#FFD700" />
          <Text style={styles.premiumText}>Premium</Text>
        </View>
      )}

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
  saveIconButton: {
    position: 'absolute',
    top: 50,
    right: 128, // Offset from apply button
    zIndex: 100,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveIconContainer: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockIcon: {
    position: 'absolute',
    top: -4,
    right: -4,
    zIndex: 1,
  },
  premiumIndicator: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 100,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 22,
  },
  premiumText: {
    color: '#FFD700',
    fontSize: 14,
    fontWeight: 'bold',
    textTransform: 'uppercase',
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
  footerLoader: {
    height: height,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
  },
});
