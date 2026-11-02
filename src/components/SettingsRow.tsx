

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
}

export default function SettingsRow({
  icon,
  title,
  subtitle,
  onPress,
  showChevron = true,
  showBorder = true,
}: SettingsRowProps) {
  const secondaryTextColor = Colors.textSecondary;
  const borderColor = Colors.border;
  const iconColor = Colors.primary;
  const borderDynamic = showBorder
    ? { borderBottomColor: borderColor, borderBottomWidth: 1 }
    : undefined;

  return (
    <TouchableOpacity
      style={[styles.row, borderDynamic]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {}
      <View style={styles.iconContainer}>
        <Ionicons
          name={icon}
          size={24}
          color={iconColor}
        />
      </View>

      {}
      <View style={styles.textContainer}>
        <FontText color={Colors.textPrimary} size={Typography.sizes.body} name="medium" style={{ marginBottom: Spacing.xs }}>
          {title}
        </FontText>
        {subtitle && (
          <FontText color={Colors.textSecondary} size={Typography.sizes.bodySmall} name="regular">
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