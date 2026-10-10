import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, Text, useColorScheme, View, ActivityIndicator } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors, Layout, Spacing, Typography } from '../constants/design';
import ThemeCard from '../components/ThemeCard';
import { THEME_CATEGORIES } from '../data/themes';
import { fetchThemesByCategory } from '../services/themeService';
import type { RootStackParamList } from '../types/navigation';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { ThemeDefinition } from '../types/data';

interface ThemeCategoryScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList, 'ThemeCategory'>;
  route: { params: { categoryId: string } };
}

export default function ThemeCategoryScreen({ navigation, route }: ThemeCategoryScreenProps) {
  const darkMode = useColorScheme() === 'dark';
  const [themes, setThemes] = useState<ThemeDefinition[]>([]);
  const [loading, setLoading] = useState(true);

  const category = THEME_CATEGORIES.find((item) => item.id === route.params.categoryId);
  const backgroundColor = darkMode ? Colors.dark.background : Colors.background;
  const textColor = darkMode ? Colors.dark.textPrimary : Colors.textPrimary;

  useEffect(() => {
    async function loadThemes() {
      try {
        setLoading(true);
        const result = await fetchThemesByCategory(route.params.categoryId);
        setThemes(result);
      } catch (e) {
        console.error('Failed to load themes:', e);
      } finally {
        setLoading(false);
      }
    }
    loadThemes();
  }, [route.params.categoryId]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: textColor }]}>{category?.title ?? 'Icon Packs'}</Text>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : (
          <View style={styles.grid}>
            {themes.map((theme) => (
              <ThemeCard
                key={theme.id}
                theme={theme}
                onPress={() => navigation.navigate('ThemeDetail', { themeId: theme.id })}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: Layout.screenPadding, paddingTop: Spacing.xxl },
  title: { fontSize: Typography.sizes.h2, fontWeight: Typography.weights.bold, marginBottom: Spacing.xl },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50
  },
});
