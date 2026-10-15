import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  useColorScheme,
  Text,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors, Spacing, Typography, Layout } from '../constants/design';
import { RootStackParamList } from '../types/navigation';
import { fetchThemesByCategory, fetchCategories, fetchHomeThemes } from '../services/themeService';
import ThemeCategorySection from '../components/ThemeCategorySection';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { ThemeDefinition } from '../types/data';

interface HomeScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>;
}

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const isDarkMode = useColorScheme() === 'dark';
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [categoryThemes, setCategoryThemes] = useState<Record<string, ThemeDefinition[]>>({});
  const [loading, setLoading] = useState(true);

  
  const backgroundColor = isDarkMode ? Colors.dark.background : Colors.background;
  const textColor = isDarkMode ? Colors.dark.textPrimary : Colors.textPrimary;
  const secondaryTextColor = isDarkMode ? Colors.dark.textSecondary : Colors.textSecondary;
  
  const loadAllCategories = async () => {
    try {
      setLoading(true);

      console.log('DEBUG: Calling fetchHomeThemes...');
      const { categories, themesMap } = await fetchHomeThemes();
      console.log('DEBUG: fetchHomeThemes categories:', categories);
      console.log('DEBUG: fetchHomeThemes themesMap keys:', Object.keys(themesMap));

      if (categories && categories.length > 0) {
        const mappedCats = categories.map(cat => ({
          id: cat.slug,
          name: cat.name
        }));
        console.log('DEBUG: Mapped categories:', mappedCats);
        setCategories(mappedCats);
        setCategoryThemes(themesMap);
      } else {
        console.log('DEBUG: No categories found in DB');
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
        ) : (
          categories.map((category) => (
            <ThemeCategorySection
              key={category.id}
              title={category.name}
              themes={categoryThemes[category.id] || []}
              darkMode={isDarkMode}
              onThemePress={(theme) => navigation.navigate('ThemeDetail', { theme: theme })}
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: {
    paddingHorizontal: Layout.screenPadding,
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.xxxl,
  },
  header: {
    marginBottom: Spacing.xxl,
    paddingHorizontal: Layout.screenPadding,
    paddingTop: Spacing.xxl,
  },
  eyebrow: {
    fontSize: Typography.sizes.caption,
    fontWeight: Typography.weights.semibold,
    letterSpacing: 1.4,
    marginBottom: Spacing.sm,
  },
  appName: {
    fontSize: Typography.sizes.h1,
    fontWeight: Typography.weights.bold,
    marginBottom: Spacing.sm,
    lineHeight: Typography.sizes.h1 * Typography.lineHeights.tight,
  },
  tagline: {
    fontSize: Typography.sizes.body,
    fontWeight: Typography.weights.regular,
    lineHeight: Typography.sizes.body * Typography.lineHeights.normal,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
});
