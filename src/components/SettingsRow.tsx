

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Colors, Spacing, Typography, Radius } from '../constants/design';

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
  const textColor = Colors.textPrimary;
  const secondaryTextColor = Colors.textSecondary;
  const borderColor = Colors.border;
  const iconColor = Colors.primary;

  return (
    <TouchableOpacity
      style={[
        styles.row,
        showBorder && {
          borderBottomColor: borderColor,
          borderBottomWidth: 1,
        },
      ]}
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
        <Text style={[styles.title, { color: textColor }]}>
          {title}
        </Text>
        {subtitle && (
          <Text style={[styles.subtitle, { color: secondaryTextColor }]}>
            {subtitle}
          </Text>
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
  title: {
    fontSize: Typography.sizes.body,
    fontWeight: Typography.weights.medium,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: Typography.sizes.bodySmall,
    fontWeight: Typography.weights.regular,
  },
});
