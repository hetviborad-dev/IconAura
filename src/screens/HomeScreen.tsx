import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  useColorScheme,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors, Spacing, Typography, Layout } from '../constants/design';
import { RootStackParamList } from '../types/navigation';
import { THEME_CATEGORIES } from '../data/themes';
import { fetchThemesByCategory } from '../services/themeService';
import ThemeCategorySection from '../components/ThemeCategorySection';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { ThemeDefinition } from '../types/data';

interface HomeScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>;
}

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const isDarkMode = useColorScheme() === 'dark';
  const [categoryThemes, setCategoryThemes] = useState<Record<string, ThemeDefinition[]>>({});
  const [loading, setLoading] = useState(true);

  const backgroundColor = isDarkMode ? Colors.dark.background : Colors.background;
  const textColor = isDarkMode ? Colors.dark.textPrimary : Colors.textPrimary;
  const secondaryTextColor = isDarkMode ? Colors.dark.textSecondary : Colors.textSecondary;

  useEffect(() => {
    async function loadAllCategories() {
      try {
        setLoading(true);
        const themesMap: Record<string, ThemeDefinition[]> = {};

        await Promise.all(
          THEME_CATEGORIES.map(async (cat) => {
            const themes = await fetchThemesByCategory(cat.id);
            themesMap[cat.id] = themes;
          })
        );

        setCategoryThemes(themesMap);
      } catch (e) {
        console.error('Failed to load home themes:', e);
      } finally {
        setLoading(false);
      }
    }
    loadAllCategories();
  }, []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : (
          THEME_CATEGORIES.map((category) => (
            <ThemeCategorySection
              key={category.id}
              title={category.title}
              themes={categoryThemes[category.id] || []}
              darkMode={isDarkMode}
              onThemePress={(theme) => navigation.navigate('ThemeDetail', { theme: theme })}
              onMorePress={() => navigation.navigate('ThemeCategory', { categoryId: category.id })}
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
