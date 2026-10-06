/**
 * AppIconCard - Preview of an app with a custom icon and apply button
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
import type { AppId } from '../types/data';

interface AppIconCardProps {
  appName: string;
  appId: AppId;
  iconColor: string;
  backgroundColor: string;
  status?: string;
  statusColor?: string;
  onApply?: () => void;
  disabled?: boolean;
}

export default function AppIconCard({
  appName,
  appId,
  iconColor,
  backgroundColor,
  status = 'Ready',
  statusColor,
  onApply,
  disabled = false,
}: AppIconCardProps) {
  const isDarkMode = useColorScheme() === 'dark';
  const cardBackground = isDarkMode ? Colors.dark.surface : Colors.background;
  const textColor = isDarkMode ? Colors.dark.textPrimary : Colors.textPrimary;
  const secondaryTextColor = isDarkMode ? Colors.dark.textSecondary : Colors.textSecondary;
  const borderColor = isDarkMode ? Colors.dark.border : Colors.border;
  const buttonBackground = disabled
    ? (isDarkMode ? Colors.dark.textTertiary : Colors.textTertiary)
    : Colors.textPrimary;

  const isProcessing = status === 'Waiting for Android confirmation...' || status === 'Preparing icon...';

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: cardBackground,
          borderColor,
          opacity: disabled && !isProcessing ? 0.5 : 1,
        },
      ]}
    >
      {/* Left: Icon Preview */}
      <View
        style={[
          styles.iconPreview,
          {
            backgroundColor,
            borderColor,
          },
        ]}
      >
        <AppSvgIcon appId={appId} iconColor={iconColor} size={36} />
      </View>

      {/* Middle: App Info */}
      <View style={styles.infoContainer}>
        <Text
          style={[styles.appName, { color: textColor }]}
          numberOfLines={1}
        >
          {appName}
        </Text>
        <Text
          style={[
            styles.status,
            {
              color: statusColor || secondaryTextColor,
            },
          ]}
          numberOfLines={2}
        >
          {status}
        </Text>
      </View>

      {/* Right: Apply Button */}
      {onApply && (
        <TouchableOpacity
          style={[
            styles.applyButton,
            {
              backgroundColor: buttonBackground,
            },
          ]}
          onPress={onApply}
          disabled={disabled}
          activeOpacity={disabled ? 1 : 0.7}
        >
          <Text style={styles.buttonText}>Apply</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.md,
    borderWidth: 1,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    gap: Spacing.lg,
    minHeight: TouchTarget.min * 1.8,
  },
  iconPreview: {
    width: 56,
    height: 56,
    borderRadius: Radius.md,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainer: {
    flex: 1,
    gap: Spacing.xs,
  },
  appName: {
    fontSize: Typography.sizes.body,
    fontWeight: Typography.weights.semibold,
    lineHeight: Typography.sizes.body * Typography.lineHeights.tight,
  },
  status: {
    fontSize: Typography.sizes.bodySmall,
    fontWeight: Typography.weights.regular,
    lineHeight: Typography.sizes.bodySmall * Typography.lineHeights.normal,
  },
  applyButton: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: Radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: TouchTarget.min,
    minWidth: 80,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: Typography.sizes.bodySmall,
    fontWeight: Typography.weights.semibold,
  },
});
