

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
import WhatsAppIcon from '../assets/icons/simple-icons--whatsapp.svg';
import LogoIcon from '../assets/appsIcons/logo.svg';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import {
  Colors,
  Spacing,
  Typography,
  Radius,
  Layout,
} from '../constants/design';
import { RootStackParamList } from '../types/navigation';
import { Theme } from '../types/index';
import { useSubscription } from '../context/SubscriptionContext';
import type { AppId, ThemeDefinition } from '../types/data';
import { getAllApps } from '../data/apps';
import { getEnabledIcons } from '../services/local/iconStorage';
import { setWallpaper } from '../services/wallpaperService';
import { saveTheme, unsaveTheme, isThemeSaved } from '../services/local/themeStorage';
import ShortcutIconCapture from '../components/ShortcutIconCapture';
import { useAppDetection } from '../hooks/useAppDetection';
import {
  createShortcut,
  createSquareWidget,
  generateShortcutId,
  onShortcutPinned,
} from '../services/shortcutCreation';
import { fetchAllInstalledApps } from '../services/appDetection';
import { getContrastColor } from '../utils/helpers';
import AppSelectionRow from '../components/AppSelectionRow';
import PrimaryButton from '../components/PrimaryButton';
import ShapeNameSelectionModal from '../components/ShapeNameSelectionModal';
import WallpaperSelectionModal from '../components/WallpaperSelectionModal';
import { NativeModules } from 'react-native';

const { HomeShortcut } = NativeModules;

