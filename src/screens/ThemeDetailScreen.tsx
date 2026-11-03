

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
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
import { NativeStackScreenProps } from '@react-navigation/native-stack';
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
import { useSubscription } from '../context/SubscriptionContext';
import type { AppId } from '../types/data';
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
import PickerAppIcon from '../components/PickerAppIcon';
import PrimaryButton from '../components/PrimaryButton';
import ShapeNameSelectionModal from '../components/ShapeNameSelectionModal';
import WallpaperSelectionModal from '../components/WallpaperSelectionModal';
import { NativeModules } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FontText from '../components/FontText';

const { HomeShortcut } = NativeModules;

const SUPPORTED_APPS = getAllApps();

type ThemeDetailScreenProps = NativeStackScreenProps<RootStackParamList, 'ThemeDetail'>;

export default function ThemeDetailScreen({
  navigation,
  route,
}: ThemeDetailScreenProps) {
  const isDarkMode = useColorScheme() === 'dark';
  const { theme } = route.params;
  const { isPremium } = useSubscription();
  const [enabledIcons, setEnabledIcons] = useState<Set<AppId>>(new Set());
  const { appStatus, loading } = useAppDetection();
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
  const [selectedShape, setSelectedShape] = useState<'round' | 'square' | undefined>(undefined);
  const [isNamePickerVisible, setIsNamePickerVisible] = useState(false);
  const [isApplyingIcons, setIsApplyingIcons] = useState(false);
  const hasInitializedSelection = React.useRef(false);

  const [capturingAppId, setCapturingAppId] = useState<AppId | undefined>(undefined);
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
  }, [installedApps, enabledIcons, selectedApps.size]);

  
  useEffect(() => {
    setSelectedApps(prev => {
      const next = new Set<string>();
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
      const installedPackageNames = new Set(
        installedApps.map((app: any) => appStatus[app.id]?.packageName || app.packageName),
      );

      let cachedIcons: Record<string, string> = {};
      try {
        const stored = await AsyncStorage.getItem('currentAppIcons');
        if (stored) cachedIcons = JSON.parse(stored);
      } catch {}
      // Prune cached icons for apps that are no longer installed.
      Object.keys(cachedIcons).forEach((pkg) => {
        if (!installedPackageNames.has(pkg)) delete cachedIcons[pkg];
      });
      if (Object.keys(cachedIcons).length) {
        setCurrentIcons(prev => ({ ...cachedIcons, ...prev }));
      }

      const icons: Record<string, string> = { ...cachedIcons };
      let changed = Object.keys(cachedIcons).length !== Object.keys(icons).length;
      for (const app of installedApps) {
        try {
          const pkgName = appStatus[app.id]?.packageName || app.packageName;
          if (!icons[pkgName]) {
            const result = await HomeShortcut.getCurrentAppIcon({
              packageName: pkgName,
            });
            icons[pkgName] = result.base64;
            changed = true;
            setCurrentIcons(prev => ({ ...prev, [pkgName]: result.base64 }));
          }
        } catch (e) {
          console.error(`Failed to fetch icon for ${app.id}`, e);
        }
      }
      if (changed) {
        try {
          await AsyncStorage.setItem('currentAppIcons', JSON.stringify(icons));
        } catch {}
      }
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


  
  useEffect(() => {
    const subscription = onShortcutPinned(event => {
      const app = SUPPORTED_APPS.find(a => {
        const primaryId = generateShortcutId(a.packageName, theme.id);
        if (
          event.shortcutId === primaryId ||
          event.shortcutId === `${primaryId}_named` ||
          event.shortcutId === `${primaryId}_unnamed` ||
          event.shortcutId.startsWith(`${primaryId}_named_`) ||
          event.shortcutId.startsWith(`${primaryId}_unnamed_`)
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
                event.shortcutId === `${altBase}_unnamed` ||
                event.shortcutId.startsWith(`${altBase}_named_`) ||
                event.shortcutId.startsWith(`${altBase}_unnamed_`)
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

  const textColor = Colors.textPrimary;
  const secondaryTextColor = Colors.textSecondary;

  const handleCreateShortcut = async (
    appId: string,
    appName: string,
    packageName: string,
    color: string = 'white',
  ) => {
    try {

      let targetPackageName = packageName;
      const mappedId = appMappings[appId as AppId];

      if (mappedId) {
        const mappedApp = SUPPORTED_APPS.find(a => a.id === mappedId);
        targetPackageName = mappedApp ? mappedApp.packageName : mappedId;
      } else {
      }

      const hasName = !!appName?.trim();
      const colorSuffix = color && color.trim() ? color.trim().toLowerCase() : 'none';
      const shortcutId = `${generateShortcutId(packageName, theme.id)}_${hasName ? 'named' : 'unnamed'}_${colorSuffix}`;
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
        labelColor: color,
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
      setCapturingAppId(undefined);
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

  const finalApplyTheme = async (withName: boolean, color: string = 'white') => {
    if (!selectedShape) return;
    try {
      const appsToApply = SUPPORTED_APPS.filter(app => selectedApps.has(app.id));

      for (const app of appsToApply) {
        const pkgName = appStatus[app.id]?.packageName || app.packageName;
        const label = withName ? app.name : '';

        if (selectedShape === 'round') {
          await handleCreateShortcut(app.id, label, pkgName, color);
        } else {
          try {

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
              labelColor: withName
                ? (color === 'white' ? '#FFFFFF' : color === 'black' ? '#000000' : (color || getContrastColor(theme.background.value)))
                : '#FFFFFF',
            });

            if (!result.success) {
              console.error(`[Square] Failed to create widget for ${app.id}: ${result.message}`);
            }
          } catch (err) {
            console.error(`[Square] Error applying widget for ${app.id}:`, err);
          } finally {
            setCapturingAppId(undefined);
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
      setSelectedShape(undefined);
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
          
          const targetMappedId = appMappings[appId];
          if (targetMappedId) {
            next.add(targetMappedId);
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

  const handleOpenPicker = (appId: AppId) => {
    setProxyAppId(appId);
    setIsPickerVisible(true);
    setSearchQuery('');
  };

  const containerDynamic = { backgroundColor: isDarkMode ? '#121212' : Colors.background };
  const previewButtonDynamic = {
    backgroundColor: isDarkMode ? '#333' : Colors.backgroundSecondary,
    borderColor: isDarkMode ? '#444' : Colors.border,
  };

  return (
    <SafeAreaView
      style={[styles.container, containerDynamic]}
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
            <FontText color={textColor} size={Typography.sizes.h2} name="bold" style={styles.textAlignCenter}>
              {theme.name}
            </FontText>
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
                style={[styles.previewButtonSmall, previewButtonDynamic]}
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
            <View style={[styles.sectionHeader, styles.sectionHeaderInline]}>
              <FontText color={textColor} size={Typography.sizes.h3} name="semibold">
                Matching Wallpapers
              </FontText>
              {theme.isPremium && !isPremium && (
                <View style={styles.wallpaperSectionBadge}>
                  <Ionicons name="lock-closed" size={12} color="white" />
                  <FontText color="#FFFFFF" size={10} name="bold" style={styles.uppercaseText}>Premium</FontText>
                </View>
              )}
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.wallpapersList}
            >
              {theme.wallpapers.map((asset, index) => {
                const url = typeof asset === 'string' ? asset : asset.url;
                return (
                <TouchableOpacity
                  key={index}
                  style={styles.wallpaperThumbnail}
                  activeOpacity={1}
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
                      <FontText color="#FFFFFF" size={8} name="bold" style={styles.uppercaseText}>Premium</FontText>
                    </View>
                  )}
                </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}
        <View style={styles.sectionHeader}>
          <FontText color={textColor} size={Typography.sizes.h3} name="semibold">
            Set Icons
          </FontText>
          <View style={styles.rowCenter}>
            <FontText
              style={[styles.selectionCount, { color: secondaryTextColor }]}
            >
              {selectedApps.size} selected
            </FontText>
            <TouchableOpacity
              onPress={() => navigation.navigate('IconManagement')}
              style={styles.manageIconsButton}
            >
              <Ionicons
                name="add-circle-outline"
                size={16}
                color={Colors.primary}
              />
              <FontText color={Colors.primary} size={Typography.sizes.caption} name="medium" style={styles.ml4}>Manage Icons</FontText>
            </TouchableOpacity>
          </View>
        </View>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.appsSection}>
            {loading ? (
              <View style={styles.mtMd}>
                <SkeletonPlaceholder
                  borderRadius={4}
                  highlightColor={isDarkMode ? '#2A2A2A' : '#E1E1E1'}
                  backgroundColor={isDarkMode ? '#1E1E1E' : '#F0F0F0'}
                >
                  {[...Array(6)].map((_, i) => (
                    <View
                      key={i}
                      style={styles.skeletonRow}
                    >
                      <View
                        style={styles.skeletonIcon}
                      />
                      <View
                        style={styles.skeletonBar}
                      />
                      <View style={styles.skeletonDot} />
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
          <FontText color="#FFF" size={Typography.sizes.body} style={styles.textAlignCenter}>{toastMessage}</FontText>
        </View>
      )}

      {selectedWallpaperUrl && (
        <WallpaperSelectionModal
          visible={!!selectedWallpaperUrl}
          wallpaperUrl={selectedWallpaperUrl}
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
          setSelectedShape(undefined);
        }}
        onSelect={(withName, color) => {
          setIsApplyingIcons(true);
          setIsNamePickerVisible(false);

          requestAnimationFrame(() => {
            finalApplyTheme(withName, color);
          });
        }}
      />

      <Modal visible={isShapePickerVisible} transparent animationType="fade">
        <View style={[styles.modalOverlay, styles.justifyCenter, styles.alignCenter]}>
          <View style={styles.modalContentShapePicker}>
            <FontText color={textColor} size={Typography.sizes.h3} name="bold" style={styles.textAlignCenter}>
              Which style do you want to set?
            </FontText>
            <FontText color={secondaryTextColor} size={Typography.sizes.bodySmall} name="regular" style={styles.textCenterMb24}>
              You can add both at once.
            </FontText>

            <View style={styles.shapeOptionsRow}>
              <TouchableOpacity
                style={styles.shapeOption}
                onPress={() => handleShapeSelection('round')}
              >
                <FontText color={textColor} size={Typography.sizes.body} name="semibold">Round</FontText>
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
                    <FontText color={secondaryTextColor} size={Typography.sizes.caption} name="regular" style={styles.lh14}>Watermarked (due to Google specs)</FontText>
                  </View>
                  <View style={styles.infoRow}>
                    <Ionicons name="checkmark-circle" size={14} color={Colors.success} />
                    <FontText color={secondaryTextColor} size={Typography.sizes.caption} name="regular" style={styles.lh14}>Can be added to the Dock & Folder</FontText>
                  </View>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.shapeOption}
                onPress={() => handleShapeSelection('square')}
              >
                <FontText color={textColor} size={Typography.sizes.body} name="semibold">Square</FontText>
                <View style={styles.shapePreviewContainer}>
                  <View style={styles.squareShapePreview}>
                    <WhatsAppIcon width={'65%'} height="65%" />
                  </View>
                </View>
                <View style={styles.infoContainer}>
                  <View style={styles.infoRow}>
                    <Ionicons name="checkmark-circle" size={14} color={Colors.success} />
                    <FontText color={secondaryTextColor} size={Typography.sizes.caption} name="regular" style={styles.lh14}>No Watermark</FontText>
                  </View>
                  <View style={styles.infoRow}>
                    <Ionicons name="alert-circle" size={14} color="#FFC107" />
                    <FontText color={secondaryTextColor} size={Typography.sizes.caption} name="regular" style={styles.lh14}>Cannot be added to Dock & Folder</FontText>
                  </View>
                </View>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.closeShapePicker}
              onPress={() => setIsShapePickerVisible(false)}
            >
              <FontText color={secondaryTextColor} size={Typography.sizes.caption} style={styles.mt10}>Cancel</FontText>
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
                  <FontText color={secondaryTextColor} size={Typography.sizes.body} style={styles.mtMd}>
                    Fetching apps from device...
                  </FontText>
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
                          <FontText color={textColor} size={Typography.sizes.body} name="medium" style={styles.flex1}>
                            {item.appName}
                          </FontText>
                          <FontText color={secondaryTextColor} size={Typography.sizes.caption} style={styles.opacity6}>
                            {' '}
                            (Default)
                          </FontText>
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
  previewButtonSmall: {
    width: 36,
    height: 36,
    borderRadius: Radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  appsSection: { marginTop: Spacing.xl },
  sectionHeader: {
    paddingHorizontal: Layout.screenPadding,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderRadius: 24,
    padding: 24,
    width: '100%',
    height: '82%',
    alignSelf: 'center',
    justifyContent: 'flex-start',
    paddingBottom: 40,
  },
  modalListContainer: { flex: 1 },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
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
    minHeight: 28,
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
  closeShapePicker: {
    marginTop: 10,
    padding: 10,
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

  textAlignCenter: { textAlign: 'center' },
  uppercaseText: { textTransform: 'uppercase' },
  rowCenter: { flexDirection: 'row', alignItems: 'center' },
  ml4: { marginLeft: 4 },
  mtMd: { marginTop: Spacing.md },
  skeletonRow: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm },
  skeletonIcon: { width: 40, height: 40, borderRadius: 8, marginRight: Spacing.sm },
  skeletonBar: { width: '70%', height: 20, borderRadius: 4, marginRight: Spacing.sm },
  skeletonDot: { width: 20, height: 20, borderRadius: 10 },
  textCenterMb24: { textAlign: 'center', marginBottom: 24 },
  lh14: { lineHeight: 14 },
  mt10: { marginTop: 10 },
  flex1: { flex: 1 },
  opacity6: { opacity: 0.6 },

  justifyCenter: { justifyContent: 'center' },
  alignCenter: { alignItems: 'center' },
  modalContentShapePicker: {
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    height: 'auto',
    maxHeight: '75%',
    width: '92%',
    padding: 24,
    borderRadius: 24,
  },
  sectionHeaderInline: { paddingHorizontal: 0, flexDirection: 'row', alignItems: 'center', gap: 8 },
});