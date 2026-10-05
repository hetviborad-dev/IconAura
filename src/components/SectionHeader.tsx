/**
 * SectionHeader - Reusable section header with title and optional subtitle
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import { Spacing, Typography } from '../constants/design';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
}

export default function SectionHeader({
  title,
  subtitle,
}: SectionHeaderProps) {
  const isDarkMode = useColorScheme() === 'dark';
  const textColor = isDarkMode ? '#FFFFFF' : '#000000';
  const secondaryTextColor = isDarkMode ? '#AAAAAA' : '#666666';

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
