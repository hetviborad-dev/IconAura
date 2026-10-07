import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, useColorScheme, View } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors, Layout, Spacing, Typography } from '../constants/design';
import ThemeCard from '../components/ThemeCard';
import { getThemesByCategory, THEME_CATEGORIES } from '../data/themes';
import type { RootStackParamList } from '../types/navigation';

interface ThemeCategoryScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList, 'ThemeCategory'>;
  route: { params: { categoryId: (typeof THEME_CATEGORIES)[number]['id'] } };
}

export default function ThemeCategoryScreen({ navigation, route }: ThemeCategoryScreenProps) {
  const darkMode = useColorScheme() === 'dark';
  const category = THEME_CATEGORIES.find((item) => item.id === route.params.categoryId);
  const themes = getThemesByCategory(route.params.categoryId);
  const backgroundColor = darkMode ? Colors.dark.background : Colors.background;
  const textColor = darkMode ? Colors.dark.textPrimary : Colors.textPrimary;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: textColor }]}>{category?.title ?? 'Icon Packs'}</Text>
        <View style={styles.grid}>
          {themes.map((theme) => (
            <ThemeCard
              key={theme.id}
              theme={theme}
              onPress={() => navigation.navigate('ThemeDetail', { themeId: theme.id })}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: Layout.screenPadding, paddingTop: Spacing.xxl },
  title: { fontSize: Typography.sizes.h2, fontWeight: Typography.weights.bold, marginBottom: Spacing.xl },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
});
