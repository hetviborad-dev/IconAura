/**
 * SettingsScreen - Settings and information screen
 * Shows saved icons, account/plan info, support, and app details
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
import { APP_NAME, APP_VERSION } from '../data/config';

export default function SettingsScreen() {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundColor = isDarkMode ? '#121212' : Colors.background;
  const textColor = isDarkMode ? '#FFFFFF' : Colors.textPrimary;
  const secondaryTextColor = isDarkMode ? '#CCCCCC' : Colors.textSecondary;
  const cardBackground = isDarkMode ? '#1E1E1E' : Colors.backgroundSecondary;
  const borderColor = isDarkMode ? '#333333' : Colors.border;

  const settingsSections = [
    {
      title: 'Saved Icons',
      items: [
        {
          label: 'Your custom shortcuts',
          description: 'Manage your created icons',
        },
      ],
    },
    {
      title: 'Account',
      items: [
        {
          label: 'Plan Status',
          description: 'Free plan',
        },
      ],
    },
    {
      title: 'Support',
      items: [
        {
          label: 'Customer Support',
          description: 'Get help and support',
        },
        {
          label: 'Privacy Policy',
          description: 'Read our privacy policy',
        },
      ],
    },
    {
      title: 'About',
      items: [
        {
          label: `${APP_NAME}`,
          description: `Version ${APP_VERSION}`,
        },
      ],
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: textColor }]}>Settings</Text>
        </View>

        {/* Settings Sections */}
        {settingsSections.map((section, sectionIndex) => (
          <View key={section.title} style={styles.section}>
            <Text
              style={[
                styles.sectionTitle,
                { color: textColor, marginBottom: Spacing.md },
              ]}
            >
              {section.title}
            </Text>

            <View
              style={[
                styles.sectionContent,
                {
                  backgroundColor: cardBackground,
                  borderColor,
                },
              ]}
            >
              {section.items.map((item, itemIndex) => (
                <View
                  key={item.label}
                  style={[
                    styles.settingItem,
                    {
                      borderBottomColor: borderColor,
                      borderBottomWidth:
                        itemIndex < section.items.length - 1 ? 1 : 0,
                    },
                  ]}
                >
                  <View style={styles.settingInfo}>
                    <Text style={[styles.settingLabel, { color: textColor }]}>
                      {item.label}
                    </Text>
                    <Text
                      style={[
                        styles.settingDescription,
                        { color: secondaryTextColor },
                      ]}
                    >
                      {item.description}
                    </Text>
                  </View>
                  <Text style={[styles.settingArrow, { color: borderColor }]}>
                    →
                  </Text>
                </View>
              ))}
            </View>
          </View>
        ))}

        {/* App Info */}
        <View style={styles.infoSection}>
          <Text style={[styles.infoTitle, { color: secondaryTextColor }]}>
            {APP_NAME} is a premium customization app for Android. Create
            beautiful home-screen shortcuts with custom themes.
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
  title: {
    fontSize: Typography.sizes.h1,
    fontWeight: Typography.weights.bold,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: Typography.sizes.h4,
    fontWeight: Typography.weights.semibold,
  },
  sectionContent: {
    borderRadius: Radius.md,
    borderWidth: 1,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  settingInfo: {
    flex: 1,
    marginRight: Spacing.md,
  },
  settingLabel: {
    fontSize: Typography.sizes.body,
    fontWeight: Typography.weights.medium,
    marginBottom: Spacing.xs,
  },
  settingDescription: {
    fontSize: Typography.sizes.bodySmall,
    fontWeight: Typography.weights.regular,
  },
  settingArrow: {
    fontSize: Typography.sizes.h4,
    fontWeight: Typography.weights.semibold,
  },
  infoSection: {
    marginTop: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  infoTitle: {
    fontSize: Typography.sizes.bodySmall,
    fontWeight: Typography.weights.regular,
    lineHeight: Typography.sizes.bodySmall * 1.6,
    textAlign: 'center',
  },
});
