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
import { Colors, Spacing, Typography, Radius } from '../constants/design';
import AppSvgIcon from './AppSvgIcon';

interface AppIconCardProps {
  appName: string;
  iconColor: string;
  backgroundColor: string;
  status?: string;
  statusColor?: string;
  onApply?: () => void;
  disabled?: boolean;
}

export default function AppIconCard({
  appName,
  iconColor,
  backgroundColor,
  status = 'Ready',
  statusColor,
  onApply,
  disabled = false,
}: AppIconCardProps) {
  const isDarkMode = useColorScheme() === 'dark';
  const cardBackground = isDarkMode ? '#1E1E1E' : Colors.background;
  const textColor = isDarkMode ? '#FFFFFF' : Colors.textPrimary;
  const secondaryTextColor = isDarkMode ? '#AAAAAA' : Colors.textSecondary;
  const borderColor = isDarkMode ? '#333333' : Colors.border;
  const buttonBackground = disabled ? secondaryTextColor : '#0A84FF';

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: cardBackground,
          borderColor,
          opacity: disabled && status !== 'Waiting for Android confirmation...' && status !== 'Preparing icon...' ? 0.6 : 1,
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
        <AppSvgIcon appName={appName} iconColor={iconColor} size={36} />
      </View>

      {/* Middle: App Info */}
      <View style={styles.infoContainer}>
        <Text style={[styles.appName, { color: textColor }]}>
          {appName}
        </Text>
        <Text
          style={[
            styles.status,
            {
              color: statusColor || secondaryTextColor,
            },
          ]}
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
          activeOpacity={disabled ? 0.5 : 0.8}
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
    padding: Spacing.md,
    marginBottom: Spacing.md,
    gap: Spacing.md,
  },
  iconPreview: {
    width: 64,
    height: 64,
    borderRadius: Radius.sm,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainer: {
    flex: 1,
  },
  appName: {
    fontSize: Typography.sizes.body,
    fontWeight: Typography.weights.semibold,
    marginBottom: Spacing.xs,
  },
  status: {
    fontSize: Typography.sizes.bodySmall,
    fontWeight: Typography.weights.regular,
  },
  applyButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: Typography.sizes.bodySmall,
    fontWeight: Typography.weights.semibold,
  },
});
