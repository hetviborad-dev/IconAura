/**
 * PrimaryButton - Reusable primary action button
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  useColorScheme,
  ViewStyle,
} from 'react-native';
import { Colors, Spacing, Typography, Radius, TouchTarget } from '../constants/design';
import Icon from 'react-native-vector-icons/Ionicons';

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  style?: ViewStyle;
  fullWidth?: boolean;
  disabled?: boolean;
  icon?: {
    name: string;
    size?: number;
    color?: string;
  };
}

export default function PrimaryButton({
  title,
  onPress,
  style,
  fullWidth = false,
  disabled = false,
  icon,
}: PrimaryButtonProps) {
  const isDarkMode = useColorScheme() === 'dark';
  const buttonBackground = isDarkMode ? Colors.dark.textPrimary : Colors.textPrimary;

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor: buttonBackground,
        },
        fullWidth && styles.fullWidth,
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={disabled}
    >
      {icon && (
        <Icon
          name={icon.name}
          size={icon.size || 20}
          color={icon.color || '#FFFFFF'}
          style={styles.icon}
        />
      )}
      <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.lg,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    minHeight: TouchTarget.min,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: Typography.sizes.body,
    fontWeight: Typography.weights.semibold,
  },
  icon: {
    // Any specific icon styling
  },
});
