import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { Colors, Spacing, Typography, Radius } from '../constants/design';
import type { ThemeDefinition } from '../types/data';
import ThemeCard from './ThemeCard';
import { fetchThemesByCategory } from '../services/themeService';
import Skeleton from './Skeleton';

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
        <Text style={[styles.title, { color: darkMode ? Colors.dark.textPrimary : Colors.textPrimary }]}>{title}</Text>
        <View style={{ flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.md }}>
          {[...Array(4)].map((_, i) => (
            <View key={i} style={{ alignItems: 'center' }}>
              <Skeleton width={110} height={110} borderRadius={Radius.md} />
              <Skeleton width={80} height={12} borderRadius={4} style={{ marginTop: Spacing.sm }} />
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
        <Text style={[styles.title, { color: textColor }]}>{title}</Text>
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
  title: { fontSize: Typography.sizes.h3, fontWeight: Typography.weights.bold },
  row: { paddingRight: Spacing.lg },
});
