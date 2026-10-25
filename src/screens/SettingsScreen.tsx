/**
 * SettingsScreen - Settings and information screen
 */

import React from 'react';
import {
  View,
  ScrollView,
  useColorScheme,
  Text,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors, Spacing, Typography, Radius, Layout } from '../constants/design';
import SectionHeader from '../components/SectionHeader';
import SettingsRow from '../components/SettingsRow';
import { APP_NAME, APP_VERSION } from '../data/config';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList } from '../types/navigation';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSubscription } from '../context/SubscriptionContext';

export default function SettingsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { isPremium } = useSubscription();
  const backgroundColor = Colors.background;
  const textColor = Colors.textPrimary;
  const secondaryTextColor = Colors.textSecondary;
  const cardBackground = Colors.surface;
  const borderColor = Colors.border;

  const settingsSections = [
    {
      title: 'Account',
      items: [
        {
          icon: 'star',
          label: isPremium ? 'Premium Active' : 'Upgrade to Premium',
          subtitle: isPremium ? 'You have full access' : 'Unlock all themes and features',
          onPress: () => navigation.navigate('Premium'),
        },
      ],
    },
    {
      title: 'App Configuration',
      items: [

        {
          icon: 'heart',
          label: 'Saved Themes',
          subtitle: 'View your favorite themes',
          onPress: () => navigation.navigate('SavedThemes'),
        },
        {
          icon: 'apps',
          label: 'Manage Icons',
          subtitle: 'Choose visible icons',
          onPress: () => navigation.navigate('IconManagement'),
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
    // {
    //   title: 'About',
    //   items: [
    //     {
    //       icon: 'information-circle-outline',
    //       label: APP_NAME,
    //       subtitle: `Version ${APP_VERSION}`,
    //     },
    //   ],
    // },
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
                  onPress={item.onPress || (() => console.log(`Pressed: ${item.label}`))}
                  showBorder={itemIndex < section.items.length - 1}
                />
              ))}
            </View>
          </View>
        ))}
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