const PickerAppIcon = memo(
  ({
    appId,
    currentIcons,
    setCurrentIcons,
    isDarkMode,
  }: {
    appId: string;
    currentIcons: Record<string, string>;
    setCurrentIcons: React.Dispatch<
      React.SetStateAction<Record<string, string>>
    >;
    isDarkMode: boolean;
  }) => {
    const [icon, setIcon] = useState(currentIcons[appId]);

    useEffect(() => {
      if (icon) return;
      let isMounted = true;
      async function load() {
        try {
          const result = await HomeShortcut.getCurrentAppIcon({
            packageName: appId,
          });
          if (isMounted) {
            setIcon(result.base64);
            setCurrentIcons(prev => ({ ...prev, [appId]: result.base64 }));
          }
        } catch (e) {
          
        }
      }
      load();
      return () => {
        isMounted = false;
      };
    }, [appId, setCurrentIcons]);

    if (!icon) {
      return (
        <View
          style={[
            styles.appOptionIconPlaceholder,
            { backgroundColor: isDarkMode ? '#333' : '#EEE' },
          ]}
        >
          <Ionicons
            name="apps"
            size={20}
            color={
              isDarkMode ? Colors.dark.textSecondary : Colors.textSecondary
            }
          />
        </View>
      );
    }

    return (
      <Image
        source={{ uri: `data:image/png;base64,${icon}` }}
        style={styles.appOptionIcon}
      />
    );
  },
);

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
  console.log(`DEBUG: ThemeDetailScreen [${theme.name}] isPremium:`, theme.isPremium);
  const { isPremium } = useSubscription();
  console.log('ThemeDetailScreen - theme:', theme);
  const [enabledIcons, setEnabledIcons] = useState<Set<AppId>>(new Set());
  const { appStatus, loading, error, refresh } = useAppDetection();
  const [isSaved, setIsSaved] = useState(false);
  const installedApps = useMemo(
    () => SUPPORTED_APPS.filter(app => appStatus[app.id]?.installed),
    [appStatus],
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

      
      isThemeSaved(theme.id).then(saved => {
        if (isMounted) setIsSaved(saved);
      });

      return () => {
        isMounted = false;
      };
    }, [theme.id]),
  );

  
  const [selectedApps, setSelectedApps] = useState<Set<AppId>>(new Set());
  const [currentIcons, setCurrentIcons] = useState<Record<string, string>>({});
  const [isPickerVisible, setIsPickerVisible] = useState(false);
  const [proxyAppId, setProxyAppId] = useState<AppId | null>(null);
  const [appMappings, setAppMappings] = useState<Record<AppId, AppId>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [allInstalledApps, setAllInstalledApps] = useState<any[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isShapePickerVisible, setIsShapePickerVisible] = useState(false);
  const [selectedShape, setSelectedShape] = useState<'round' | 'square' | null>(null);
  const [isNamePickerVisible, setIsNamePickerVisible] = useState(false);
  const [isApplyingIcons, setIsApplyingIcons] = useState(false);
  const hasInitializedSelection = React.useRef(false);

  const [capturingAppId, setCapturingAppId] = useState<AppId | null>(null);
  const [selectedWallpaperUrl, setSelectedWallpaperUrl] = useState<
    string | null
  >(null);
  const confirmationTimers = React.useRef<
    Record<string, ReturnType<typeof setTimeout>>
  >({});
  const captureIcons = React.useRef<
    Partial<Record<AppId, () => Promise<string>>>
  >({});
  const registerCapture = useCallback(
    (appId: AppId, capture: () => Promise<string>) => {
      captureIcons.current[appId] = capture;
    },
    [],
  );

  
  useEffect(() => {
    if (
      !hasInitializedSelection.current &&
      enabledIcons.size > 0 &&
      selectedApps.size === 0
    ) {
      const enabledAndInstalled = installedApps.filter(app =>
        enabledIcons.has(app.id),
      );

      if (enabledAndInstalled.length > 0) {
        const shuffled = [...enabledAndInstalled].sort(
          () => 0.5 - Math.random(),
        );
        setSelectedApps(new Set(shuffled.slice(0, 1).map(app => app.id)));
        hasInitializedSelection.current = true;
      }
    }
  }, [installedApps, enabledIcons]);

  
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

  
  useEffect(() => {
    const fetchIcons = async () => {
      const icons: Record<string, string> = {};
      for (const app of installedApps) {
        try {
          const pkgName = appStatus[app.id]?.packageName || app.packageName;
          const result = await HomeShortcut.getCurrentAppIcon({
            packageName: pkgName,
          });
          icons[pkgName] = result.base64;
        } catch (e) {
          console.error(`Failed to fetch icon for ${app.id}`, e);
        }
      }
      setCurrentIcons(prev => ({ ...prev, ...icons }));
    };

    fetchIcons();
  }, [installedApps, appStatus]);

  
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

  
  useEffect(() => {
    const subscription = onShortcutPinned(event => {
      const app = SUPPORTED_APPS.find(a => {
        const primaryId = generateShortcutId(a.packageName, theme.id);
        if (
          event.shortcutId === primaryId ||
          event.shortcutId === `${primaryId}_named` ||
          event.shortcutId === `${primaryId}_unnamed`
        ) {
          return true;
        }

        if (a.packageAlternatives) {
          return Object.values(a.packageAlternatives).some(
            pkg => {
              const altBase = generateShortcutId(pkg, theme.id);
              return (
                event.shortcutId === altBase ||
                event.shortcutId === `${altBase}_named` ||
                event.shortcutId === `${altBase}_unnamed`
              );
            },
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

  const backgroundColor = Colors.background;
  const textColor = Colors.textPrimary;
  const secondaryTextColor = Colors.textSecondary;
  const cardBackground = Colors.surface;
  const borderColor = Colors.border;

  const handleCreateShortcut = async (
    appId: string,
    appName: string,
    packageName: string,
  ) => {
    try {
      console.log(
        `[Shortcut] Creating for appId: ${appId}, pkg: ${packageName}`,
      );

      let targetPackageName = packageName;
      const mappedId = appMappings[appId as AppId];

      if (mappedId) {
        console.log(`[Shortcut] Found mapping: ${appId} -> ${mappedId}`);
        const mappedApp = SUPPORTED_APPS.find(a => a.id === mappedId);
        targetPackageName = mappedApp ? mappedApp.packageName : mappedId;
        console.log(
          `[Shortcut] Target package updated to: ${targetPackageName}`,
        );
      } else {
        console.log(
          `[Shortcut] No mapping for ${appId}, using original package: ${targetPackageName}`,
        );
      }

      const hasName = !!appName?.trim();
      const shortcutId = `${generateShortcutId(packageName, theme.id)}_${hasName ? 'named' : 'unnamed'}`;
      setCapturingAppId(appId as AppId);

      let attempts = 0;
      while (!captureIcons.current[appId as AppId] && attempts < 20) {
        await new Promise(resolve => setTimeout(resolve, 50));
        attempts++;
      }

      const captureFn = captureIcons.current[appId as AppId];
      if (!captureFn) throw new Error('Capture function not ready');

      
      await new Promise(resolve => setTimeout(resolve, 100));
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
    if (theme.isPremium && !isPremium) {
      navigation.navigate('Premium');
      return;
    }
    const appsToApply = SUPPORTED_APPS.filter(app => selectedApps.has(app.id));
    if (appsToApply.length === 0) {
      Alert.alert(
        'No apps selected',
        'Please select at least one app to apply the theme.',
      );
      return;
    }
    setIsShapePickerVisible(true);
  };

  const handleShapeSelection = (shape: 'round' | 'square') => {
    setSelectedShape(shape);
    setIsShapePickerVisible(false);
    setIsNamePickerVisible(true);
  };

  const finalApplyTheme = async (withName: boolean) => {
    if (!selectedShape) return;

    setIsApplyingIcons(true);
    try {
      const appsToApply = SUPPORTED_APPS.filter(app => selectedApps.has(app.id));

      for (const app of appsToApply) {
        const pkgName = appStatus[app.id]?.packageName || app.packageName;
        const label = withName ? app.name : '';

        if (selectedShape === 'round') {
          await handleCreateShortcut(app.id, label, pkgName);
        } else {
          try {
            console.log(`[Square] Applying widget for: ${app.name}`);

            setCapturingAppId(app.id);
            let attempts = 0;
            while (!captureIcons.current[app.id] && attempts < 20) {
              await new Promise(resolve => setTimeout(resolve, 50));
              attempts++;
            }
            const captureFn = captureIcons.current[app.id];
            if (!captureFn) throw new Error('Capture function not ready');

            await new Promise(resolve => setTimeout(resolve, 100));
            const iconPngBase64 = await captureFn();
            if (!iconPngBase64) throw new Error('Could not capture icon');

            const shortcutId = generateShortcutId(pkgName, theme.id);

            const result = await createSquareWidget({
              appPackageName: pkgName,
              shortcutId,
              label,
              iconColor: theme.icon.value,
              backgroundColor: theme.background.value,
              iconPngBase64,
              themeId: theme.id,
              showLabel: withName,
              labelColor: getContrastColor(theme.background.value),
            });

            if (!result.success) {
              console.error(`[Square] Failed to create widget for ${app.id}: ${result.message}`);
            }
          } catch (err) {
            console.error(`[Square] Error applying widget for ${app.id}:`, err);
          } finally {
            setCapturingAppId(null);
          }
        }
      }
      showToast(`Theme applied as ${selectedShape} ${withName ? 'with' : 'without'} names!`);
    } catch (err) {
      console.error(`Error applying theme with shape ${selectedShape}:`, err);
      Alert.alert('Error', 'An unexpected error occurred while applying the theme.');
    } finally {
      setIsApplyingIcons(false);
      setIsNamePickerVisible(false);
      setSelectedShape(null);
    }
  };

  const handleToggleSave = async () => {
    if (isSaved) {
      const success = await unsaveTheme(theme.id);
      if (success) setIsSaved(false);
    } else {
      const result = await saveTheme(theme);
      if (result.success) setIsSaved(true);
    }
  };

  const showToast = useCallback((message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  }, []);

  const toggleSelection = useCallback(
    (appId: AppId) => {
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
          
          const mappedId = appMappings[appId];
          if (mappedId) {
            next.add(mappedId);
          }
        }
        return next;
      });
    },
    [appStatus, appMappings, selectedApps, showToast],
  );

  const sortedApps = useMemo(() => {
    return SUPPORTED_APPS.filter(app => enabledIcons.has(app.id)).sort(
      (a, b) => {
        const aInstalled = appStatus[a.id]?.installed;
        const bInstalled = appStatus[b.id]?.installed;

        if (aInstalled && !bInstalled) return -1;
        if (!aInstalled && bInstalled) return 1;
        return a.name.localeCompare(b.name);
      },
    );
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
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: isDarkMode ? '#121212' : Colors.background },
      ]}
    >
      <>
        <View style={styles.hiddenCaptures} pointerEvents="none">
          <ShortcutIconCapture
            appId={capturingAppId}
            theme={theme}
            shape={selectedShape}
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
            <View style={styles.headerActions}>
              <TouchableOpacity
                style={styles.headerAction}
                onPress={handleToggleSave}
              >
                <Ionicons
                  name={isSaved ? 'heart' : 'heart-outline'}
                  size={24}
                  color={isSaved ? '#FF4B4B' : textColor}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.previewButtonSmall,
                  {
                    backgroundColor: isDarkMode ? '#333' : Colors.backgroundSecondary,
                    borderColor: isDarkMode ? '#444' : Colors.border,
                  },
                ]}
                onPress={() => navigation.navigate('ThemeHomeScreenPreview', { theme })}
              >
                <Ionicons name="eye-outline" size={24} color={textColor} />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.previewRow}>
            {theme.previewUrl && (
              <Image
                source={{ uri: theme.previewUrl }}
                style={styles.themePreviewImage}
                resizeMode="cover"
              />
            )}
          </View>
        </View>

        {theme.wallpapers && theme.wallpapers.length > 0 && (
          <View style={styles.wallpapersSection}>
            <View style={[styles.sectionHeader, { paddingHorizontal: 0, flexDirection: 'row', alignItems: 'center', gap: 8 }]}>
              <Text style={[styles.sectionTitle, { color: textColor }]}>
                Matching Wallpapers
              </Text>
              {theme.isPremium && !isPremium && (
                <View style={styles.wallpaperSectionBadge}>
                  <Ionicons name="lock-closed" size={12} color="white" />
                  <Text style={styles.wallpaperSectionBadgeText}>Premium</Text>
                </View>
              )}
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.wallpapersList}
            >
              {theme.wallpapers.map((url, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.wallpaperThumbnail}
                  onPress={() => setSelectedWallpaperUrl(url)}
                >
                  <Image
                    source={{ uri: url }}
                    style={styles.wallpaperImageThumbnail}
                    resizeMode="cover"
                  />
                  {theme.isPremium && !isPremium && (
                    <View style={styles.wallpaperLockBadge}>
                      <Ionicons name="lock-closed" size={12} color="white" />
                      <Text style={styles.wallpaperLockText}>Premium</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>
            Set Icons
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text
              style={[styles.selectionCount, { color: secondaryTextColor }]}
            >
              {selectedApps.size} selected
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('IconManagement')}
              style={styles.manageIconsButton}
            >
              <Ionicons
                name="add-circle-outline"
                size={16}
                color={Colors.primary}
              />
              <Text style={styles.manageIconsText}>Manage Icons</Text>
            </TouchableOpacity>
          </View>
        </View>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.appsSection}>
            {loading ? (
              <View style={{ marginTop: Spacing.md }}>
                <SkeletonPlaceholder
                  borderRadius={4}
                  highlightColor={isDarkMode ? '#2A2A2A' : '#E1E1E1'}
                  lowlightColor={isDarkMode ? '#1E1E1E' : '#F0F0F0'}
                >
                  {[...Array(6)].map((_, i) => (
                    <View
                      key={i}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        marginBottom: Spacing.sm,
                      }}
                    >
                      <View
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 8,
                          marginRight: Spacing.sm,
                        }}
                      />
                      <View
                        style={{
                          width: '70%',
                          height: 20,
                          borderRadius: 4,
                          marginRight: Spacing.sm,
                        }}
                      />
                      <View style={{ width: 20, height: 20, borderRadius: 10 }} />
                    </View>
                  ))}
                </SkeletonPlaceholder>
              </View>
            ) : (
              sortedApps.map(app => {
                const isInstalled = appStatus[app.id]?.installed;
                const mappedId = appMappings[app.id];
                const isMappedSelected = mappedId
                  ? selectedApps.has(mappedId)
                  : false;
                const disabled =
                  !isInstalled && (!mappedId || !isMappedSelected);

                return (
                  <AppSelectionRow
                    key={app.id}
                    appId={app.id}
                    appName={app.name}
                    theme={theme}
                    isSelected={selectedApps.has(app.id)}
                    onToggle={() => toggleSelection(app.id)}
                    currentIconBase64={
                      currentIcons[
                        mappedId ||
                          appStatus[app.id]?.packageName ||
                          app.packageName
                      ]
                    }
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
            loading={isApplyingIcons}
            icon={theme.isPremium && !isPremium ? { name: 'lock-closed' } : undefined}
          />
        </View>
      </>

      {toastMessage && (
        <View style={styles.toast}>
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      )}

      {selectedWallpaperUrl && (
        <WallpaperSelectionModal
          visible={!!selectedWallpaperUrl}
          wallpaperUrl={selectedWallpaperUrl}
          isDarkMode={isDarkMode}
          isPremiumTheme={theme.isPremium}
          isUserPremium={isPremium}
          onClose={() => setSelectedWallpaperUrl(null)}
          onApply={async target => {
            if (theme.isPremium && !isPremium) {
              navigation.navigate('Premium');
              return;
            }
            const result = await setWallpaper(selectedWallpaperUrl!, target);
            if (result.success) {
              Alert.alert('Success', `Wallpaper applied to ${target} screen!`);
            } else {
              Alert.alert('Error', result.error || 'Failed to apply wallpaper');
            }
            setSelectedWallpaperUrl(null);
          }}
          showApplyTheme={false}
          onApplyTheme={() => {
            setSelectedWallpaperUrl(null);
            
            Alert.alert('Theme', 'This theme is already selected!');
          }}
        />
      )}

      <ShapeNameSelectionModal
        visible={isNamePickerVisible}
        isDarkMode={isDarkMode}
        onClose={() => {
          setIsNamePickerVisible(false);
          setSelectedShape(null);
        }}
        onSelect={finalApplyTheme}
      />

      <Modal visible={isShapePickerVisible} transparent animationType="fade">
        <View style={[styles.modalOverlay, { justifyContent: 'center' }]}>
          <View style={[styles.modalContent, { backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center' }]}>
            <Text style={[styles.modalHeaderTitle, { color: textColor, textAlign: 'center' }]}>
              Which style do you want to set?
            </Text>
            <Text style={[styles.modalSubtitle, { color: secondaryTextColor, textAlign: 'center', marginBottom: 24 }]}>
              You can add both at once.
            </Text>

            <View style={styles.shapeOptionsRow}>
              <TouchableOpacity
                style={styles.shapeOption}
                onPress={() => handleShapeSelection('round')}
              >
                <Text style={[styles.shapeOptionTitle, { color: textColor }]}>Round</Text>
                <View style={styles.shapePreviewContainer}>
                  <View style={styles.roundShapePreview}>
                    <WhatsAppIcon width={'65%'} height="65%" />
                  </View>
                  <View style={styles.previewBadge}>
                    <LogoIcon width="15" height="15" />
                  </View>
                </View>
                <View style={styles.infoContainer}>
                  <View style={styles.infoRow}>
                    <Ionicons name="alert-circle" size={14} color="#FFC107" />
                    <Text style={[styles.infoText, { color: secondaryTextColor }]}>Watermarked (due to Google specs)</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Ionicons name="checkmark-circle" size={14} color="#FFC107" />
                    <Text style={[styles.infoText, { color: secondaryTextColor }]}>Can be added to the Dock & Folder</Text>
                  </View>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.shapeOption}
                onPress={() => handleShapeSelection('square')}
              >
                <Text style={[styles.shapeOptionTitle, { color: textColor }]}>Square</Text>
                <View style={styles.shapePreviewContainer}>
                  <View style={styles.squareShapePreview}>
                    <WhatsAppIcon width={'65%'} height="65%" />
                  </View>
                </View>
                <View style={styles.infoContainer}>
                  <View style={styles.infoRow}>
                    <Ionicons name="checkmark-circle" size={14} color="#FFC107" />
                    <Text style={[styles.infoText, { color: secondaryTextColor }]}>No Watermark</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Ionicons name="alert-circle" size={14} color="#FFC107" />
                    <Text style={[styles.infoText, { color: secondaryTextColor }]}>Cannot be added to Dock & Folder</Text>
                  </View>
                </View>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.closeShapePicker}
              onPress={() => setIsShapePickerVisible(false)}
            >
              <Text style={[styles.closeShapeText, { color: secondaryTextColor }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={isPickerVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: Colors.surface },
            ]}
          >
            <View style={styles.modalHeader}>
              <View style={styles.searchContainer}>
                <Ionicons
                  name="search"
                  size={20}
                  color={secondaryTextColor}
                  style={styles.searchIcon}
                />
                <TextInput
                  style={[styles.searchInput, { color: textColor }]}
                  placeholder="Choose the app to open on..."
                  placeholderTextColor={secondaryTextColor}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>
              <TouchableOpacity
                onPress={() => {
                  setIsPickerVisible(false);
                  setSearchQuery('');
                }}
              >
                <Ionicons name="close" size={24} color={textColor} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalListContainer}>
              {allInstalledApps.length === 0 ? (
                <View style={styles.loadingState}>
                  <ActivityIndicator size="large" color={Colors.primary} />
                  <Text
                    style={[styles.loadingText, { color: secondaryTextColor }]}
                  >
                    Fetching apps from device...
                  </Text>
                </View>
              ) : (
                <FlatList
                  data={filteredInstalledApps}
                  keyExtractor={item => item.id}
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
                                const result =
                                  await HomeShortcut.getCurrentAppIcon({
                                    packageName: pkgName,
                                  });
                                iconBase64 = result.base64;
                                setCurrentIcons(prev => ({
                                  ...prev,
                                  [pkgName]: iconBase64,
                                }));
                              } catch (e) {
                                console.error(
                                  'Failed to fetch selected app icon',
                                  e,
                                );
                              }
                            }

                            const selectedAppId = item.id;
                            setAppMappings(prev => ({
                              ...prev,
                              [proxyAppId]: selectedAppId,
                            }));
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
                          <Text
                            style={[styles.appOptionText, { color: textColor }]}
                          >
                            {item.appName}
                          </Text>
                          <Text
                            style={[
                              styles.appOptionDefault,
                              { color: secondaryTextColor },
                            ]}
                          >
                            {' '}
                            (Default)
                          </Text>
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
  scrollContent: {
    paddingHorizontal: Layout.screenPadding,
    paddingBottom: Spacing.xl,
  },
  fixedHeader: { paddingTop: Spacing.lg },
  header: {
    paddingHorizontal: Layout.screenPadding,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerAction: {
    padding: 4,
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
  themePreviewImage: {
    flex: 1,
    height: 60,
    marginBottom: Spacing.md,
    backgroundColor: '#333',
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  previewButton: {
    width: 60,
    height: 60,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  previewButtonSmall: {
    width: 36,
    height: 36,
    borderRadius: Radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  description: {
    fontSize: Typography.sizes.body,
    fontWeight: Typography.weights.regular,
    marginBottom: Spacing.lg,
    lineHeight: Typography.sizes.body * Typography.lineHeights.normal,
  },
  appsSection: { marginTop: Spacing.xl },
  sectionHeader: {
    paddingHorizontal: Layout.screenPadding,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.sizes.h3,
    fontWeight: Typography.weights.semibold,
  },
  selectionCount: {
    fontSize: Typography.sizes.caption,
    fontWeight: Typography.weights.regular,
  },
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
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xl,
  },
  loadingText: { fontSize: Typography.sizes.body, marginTop: Spacing.md },
  footer: { padding: Spacing.lg, paddingBottom: Spacing.xxl },
  wallpapersSection: {
    marginBottom: Spacing.xl,
    paddingHorizontal: Layout.screenPadding,
  },
  wallpapersList: { paddingRight: Layout.screenPadding },
  wallpaperThumbnail: {
    width: 100,
    height: 160,
    borderRadius: Radius.md,
    marginRight: Spacing.md,
    overflow: 'hidden',
    backgroundColor: '#333',
    position: 'relative',
  },
  wallpaperImageThumbnail: {
    width: '100%',
    height: '100%',
  },
  wallpaperLockBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    gap: 2,
    borderWidth: 1,
    borderColor: Colors.primary,
    zIndex: 10,
  },
  wallpaperLockText: {
    color: 'white',
    fontSize: 8,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  wallpaperSectionBadge: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    gap: 2,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  wallpaperSectionBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  noWallpapersText: {
    fontSize: Typography.sizes.bodySmall,
    fontStyle: 'italic',
  },
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderRadius: 24,
    padding: 24,
    width: '90%',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 40,
  },
  modalListContainer: { flex: 1 },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  modalHeaderTitle: {
    fontSize: Typography.sizes.h3,
    fontWeight: Typography.weights.bold,
  },
  shapeOptionsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    marginBottom: 30,
  },
  shapeOption: {
    alignItems: 'center',
    gap: 12,
    width: 140,
  },
  shapeOptionTitle: {
    fontSize: Typography.sizes.body,
    fontWeight: Typography.weights.semibold,
  },
  shapePreviewContainer: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    position: 'relative',
  },
  previewBadge: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: Colors.background,
    borderRadius: 7,
    padding: 3,
  },
  infoContainer: {
    gap: 6,
    alignItems: 'flex-start',
    width: '100%',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoText: {
    fontSize: Typography.sizes.caption,
    fontWeight: Typography.weights.regular,
    lineHeight: 14,
  },
  roundShapePreview: {
    width: 60,
    height: 60,
    borderRadius: 25,
    backgroundColor: Colors.primary,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  squareShapePreview: {
    width: 60,
    height: 60,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSubtitle: {
    fontSize: Typography.sizes.bodySmall,
    fontWeight: Typography.weights.regular,
    marginBottom: 24,
  },
  closeShapePicker: {
    marginTop: 10,
    padding: 10,
  },
  closeShapeText: {
    fontSize: Typography.sizes.caption,
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
