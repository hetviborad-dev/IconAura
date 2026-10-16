import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { Colors, Spacing, Typography } from '../constants/design';
import type { ThemeDefinition } from '../types/data';
import ThemeCard from './ThemeCard';

interface ThemeCategorySectionProps {
  title: string;
  themes: ThemeDefinition[];
  onThemePress: (theme: ThemeDefinition) => void;
  darkMode: boolean;
}

export default function ThemeCategorySection({
  title,
  themes,
  onThemePress,
  darkMode,
}: ThemeCategorySectionProps) {
  if (!themes.length) return null;
  const textColor = darkMode ? Colors.dark.textPrimary : Colors.textPrimary;
  const mutedColor = darkMode ? Colors.dark.textSecondary : Colors.textSecondary;

  return (
    <View style={styles.section}>
      <View style={styles.heading}>
        <Text style={[styles.title, { color: textColor }]}>{title}</Text>
      </View>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
        data={themes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ThemeCard
            theme={item}
            onPress={() => onThemePress(item)}
          />
        )}
        initialNumToRender={5}
        maxToRenderPerBatch={5}
        windowSize={3}
        removeClippedSubviews={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: Spacing.xxl },
  heading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  title: { fontSize: Typography.sizes.h3, fontWeight: Typography.weights.bold },
  more: { fontSize: Typography.sizes.bodySmall, fontWeight: Typography.weights.semibold },
  row: { paddingRight: Spacing.lg },
});
