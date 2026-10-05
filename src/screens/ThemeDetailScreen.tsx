/**
 * ThemeDetailScreen - Detailed view of a theme with app icon previews and apply buttons
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  useColorScheme,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Colors, Spacing, Typography, Radius, Layout } from '../constants/design';
import { RootStackParamList } from '../types/navigation';
import { Theme } from '../types/index';
import { getTheme } from '../data/themes';
import { getMvpApps } from '../data/apps';
import { createThemedIcon } from '../data/themed-icons';
import { useAppDetection } from '../hooks/useAppDetection';
import { createShortcut, generateShortcutId, onShortcutPinned } from '../services/shortcutCreation';
import AppIconCard from '../components/AppIconCard';
import AppSvgIcon from '../components/AppSvgIcon';
import PrimaryButton from '../components/PrimaryButton';

type ShortcutState = 'idle' | 'applying' | 'waiting_confirmation' | 'applied' | 'failed';

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
  const { appStatus, loading, error } = useAppDetection();

  // Track shortcut states per app ID
  const [shortcutStates, setShortcutStates] = useState<Record<string, ShortcutState>>({});

  // Listen for native shortcut confirmations
  useEffect(() => {
    const subscription = onShortcutPinned((event) => {
      // event.shortcutId format: "appId_themeId" or "packageName_themeId"
      // find the app that matches this shortcutId
      const app = mvpApps.find((a) => generateShortcutId(a.packageName, themeId) === event.shortcutId);

      if (app) {
        setShortcutStates((prev) => ({
          ...prev,
          [app.id]: event.status === 'success' ? 'applied' : 'failed'
        }));
      }
    });

    return () => {
      subscription.remove();
    };
  }, [themeId, mvpApps]);

  const backgroundColor = isDarkMode ? '#121212' : Colors.background;
  const textColor = isDarkMode ? '#FFFFFF' : Colors.textPrimary;
  const secondaryTextColor = isDarkMode ? '#AAAAAA' : Colors.textSecondary;
  const cardBackground = isDarkMode ? '#1E1E1E' : Colors.backgroundSecondary;
  const borderColor = isDarkMode ? '#333333' : Colors.border;
  const disabledColor = isDarkMode ? '#444444' : Colors.textSecondary;

  const handleCreateShortcut = async (appId: string, appName: string, packageName: string) => {
    // Only allow applying if it's idle or failed
    const currentState = shortcutStates[appId] || 'idle';
    if (currentState === 'applying' || currentState === 'waiting_confirmation') {
      return;
    }

    try {
      setShortcutStates((prev) => ({ ...prev, [appId]: 'applying' }));
      console.log(`Creating shortcut for ${appName}...`);

      // Generate stable shortcut ID
      const shortcutId = generateShortcutId(packageName, themeId);

      // Create shortcut
      const result = await createShortcut({
        appPackageName: packageName,
        shortcutId,
        label: appName,
        iconColor: theme.colors.icon,
        backgroundColor: theme.colors.background,
        themeId,
      });

      if (result.success) {
        setShortcutStates((prev) => ({ ...prev, [appId]: 'waiting_confirmation' }));
        Alert.alert(
          'Add to Home Screen',
          `Android will now ask you to place "${appName}" on your home screen.`,
          [{ text: 'OK' }]
        );
      } else {
        setShortcutStates((prev) => ({ ...prev, [appId]: 'failed' }));
        Alert.alert(
          'Shortcut Creation Failed',
          result.message || 'Could not create shortcut. Your launcher may not support this feature.',
          [{ text: 'OK' }]
        );
      }
    } catch (err) {
      console.error('Shortcut creation error:', err);
      setShortcutStates((prev) => ({ ...prev, [appId]: 'failed' }));
      Alert.alert(
        'Error',
        'Failed to create shortcut. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

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
              <View style={styles.largeIcon}>
                <AppSvgIcon appName={app.name} iconColor={theme.colors.icon} size={64} />
              </View>
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

          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={[styles.loadingText, { color: secondaryTextColor }]}>
                Checking installed apps...
              </Text>
            </View>
          )}

          {error && (
            <View style={[styles.errorContainer, { backgroundColor: cardBackground, borderColor }]}>
              <Ionicons name="warning-outline" size={24} color="#FF6B6B" />
              <Text style={[styles.errorText, { color: secondaryTextColor }]}>
                {error}
              </Text>
            </View>
          )}

          {!loading &&
            mvpApps.map((app) => {
              const status = appStatus[app.id];
              const themedIcon = createThemedIcon(app.id, themeId);
              const isInstalled = status?.installed ?? false;
              const shortcutState = shortcutStates[app.id] || 'idle';
              const isApplying = shortcutState === 'applying' || shortcutState === 'waiting_confirmation';

              // Determine UI status based on shortcut state
              let displayStatus = 'Not installed';
              let displayColor = '#FF9800'; // Orange

              if (isInstalled) {
                switch (shortcutState) {
                  case 'idle':
                    displayStatus = 'Installed - Ready to apply';
                    displayColor = '#4CAF50'; // Green
                    break;
                  case 'applying':
                    displayStatus = 'Preparing icon...';
                    displayColor = Colors.primary; // Blue
                    break;
                  case 'waiting_confirmation':
                    displayStatus = 'Waiting for Android confirmation...';
                    displayColor = '#FFC107'; // Amber
                    break;
                  case 'applied':
                    displayStatus = 'Applied successfully';
                    displayColor = '#4CAF50'; // Green
                    break;
                  case 'failed':
                    displayStatus = 'Failed to apply';
                    displayColor = '#F44336'; // Red
                    break;
                }
              }

              return (
                <View key={app.id} style={styles.appCardContainer}>
                  <AppIconCard
                    appName={app.name}
                    iconColor={themedIcon.iconColor}
                    backgroundColor={themedIcon.backgroundColor}
                    status={displayStatus}
                    statusColor={displayColor}
                    onApply={() => {
                      if (isInstalled && !isApplying) {
                        handleCreateShortcut(app.id, app.name, app.packageName);
                      }
                    }}
                    disabled={!isInstalled || isApplying}
                  />
                  {isApplying && (
                    <View style={styles.creatingOverlay}>
                      <ActivityIndicator size="small" color={Colors.primary} />
                    </View>
                  )}
                </View>
              );
            })}

          {/* Apply All Button */}
          <PrimaryButton
            title="Apply All"
            onPress={() => {
              const installedApps = mvpApps.filter((app) => appStatus[app.id]?.installed);
              if (installedApps.length > 0) {
                installedApps.forEach((app) => {
                  handleCreateShortcut(app.id, app.name, app.packageName);
                });
              }
            }}
            disabled={!Object.values(appStatus).some((s) => s?.installed) || Object.values(shortcutStates).some(s => s === 'applying' || s === 'waiting_confirmation')}
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
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xl,
  },
  loadingText: {
    fontSize: Typography.sizes.body,
    marginTop: Spacing.md,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.md,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  errorText: {
    fontSize: Typography.sizes.bodySmall,
    marginLeft: Spacing.md,
    flex: 1,
  },
  appCardContainer: {
    position: 'relative',
    marginBottom: Spacing.md,
  },
  creatingOverlay: {
    position: 'absolute',
    right: Spacing.md,
    top: '50%',
    transform: [{ translateY: -12 }],
  },
  applyAllButton: {
    marginTop: Spacing.lg,
  },
});
