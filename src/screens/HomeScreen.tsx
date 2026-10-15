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
import { Colors, Spacing, Typography, Layout, TouchTarget } from '../constants/design';
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
