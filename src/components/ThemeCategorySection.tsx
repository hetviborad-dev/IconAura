import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors, Spacing, Typography } from '../constants/design';
import type { ThemeDefinition } from '../types/data';
import ThemeCard from './ThemeCard';

interface ThemeCategorySectionProps {
  title: string;
  themes: ThemeDefinition[];
  onThemePress: (theme: ThemeDefinition) => void;
  onMorePress: () => void;
  darkMode: boolean;
}

export default function ThemeCategorySection({
  title,
  themes,
  onThemePress,
  onMorePress,
  darkMode,
}: ThemeCategorySectionProps) {
  if (!themes.length) return null;
  const textColor = darkMode ? Colors.dark.textPrimary : Colors.textPrimary;
  const mutedColor = darkMode ? Colors.dark.textSecondary : Colors.textSecondary;

  return (
    <View style={styles.section}>
      <View style={styles.heading}>
        <Text style={[styles.title, { color: textColor }]}>{title}</Text>
        <TouchableOpacity onPress={onMorePress} accessibilityRole="button" accessibilityLabel={`See all ${title} themes`}>
          <Text style={[styles.more, { color: mutedColor }]}>More ›</Text>
        </TouchableOpacity>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {themes.map((theme) => (
          <ThemeCard
            key={theme.id}
            theme={theme}
            onPress={() => onThemePress(theme)}
          />
        ))}
      </ScrollView>
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
