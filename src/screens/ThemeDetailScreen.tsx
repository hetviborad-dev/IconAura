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
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import { Colors, Spacing, Typography, Radius, Layout } from '../constants/design';
import { RootStackParamList } from '../types/navigation';
import { Theme } from '../types/index';
import type { AppId, ThemeDefinition } from '../types/data';
import { getAllApps } from '../data/apps';
import { getEnabledIcons } from '../services/local/iconStorage';
import ShortcutIconCapture from '../components/ShortcutIconCapture';
import { useAppDetection } from '../hooks/useAppDetection';
import { createShortcut, generateShortcutId, onShortcutPinned } from '../services/shortcutCreation';
import { fetchAllInstalledApps } from '../services/appDetection';
import AppSelectionRow from '../components/AppSelectionRow';
import PrimaryButton from '../components/PrimaryButton';
import { NativeModules } from 'react-native';

const { HomeShortcut } = NativeModules;

const ThemeDetailSkeleton = ({ isDarkMode }: { isDarkMode: boolean }) => {
  return (
    <View style={{ flex: 1, paddingHorizontal: Layout.screenPadding, paddingTop: Spacing.lg }}>
      <SkeletonPlaceholder
        borderRadius={4}
        highlightColor={isDarkMode ? '#2A2A2A' : '#E1E1E1'}
        lowlightColor={isDarkMode ? '#1E1E1E' : '#F0F0F0'}
      >
        <View>
          {/* Header */}
          <View style={[styles.header, { marginBottom: Spacing.lg }]}>
            <View style={{ width: 28, height: 28, borderRadius: 14 }} />
            <View style={{ width: 150, height: 24, borderRadius: 4 }} />
            <View style={{ width: 28, height: 28 }} />
          </View>

          {/* Preview Image */}
          <View style={[styles.themePreviewImage, { marginBottom: Spacing.md }]} />

          {/* Description */}
          <View style={{ width: '80%', height: 16, borderRadius: 4, marginBottom: 8 }} />
          <View style={{ width: '60%', height: 16, borderRadius: 4, marginBottom: Spacing.xl }} />

          {/* Apps Section */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.md }}>
            <View style={{ width: 100, height: 20, borderRadius: 4 }} />
            <View style={{ width: 80, height: 20, borderRadius: 4 }} />
          </View>

          {[...Array(15)].map((_, i) => (
            <View key={i} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm }}>
              <View style={{ width: 40, height: 40, borderRadius: 8, marginRight: Spacing.sm }} />
              <View style={{ flex: 1, height: 20, borderRadius: 4, marginRight: Spacing.sm }} />
              <View style={{ width: 20, height: 20, borderRadius: 10 }} />
            </View>
          ))}

        </View>
      </SkeletonPlaceholder>
    </View>
  );
};

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

const SUPPORTED_APPS = getAllApps();


interface ThemeDetailScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList, 'ThemeDetail'>;
  route: {
    params: {
      theme: ThemeDefinition;
    };
  };
}

