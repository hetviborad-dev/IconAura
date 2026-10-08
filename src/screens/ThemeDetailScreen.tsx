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
  const isMounted = React.useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const { themeId } = route.params;
  const theme = getTheme(themeId);
  const { appStatus, loading, error, refresh } = useAppDetection();
  const installedApps = SUPPORTED_APPS.filter((app) => appStatus[app.id]?.installed);

  const safeAlert = (title: string, message: string, options?: any[]) => {
    if (isMounted.current) {
      Alert.alert(title, message, options);
    }
  };

  // Track shortcut states per app ID
  const [shortcutStates, setShortcutStates] = useState<Record<string, ShortcutState>>({});
  const [capturingAppId, setCapturingAppId] = useState<AppId | null>(null);
  const [currentPrefs, setCurrentPrefs] = useState<{ shape: 'round' | 'square', withAppName: boolean } | null>(null);
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

  const promptUserPreferences = async (): Promise<{ shape: 'round' | 'square', withAppName: boolean }> => {
    const shape = await new Promise<'round' | 'square'>((resolve) => {
      Alert.alert(
        'Icon Shape',
        'Choose the shape for your icons',
        [
          { text: 'Round', onPress: () => resolve('round') },
          { text: 'Square', onPress: () => resolve('square') },
        ],
        { cancelable: false }
      );
    });

    const withAppName = await new Promise<boolean>((resolve) => {
      Alert.alert(
        'App Name',
        'Do you want to include the app name?',
        [
          { text: 'Yes', onPress: () => resolve(true) },
          { text: 'No', onPress: () => resolve(false) },
        ],
        { cancelable: false }
      );
    });

    return { shape, withAppName };
  };

  const handleCreateShortcut = async (
    appId: string,
    appName: string,
    packageName: string,
    preferences?: { shape: 'round' | 'square', withAppName: boolean }
  ) => {
    console.log(`[Apply] Starting shortcut creation for ${appName} (${appId})`);
    const currentState = shortcutStates[appId] || 'idle';
    if (currentState === 'applying' || currentState === 'waiting_confirmation') {
      console.log(`[Apply] App ${appId} is already busy (${currentState}), skipping`);
      return;
    }

    try {
      // Immediate visual feedback
      console.log(`[Apply] Setting state to applying for ${appId} immediately`);
      setShortcutStates((prev) => ({ ...prev, [appId]: 'applying' }));

      // Now prompt for preferences
      console.log(`[Apply] Prompting for preferences...`);
      const prefs = preferences || await promptUserPreferences();
      console.log(`[Apply] Preferences received:`, prefs);
      setCurrentPrefs(prefs);

      const shortcutId = generateShortcutId(packageName, themeId);
      console.log(`[Apply] Generated shortcutId: ${shortcutId}`);

      // 1. Trigger the capture component to render this specific app
      console.log(`[Apply] Setting capturingAppId to ${appId}`);
      setCapturingAppId(appId as AppId);

      // 2. Wait for the component to render and register its capture function
      console.log(`[Apply] Waiting for capture registration...`);
      let attempts = 0;
      while (!captureIcons.current[appId as AppId] && attempts < 20) {
        await new Promise((resolve) => setTimeout(resolve, 50));
        attempts++;
      }
      console.log(`[Apply] Capture registration attempt ${attempts}/20. Registered: ${!!captureIcons.current[appId as AppId]}`);

      if (!captureIcons.current[appId as AppId]) {
         throw new Error('Capture function not registered in time');
      }

      console.log(`[Apply] Capturing icon...`);
      const iconPngBase64 = await captureIcons.current[appId as AppId]?.();

      if (!iconPngBase64) {
        console.log(`[Apply] Icon capture returned null`);
        throw new Error('Could not capture the SVG icon asset. Please try again.');
      }
      console.log(`[Apply] Icon captured successfully (length: ${iconPngBase64.length})`);

      console.log(`[Apply] Calling createShortcut service...`);
      const result = await createShortcut({
        appPackageName: packageName,
        shortcutId,
        label: prefs.withAppName ? appName : '',
        iconColor: theme.icon.value,
        backgroundColor: theme.background.value,
        iconPngBase64,
        shape: prefs.shape,
        withAppName: prefs.withAppName,
        themeId,
      });
      console.log(`[Apply] createShortcut result:`, result);

      if (result.success) {
        console.log(`[Apply] Success! Setting state to waiting_confirmation`);
        setShortcutStates((prev) => ({ ...prev, [appId]: 'waiting_confirmation' }));
        clearTimeout(confirmationTimers.current[appId]);
        confirmationTimers.current[appId] = setTimeout(() => {
          console.log(`[Apply] Confirmation timeout reached for ${appId}`);
          setShortcutStates((prev) =>
            prev[appId] === 'waiting_confirmation'
              ? { ...prev, [appId]: 'retry' }
              : prev,
          );
          delete confirmationTimers.current[appId];
        }, 15000);
      } else {
        console.log(`[Apply] createShortcut failed: ${result.message}`);
        setShortcutStates((prev) => ({ ...prev, [appId]: 'failed' }));
        safeAlert(
          'Shortcut Creation Failed',
          result.message || 'Could not create shortcut. Your launcher may not support this feature.',
          [{ text: 'OK' }]
        );
      }
    } catch (err) {
      console.error(`[Apply] ERROR during shortcut creation for ${appId}:`, err);
      setShortcutStates((prev) => ({ ...prev, [appId]: 'failed' }));
      const errorMessage = err instanceof Error ? err.message : String(err);
      safeAlert('Shortcut Creation Failed', errorMessage, [{ text: 'OK' }]);
    } finally {
      console.log(`[Apply] Cleaning up capturingAppId for ${appId}`);
      setCapturingAppId(null);
    }
  };

  const handleApplyAll = async () => {
    const appsToApply = SUPPORTED_APPS.filter((app) => appStatus[app.id]?.installed);
    if (appsToApply.length === 0) {
      return;
    }

    // Prompt for preferences once for all apps
    const prefs = await promptUserPreferences();
    setCurrentPrefs(prefs);

    for (const app of appsToApply) {
      const currentState = shortcutStates[app.id] || 'idle';
      if (currentState === 'applied' || currentState === 'applying' || currentState === 'waiting_confirmation') {
        continue;
      }

      await handleCreateShortcut(app.id, app.name, app.packageName, prefs);
      await new Promise<void>((resolve) => setTimeout(resolve, 1000));
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <View style={styles.hiddenCaptures} pointerEvents="none">
        <ShortcutIconCapture
          appId={capturingAppId}
          theme={theme}
          shape={currentPrefs?.shape}
          onCaptureReady={registerCapture}
        />
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
