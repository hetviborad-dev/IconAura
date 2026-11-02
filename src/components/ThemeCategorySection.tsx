import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { Colors, Spacing, Typography, Radius } from '../constants/design';
import type { ThemeDefinition } from '../types/data';
import ThemeCard from './ThemeCard';
import { fetchThemesByCategory } from '../services/themeService';
import Skeleton from './Skeleton';
import FontText from './FontText';

interface ThemeCategorySectionProps {
  categoryId: string;
  title: string;
  onThemePress: (theme: ThemeDefinition) => void;
  darkMode: boolean;
  isPremium?: boolean;
}

export default function ThemeCategorySection({
  categoryId,
  title,
  onThemePress,
  darkMode,
  isPremium,
}: ThemeCategorySectionProps) {
  const [themes, setThemes] = useState<ThemeDefinition[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchThemesByCategory(categoryId)
      .then(data => {
        if (active) {
          setThemes(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [categoryId]);

  if (loading) {
    return (
      <View style={styles.section}>
        <FontText color={darkMode ? Colors.dark.textPrimary : Colors.textPrimary} size={Typography.sizes.h3} name="bold">{title ? title.charAt(0).toUpperCase() + title.slice(1) : title}</FontText>
        <View style={styles.loadingRow}>
          {[...Array(4)].map((_, i) => (
            <View key={i} style={styles.loadingItem}>
              <Skeleton width={110} height={110} borderRadius={Radius.md} />
              <Skeleton width={80} height={12} borderRadius={4} style={styles.skeletonSpacing} />
            </View>
          ))}
        </View>
      </View>
    );
  }

  if (!themes.length) return null;
  const textColor = darkMode ? Colors.dark.textPrimary : Colors.textPrimary;

  return (
    <View style={styles.section}>
      <View style={styles.heading}>
        <FontText color={textColor} size={Typography.sizes.h3} name="bold">{title ? title.charAt(0).toUpperCase() + title.slice(1) : title}</FontText>
      </View>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
        initialNumToRender={4}
        windowSize={3}
        data={themes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ThemeCard
            theme={item}
            onPress={() => onThemePress(item)}
            isPremium={isPremium}
          />
        )}
        maxToRenderPerBatch={4}
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
  loadingRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.md,
  },
  loadingItem: {
    alignItems: 'center',
  },
  skeletonSpacing: {
    marginTop: Spacing.sm,
  },
  row: { paddingRight: Spacing.lg },
});