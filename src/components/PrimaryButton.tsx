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
import { Colors, Spacing, Typography, Radius } from '../constants/design';

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  style?: ViewStyle;
  fullWidth?: boolean;
  disabled?: boolean;
}

export default function PrimaryButton({
  title,
  onPress,
  style,
  fullWidth = false,
  disabled = false,
}: PrimaryButtonProps) {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <TouchableOpacity
      style={[
        styles.button,
        fullWidth && styles.fullWidth,
        {
          opacity: disabled ? 0.5 : 1,
        },
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.8}
      disabled={disabled}
    >
      <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#0A84FF',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullWidth: {
    width: '100%',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: Typography.sizes.body,
    fontWeight: Typography.weights.semibold,
  },
});
