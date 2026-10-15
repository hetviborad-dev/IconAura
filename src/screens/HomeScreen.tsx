import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  useColorScheme,
  Text,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors, Spacing, Typography, Layout, TouchTarget, Radius } from '../constants/design';
import { RootStackParamList } from '../types/navigation';
import { fetchThemesByCategory, fetchCategories, fetchHomeThemes } from '../services/themeService';
import ThemeCategorySection from '../components/ThemeCategorySection';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { ThemeDefinition } from '../types/data';
import { ThemeCard } from '../components';

interface HomeScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>;
}

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const isDarkMode = useColorScheme() === 'dark';
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [categoryThemes, setCategoryThemes] = useState<Record<string, ThemeDefinition[]>>({});
  const [selectedCategoryId, setSelectedCategoryId] = useState('all');
  const [loading, setLoading] = useState(true);

  const backgroundColor = isDarkMode ? Colors.dark.background : Colors.background;
  const textColor = isDarkMode ? Colors.dark.textPrimary : Colors.textPrimary;
  const secondaryTextColor = isDarkMode ? Colors.dark.textSecondary : Colors.textSecondary;

  const loadAllCategories = async () => {
    try {
      setLoading(true);
      const { categories, themesMap } = await fetchHomeThemes();

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
  };

  useEffect(() => {
    loadAllCategories();
  }, []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.headerMain, { color: textColor }]}>ICON PACK</Text>
          <Text style={[styles.headerSub, { color: secondaryTextColor }]}>Aura</Text>
        </View>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => {}} // To be implemented
        >
          <Text style={{ fontSize: 24, color: textColor }}>⚙️</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.categoryContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
          <TouchableOpacity
            style={[
              styles.categoryButton,
              { borderColor: isDarkMode ? Colors.dark.border : Colors.border },
              selectedCategoryId === 'all' && {
                backgroundColor: isDarkMode ? Colors.dark.textPrimary : Colors.primary
              },
            ]}
            onPress={() => setSelectedCategoryId('all')}
          >
            <Text style={[
              styles.categoryText,
              {
                color: selectedCategoryId === 'all'
                  ? (isDarkMode ? Colors.dark.background : '#FFFFFF')
                  : secondaryTextColor
              }
            ]}>
              All
            </Text>
          </TouchableOpacity>
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryButton,
                { borderColor: isDarkMode ? Colors.dark.border : Colors.border },
                selectedCategoryId === category.id && {
                  backgroundColor: isDarkMode ? Colors.dark.textPrimary : Colors.primary
                },
              ]}
              onPress={() => setSelectedCategoryId(category.id)}
            >
              <Text style={[
                styles.categoryText,
                {
                  color: selectedCategoryId === category.id
                    ? (isDarkMode ? Colors.dark.background : '#FFFFFF')
                    : secondaryTextColor
                }
              ]}>
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={loadAllCategories}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
      >
        {loading && categories.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : selectedCategoryId === 'all' ? (
          categories.map((category) => (
            <ThemeCategorySection
              key={category.id}
              title={category.name}
              themes={categoryThemes[category.id] || []}
              darkMode={isDarkMode}
              onThemePress={(theme) => navigation.navigate('ThemeDetail', { theme: theme })}
            />
          ))
        ) : (
          <View style={styles.verticalThemesContainer}>
            {categoryThemes[selectedCategoryId]?.map((theme) => (
              <View key={theme.id} style={styles.gridItem}>
                <View style={{ marginRight: -Spacing.md }}>
                  <ThemeCard
                    theme={theme}
                    onPress={() => navigation.navigate('ThemeDetail', { theme: theme })}
                  />
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
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
  verticalThemesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  gridItem: {
    width: '33.33%',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  scrollContent: {
    paddingHorizontal: Layout.screenPadding,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xxxl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
});
