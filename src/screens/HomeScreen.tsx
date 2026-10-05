/**
 * HomeScreen - Main screen with theme browsing and app selection
 * Shows available themes and supported apps with preview and apply buttons
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  useColorScheme,
} from 'react-native';
import { Colors, Spacing, Typography, Radius, Layout } from '../constants/design';
import { THEMES, SUPPORTED_APPS, APP_NAME } from '../data/config';

export default function HomeScreen() {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundColor = isDarkMode ? '#121212' : Colors.background;
  const textColor = isDarkMode ? '#FFFFFF' : Colors.textPrimary;
  const secondaryTextColor = isDarkMode ? '#CCCCCC' : Colors.textSecondary;
  const cardBackground = isDarkMode ? '#1E1E1E' : Colors.backgroundSecondary;
  const borderColor = isDarkMode ? '#333333' : Colors.border;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.appName, { color: textColor }]}>{APP_NAME}</Text>
          <Text style={[styles.subtitle, { color: secondaryTextColor }]}>
            Create custom home-screen shortcuts
          </Text>
        </View>

        {/* Themes Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>
            Icon Themes
          </Text>
          <Text style={[styles.sectionDescription, { color: secondaryTextColor }]}>
            Choose a theme for your custom icons
          </Text>

          <View style={styles.themesGrid}>
            {Object.values(THEMES).map((theme) => (
              <View
                key={theme.id}
                style={[
                  styles.themeCard,
                  {
                    backgroundColor: cardBackground,
                    borderColor,
                  },
                ]}
              >
                {/* Theme Preview */}
                <View
                  style={[
                    styles.themePreview,
                    {
                      backgroundColor: theme.backgroundColor,
                      borderColor,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.previewIcon,
                      {
                        backgroundColor: theme.iconColor,
                        opacity: 0.7,
                      },
                    ]}
                  />
                </View>

                {/* Theme Info */}
                <Text style={[styles.themeName, { color: textColor }]}>
                  {theme.name}
                </Text>
                <Text
                  style={[styles.themeDescription, { color: secondaryTextColor }]}
                >
                  {theme.description}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Supported Apps Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>
            Supported Apps
          </Text>
          <Text style={[styles.sectionDescription, { color: secondaryTextColor }]}>
            Create shortcuts for these apps
          </Text>

          <View style={styles.appsList}>
            {Object.values(SUPPORTED_APPS).map((app) => (
              <View
                key={app.id}
                style={[
                  styles.appCard,
                  {
                    backgroundColor: cardBackground,
                    borderBottomColor: borderColor,
                  },
                ]}
              >
                <View style={styles.appInfo}>
                  <Text style={[styles.appName, { color: textColor }]}>
                    {app.name}
                  </Text>
                  <Text style={[styles.appDescription, { color: secondaryTextColor }]}>
                    {app.description}
                  </Text>
                </View>
                <Text style={styles.appBadge}>Ready</Text>
              </View>
            ))}
          </View>
        </View>

        {/* CTA Section */}
        <View
          style={[
            styles.ctaSection,
            {
              backgroundColor: cardBackground,
              borderColor,
            },
          ]}
        >
          <Text style={[styles.ctaTitle, { color: textColor }]}>
            Ready to create?
          </Text>
          <Text style={[styles.ctaDescription, { color: secondaryTextColor }]}>
            Select a theme and app above to create your first custom shortcut.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Layout.screenPadding,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  header: {
    marginBottom: Spacing.xl,
  },
  appName: {
    fontSize: Typography.sizes.h1,
    fontWeight: Typography.weights.bold,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: Typography.sizes.body,
    fontWeight: Typography.weights.regular,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: Typography.sizes.h3,
    fontWeight: Typography.weights.semibold,
    marginBottom: Spacing.sm,
  },
  sectionDescription: {
    fontSize: Typography.sizes.bodySmall,
    fontWeight: Typography.weights.regular,
    marginBottom: Spacing.md,
  },
  themesGrid: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  themeCard: {
    flex: 1,
    borderRadius: Radius.md,
    borderWidth: 1,
    padding: Spacing.md,
    alignItems: 'center',
  },
  themePreview: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: Radius.sm,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  previewIcon: {
    width: 32,
    height: 32,
    borderRadius: Radius.sm,
  },
  themeName: {
    fontSize: Typography.sizes.bodySmall,
    fontWeight: Typography.weights.semibold,
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  themeDescription: {
    fontSize: Typography.sizes.caption,
    fontWeight: Typography.weights.regular,
    textAlign: 'center',
  },
  appsList: {
    gap: Spacing.md,
  },
  appCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: Radius.md,
    borderWidth: 1,
    padding: Spacing.md,
    borderBottomWidth: 1,
  },
  appInfo: {
    flex: 1,
  },
  appDescription: {
    fontSize: Typography.sizes.bodySmall,
    fontWeight: Typography.weights.regular,
    marginTop: Spacing.xs,
  },
  appBadge: {
    fontSize: Typography.sizes.caption,
    fontWeight: Typography.weights.semibold,
    color: '#34C759',
    marginLeft: Spacing.md,
  },
  ctaSection: {
    borderRadius: Radius.md,
    borderWidth: 1,
    padding: Spacing.lg,
    alignItems: 'center',
    marginTop: Spacing.xl,
  },
  ctaTitle: {
    fontSize: Typography.sizes.h4,
    fontWeight: Typography.weights.semibold,
    marginBottom: Spacing.sm,
  },
  ctaDescription: {
    fontSize: Typography.sizes.bodySmall,
    fontWeight: Typography.weights.regular,
    textAlign: 'center',
  },
});
