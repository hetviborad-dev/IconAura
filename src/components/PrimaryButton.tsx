

import React from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  ViewStyle,
  ActivityIndicator,
} from 'react-native';
import { Colors, Spacing, Typography, Radius, TouchTarget } from '../constants/design';
import Icon from 'react-native-vector-icons/Ionicons';
import FontText from './FontText';

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  style?: ViewStyle;
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
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
  loading = false,
  icon,
}: PrimaryButtonProps) {
  const isDarkMode = useColorScheme() === 'dark';
  const buttonBackground = Colors.primary;

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor: buttonBackground,
        },
        fullWidth && styles.fullWidth,
        (disabled || loading) && styles.disabled,
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator size="small" color="#FFFFFF" />
      ) : (
        icon && (
          <Icon
            name={icon.name}
            size={icon.size || 20}
            color={icon.color || '#FFFFFF'}
            style={styles.icon}
          />
        )
      )}
      <FontText color="#FFFFFF" size={Typography.sizes.body} name="semibold">{title}</FontText>
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
  icon: {
    
  },
});