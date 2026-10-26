

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { Colors, Spacing, Typography } from '../constants/design';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
}

export default function SectionHeader({
  title,
  subtitle,
}: SectionHeaderProps) {
  const textColor = Colors.textPrimary;
  const secondaryTextColor = Colors.textSecondary;

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: textColor }]}>
        {title}
      </Text>
      {subtitle && (
        <Text style={[styles.subtitle, { color: secondaryTextColor }]}>
          {subtitle}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: Typography.sizes.h3,
    fontWeight: Typography.weights.semibold,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: Typography.sizes.bodySmall,
    fontWeight: Typography.weights.regular,
  },
});
