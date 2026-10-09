/**
 * ThemeDetailScreen - Detailed view of a theme with app icon previews and apply buttons
 */

import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  useColorScheme,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  FlatList,
  TextInput,
  Image,
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
import { fetchAllInstalledApps } from '../services/appDetection';
import AppSelectionRow from '../components/AppSelectionRow';
import PrimaryButton from '../components/PrimaryButton';
import { NativeModules } from 'react-native';

const { HomeShortcut } = NativeModules;

const PickerAppIcon = memo(({
  appId,
  currentIcons,
  setCurrentIcons,
  isDarkMode
}: {
  appId: string,
  currentIcons: Record<string, string>,
  setCurrentIcons: React.Dispatch<React.SetStateAction<Record<string, string>>>,
  isDarkMode: boolean
}) => {
  const [icon, setIcon] = useState(currentIcons[appId]);

  useEffect(() => {
    if (icon) return;
    let isMounted = true;
    async function load() {
      try {
        const result = await HomeShortcut.getCurrentAppIcon({ packageName: appId });
        if (isMounted) {
          setIcon(result.base64);
          setCurrentIcons(prev => ({ ...prev, [appId]: result.base64 }));
        }
      } catch (e) {
        // Fail silently for icons
      }
    }
    load();
    return () => { isMounted = false; };
  }, [appId, setCurrentIcons]);

  if (!icon) {
    return (
      <View style={[styles.appOptionIconPlaceholder, { backgroundColor: isDarkMode ? '#333' : '#EEE' }]}>
        <Ionicons name="apps" size={20} color={isDarkMode ? Colors.dark.textSecondary : Colors.textSecondary} />
      </View>
    );
  }

  return (
    <Image
      source={{ uri: `data:image/png;base64,${icon}` }}
      style={styles.appOptionIcon}
    />
  );
});

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
  const installedApps = useMemo(() =>
    SUPPORTED_APPS.filter((app) => appStatus[app.id]?.installed),
    [appStatus]
  );

  // Selection and Icons State
  const [selectedApps, setSelectedApps] = useState<Set<AppId>>(new Set());
  const [currentIcons, setCurrentIcons] = useState<Record<string, string>>({});
  const [isPickerVisible, setIsPickerVisible] = useState(false);
  const [proxyAppId, setProxyAppId] = useState<AppId | null>(null);
  const [appMappings, setAppMappings] = useState<Record<AppId, AppId>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [allInstalledApps, setAllInstalledApps] = useState<any[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const hasInitializedSelection = React.useRef(false);

  // Shortcut states
  const [shortcutStates, setShortcutStates] = useState<Record<string, ShortcutState>>({});
  const [capturingAppId, setCapturingAppId] = useState<AppId | null>(null);
  const confirmationTimers = React.useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const captureIcons = React.useRef<Partial<Record<AppId, () => Promise<string>>>>({});
  const registerCapture = React.useCallback((appId: AppId, capture: () => Promise<string>) => {
    captureIcons.current[appId] = capture;
  }, []);

  // Initial selection
  useEffect(() => {
    if (!hasInitializedSelection.current && installedApps.length > 0 && selectedApps.size === 0) {
      const shuffled = [...installedApps].sort(() => 0.5 - Math.random());
      setSelectedApps(new Set(shuffled.slice(0, 4).map(app => app.id)));
      hasInitializedSelection.current = true;
    }
  }, [installedApps]);

  // Fetch current icons
  useEffect(() => {
    const fetchIcons = async () => {
      const icons: Record<string, string> = {};
      for (const app of installedApps) {
        try {
          const result = await HomeShortcut.getCurrentAppIcon({ packageName: app.packageName });
          icons[app.packageName] = result.base64;
        } catch (e) {
          console.error(`Failed to fetch icon for ${app.id}`, e);
        }
      }
      setCurrentIcons(prev => ({ ...prev, ...icons }));
    };

    fetchIcons();
  }, [installedApps]);

  // Preload all installed apps for the picker to avoid lag when opening
  useEffect(() => {
    const preloadAllApps = async () => {
      try {
        const apps = await fetchAllInstalledApps();
        setAllInstalledApps(apps);
      } catch (e) {
        console.error('Failed to preload all apps for picker', e);
      }
    };
    preloadAllApps();
  }, []);

  console.log('installedApps', installedApps);

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
      console.log(`[Shortcut] Creating for appId: ${appId}, pkg: ${packageName}`);

      let targetPackageName = packageName;
      const mappedId = appMappings[appId as AppId];

      if (mappedId) {
        console.log(`[Shortcut] Found mapping: ${appId} -> ${mappedId}`);
        const mappedApp = SUPPORTED_APPS.find(a => a.id === mappedId);
        targetPackageName = mappedApp ? mappedApp.packageName : mappedId;
        console.log(`[Shortcut] Target package updated to: ${targetPackageName}`);
      } else {
        console.log(`[Shortcut] No mapping for ${appId}, using original package: ${targetPackageName}`);
      }

      setShortcutStates((prev) => ({ ...prev, [appId]: 'applying' }));
      const shortcutId = generateShortcutId(packageName, themeId);
      setCapturingAppId(appId as AppId);

      let attempts = 0;
      while (!captureIcons.current[appId as AppId] && attempts < 20) {
        await new Promise((resolve) => setTimeout(resolve, 50));
        attempts++;
      }

      const iconPngBase64 = await captureIcons.current[appId as AppId]?.();
      if (!iconPngBase64) throw new Error('Could not capture icon');

      const result = await createShortcut({
        appPackageName: targetPackageName,
        shortcutId,
        label: appName,
        iconColor: theme.icon.value,
        backgroundColor: theme.background.value,
        iconPngBase64,
        themeId,
      });

      if (result.success) {
        setShortcutStates((prev) => ({ ...prev, [appId]: 'waiting_confirmation' }));
        confirmationTimers.current[appId] = setTimeout(() => {
          setShortcutStates((prev) =>
            prev[appId] === 'waiting_confirmation' ? { ...prev, [appId]: 'retry' } : prev,
          );
          delete confirmationTimers.current[appId];
        }, 15000);
      } else {
        setShortcutStates((prev) => ({ ...prev, [appId]: 'failed' }));
      }
    } catch (err) {
      console.error(`[Shortcut] Error creating shortcut for ${appId}:`, err);
      setShortcutStates((prev) => ({ ...prev, [appId]: 'failed' }));
    } finally {
      setCapturingAppId(null);
    }
  };

  const handleSetIcons = async () => {
    const appsToApply = SUPPORTED_APPS.filter(app => selectedApps.has(app.id));
    if (appsToApply.length === 0) {
      Alert.alert('No apps selected', 'Please select at least one app to apply the theme.');
      return;
    }

    for (const app of appsToApply) {
      await handleCreateShortcut(app.id, app.name, app.packageName);
      await new Promise(r => setTimeout(r, 500));
    }
  };

  const showToast = useCallback((message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  }, []);

  const toggleSelection = useCallback((appId: AppId) => {
    const isInstalled = appStatus[appId]?.installed;
    const mappedId = appMappings[appId];
    const isMappedSelected = mappedId ? selectedApps.has(mappedId) : false;

    if (!isInstalled && (!mappedId || !isMappedSelected)) {
      showToast('You need to select the default app to check');
      return;
    }

    setSelectedApps(prev => {
      const next = new Set(prev);
      if (next.has(appId)) {
        next.delete(appId);
      } else {
        next.add(appId);
        // If this is a proxy app mapped to an installed app, also select the installed app
        const mappedId = appMappings[appId];
        if (mappedId) {
          next.add(mappedId);
        }
      }
      return next;
    });
  }, [appStatus, appMappings, selectedApps, showToast]);

  const sortedApps = useMemo(() => {
    return [...SUPPORTED_APPS].sort((a, b) => {
      const aInstalled = appStatus[a.id]?.installed;
      const bInstalled = appStatus[b.id]?.installed;

      if (aInstalled && !bInstalled) return -1;
      if (!aInstalled && bInstalled) return 1;
      return a.name.localeCompare(b.name);
    });
  }, [appStatus]);

  const filteredInstalledApps = useMemo(() => {
    const sourceList = isPickerVisible ? allInstalledApps : installedApps;
    return sourceList.filter(app => {
      const name = app?.appName || '';
      return name.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [installedApps, allInstalledApps, searchQuery, isPickerVisible]);

  const handleOpenPicker = (appId: any) => {
    setProxyAppId(appId);
    setIsPickerVisible(true);
    setSearchQuery('');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <View style={styles.hiddenCaptures} pointerEvents="none">
        <ShortcutIconCapture
          appId={capturingAppId}
          theme={theme}
          onCaptureReady={registerCapture}
        />
      </View>

      <View style={styles.fixedHeader}>
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
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.appsSection}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>Set Icons</Text>
            <Text style={[styles.selectionCount, { color: secondaryTextColor }]}>
              {selectedApps.size} selected
            </Text>
          </View>

          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={[styles.loadingText, { color: secondaryTextColor }]}>Checking apps...</Text>
            </View>
          )}

          {!loading && sortedApps.map((app) => {
            const isInstalled = appStatus[app.id]?.installed;
            const mappedId = appMappings[app.id];
            const isMappedSelected = mappedId ? selectedApps.has(mappedId) : false;
            const disabled = !isInstalled && (!mappedId || !isMappedSelected);

            return (
              <AppSelectionRow
                key={app.id}
                appId={app.id}
                appName={app.name}
                theme={theme}
                isSelected={selectedApps.has(app.id)}
                onToggle={() => toggleSelection(app.id)}
                currentIconBase64={currentIcons[mappedId || app.packageName]}
                onPlusPress={() => handleOpenPicker(app.id)}
                disabled={disabled}
                isDarkMode={isDarkMode}
                status={shortcutStates[app.id]}
              />
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton
          title="Set Icons"
          onPress={handleSetIcons}
          fullWidth
        />
      </View>

      {toastMessage && (
        <View style={styles.toast}>
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      )}

      <Modal visible={isPickerVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: isDarkMode ? '#1E1E1E' : 'white' }]}>
            <View style={styles.modalHeader}>
              <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color={secondaryTextColor} style={styles.searchIcon} />
                <TextInput
                  style={[styles.searchInput, { color: textColor }]}
                  placeholder="Choose the app to open on..."
                  placeholderTextColor={secondaryTextColor}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>
              <TouchableOpacity onPress={() => {
                setIsPickerVisible(false);
                setSearchQuery('');
              }}>
                <Ionicons name="close" size={24} color={textColor} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalListContainer}>
              {allInstalledApps.length === 0 ? (
                <View style={styles.loadingState}>
                  <ActivityIndicator size="large" color={Colors.primary} />
                  <Text style={[styles.loadingText, { color: secondaryTextColor }]}>
                    Fetching apps from device...
                  </Text>
                </View>
              ) : (
                <FlatList
                  data={filteredInstalledApps}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => {
                    // For installed apps from SUPPORTED_APPS, we use their packageName.
                    // For apps from fetchAllInstalledApps, id is already the packageName.
                    const pkgName = item.packageName || item.id;

                    return (
                      <TouchableOpacity
                        style={styles.appOption}
                        onPress={async () => {
                          if (proxyAppId) {
                            let iconBase64 = currentIcons[pkgName];

                            if (!iconBase64) {
                              try {
                                const result = await HomeShortcut.getCurrentAppIcon({ packageName: pkgName });
                                iconBase64 = result.base64;
                                setCurrentIcons(prev => ({ ...prev, [pkgName]: iconBase64 }));
                              } catch (e) {
                                console.error('Failed to fetch selected app icon', e);
                              }
                            }

                            // We map the proxy app (slug) to the selected app's ID
                            // If the selected app is a system app, we use its package name as the ID
                            const selectedAppId = item.id;
                            setAppMappings(prev => ({ ...prev, [proxyAppId]: selectedAppId }));
                            setSelectedApps(prev => {
                              const next = new Set(prev);
                              next.add(selectedAppId);
                              return next;
                            });
                          }
                          setIsPickerVisible(false);
                        }}
                      >
                        <View style={styles.appOptionContent}>
                          <PickerAppIcon
                            appId={pkgName}
                            currentIcons={currentIcons}
                            setCurrentIcons={setCurrentIcons}
                            isDarkMode={isDarkMode}
                          />
                          <Text style={[styles.appOptionText, { color: textColor }]}>{item.appName}</Text>
                          <Text style={[styles.appOptionDefault, { color: secondaryTextColor }]}> (Default)</Text>
                        </View>
                      </TouchableOpacity>
                    );
                  }}
                />
              )}
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  hiddenCaptures: { position: 'absolute', left: -600, top: 0 },
  scrollContent: { paddingHorizontal: Layout.screenPadding, paddingTop: Spacing.lg, paddingBottom: Spacing.xl },
  fixedHeader: { paddingHorizontal: Layout.screenPadding, paddingTop: Spacing.lg, marginBottom: Spacing.lg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.lg },
  backButton: { width: 28, height: 28, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: Typography.sizes.h2, fontWeight: Typography.weights.bold, textAlign: 'center' },
  description: { fontSize: Typography.sizes.body, fontWeight: Typography.weights.regular, marginBottom: Spacing.lg, lineHeight: Typography.sizes.body * Typography.lineHeights.normal },
  appsSection: { marginTop: Spacing.xl },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  sectionTitle: { fontSize: Typography.sizes.h3, fontWeight: Typography.weights.semibold },
  selectionCount: { fontSize: Typography.sizes.caption, fontWeight: Typography.weights.regular },
  loadingContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: Spacing.xl },
  loadingText: { fontSize: Typography.sizes.body, marginTop: Spacing.md },
  footer: { padding: Spacing.lg, paddingBottom: Spacing.xxl },
  toast: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    backgroundColor: '#333',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  toastText: {
    color: '#FFF',
    fontSize: Typography.sizes.body,
    textAlign: 'center',
  },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    height: '85%',
    paddingBottom: 40,
  },
  modalListContainer: { flex: 1 },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flex: 1,
    marginRight: 12,
  },
  searchIcon: { marginRight: 8 },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '400',
  },
  loadingState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: Typography.sizes.body,
    marginTop: 12,
    textAlign: 'center',
  },
  appOption: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  appOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  appOptionIcon: {
    width: 32,
    height: 32,
    borderRadius: 6,
    marginRight: 12,
  },
  appOptionIconPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  appOptionText: {
    fontSize: Typography.sizes.body,
    fontWeight: '500',
    flex: 1,
  },
  appOptionDefault: {
    fontSize: Typography.sizes.caption,
    opacity: 0.6,
  },
});
