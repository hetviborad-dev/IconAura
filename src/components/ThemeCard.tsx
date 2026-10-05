/**
 * ThemeCard - Visual preview of an icon theme
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import { Colors, Spacing, Typography, Radius, TouchTarget } from '../constants/design';
import AppSvgIcon from './AppSvgIcon';

interface ThemeCardProps {
  themeName: string;
  description: string;
  iconColor: string;
  backgroundColor: string;
  supportedAppCount: number;
  onPress: () => void;
}

export default function ThemeCard({
  themeName,
  description,
  iconColor,
  backgroundColor,
  supportedAppCount,
  onPress,
}: ThemeCardProps) {
  const isDarkMode = useColorScheme() === 'dark';
  const cardBackground = isDarkMode ? Colors.dark.backgroundSecondary : Colors.background;
  const textColor = isDarkMode ? Colors.dark.textPrimary : Colors.textPrimary;
  const secondaryTextColor = isDarkMode ? Colors.dark.textSecondary : Colors.textSecondary;
  const borderColor = isDarkMode ? Colors.dark.border : Colors.border;

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: cardBackground,
          borderColor,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.6}
    >
      {/* Preview Area */}
      <View
        style={[
          styles.previewContainer,
          {
            backgroundColor,
            borderColor,
          },
        ]}
      >
        {/* Instagram Icon Preview */}
        <View style={styles.iconColumn}>
          <View style={styles.previewIcon}>
            <AppSvgIcon appName="Instagram" iconColor={iconColor} size={48} />
          </View>
          <Text style={[styles.appLabel, { color: iconColor }]}>Instagram</Text>
        </View>

        {/* WhatsApp Icon Preview */}
        <View style={styles.iconColumn}>
          <View style={styles.previewIcon}>
            <AppSvgIcon appName="WhatsApp" iconColor={iconColor} size={48} />
          </View>
          <Text style={[styles.appLabel, { color: iconColor }]}>WhatsApp</Text>
        </View>
      </View>

      {/* Theme Info */}
      <View style={styles.infoContainer}>
        <Text style={[styles.themeName, { color: textColor }]}>
          {themeName}
        </Text>
        <Text style={[styles.description, { color: secondaryTextColor }]}>
          {description}
        </Text>
        <Text style={[styles.appCount, { color: secondaryTextColor }]}>
          {supportedAppCount} app{supportedAppCount !== 1 ? 's' : ''}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    minHeight: TouchTarget.min,
  },
  previewContainer: {
    borderRadius: Radius.md,
    borderWidth: 1,
    padding: Spacing.xxl,
    marginBottom: Spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    minHeight: 120,
  },
  iconColumn: {
    alignItems: 'center',
    gap: Spacing.sm,
  },
  previewIcon: {
    width: 64,
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
  },
  appLabel: {
    fontSize: Typography.sizes.caption,
    fontWeight: Typography.weights.medium,
    marginTop: Spacing.xs,
  },
  infoContainer: {
    gap: Spacing.xs,
  },
  themeName: {
    fontSize: Typography.sizes.h3,
    fontWeight: Typography.weights.semibold,
    lineHeight: Typography.sizes.h3 * Typography.lineHeights.tight,
  },
  description: {
    fontSize: Typography.sizes.bodySmall,
    fontWeight: Typography.weights.regular,
    lineHeight: Typography.sizes.bodySmall * Typography.lineHeights.normal,
  },
  appCount: {
    fontSize: Typography.sizes.caption,
    fontWeight: Typography.weights.medium,
    marginTop: Spacing.xs,
  },
});
