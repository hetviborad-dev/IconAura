import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import {
  View,
  FlatList,
  useColorScheme,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { Colors, Spacing, Typography, Layout, Radius } from '../constants/design';
import { HomeStackParamList } from '../types/navigation';
import { fetchHomeThemes, fetchCategories, fetchThemesByCategory } from '../services/themeService';
import ThemeCategorySection from '../components/ThemeCategorySection';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { ThemeDefinition } from '../types/data';
import { ThemeCard } from '../components';
import AdBanner from '../components/AdBanner';
import { useSubscription } from '../context/SubscriptionContext';
import Icon from 'react-native-vector-icons/Ionicons';
import FontText from '../components/FontText';
import { fonts } from '../assets';

interface HomeScreenProps {
  navigation: NativeStackNavigationProp<HomeStackParamList, 'Home'>;
}

const CategoryButton = memo(({
  id,
  name,
  isSelected,
  onPress,
  secondaryTextColor
}: {
  id: string;
  name: string;
  isSelected: boolean;
  onPress: (id: string) => void;
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
      <FontText
        color={isSelected ? '#FFFFFF' : secondaryTextColor}
        size={Typography.sizes.bodySmall}
        name="bold"
      >
        {name}
      </FontText>
    </TouchableOpacity>
  );
});

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const isDarkMode = useColorScheme() === 'dark';
  const { isPremium, loading: subscriptionLoading } = useSubscription();
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState('all');
  const [selectedThemes, setSelectedThemes] = useState<ThemeDefinition[]>([]);
  const [allThemesCache, setAllThemesCache] = useState<ThemeDefinition[] | null>(null);
  const [themesByCategory, setThemesByCategory] = useState<Record<string, ThemeDefinition[]>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [bannerKey, setBannerKey] = useState(0);

  const backgroundColor = isDarkMode ? Colors.dark.background : Colors.background;
  const textColor = isDarkMode ? Colors.dark.textPrimary : Colors.textPrimary;
  const secondaryTextColor = isDarkMode ? Colors.dark.textSecondary : Colors.textSecondary;

  const loadCategories = useCallback(async () => {
    try {
      setLoading(true);
      const cats = await fetchCategories();
      setCategories(cats.map(cat => ({ id: cat.id, name: cat.name })));
    } catch {
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  useFocusEffect(
    useCallback(() => {
      setBannerKey(k => k + 1);
    }, [])
  );

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
    } catch {
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
      } catch {
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
      onSeeAll={() => handleCategoryPress(item.id)}
      isPremium={isPremium}
    />
  ), [isDarkMode, handleThemePress, handleCategoryPress, isPremium]);

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
            <FontText color="#B9B0C9" size={Typography.sizes.caption} name="semibold">Make your phone yours</FontText>
            <FontText color={textColor} size={Typography.sizes.h2} name="bold">
              <FontText color="#FFFFFF" size={Typography.sizes.h2} name="bold">Icon</FontText>
              <FontText color="#FF007A" size={Typography.sizes.h2} name="bold">Aura</FontText>
            </FontText>
          </View>
          <View style={styles.headerActions}>
            {!subscriptionLoading && !isPremium && (
              <TouchableOpacity
                style={styles.premiumButton}
                onPress={() => (navigation as any).navigate('Premium')}
              >
                <Icon name="star" size={18} color={Colors.primary} />
                <FontText color={Colors.primary} size={Typography.sizes.caption} name="bold">Premium</FontText>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* {!subscriptionLoading && !isPremium && <AdBanner key={bannerKey} />} */}

        <View style={styles.searchContainer}>
          <View style={styles.searchBarWrapper}>
            <Icon name="search" size={20} color="#B9B0C9" style={{ marginLeft: Spacing.md }} />
            <TextInput
              style={styles.searchBar}
              placeholder="Search Themes"
              placeholderTextColor="#B9B0C9"
              value={searchQuery}
              onChangeText={setSearchQuery}
              clearButtonMode="while-editing"
            />
          </View>
        </View>

        <View style={styles.categoryContainer}>
          {loading && categories.length === 0 ? null : (
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
                  name={categoryName ? categoryName.charAt(0).toUpperCase() + categoryName.slice(1) : categoryName}
                  isSelected={selectedCategoryId === item}
                  onPress={handleCategoryPress}
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
                <FontText color={secondaryTextColor}>No themes found</FontText>
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
            // ListEmptyComponent={
            //   loading ? (
            //     <View style={styles.loadingContainer}>
            //       <ActivityIndicator size="large" color={Colors.primary} />
            //     </View>
            //   ) : undefined
            // }
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
  searchContainer: {
    paddingHorizontal: Layout.screenPadding,
    marginBottom: Spacing.md,
  },
  searchBar: {
    flex: 1,
    height: 48,
    paddingHorizontal: Spacing.md,
    fontSize: Typography.sizes.bodySmall,
    fontFamily: fonts['regular'],
    color: Colors.textPrimary,
  },
  searchBarWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1522',
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: '#2C2438',
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
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.lg,
    borderWidth: 1,
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
});