

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors, Spacing, Typography } from '../constants/design';
import FontText from './FontText';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  color?: string;
  size?: number;
  name?: 'regular' | 'medium' | 'semibold' | 'bold';
}

export default function SectionHeader({
  title,
  subtitle,
  color = Colors.textPrimary,
  size = Typography.sizes.h3,
  name = 'semibold',
}: SectionHeaderProps) {

  return (
    <View style={styles.container}>
      <FontText color={color} size={size} name={name} style={{ marginBottom: Spacing.xs }}>
        {title}
      </FontText>
      {subtitle && (
        <FontText color={Colors.textSecondary} size={Typography.sizes.bodySmall} name="regular">
          {subtitle}
        </FontText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
});