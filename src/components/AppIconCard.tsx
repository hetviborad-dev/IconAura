

import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  useColorScheme,
} from 'react-native';
import { Colors, Spacing, Typography, Radius, TouchTarget } from '../constants/design';
import IconCanvas from './IconCanvas';
import type { AppId, ThemeDefinition } from '../types/data';
import FontText from './FontText';

interface AppIconCardProps {
  appName: string;
  appId: AppId;
  theme: ThemeDefinition;
  status?: string;
  statusColor?: string;
  onApply?: () => void;
  disabled?: boolean;
  loading?: boolean;
}

export default function AppIconCard({
  appName,
  appId,
  theme,
  status = 'Ready',
  statusColor,
  onApply,
  disabled = false,
  loading = false,
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
      {}
      <View style={styles.iconPreview}>
        <IconCanvas appId={appId} theme={theme} size={56} />
      </View>

      {}
      <View style={styles.infoContainer}>
        <FontText
          color={textColor}
          size={Typography.sizes.body}
          name="semibold"
          numberOfLines={1}
        >
          {appName}
        </FontText>
        <FontText
          color={statusColor || secondaryTextColor}
          size={Typography.sizes.bodySmall}
          name="regular"
          numberOfLines={2}
        >
          {status}
        </FontText>
      </View>

      {}
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
          {loading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <FontText color="#FFFFFF" size={Typography.sizes.bodySmall} name="semibold">Apply</FontText>
          )}
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
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainer: {
    flex: 1,
    flexShrink: 1,
    gap: Spacing.xs,
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
});