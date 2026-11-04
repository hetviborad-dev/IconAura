import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Dimensions,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Spacing } from '../constants/design';
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
import FontText from '../components/FontText';

const { height } = Dimensions.get('window');

const ExploreFooter = ({ loadingMore }: { loadingMore: boolean }) => (
  loadingMore ? (
    <View style={styles.footerLoader}>
      <ActivityIndicator size="small" color="white" />
    </View>
  ) : null
);

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
  const navigation = useNavigation<any>();
  const { isPremium } = useSubscription();
  const [themes, setThemes] = useState<ThemeDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [currentThemeIndex, setCurrentThemeIndex] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [savedThemeIds, setSavedThemeIds] = useState<Set<string>>(new Set());
  const lastAdIndex = useRef<number>(-1);
  const { showAd } = useInterstitialAd();

  const [showScrollHint, setShowScrollHint] = useState(false);
  const scrollHintOpacity = useRef(new Animated.Value(0)).current;
  const scrollHintTranslate = useRef(new Animated.Value(0)).current;
  const hintDismissedRef = useRef(false);

  const [showWallpaperHint, setShowWallpaperHint] = useState(false);
  const wallpaperHintOpacity = useRef(new Animated.Value(0)).current;
  const wallpaperHintTranslate = useRef(new Animated.Value(60)).current;
  const wallpaperHintDismissedRef = useRef(false);

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
    if (loading) return;
    let cancelled = false;
    (async () => {
      try {
        const seenVertical = await AsyncStorage.getItem('themeExploreScrollHintSeen');
        if (cancelled) return;
        if (!seenVertical) {
          setShowScrollHint(true);
          Animated.timing(scrollHintOpacity, {
            toValue: 1,
            duration: 350,
            useNativeDriver: true,
          }).start();

          Animated.loop(
            Animated.sequence([
              Animated.timing(scrollHintTranslate, {
                toValue: -14,
                duration: 550,
                easing: (t: number) => 1 - Math.pow(1 - t, 3),
                useNativeDriver: true,
              }),
              Animated.timing(scrollHintTranslate, {
                toValue: 0,
                duration: 550,
                easing: (t: number) => t * t * t,
                useNativeDriver: true,
              }),
            ]),
          ).start();

          // Keep the hint (and its looped animation) visible until the user scrolls.
          return;
        }

        const seenWallpaper = await AsyncStorage.getItem('themeExploreWallpaperHintSeen');
        if (cancelled || seenWallpaper) return;
        setShowWallpaperHint(true);
        Animated.timing(wallpaperHintOpacity, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }).start();
        Animated.loop(
          Animated.sequence([
            Animated.timing(wallpaperHintTranslate, {
              toValue: -70,
              duration: 900,
              easing: (t: number) => 1 - Math.pow(1 - t, 2),
              useNativeDriver: true,
            }),
            Animated.timing(wallpaperHintTranslate, {
              toValue: 60,
              duration: 0,
              useNativeDriver: true,
            }),
          ]),
        ).start();
        // Keep the hint visible until the user scrolls the wallpaper horizontally.
      } catch {
        // ignore
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

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

  const dismissScrollHint = () => {
    if (hintDismissedRef.current) return;
    hintDismissedRef.current = true;
    Animated.timing(scrollHintOpacity, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setShowScrollHint(false);
      AsyncStorage.setItem('themeExploreScrollHintSeen', 'true').catch(() => {});
      setTimeout(() => {
        if (wallpaperHintDismissedRef.current) return;
        AsyncStorage.getItem('themeExploreWallpaperHintSeen').then((seen) => {
          if (seen) return;
          setShowWallpaperHint(true);
          Animated.timing(wallpaperHintOpacity, {
            toValue: 1,
            duration: 350,
            useNativeDriver: true,
          }).start();
          Animated.loop(
            Animated.sequence([
              Animated.timing(wallpaperHintTranslate, {
                toValue: -70,
                duration: 900,
                easing: (t: number) => 1 - Math.pow(1 - t, 2),
                useNativeDriver: true,
              }),
              Animated.timing(wallpaperHintTranslate, {
                toValue: 60,
                duration: 0,
                useNativeDriver: true,
              }),
            ]),
          ).start();
          // Keep the hint (and its looped animation) visible until horizontal scroll.
        });
      }, 700);
    });
  };

  const dismissWallpaperHint = () => {
    if (wallpaperHintDismissedRef.current) return;
    wallpaperHintDismissedRef.current = true;
    Animated.timing(wallpaperHintOpacity, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setShowWallpaperHint(false);
      AsyncStorage.setItem('themeExploreWallpaperHintSeen', 'true').catch(() => {});
    });
  };

  const handleScroll = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    if (showScrollHint && offsetY > 20) {
      dismissScrollHint();
    }
    const index = Math.round(offsetY / height);
    if (index !== currentThemeIndex && index >= 0 && index < themes.length) {
      setCurrentThemeIndex(index);

      
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
      ? (typeof theme.wallpapers[0] === 'string' ? theme.wallpapers[0] : theme.wallpapers[0].url)
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
    if (!theme) return;
    if (theme.isPremium && !isPremium) {
      setModalVisible(false);
      navigation.navigate('Premium');
      return;
    }
    setModalVisible(false);
    navigation.navigate('ThemeDetail', { theme });
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
          <ThemePreviewCard
            theme={item}
            onWallpaperScroll={(offsetX) => {
              if (showWallpaperHint && offsetX > 20) {
                dismissWallpaperHint();
              }
            }}
          />
        )}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        snapToInterval={height}
        snapToAlignment="start"
        decelerationRate="fast"
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={<ExploreFooter loadingMore={loadingMore} />}
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
          if (currentTheme?.isPremium && !isPremium) {
            navigation.navigate('Premium');
            return;
          }
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
          <Icon name="lock-closed" size={16} color={Colors.primary} />
          <FontText color={Colors.primary} size={14} name="bold" style={styles.uppercaseText}>PRO</FontText>
        </View>
      )}

      <WallpaperSelectionModal
        visible={modalVisible}
        wallpaperUrl={(currentTheme?.wallpapers && currentTheme.wallpapers.length > 0)
          ? (typeof currentTheme.wallpapers[0] === 'string' ? currentTheme.wallpapers[0] : currentTheme.wallpapers[0].url)
          : ''}
        onClose={() => setModalVisible(false)}
        onApply={handleApplyWallpaper}
        showApplyTheme={true}
        onApplyTheme={handleNavigateToDetail}
      />

      {showScrollHint && (
        <Animated.View
          pointerEvents="none"
          style={[styles.scrollHintOverlay, { opacity: scrollHintOpacity }]}
        >
          <Animated.View style={{ transform: [{ translateY: scrollHintTranslate }] }}>
            <Icon name="arrow-up-outline" size={44} color="#FFFFFF" />
          </Animated.View>
          <FontText color="#FFFFFF" size={16} name="semibold" style={styles.scrollHintText}>
            Swipe up to explore themes
          </FontText>
          <FontText color="rgba(255,255,255,0.7)" size={12} name="regular" style={styles.scrollHintSubText}>
            Scroll from bottom to top
          </FontText>
        </Animated.View>
      )}

      {showWallpaperHint && (
        <Animated.View
          pointerEvents="none"
          style={[styles.wallpaperHintOverlay, { opacity: wallpaperHintOpacity }]}
        >
          <View style={styles.wallpaperHintCard}>
            <Animated.View style={{ transform: [{ translateX: wallpaperHintTranslate }] }}>
              <Icon name="images-outline" size={34} color="#FFFFFF" />
            </Animated.View>
            <View style={styles.wallpaperHintArrowRow}>
              <Icon name="arrow-back-outline" size={20} color="rgba(255,255,255,0.8)" />
              <View style={styles.wallpaperHintLine} />
              <Icon name="arrow-forward-outline" size={20} color="rgba(255,255,255,0.8)" />
            </View>
          </View>
          <FontText color="#FFFFFF" size={16} name="semibold" style={styles.scrollHintText}>
            Swipe to browse wallpapers
          </FontText>
          <FontText color="rgba(255,255,255,0.7)" size={12} name="regular" style={styles.scrollHintSubText}>
            Drag right to left
          </FontText>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  scrollHintOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    zIndex: 1000,
  },
  wallpaperHintOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    zIndex: 1000,
  },
  wallpaperHintCard: {
    width: 120,
    height: 80,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  wallpaperHintArrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.sm,
    gap: Spacing.xs,
  },
  wallpaperHintLine: {
    width: 40,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  scrollHintText: {
    marginTop: Spacing.md,
    textAlign: 'center',
  },
  scrollHintSubText: {
    marginTop: Spacing.xs,
    textAlign: 'center',
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
    right: 74, 
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
    right: 128, 
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
  footerLoader: {
    height: height,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
  },
  uppercaseText: {
    textTransform: 'uppercase',
  },
});