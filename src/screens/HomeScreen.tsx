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
import { THEMES } from '../data/config';
import ThemeCard from '../components/ThemeCard';
import SectionHeader from '../components/SectionHeader';

interface HomeScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>;
}

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const isDarkMode = useColorScheme() === 'dark';
  const backgroundColor = isDarkMode ? '#121212' : Colors.background;
  const textColor = isDarkMode ? '#FFFFFF' : Colors.textPrimary;
  const secondaryTextColor = isDarkMode ? '#AAAAAA' : Colors.textSecondary;

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
            Make your home screen yours.
          </Text>
        </View>

        {/* Themes Section */}
        <View style={styles.section}>
          <SectionHeader
            title="Icon Themes"
            subtitle="Choose a theme for your custom icons"
          />

          {Object.values(THEMES).map((theme) => (
            <ThemeCard
              key={theme.id}
              themeName={theme.name}
              description={theme.description}
              iconColor={theme.iconColor}
              backgroundColor={theme.backgroundColor}
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
  tagline: {
    fontSize: Typography.sizes.body,
    fontWeight: Typography.weights.regular,
  },
  section: {
    marginBottom: Spacing.xl,
  },
});
