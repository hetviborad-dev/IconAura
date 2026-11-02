import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import {
  View,
  FlatList,
  SectionList,
  ScrollView,
  useColorScheme,
  Text,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors, Spacing, Typography, Layout, TouchTarget, Radius } from '../constants/design';
import { HomeStackParamList } from '../types/navigation';
import { fetchHomeThemes, fetchCategories, fetchThemesByCategory } from '../services/themeService';
import ThemeCategorySection from '../components/ThemeCategorySection';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { ThemeDefinition } from '../types/data';
import { ThemeCard } from '../components';
import Skeleton from '../components/Skeleton';
import AdBanner from '../components/AdBanner';
import { useSubscription } from '../context/SubscriptionContext';
import Icon from 'react-native-vector-icons/Ionicons';

interface HomeScreenProps {
  navigation: NativeStackNavigationProp<HomeStackParamList, 'Home'>;
}

const CategoryButton = memo(({
  id,
  name,
  isSelected,
  onPress,
  isDarkMode,
  secondaryTextColor
}: {
  id: string;
  name: string;
  isSelected: boolean;
  onPress: (id: string) => void;
  isDarkMode: boolean;
  secondaryTextColor: string;
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.categoryButton,
        { borderColor: Colors.border },
        isSelected && {
          backgroundColor: Colors.primary
        },
      ]}
      disabled={isSelected}
      onPress={() => onPress(id)}
    >
      <Text style={[
        styles.categoryText,
        {
          color: isSelected
            ? '#FFFFFF'
            : secondaryTextColor
        }
      ]}>
        {name}
      </Text>
    </TouchableOpacity>
  );
});

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const isDarkMode = useColorScheme() === 'dark';
  const { isPremium } = useSubscription();
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState('all');
  const [selectedThemes, setSelectedThemes] = useState<ThemeDefinition[]>([]);
  const [allThemesCache, setAllThemesCache] = useState<ThemeDefinition[] | null>(null);
  const [themesByCategory, setThemesByCategory] = useState<Record<string, ThemeDefinition[]>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [categoryLoading, setCategoryLoading] = useState(false);

  const backgroundColor = isDarkMode ? Colors.dark.background : Colors.background;
  const textColor = isDarkMode ? Colors.dark.textPrimary : Colors.textPrimary;
  const secondaryTextColor = isDarkMode ? Colors.dark.textSecondary : Colors.textSecondary;
  const surfaceColor = isDarkMode ? Colors.dark.surface : Colors.backgroundSecondary;

  const loadCategories = useCallback(async () => {
    try {
      setLoading(true);
      const cats = await fetchCategories();
      setCategories(cats.map(cat => ({ id: cat.id, name: cat.name })));
    } catch (e) {
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const loadCategoryThemes = useCallback(async (categoryId: string) => {
    if (themesByCategory[categoryId]) {
      setSelectedThemes(themesByCategory[categoryId]);
      setCategoryLoading(false);
      return;
    }
    try {
      setCategoryLoading(true);
      const data = await fetchThemesByCategory(categoryId);
      setThemesByCategory(prev => ({ ...prev, [categoryId]: data }));
      setSelectedThemes(data);
    } catch (e) {
      setSelectedThemes([]);
    } finally {
      setCategoryLoading(false);
    }
  }, [themesByCategory]);

  useEffect(() => {
    if (selectedCategoryId && selectedCategoryId !== 'all') {
      loadCategoryThemes(selectedCategoryId);
    }
  }, [selectedCategoryId, loadCategoryThemes]);

  useEffect(() => {
    const q = searchQuery.trim();
    if (!q || selectedCategoryId !== 'all' || allThemesCache) return;
    (async () => {
      try {
        const { themesMap } = await fetchHomeThemes();
        setAllThemesCache(Object.values(themesMap).flat());
      } catch (e) {
        setAllThemesCache([]);
      }
    })();
  }, [searchQuery, selectedCategoryId, allThemesCache]);

  const handleCategoryPress = useCallback((id: string) => {
    setSelectedCategoryId(id);
    if (id !== 'all') {
      setSelectedThemes([]);
      setCategoryLoading(true);
    }
  }, []);

  const handleThemePress = useCallback((theme: ThemeDefinition) => {
    (navigation as any).navigate('ThemeDetail', { theme });
  }, [navigation]);

  const filteredThemes = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return null;

    let source: ThemeDefinition[] = [];
    if (selectedCategoryId === 'all') {
      source = allThemesCache || [];
    } else {
      source = selectedThemes;
    }
    return source.filter(theme => theme.name.toLowerCase().includes(query));
  }, [searchQuery, selectedCategoryId, allThemesCache, selectedThemes]);

  const renderCategoryItem = useCallback(({ item }: { item: { id: string; name: string } }) => (
    <ThemeCategorySection
      categoryId={item.id}
      title={item.name}
      darkMode={isDarkMode}
      onThemePress={handleThemePress}
      isPremium={isPremium}
    />
  ), [isDarkMode, handleThemePress, isPremium]);

  const renderThemeItem = useCallback(({ item }: { item: ThemeDefinition }) => (
    <View style={styles.themeGridItem}>
      <ThemeCard
        theme={item}
        onPress={() => handleThemePress(item)}
        isPremium={isPremium}
      />
    </View>
  ), [handleThemePress, isPremium]);

  return (
    <>
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <View style={styles.header}>
          <View>
            <Text style={[styles.headerMain, { color: textColor }]}>ICON PACK</Text>
            <Text style={[styles.headerSub, { color: secondaryTextColor }]}>Aura</Text>
          </View>
          <View style={styles.headerActions}>
            {!isPremium && (
              <TouchableOpacity
                style={styles.premiumButton}
                onPress={() => (navigation as any).navigate('Premium')}
              >
                <Icon name="star" size={18} color={Colors.primary} />
                <Text style={styles.premiumButtonText}>Premium</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {!isPremium && <AdBanner />}

        <View style={styles.searchContainer}>
          <View style={styles.searchBarWrapper}>
            <TextInput
              style={styles.searchBar}
              placeholder="Search themes..."
              placeholderTextColor={secondaryTextColor}
              value={searchQuery}
              onChangeText={setSearchQuery}
              clearButtonMode="while-editing"
            />
          </View>
        </View>

        <View style={styles.categoryContainer}>
          {loading && categories.length === 0 ? (
            <ActivityIndicator size="small" color={Colors.primary} />
          ) : (
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={categories.length > 0 ? ['all', ...categories.map(c => c.id)] : []}
            keyExtractor={(item) => item}
            contentContainerStyle={styles.categoryScroll}
            initialNumToRender={8}
            windowSize={3}
            renderItem={({ item }) => {
              const categoryName = item === 'all' ? 'All' : categories.find(c => c.id === item)?.name || '';
              return (
                <CategoryButton
                  id={item}
                  name={categoryName}
                  isSelected={selectedCategoryId === item}
                  onPress={handleCategoryPress}
                  isDarkMode={isDarkMode}
                  secondaryTextColor={secondaryTextColor}
                />
              );
            }}
          />
          )}
        </View>

        {filteredThemes ? (
          <FlatList
            key={`search-list-${selectedCategoryId}`}
            data={filteredThemes}
            keyExtractor={(item) => item.id}
            renderItem={renderThemeItem}
            numColumns={3}
            columnWrapperStyle={styles.columnWrapper}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            initialNumToRender={6}
            maxToRenderPerBatch={6}
            windowSize={2}
            removeClippedSubviews={true}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={{ color: secondaryTextColor }}>No themes found</Text>
              </View>
            }
          />
        ) : selectedCategoryId === 'all' ? (
          <FlatList
            key="all-list"
            data={categories}
            keyExtractor={(item) => item.id}
            renderItem={renderCategoryItem}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            initialNumToRender={6}
            maxToRenderPerBatch={6}
            windowSize={2}
            removeClippedSubviews={true}
            refreshControl={
              <RefreshControl
                refreshing={loading}
                onRefresh={loadCategories}
                colors={[Colors.primary]}
                tintColor={Colors.primary}
              />
            }
            ListEmptyComponent={
              loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={Colors.primary} />
                </View>
              ) : undefined
            }
          />
        ) : (
          <FlatList
            key={`category-list-${selectedCategoryId}`}
            data={selectedThemes}
            keyExtractor={(item) => item.id}
            renderItem={renderThemeItem}
            numColumns={3}
            columnWrapperStyle={styles.columnWrapper}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            initialNumToRender={6}
            maxToRenderPerBatch={6}
            windowSize={2}
            removeClippedSubviews={true}
            refreshControl={
              <RefreshControl
                refreshing={categoryLoading}
                onRefresh={() => loadCategoryThemes(selectedCategoryId)}
                colors={[Colors.primary]}
                tintColor={Colors.primary}
              />
            }
            // ListEmptyComponent={
            //   categoryLoading ? (
            //     <View style={styles.loadingContainer}>
            //       <ActivityIndicator size="large" color={Colors.primary} />
            //     </View>
            //   ) : undefined
            // }
          />
        )}
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Layout.screenPadding,
    paddingVertical: Spacing.xl,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  premiumButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 0, 122, 0.1)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.sm,
    gap: 4,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  premiumButtonText: {
    fontSize: Typography.sizes.caption,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
  },
  filterButton: {
    width: TouchTarget.min,
    height: TouchTarget.min,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerMain: {
    fontSize: Typography.sizes.h3,
    fontWeight: Typography.weights.bold,
    letterSpacing: 1,
  },
  headerSub: {
    fontSize: Typography.sizes.bodySmall,
    fontWeight: Typography.weights.medium,
    marginTop: -4,
  },
  searchContainer: {
    paddingHorizontal: Layout.screenPadding,
    marginBottom: Spacing.md,
  },
  searchBar: {
    flex: 1,
    height: 48,
    paddingHorizontal: Spacing.md,
    fontSize: Typography.sizes.body,
    color: Colors.textPrimary,
  },
  searchBarWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingRight: Spacing.sm,
  },
  categoryContainer: {
    paddingVertical: Spacing.md,
    paddingLeft: Layout.screenPadding,
  },
  categoryScroll: {
    paddingRight: Layout.screenPadding,
    gap: Spacing.sm,
  },
  categoryButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.lg,
    borderWidth: 1,
  },
  categoryText: {
    fontSize: Typography.sizes.bodySmall,
    fontWeight: Typography.weights.semibold,
  },
  columnWrapper: {
    justifyContent: 'flex-start',
  },
  themeGridItem: {
    width: '33.33%',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  scrollContent: {
    paddingHorizontal: Layout.screenPadding,
    paddingTop: Spacing.sm,
    paddingBottom: 100,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  skeletonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingTop: Spacing.md,
  },
  skeletonRow: {
    width: '30%',
    marginBottom: Spacing.md,
    alignItems: 'center',
  },
});
