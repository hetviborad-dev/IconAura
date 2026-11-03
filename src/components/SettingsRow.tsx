

import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Colors, Spacing, Typography } from '../constants/design';
import FontText from './FontText';

interface SettingsRowProps {
  icon: string;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  showChevron?: boolean;
  showBorder?: boolean;
  backgroundColor?: string;
  titleColor?: string;
  titleSize?: number;
  titleWeight?: 'regular' | 'medium' | 'semibold' | 'bold';
  subtitleColor?: string;
  subtitleSize?: number;
  subtitleWeight?: 'regular' | 'medium' | 'semibold' | 'bold';
  iconBackgroundColor?: string;
  iconColor?: string;
  secondaryTextColor?: string;
}

export default function SettingsRow({
  icon,
  title,
  subtitle,
  onPress,
  showChevron = true,
  showBorder = true,
  backgroundColor,
  titleColor = Colors.textPrimary,
  titleSize = Typography.sizes.body,
  titleWeight = 'medium',
  subtitleColor = Colors.textSecondary,
  subtitleSize = Typography.sizes.bodySmall,
  subtitleWeight = 'regular',
  iconBackgroundColor,
  iconColor = Colors.primary,
  secondaryTextColor = Colors.textSecondary,
}: SettingsRowProps) {
  const borderColor = Colors.border;
  const borderDynamic = showBorder
    ? { borderBottomColor: borderColor, borderBottomWidth: 1 }
    : undefined;

  return (
    <TouchableOpacity
      style={[styles.row, borderDynamic, backgroundColor ? { backgroundColor } : undefined]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {}
      <View style={[styles.iconContainer, iconBackgroundColor ? { backgroundColor: iconBackgroundColor, borderRadius: 8, width: 40, height: 40 } : undefined]}>
        <Ionicons
          name={icon}
          size={24}
          color={iconColor}
        />
      </View>

      {}
      <View style={styles.textContainer}>
        <FontText color={titleColor} size={titleSize} name={titleWeight} style={{ marginBottom: Spacing.xs }}>
          {title}
        </FontText>
        {subtitle && (
          <FontText color={subtitleColor} size={subtitleSize} name={subtitleWeight}>
            {subtitle}
          </FontText>
        )}
      </View>

      {}
      {showChevron && (
        <Ionicons
          name="chevron-forward"
          size={20}
          color={secondaryTextColor}
        />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    gap: Spacing.md,
  },
  iconContainer: {
    width: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
  },
});