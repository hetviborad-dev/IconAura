import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import { Colors, Radius, Spacing, Typography } from '../constants/design';
import type { ThemeDefinition } from '../types/data';
import IconCanvas from './IconCanvas';

interface ThemeCardProps {
  theme: ThemeDefinition;
  onPress: () => void;
}

export default function ThemeCard({
  theme,
  onPress,
}: ThemeCardProps) {
  const isDarkMode = useColorScheme() === 'dark';
  const borderColor = isDarkMode ? Colors.dark.border : Colors.border;
  const cardColor = isDarkMode ? Colors.dark.surface : Colors.background;
  const secondaryTextColor = isDarkMode ? Colors.dark.textSecondary : Colors.textSecondary;

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: cardColor, borderColor }]}
      onPress={onPress}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={`${theme.name} icon pack`}
    >
      <View
        style={[
          styles.preview,
          {
            backgroundColor: theme.background.type === 'color' ? theme.background.value : 'transparent',
            borderColor,
          },
        ]}
      >
        {theme.featuredApps.slice(0, 4).map((appId) => (
          <View key={appId} style={styles.iconTile}>
            <IconCanvas appId={appId} theme={theme} size={52} />
          </View>
        ))}
      </View>
      <Text style={[styles.name, { color: isDarkMode ? Colors.dark.textPrimary : Colors.textPrimary }]} numberOfLines={1}>
        {theme.name}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 158,
    padding: Spacing.sm,
    borderRadius: Radius.lg,
    borderWidth: 1,
    marginRight: Spacing.md,
  },
  preview: {
    width: 140,
    height: 140,
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignContent: 'space-between',
  },
  iconTile: {
    width: 52,
    height: 52,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  name: {
    marginTop: Spacing.md,
    fontSize: Typography.sizes.bodySmall,
    fontWeight: Typography.weights.semibold,
  },
  description: {
    marginTop: Spacing.xs,
    fontSize: Typography.sizes.caption,
  },
});
