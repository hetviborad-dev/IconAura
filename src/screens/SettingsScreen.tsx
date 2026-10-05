/**
 * SettingsScreen - Settings and information screen
 */

import React from 'react';
import {
  View,
  ScrollView,
  SafeAreaView,
  useColorScheme,
  Text,
  StyleSheet,
} from 'react-native';
import { Colors, Spacing, Typography, Radius, Layout } from '../constants/design';
import SectionHeader from '../components/SectionHeader';
import SettingsRow from '../components/SettingsRow';
import { APP_NAME, APP_VERSION } from '../data/config';

export default function SettingsScreen() {
  const isDarkMode = useColorScheme() === 'dark';
  const backgroundColor = isDarkMode ? '#121212' : Colors.background;
  const textColor = isDarkMode ? '#FFFFFF' : Colors.textPrimary;
  const secondaryTextColor = isDarkMode ? '#AAAAAA' : Colors.textSecondary;
  const cardBackground = isDarkMode ? '#1E1E1E' : Colors.backgroundSecondary;
  const borderColor = isDarkMode ? '#333333' : Colors.border;

  const settingsSections = [
    {
      title: 'Saved Icons',
      items: [
        {
          icon: 'bookmark-outline',
          label: 'Your custom shortcuts',
          subtitle: 'Manage your created icons',
        },
      ],
    },
    {
      title: 'Account',
      items: [
        {
          icon: 'star-outline',
          label: 'Plan Status',
          subtitle: 'Free plan',
        },
      ],
    },
    {
      title: 'Support',
      items: [
        {
          icon: 'help-circle-outline',
          label: 'Customer Support',
          subtitle: 'Get help and support',
        },
        {
          icon: 'shield-checkmark-outline',
          label: 'Privacy Policy',
          subtitle: 'Read our privacy policy',
        },
      ],
    },
    {
      title: 'About',
      items: [
        {
          icon: 'information-circle-outline',
          label: APP_NAME,
          subtitle: `Version ${APP_VERSION}`,
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
        <Text style={[styles.title, { color: textColor }]}>Settings</Text>

        {/* Settings Sections */}
        {settingsSections.map((section, sectionIndex) => (
          <View key={section.title} style={styles.section}>
            <SectionHeader title={section.title} />

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
                <SettingsRow
                  key={item.label}
                  icon={item.icon}
                  title={item.label}
                  subtitle={item.subtitle}
                  onPress={() => {
                    // TODO: Handle navigation in Phase 2
                    console.log(`Pressed: ${item.label}`);
                  }}
                  showBorder={itemIndex < section.items.length - 1}
                />
              ))}
            </View>
          </View>
        ))}

        {/* App Info */}
        <View style={styles.infoSection}>
          <Text style={[styles.infoText, { color: secondaryTextColor }]}>
            IconAura is a premium customization app for Android. Create
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
  title: {
    fontSize: Typography.sizes.h1,
    fontWeight: Typography.weights.bold,
    marginBottom: Spacing.xl,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionContent: {
    borderRadius: Radius.md,
    borderWidth: 1,
    overflow: 'hidden',
  },
  infoSection: {
    marginTop: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  infoText: {
    fontSize: Typography.sizes.bodySmall,
    fontWeight: Typography.weights.regular,
    lineHeight: Typography.sizes.bodySmall * 1.6,
    textAlign: 'center',
  },
});
