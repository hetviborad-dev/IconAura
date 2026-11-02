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
import { RootStackParamList } from '../types/navigation';
import { fetchHomeThemes } from '../services/themeService';
import ThemeCategorySection from '../components/ThemeCategorySection';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { ThemeDefinition } from '../types/data';
import { ThemeCard } from '../components';
import Skeleton from '../components/Skeleton';
import AdvancedFilterModal from '../components/AdvancedFilterModal';
import AdBanner from '../components/AdBanner';
import { useSubscription } from '../context/SubscriptionContext';
import Icon from 'react-native-vector-icons/Ionicons';

interface HomeScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>;
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
  const [categoryThemes, setCategoryThemes] = useState<Record<string, ThemeDefinition[]>>({});
  const [selectedCategoryId, setSelectedCategoryId] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [filters, setFilters] = useState({ colors: [] as string[], tags: [] as string[] });

  const backgroundColor = isDarkMode ? Colors.dark.background : Colors.background;
  const textColor = isDarkMode ? Colors.dark.textPrimary : Colors.textPrimary;
  const secondaryTextColor = isDarkMode ? Colors.dark.textSecondary : Colors.textSecondary;
  const surfaceColor = isDarkMode ? Colors.dark.surface : Colors.backgroundSecondary;

  const loadAllCategories = useCallback(async () => {
    try {
      setLoading(true);
      const { categories, themesMap } = await fetchHomeThemes(filters);

      if (categories && categories.length > 0) {
        setCategories(categories.map(cat => ({
          id: cat.slug,
          name: cat.name
        })));
        setCategoryThemes(themesMap);
      } else {
        setCategories([]);
        setCategoryThemes({});
      }
    } catch (e) {
      console.error('Failed to load home themes:', e);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadAllCategories();
  }, [loadAllCategories, filters]);

  const handleCategoryPress = useCallback((id: string) => {
    setSelectedCategoryId(id);
  }, []);

  const handleThemePress = useCallback((theme: ThemeDefinition) => {
    navigation.navigate('ThemeDetail', { theme });
  }, [navigation]);

  const filteredThemes = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return null;

    const allThemes: ThemeDefinition[] = [];
    if (selectedCategoryId === 'all') {
      Object.values(categoryThemes).forEach(themes => {
        allThemes.push(...themes);
      });
    } else {
      allThemes.push(...(categoryThemes[selectedCategoryId] || []));
    }

    return allThemes.filter(theme =>
      theme.name.toLowerCase().includes(query)
    );
  }, [searchQuery, selectedCategoryId, categoryThemes]);

  const renderCategoryItem = useCallback(({ item }: { item: { id: string; name: string } }) => (
    <ThemeCategorySection
      title={item.name}
      themes={categoryThemes[item.id] || []}
      darkMode={isDarkMode}
      onThemePress={handleThemePress}
    />
  ), [categoryThemes, isDarkMode, handleThemePress]);

  const renderThemeItem = useCallback(({ item }: { item: ThemeDefinition }) => (
    <View style={styles.themeGridItem}>
      <ThemeCard
        theme={item}
        onPress={() => handleThemePress(item)}
      />
    </View>
  ), [handleThemePress]);

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
                onPress={() => navigation.navigate('Premium')}
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
            <TouchableOpacity
              style={styles.filterButton}
              onPress={() => setFilterModalVisible(true)}
            >
              <Icon name="options-outline" size={24} color={textColor} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.categoryContainer}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={categories.length > 0 ? ['all', ...categories.map(c => c.id)] : []}
            keyExtractor={(item) => item}
            contentContainerStyle={styles.categoryScroll}
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
            initialNumToRender={12}
            maxToRenderPerBatch={10}
            windowSize={5}
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
            initialNumToRender={10}
            maxToRenderPerBatch={5}
            windowSize={5}
            removeClippedSubviews={true}
            refreshControl={
              <RefreshControl
                refreshing={loading}
                onRefresh={loadAllCategories}
                colors={[Colors.primary]}
                tintColor={Colors.primary}
              />
            }
            ListEmptyComponent={
              loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={Colors.primary} />
                </View>
              ) : null
            }
          />
        ) : (
          <FlatList
            key={`category-list-${selectedCategoryId}`}
            data={categoryThemes[selectedCategoryId] || []}
            keyExtractor={(item) => item.id}
            renderItem={renderThemeItem}
            numColumns={3}
            columnWrapperStyle={styles.columnWrapper}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            initialNumToRender={12}
            maxToRenderPerBatch={10}
            windowSize={5}
            removeClippedSubviews={true}
            refreshControl={
              <RefreshControl
                refreshing={loading}
                onRefresh={loadAllCategories}
                colors={[Colors.primary]}
                tintColor={Colors.primary}
              />
            }
            ListEmptyComponent={
              loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={Colors.primary} />
                </View>
              ) : null
            }
          />
        )}
      </SafeAreaView>
      <AdvancedFilterModal
        isVisible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        initialFilters={filters}
        onApply={(newFilters) => {
          setFilters(newFilters);
          setLoading(true);
        }}
      />
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
  settingsButton: {
    width: TouchTarget.min,
    height: TouchTarget.min,
    justifyContent: 'center',
    alignItems: 'center',
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
  sectionHeader: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Layout.screenPadding,
    marginTop: Spacing.lg,
  },
  sectionHeaderText: {
    fontSize: Typography.sizes.h3,
    fontWeight: Typography.weights.bold,
  },
});
