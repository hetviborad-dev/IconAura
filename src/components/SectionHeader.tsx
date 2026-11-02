

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors, Spacing, Typography } from '../constants/design';
import FontText from './FontText';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
}

export default function SectionHeader({
  title,
  subtitle,
}: SectionHeaderProps) {

  return (
    <View style={styles.container}>
      <FontText color={Colors.textPrimary} size={Typography.sizes.h3} name="semibold" style={{ marginBottom: Spacing.xs }}>
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