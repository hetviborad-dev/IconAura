import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import { Colors, Radius, Spacing, Typography } from '../constants/design';
import type { AppId } from '../types/data';
import AppSvgIcon from './AppSvgIcon';

interface ThemeCardProps {
  themeName: string;
  description: string;
  iconColor: string;
  backgroundColor: string;
  featuredApps: AppId[];
  pattern?: 'leopard' | 'crimson-bloom';
  onPress: () => void;
}

export default function ThemeCard({
  themeName,
  description,
  iconColor,
  backgroundColor,
  featuredApps,
  pattern,
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
      accessibilityLabel={`${themeName} icon pack`}
    >
      <View style={[styles.preview, { backgroundColor, borderColor }]}>
        {featuredApps.slice(0, 4).map((appId) => (
          <View key={appId} style={[styles.iconTile, { backgroundColor, borderColor }]}>
            <AppSvgIcon appId={appId} iconColor={iconColor} size={28} pattern={pattern} />
          </View>
        ))}
      </View>
      <Text style={[styles.name, { color: isDarkMode ? Colors.dark.textPrimary : Colors.textPrimary }]} numberOfLines={1}>
        {themeName}
      </Text>
      <Text style={[styles.description, { color: secondaryTextColor }]} numberOfLines={1}>
        {description}
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
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
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
