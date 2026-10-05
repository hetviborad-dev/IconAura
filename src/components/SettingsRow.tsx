/**
 * SettingsRow - Reusable settings list item with icon and chevron
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
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
  const isDarkMode = useColorScheme() === 'dark';
  const textColor = isDarkMode ? '#FFFFFF' : Colors.textPrimary;
  const secondaryTextColor = isDarkMode ? '#AAAAAA' : Colors.textSecondary;
  const borderColor = isDarkMode ? '#333333' : Colors.border;
  const iconColor = isDarkMode ? '#0A84FF' : '#0A84FF';

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
      {/* Icon */}
      <View style={styles.iconContainer}>
        <Ionicons
          name={icon}
          size={24}
          color={iconColor}
        />
      </View>

      {/* Text */}
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

      {/* Chevron */}
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
