/**
 * HomeScreen - Main screen with theme browsing
 */

import React from 'react';
import {
  View,
  ScrollView,
  SafeAreaView,
  useColorScheme,
  Text,
  StyleSheet,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors, Spacing, Typography, Layout } from '../constants/design';
import { RootStackParamList } from '../types/navigation';
import { getThemesByCategory, THEME_CATEGORIES } from '../data/themes';
import ThemeCategorySection from '../components/ThemeCategorySection';

interface HomeScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>;
}

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const isDarkMode = useColorScheme() === 'dark';
  const backgroundColor = isDarkMode ? Colors.dark.background : Colors.background;
  const textColor = isDarkMode ? Colors.dark.textPrimary : Colors.textPrimary;
  const secondaryTextColor = isDarkMode ? Colors.dark.textSecondary : Colors.textSecondary;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.eyebrow, { color: secondaryTextColor }]}>ICON PACKS</Text>
          <Text style={[styles.appName, { color: textColor }]}>
            IconAura
          </Text>
          <Text style={[styles.tagline, { color: secondaryTextColor }]}>
            Find an icon style that feels like you
          </Text>
        </View>

        {THEME_CATEGORIES.map((category) => (
          <ThemeCategorySection
            key={category.id}
            title={category.title}
            themes={getThemesByCategory(category.id)}
            darkMode={isDarkMode}
            onThemePress={(theme) => navigation.navigate('ThemeDetail', { themeId: theme.id })}
            onMorePress={() => navigation.navigate('ThemeCategory', { categoryId: category.id })}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Layout.screenPadding,
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.xxxl,
  },
  header: {
    marginBottom: Spacing.xxl,
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
});
