/**
 * HomeScreen - Main screen with theme browsing
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
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors, Spacing, Typography, Layout } from '../constants/design';
import { RootStackParamList } from '../types/navigation';
import { getAllThemes } from '../data/themes';
import ThemeCard from '../components/ThemeCard';
import SectionHeader from '../components/SectionHeader';

interface HomeScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>;
}

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const isDarkMode = useColorScheme() === 'dark';
  const backgroundColor = isDarkMode ? Colors.dark.background : Colors.background;
  const textColor = isDarkMode ? Colors.dark.textPrimary : Colors.textPrimary;
  const secondaryTextColor = isDarkMode ? Colors.dark.textSecondary : Colors.textSecondary;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.appName, { color: textColor }]}>
            IconAura
          </Text>
          <Text style={[styles.tagline, { color: secondaryTextColor }]}>
            Beautiful custom icons for your home screen
          </Text>
        </View>

        {/* Themes Section */}
        <View style={styles.section}>
          <SectionHeader
            title="Icon Themes"
            subtitle="Choose a theme for your apps"
          />

          {getAllThemes().map((theme) => (
            <ThemeCard
              key={theme.id}
              themeName={theme.name}
              description={theme.description}
              iconColor={theme.colors.icon}
              backgroundColor={theme.colors.background}
              supportedAppCount={2}
              onPress={() => {
                navigation.navigate('ThemeDetail', { themeId: theme.id });
              }}
            />
          ))}
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
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.xxxl,
  },
  header: {
    marginBottom: Spacing.xxxl,
  },
  appName: {
    fontSize: Typography.sizes.h1,
    fontWeight: Typography.weights.bold,
    marginBottom: Spacing.sm,
    lineHeight: Typography.sizes.h1 * Typography.lineHeights.tight,
  },
  tagline: {
    fontSize: Typography.sizes.body,
    fontWeight: Typography.weights.regular,
    lineHeight: Typography.sizes.body * Typography.lineHeights.normal,
  },
  section: {
    marginBottom: Spacing.xxl,
  },
});
