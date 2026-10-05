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
import { Colors, Spacing, Typography, Radius } from '../constants/design';
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
  const cardBackground = isDarkMode ? '#1E1E1E' : Colors.backgroundSecondary;
  const textColor = isDarkMode ? '#FFFFFF' : Colors.textPrimary;
  const secondaryTextColor = isDarkMode ? '#AAAAAA' : Colors.textSecondary;
  const borderColor = isDarkMode ? '#333333' : Colors.border;

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
      activeOpacity={0.7}
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
        <View style={styles.iconRow}>
          <View style={styles.previewIcon}>
            <AppSvgIcon appName="Instagram" iconColor={iconColor} size={40} />
          </View>
          <Text style={[styles.appLabel, { color: iconColor }]}>IG</Text>
        </View>

        {/* WhatsApp Icon Preview */}
        <View style={styles.iconRow}>
          <View style={styles.previewIcon}>
            <AppSvgIcon appName="WhatsApp" iconColor={iconColor} size={40} />
          </View>
          <Text style={[styles.appLabel, { color: iconColor }]}>WA</Text>
        </View>
      </View>

      {/* Theme Info */}
      <Text style={[styles.themeName, { color: textColor }]}>
        {themeName}
      </Text>
      <Text style={[styles.description, { color: secondaryTextColor }]}>
        {description}
      </Text>
      <Text style={[styles.appCount, { color: secondaryTextColor }]}>
        {supportedAppCount} app{supportedAppCount !== 1 ? 's' : ''}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.md,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  previewContainer: {
    borderRadius: Radius.sm,
    borderWidth: 1,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  iconRow: {
    alignItems: 'center',
    gap: Spacing.sm,
  },
  previewIcon: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  appLabel: {
    fontSize: Typography.sizes.caption,
    fontWeight: Typography.weights.semibold,
    marginTop: Spacing.xs,
  },
  themeName: {
    fontSize: Typography.sizes.h4,
    fontWeight: Typography.weights.semibold,
    marginBottom: Spacing.xs,
  },
  description: {
    fontSize: Typography.sizes.bodySmall,
    fontWeight: Typography.weights.regular,
    marginBottom: Spacing.xs,
  },
  appCount: {
    fontSize: Typography.sizes.caption,
    fontWeight: Typography.weights.regular,
  },
});