export default function ThemeDetailScreen({
  navigation,
  route,
}: ThemeDetailScreenProps) {
  const isDarkMode = useColorScheme() === 'dark';
  const { theme } = route.params;
  const [enabledIcons, setEnabledIcons] = useState<Set<AppId>>(new Set());
  const { appStatus, loading, error, refresh } = useAppDetection();
  const installedApps = useMemo(() =>
    SUPPORTED_APPS.filter((app) => appStatus[app.id]?.installed),
    [appStatus]
  );

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;
      async function loadIcons() {
        try {
          const icons = await getEnabledIcons();
          if (isMounted) {
            setEnabledIcons(icons);
          }
        } catch (e) {
          console.error('Failed to load enabled icons:', e);
        }
      }
      loadIcons();
      return () => { isMounted = false; };
    }, [])
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

  const [capturingAppId, setCapturingAppId] = useState<AppId | null>(null);
  const confirmationTimers = React.useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const captureIcons = React.useRef<Partial<Record<AppId, () => Promise<string>>>>({});
  const registerCapture = useCallback((appId: AppId, capture: () => Promise<string>) => {
    captureIcons.current[appId] = capture;
  }, []);

  // Initial selection
  useEffect(() => {
    if (!hasInitializedSelection.current && enabledIcons.size > 0 && selectedApps.size === 0) {
      const enabledAndInstalled = installedApps.filter(app => enabledIcons.has(app.id));

      if (enabledAndInstalled.length > 0) {
        const shuffled = [...enabledAndInstalled].sort(() => 0.5 - Math.random());
        setSelectedApps(new Set(shuffled.slice(0, 4).map(app => app.id)));
        hasInitializedSelection.current = true;
      }
    }
  }, [installedApps, enabledIcons]);

  // Sync selected apps with enabled icons
  useEffect(() => {
    setSelectedApps(prev => {
      const next = new Set();
      prev.forEach(id => {
        if (enabledIcons.has(id)) {
          next.add(id);
        }
      });
      return next.size !== prev.size ? next : prev;
    });
  }, [enabledIcons]);

  // Fetch current icons
  useEffect(() => {
    const fetchIcons = async () => {
      const icons: Record<string, string> = {};
      for (const app of installedApps) {
        try {
          const pkgName = appStatus[app.id]?.packageName || app.packageName;
          const result = await HomeShortcut.getCurrentAppIcon({ packageName: pkgName });
          icons[pkgName] = result.base64;
        } catch (e) {
          console.error(`Failed to fetch icon for ${app.id}`, e);
        }
      }
      setCurrentIcons(prev => ({ ...prev, ...icons }));
    };

    fetchIcons();
  }, [installedApps, appStatus]);

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
      const app = SUPPORTED_APPS.find((a) => {
        const primaryId = generateShortcutId(a.packageName, theme.id);
        if (primaryId === event.shortcutId) return true;

        if (a.packageAlternatives) {
          return Object.values(a.packageAlternatives).some(pkg =>
            generateShortcutId(pkg, theme.id) === event.shortcutId
          );
        }
        return false;
      });

      if (app) {
        clearTimeout(confirmationTimers.current[app.id]);
        delete confirmationTimers.current[app.id];
      }
    });

    return () => {
      subscription.remove();
      Object.values(confirmationTimers.current).forEach(clearTimeout);
      confirmationTimers.current = {};
    };
  }, [theme.id]);

  const backgroundColor = isDarkMode ? '#121212' : Colors.background;
  const textColor = isDarkMode ? '#FFFFFF' : Colors.textPrimary;
  const secondaryTextColor = isDarkMode ? '#AAAAAA' : Colors.textSecondary;
  const cardBackground = isDarkMode ? '#1E1E1E' : Colors.backgroundSecondary;
  const borderColor = isDarkMode ? '#333333' : Colors.border;

  const handleCreateShortcut = async (appId: string, appName: string, packageName: string) => {
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

      const shortcutId = generateShortcutId(packageName, theme.id);
      setCapturingAppId(appId as AppId);

      let attempts = 0;
      while (!captureIcons.current[appId as AppId] && attempts < 20) {
        await new Promise((resolve) => setTimeout(resolve, 50));
        attempts++;
      }

      const captureFn = captureIcons.current[appId as AppId];
      if (!captureFn) throw new Error('Capture function not ready');

      // Small grace period for the native view to be mounted after capturingAppId change
      await new Promise((resolve) => setTimeout(resolve, 100));
      const iconPngBase64 = await captureFn();
      if (!iconPngBase64) throw new Error('Could not capture icon');

      const result = await createShortcut({
        appPackageName: targetPackageName,
        shortcutId,
        label: appName,
        iconColor: theme.icon.value,
        backgroundColor: theme.background.value,
        iconPngBase64,
        themeId: theme.id,
      });

      if (result.success) {
        confirmationTimers.current[appId] = setTimeout(() => {
          delete confirmationTimers.current[appId];
        }, 15000);
      } else {
        console.error(`[Shortcut] Failed to create shortcut for ${appId}`);
      }
    } catch (err) {
      console.error(`[Shortcut] Error creating shortcut for ${appId}:`, err);
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
      const pkgName = appStatus[app.id]?.packageName || app.packageName;
      await handleCreateShortcut(app.id, app.name, pkgName);
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
    return SUPPORTED_APPS
      .filter(app => enabledIcons.has(app.id))
      .sort((a, b) => {
        const aInstalled = appStatus[a.id]?.installed;
        const bInstalled = appStatus[b.id]?.installed;

        if (aInstalled && !bInstalled) return -1;
        if (!aInstalled && bInstalled) return 1;
        return a.name.localeCompare(b.name);
      });
  }, [appStatus, enabledIcons]);

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
    <SafeAreaView style={[styles.container, { backgroundColor: isDarkMode ? '#121212' : Colors.background }]}>
      <>
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
          {theme.previewUrl && (
            <Image
              source={{ uri: theme.previewUrl }}
              style={styles.themePreviewImage}
              resizeMode="cover"
            />
          )}
          <Text style={[styles.description, { color: secondaryTextColor }]}>
            {theme.description}
          </Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.appsSection}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: textColor }]}>Set Icons</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={[styles.selectionCount, { color: secondaryTextColor }]}>
                  {selectedApps.size} selected
                </Text>
                <TouchableOpacity
                  onPress={() => navigation.navigate('IconManagement')}
                  style={styles.manageIconsButton}
                >
                  <Ionicons name="settings-outline" size={16} color={Colors.primary} />
                  <Text style={styles.manageIconsText}>Manage</Text>
                </TouchableOpacity>
              </View>
            </View>

            {loading ? (
              <View style={{ marginTop: Spacing.md }}>
                <SkeletonPlaceholder
                  borderRadius={4}
                  highlightColor={isDarkMode ? '#2A2A2A' : '#E1E1E1'}
                  lowlightColor={isDarkMode ? '#1E1E1E' : '#F0F0F0'}
                >
                  {[...Array(6)].map((_, i) => (
                    <View key={i} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm }}>
                      <View style={{ width: 40, height: 40, borderRadius: 8, marginRight: Spacing.sm }} />
                      <View style={{ width: '70%', height: 20, borderRadius: 4, marginRight: Spacing.sm }} />
                      <View style={{ width: 20, height: 20, borderRadius: 10 }} />
                    </View>
                  ))}
                </SkeletonPlaceholder>
              </View>
            ) : (
              sortedApps.map((app) => {
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
                    currentIconBase64={currentIcons[mappedId || appStatus[app.id]?.packageName || app.packageName]}
                    onPlusPress={() => handleOpenPicker(app.id)}
                    disabled={disabled}
                    isDarkMode={isDarkMode}
                  />
                );
              })
            )}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <PrimaryButton
            title="Set Icons"
            onPress={handleSetIcons}
            fullWidth
          />
        </View>
      </>

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
  themePreviewImage: {
    width: '100%',
    height: 150,
    borderRadius: Radius.lg,
    marginBottom: Spacing.md,
    backgroundColor: '#333',
  },
  description: { fontSize: Typography.sizes.body, fontWeight: Typography.weights.regular, marginBottom: Spacing.lg, lineHeight: Typography.sizes.body * Typography.lineHeights.normal },
  appsSection: { marginTop: Spacing.xl },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  sectionTitle: { fontSize: Typography.sizes.h3, fontWeight: Typography.weights.semibold },
  selectionCount: { fontSize: Typography.sizes.caption, fontWeight: Typography.weights.regular },
  manageIconsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: Spacing.sm,
    paddingHorizontal: Spacing.xs,
    paddingVertical: 4,
    borderRadius: Radius.sm,
  },
  manageIconsText: {
    fontSize: Typography.sizes.caption,
    fontWeight: Typography.weights.medium,
    color: Colors.primary,
    marginLeft: 4,
  },
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
