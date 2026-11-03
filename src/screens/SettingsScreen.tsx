

import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Linking,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors, Spacing, Typography, Radius, Layout } from '../constants/design';
import SectionHeader from '../components/SectionHeader';
import SettingsRow from '../components/SettingsRow';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList } from '../types/navigation';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSubscription } from '../context/SubscriptionContext';
import FontText from '../components/FontText';

export default function SettingsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { isPremium } = useSubscription();
  const backgroundColor = Colors.background;
  const textColor = Colors.textPrimary;
  const cardBackground = '#16161F';
  const borderColor = '#262633';

  const settingsSections = [
    {
      title: '',
      items: [
        {
          icon: 'star',
          premium: true,
          label: isPremium ? 'Premium Active' : 'Upgrade to Premium',
          subtitle: isPremium ? 'You have full access' : 'Unlock all themes and features',
          onPress: () => navigation.navigate('Premium'),
        },
      ],
    },
    {
      title: 'Customize',
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
          onPress: () => Linking.openURL('https://sites.google.com/view/iconaura/privacy-policy').catch(() => {}),
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
        {}
        <FontText color={textColor} size={32} name="bold" style={{ marginBottom: 4 }}>Settings</FontText>
        <FontText color="#A8A8B8" size={14} name="semibold" style={{ marginBottom: Spacing.xl }}>Manage your icons, themes and account</FontText>

        {}
        {settingsSections.map((section) => (
          <View key={section.title} style={styles.section}>
            {section.title ? <SectionHeader title={section.title} color={section.title === 'Customize' ? '#A8A8B8' : Colors.textPrimary} size={Typography.sizes.h3} name={section.title === 'Customize' ? 'semibold' : 'semibold'} /> : null}

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
                  onPress={item.onPress}
                  backgroundColor={item.premium ? Colors.primary : undefined}
                  titleColor={item.premium ? '#000000' : undefined}
                  titleSize={item.premium ? 18 : undefined}
                  titleWeight={item.premium ? 'bold' : undefined}
                  subtitleColor={item.premium ? '#000000' : undefined}
                  subtitleWeight={item.premium ? 'semibold' : undefined}
                  secondaryTextColor={item.premium ? '#000000' : undefined}
                  subtitleSize={item.premium ? 12 : undefined}
                  iconBackgroundColor={item?.premium ? '#000000' : undefined}
                  iconColor={item.premium ? Colors.primary : undefined}
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
  section: {
    marginBottom: Spacing.xl,
  },
  sectionContent: {
    borderRadius: Radius.md,
    borderWidth: 1,
    overflow: 'hidden',
  },
});