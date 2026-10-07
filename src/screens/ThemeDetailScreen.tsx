/**
 * ThemeDetailScreen - Detailed view of a theme with app icon previews and apply buttons
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  useColorScheme,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Colors, Spacing, Typography, Radius, Layout } from '../constants/design';
import { RootStackParamList } from '../types/navigation';
import { Theme } from '../types/index';
import type { AppId } from '../types/data';
import { getTheme } from '../data/themes';
import { getAllApps } from '../data/apps';
import ShortcutIconCapture from '../components/ShortcutIconCapture';
import { useAppDetection } from '../hooks/useAppDetection';
import { createShortcut, generateShortcutId, onShortcutPinned } from '../services/shortcutCreation';
import AppIconCard from '../components/AppIconCard';
import IconCanvas from '../components/IconCanvas';
import PrimaryButton from '../components/PrimaryButton';

type ShortcutState = 'idle' | 'applying' | 'waiting_confirmation' | 'retry' | 'applied' | 'failed';

const SUPPORTED_APPS = getAllApps();

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
  const { appStatus, loading, error, refresh } = useAppDetection();
  const installedApps = SUPPORTED_APPS.filter((app) => appStatus[app.id]?.installed);

  // Track shortcut states per app ID
  const [shortcutStates, setShortcutStates] = useState<Record<string, ShortcutState>>({});
  const confirmationTimers = React.useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const captureIcons = React.useRef<Partial<Record<AppId, () => Promise<string>>>>({});
  const registerCapture = React.useCallback((appId: AppId, capture: () => Promise<string>) => {
    captureIcons.current[appId] = capture;
  }, []);

  // Listen for native shortcut confirmations
  useEffect(() => {
    const subscription = onShortcutPinned((event) => {
      const app = SUPPORTED_APPS.find((a) => generateShortcutId(a.packageName, themeId) === event.shortcutId);

      if (app) {
        clearTimeout(confirmationTimers.current[app.id]);
        delete confirmationTimers.current[app.id];
        setShortcutStates((prev) => ({
          ...prev,
          [app.id]: event.status === 'success' ? 'applied' : 'failed',
        }));
      }
    });

    return () => {
      subscription.remove();
      Object.values(confirmationTimers.current).forEach(clearTimeout);
      confirmationTimers.current = {};
    };
  }, [themeId]);

  const backgroundColor = isDarkMode ? '#121212' : Colors.background;
  const textColor = isDarkMode ? '#FFFFFF' : Colors.textPrimary;
  const secondaryTextColor = isDarkMode ? '#AAAAAA' : Colors.textSecondary;
  const cardBackground = isDarkMode ? '#1E1E1E' : Colors.backgroundSecondary;
  const borderColor = isDarkMode ? '#333333' : Colors.border;

  const handleCreateShortcut = async (appId: string, appName: string, packageName: string) => {
    const currentState = shortcutStates[appId] || 'idle';
    if (currentState === 'applying' || currentState === 'waiting_confirmation') {
      return;
    }

    try {
      setShortcutStates((prev) => ({ ...prev, [appId]: 'applying' }));
      console.log(`Creating shortcut for ${appName}...`);

      const shortcutId = generateShortcutId(packageName, themeId);
      const iconPngBase64 = await captureIcons.current[appId as AppId]?.();
      if (!iconPngBase64) throw new Error('Could not capture the SVG icon asset.');

      const result = await createShortcut({
        appPackageName: packageName,
        shortcutId,
        label: appName,
        iconColor: theme.icon.value,
        backgroundColor: theme.background.value,
        iconPngBase64,
        themeId,
      });

      if (result.success) {
        setShortcutStates((prev) => ({ ...prev, [appId]: 'waiting_confirmation' }));
        clearTimeout(confirmationTimers.current[appId]);
        confirmationTimers.current[appId] = setTimeout(() => {
          setShortcutStates((prev) =>
            prev[appId] === 'waiting_confirmation'
              ? { ...prev, [appId]: 'retry' }
              : prev,
          );
          delete confirmationTimers.current[appId];
        }, 15000);
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
      const errorMessage = err instanceof Error ? err.message : String(err);
      Alert.alert('Shortcut Creation Failed', errorMessage, [{ text: 'OK' }]);
    }
  };

  const handleApplyAll = async () => {
    const appsToApply = SUPPORTED_APPS.filter((app) => appStatus[app.id]?.installed);
    if (appsToApply.length === 0) {
      return;
    }

    for (const app of appsToApply) {
      const currentState = shortcutStates[app.id] || 'idle';
      if (currentState === 'applied' || currentState === 'applying' || currentState === 'waiting_confirmation') {
        continue;
      }

      await handleCreateShortcut(app.id, app.name, app.packageName);
      await new Promise<void>((resolve) => setTimeout(resolve, 1000));
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <View style={styles.hiddenCaptures} pointerEvents="none">
        {SUPPORTED_APPS.map((app) => (
          <ShortcutIconCapture
            key={app.id}
            appId={app.id}
            theme={theme}
            onCaptureReady={registerCapture}
          />
        ))}
      </View>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
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

        <Text style={[styles.description, { color: secondaryTextColor }]}>
          {theme.description}
        </Text>

        <View
          style={[
            styles.largePreview,
            {
              backgroundColor: theme.background.type === 'color' ? theme.background.value : 'transparent',
              borderColor,
            },
          ]}
        >
          {loading ? null : !error && theme.preview.featuredApps
            .map((appId) => SUPPORTED_APPS.find((app) => app.id === appId))
            .filter((app) => app && appStatus[app.id]?.installed)
            .map((app, index) => app && (
            <View
              key={app.id}
              style={[
                styles.previewIconContainer,
                index > 0 && { marginLeft: Spacing.lg },
              ]}
            >
              <View style={styles.largeIcon}>
                <IconCanvas appId={app.id} theme={theme} size={56} />
              </View>
              <Text
                style={[
                  styles.previewLabel,
                  { color: theme.icon.value },
                ]}
              >
                {app.name}
              </Text>
            </View>
          ))}
        </View>

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

          {!loading && !error && installedApps.length === 0 && (
            <Text style={[styles.emptyState, { color: secondaryTextColor }]}>
              None of the supported apps are installed yet.
            </Text>
          )}

          {!loading && !error &&
            installedApps.map((app) => {
              const status = appStatus[app.id];
              const isInstalled = status?.installed ?? false;
              const shortcutState = shortcutStates[app.id] || 'idle';
              const isBusy = shortcutState === 'applying' || shortcutState === 'waiting_confirmation';

              let displayStatus = 'Not installed';
              let displayColor = '#FF9800';

              if (isInstalled) {
                switch (shortcutState) {
                  case 'idle':
                    displayStatus = 'Installed - Ready to apply';
                    displayColor = '#4CAF50';
                    break;
                  case 'retry':
                    displayStatus = 'Not added - Tap to retry';
                    displayColor = '#FF9800';
                    break;
                  case 'applying':
                    displayStatus = 'Preparing icon...';
                    displayColor = Colors.primary;
                    break;
                  case 'waiting_confirmation':
                    displayStatus = 'Waiting for Android confirmation...';
                    displayColor = '#FFC107';
                    break;
                  case 'applied':
                    displayStatus = 'Applied successfully';
                    displayColor = '#4CAF50';
                    break;
                  case 'failed':
                    displayStatus = 'Failed to apply';
                    displayColor = '#F44336';
                    break;
                }
              }

              return (
                <View key={app.id} style={styles.appCardContainer}>
                  <AppIconCard
                    appName={app.name}
                    appId={app.id}
                    theme={theme}
                    status={displayStatus}
                    statusColor={displayColor}
                    onApply={() => {
                      if (isInstalled && !isBusy) {
                        handleCreateShortcut(app.id, app.name, app.packageName);
                      }
                    }}
                    disabled={!isInstalled || isBusy}
                    loading={shortcutState === 'applying'}
                  />
                </View>
              );
            })}

          <PrimaryButton
            title="Apply All"
            onPress={handleApplyAll}
            disabled={!Object.values(appStatus).some((s) => s?.installed) || Object.values(shortcutStates).some(s => s === 'applying')}
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
  hiddenCaptures: {
    position: 'absolute',
    left: -600,
    top: 0,
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
  emptyState: {
    fontSize: Typography.sizes.body,
    paddingVertical: Spacing.lg,
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
  applyAllButton: {
    marginTop: Spacing.lg,
  },
});
