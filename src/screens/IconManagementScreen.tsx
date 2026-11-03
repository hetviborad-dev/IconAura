import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Switch,
  TextInput,
  Image,
  ActivityIndicator,
} from 'react-native';
import { NativeModules } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {
  Colors,
  Spacing,
  Typography,
  Radius,
  Layout,
} from '../constants/design';
import { RootStackParamList } from '../types/navigation';
import { getAllApps } from '../data/apps';
import {
  getEnabledIcons,
  toggleIconEnabled,
} from '../services/local/iconStorage';
import type { AppId } from '../types/data';
import { useAppDetection } from '../context/AppDetectionContext';
import FontText from '../components/FontText';

const { HomeShortcut } = NativeModules;

const iconCache = new Map<string, string | null>();

const AppIcon = ({
  appId,
  appName,
  fallbackColor,
  installed = true,
}: {
  appId: string;
  appName?: string;
  fallbackColor?: string;
  installed?: boolean;
}) => {
  const [icon, setIcon] = useState<string | null>(
    iconCache.has(appId) ? iconCache.get(appId) ?? null : null,
  );

  useEffect(() => {
    if (!installed) {
      iconCache.set(appId, null);
      return;
    }
    if (iconCache.has(appId)) {
      setIcon(iconCache.get(appId) ?? null);
      return;
    }

    let cancelled = false;
    async function load() {
      try {
        const app = getAllApps().find(
          (candidate: any) => candidate.id === appId,
        );
        const packages = app
          ? [app.packageName, ...Object.values(app.packageAlternatives || {})]
          : [appId];

        for (const packageName of packages) {
          try {
            const result = await HomeShortcut.getCurrentAppIcon({
              packageName: String(packageName),
            });
            if (result?.base64) {
              if (!cancelled) {
                iconCache.set(appId, result.base64);
                setIcon(result.base64);
              }
              return;
            }
          } catch {}
        }
        if (!cancelled) {
          iconCache.set(appId, null);
          setIcon(null);
        }
      } catch {
        if (!cancelled) {
          iconCache.set(appId, null);
          setIcon(null);
        }
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [appId, installed]);

  if (!icon) {
    const letter = (appName || appId || '?').charAt(0).toUpperCase();
    return (
      <View
        style={[
          styles.appIcon,
          styles.fallbackCenter,
          { backgroundColor: fallbackColor || Colors.primary },
        ]}
      >
        <FontText color="#FFFFFF" size={12} name="bold">
          {letter}
        </FontText>
      </View>
    );
  }

  return (
    <Image
      source={{ uri: `data:image/png;base64,${icon}` }}
      style={styles.appIcon}
    />
  );
};

interface IconManagementScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList, 'IconManagement'>;
}

interface IconManagementScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList, 'IconManagement'>;
}

export default function IconManagementScreen({
  navigation,
}: IconManagementScreenProps) {
  const { appStatus } = useAppDetection();
  const [enabledIcons, setEnabledIcons] = useState<Set<AppId>>(new Set());
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const backgroundColor = Colors.background;
  const textColor = Colors.textPrimary;
  const secondaryTextColor = Colors.textSecondary;

  useEffect(() => {
    async function loadIcons() {
      try {
        const icons = await getEnabledIcons();
        setEnabledIcons(icons);
      } catch (e) {
        console.error('Failed to load icon settings', e);
      } finally {
        setLoading(false);
      }
    }
    loadIcons();
  }, []);

  const handleToggle = async (appId: AppId) => {
    const newValue = !enabledIcons.has(appId);
    setEnabledIcons(prev => {
      const next = new Set(prev);
      if (newValue) next.add(appId);
      else next.delete(appId);
      return next;
    });
    await toggleIconEnabled(appId, newValue);
  };

  const filteredApps = useMemo(() => {
    return getAllApps().filter(app =>
      app.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [searchQuery]);

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={28} color={textColor} />
          </TouchableOpacity>
          <FontText color={textColor} size={Typography.sizes.h2} name="bold">
            Manage Icons
          </FontText>
          <View style={styles.spacer28} />
        </View>

        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={20}
            color={secondaryTextColor}
            style={{ marginLeft: Spacing.sm }}
          />
          <View style={[styles.searchInput, styles.searchInputPlaceholder]} />
        </View>

        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={28} color={textColor} />
        </TouchableOpacity>
        <FontText color={textColor} size={Typography.sizes.h2} name="bold">
          Manage Icons
        </FontText>
        <View style={styles.spacer28} />
      </View>

      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={20}
          color={secondaryTextColor}
          style={styles.searchIcon}
        />
        <TextInput
          style={[styles.searchInput, { color: textColor }]}
          placeholder="Search apps..."
          placeholderTextColor={secondaryTextColor}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <FlatList
        data={filteredApps}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.content}
        initialNumToRender={15}
        maxToRenderPerBatch={20}
        windowSize={8}
        ListHeaderComponent={
          <FontText
            color={secondaryTextColor}
            size={Typography.sizes.body}
            style={styles.listHeader}
          >
            {`We have ${filteredApps.length} varieties of app icons. Select which icons should be visible in the theme editor.`}
          </FontText>
        }
        renderItem={({ item: app }) => {
          return (
            <View style={[styles.iconRow, { backgroundColor: Colors.surface }]}>
              <View style={styles.leftSection}>
                <AppIcon
                  appId={app.id}
                  appName={app.name}
                  fallbackColor={app.icon?.fallbackColor}
                  installed={appStatus[app.id]?.installed}
                />
                <FontText
                  color={textColor}
                  size={Typography.sizes.body}
                  name="medium"
                >
                  {app.name}
                </FontText>
              </View>
              <Switch
                value={enabledIcons.has(app.id)}
                onValueChange={() => handleToggle(app.id)}
                trackColor={{ false: '#767577', true: Colors.primary }}
              />
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Layout.screenPadding,
    paddingVertical: Spacing.md,
  },
  backButton: {
    position: 'absolute',
    left: Layout.screenPadding,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1A1612',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2C2620',
    overflow: 'hidden',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1522',
    marginHorizontal: Layout.screenPadding,
    marginVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: '#2C2438',
  },
  searchIcon: { marginRight: Spacing.sm },
  searchInput: {
    flex: 1,
    height: 40,
    paddingHorizontal: Spacing.sm,
    fontSize: Typography.sizes.bodySmall,
    fontFamily: 'System',
    color: Colors.textPrimary,
  },
  content: { padding: Layout.screenPadding },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderRadius: Radius.md,
    marginBottom: Spacing.sm,
  },
  leftSection: { flexDirection: 'row', alignItems: 'center' },
  appIcon: { width: 24, height: 24, borderRadius: 4, marginRight: Spacing.sm },
  fallbackCenter: { alignItems: 'center', justifyContent: 'center' },
  mrSm: { marginRight: Spacing.sm },
  skeletonText: { width: 120, height: 20, borderRadius: 4 },
  skeletonBadge: { width: 40, height: 20, borderRadius: 10 },
  spacer28: { width: 28 },
  searchInputPlaceholder: { backgroundColor: Colors.surface, borderRadius: 4 },
  loadingTitle: {
    height: 20,
    width: '60%',
    backgroundColor: Colors.surface,
    marginBottom: Spacing.xl,
    borderRadius: 4,
  },
  listHeader: { marginBottom: Spacing.xl, lineHeight: 20 },
});
