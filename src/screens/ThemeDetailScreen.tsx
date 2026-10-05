/**
 * ThemeDetailScreen - Detailed view of a theme with app icon previews and apply buttons
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  useColorScheme,
  TouchableOpacity,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Colors, Spacing, Typography, Radius, Layout } from '../constants/design';
import { RootStackParamList } from '../types/navigation';
import { Theme } from '../types/index';
import { getTheme } from '../data/themes';
import { getMvpApps } from '../data/apps';
import { createThemedIcon } from '../data/themed-icons';
import AppIconCard from '../components/AppIconCard';
import PrimaryButton from '../components/PrimaryButton';

interface ThemeDetailScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList, 'ThemeDetail'>;
  route: {
    params: {
      themeId: Theme;
    };
  };
}

export default function ThemeDetailScreen({
  navigation,
  route,
}: ThemeDetailScreenProps) {
  const isDarkMode = useColorScheme() === 'dark';
  const { themeId } = route.params;
  const theme = getTheme(themeId);
  const mvpApps = getMvpApps();

  const backgroundColor = isDarkMode ? '#121212' : Colors.background;
  const textColor = isDarkMode ? '#FFFFFF' : Colors.textPrimary;
  const secondaryTextColor = isDarkMode ? '#AAAAAA' : Colors.textSecondary;
  const cardBackground = isDarkMode ? '#1E1E1E' : Colors.backgroundSecondary;
  const borderColor = isDarkMode ? '#333333' : Colors.border;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with Back Button */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={28} color={textColor} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: textColor }]}>
            {theme.name}
          </Text>
          <View style={{ width: 28 }} />
        </View>

        {/* Theme Description */}
        <Text style={[styles.description, { color: secondaryTextColor }]}>
          {theme.description}
        </Text>

        {/* Large Preview */}
        <View
          style={[
            styles.largePreview,
            {
              backgroundColor: theme.colors.background,
              borderColor,
            },
          ]}
        >
          {mvpApps.map((app, index) => (
            <View
              key={app.id}
              style={[
                styles.previewIconContainer,
                index > 0 && { marginLeft: Spacing.lg },
              ]}
            >
              <View
                style={[
                  styles.largeIcon,
                  {
                    backgroundColor: theme.colors.icon,
                  },
                ]}
              />
              <Text
                style={[
                  styles.previewLabel,
                  { color: theme.colors.icon },
                ]}
              >
                {app.name}
              </Text>
            </View>
          ))}
        </View>

        {/* Apps Section */}
        <View style={styles.appsSection}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>
            Apply to Apps
          </Text>

          {mvpApps.map((app) => {
            const themedIcon = createThemedIcon(app.id, themeId);
            return (
              <AppIconCard
                key={app.id}
                appName={app.name}
                iconColor={themedIcon.iconColor}
                backgroundColor={themedIcon.backgroundColor}
                status="Ready to apply"
                onApply={() => {
                  // TODO: Implement apply functionality in Phase 2
                  console.log(`Apply ${theme.name} to ${app.name}`);
                }}
              />
            );
          })}

          {/* Apply All Button */}
          <PrimaryButton
            title="Apply All"
            onPress={() => {
              // TODO: Implement apply all functionality in Phase 2
              console.log(`Apply all apps with ${theme.name}`);
            }}
            fullWidth
            style={styles.applyAllButton}
          />
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  backButton: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: Typography.sizes.h2,
    fontWeight: Typography.weights.bold,
    textAlign: 'center',
  },
  description: {
    fontSize: Typography.sizes.body,
    fontWeight: Typography.weights.regular,
    marginBottom: Spacing.lg,
    lineHeight: Typography.sizes.body * 1.5,
  },
  largePreview: {
    borderRadius: Radius.md,
    borderWidth: 1,
    padding: Spacing.xl,
    marginBottom: Spacing.xl,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewIconContainer: {
    alignItems: 'center',
  },
  largeIcon: {
    width: 80,
    height: 80,
    borderRadius: Radius.md,
    marginBottom: Spacing.md,
  },
  previewLabel: {
    fontSize: Typography.sizes.bodySmall,
    fontWeight: Typography.weights.semibold,
  },
  appsSection: {
    marginTop: Spacing.xl,
  },
  sectionTitle: {
    fontSize: Typography.sizes.h3,
    fontWeight: Typography.weights.semibold,
    marginBottom: Spacing.md,
  },
  applyAllButton: {
    marginTop: Spacing.lg,
  },
});
