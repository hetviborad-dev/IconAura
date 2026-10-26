import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  ActivityIndicator,
  TextInput,
  Image,
} from 'react-native';
import { NativeModules } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import { Colors, Spacing, Typography, Radius, Layout } from '../constants/design';
import { RootStackParamList } from '../types/navigation';
import { getAllApps } from '../data/apps';
import { getEnabledIcons, toggleIconEnabled } from '../services/local/iconStorage';
import type { AppId } from '../types/data';
import { useAppDetection } from '../context/AppDetectionContext';

const { HomeShortcut } = NativeModules;

const AppIcon = ({ appId }: { appId: string }) => {
  const [icon, setIcon] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const result = await HomeShortcut.getCurrentAppIcon({ packageName: appId });
        setIcon(result.base64);
      } catch (e) {
        
      }
    }
    load();
  }, [appId]);

  if (!icon) {
    return (
      <View style={[styles.appIconPlaceholder, { backgroundColor: Colors.surface }]}>
        <Ionicons name="apps" size={16} color={Colors.textSecondary} />
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

const IconRowSkeleton = () => {
  return (
    <SkeletonPlaceholder
      borderRadius={Radius.md}
      highlightColor={Colors.surface}
      lowlightColor={Colors.background}
    >
      <View style={styles.iconRow}>
        <View style={styles.leftSection}>
          <View style={[styles.appIcon, { marginRight: Spacing.sm }]} />
          <View style={{ width: 120, height: 20, borderRadius: 4 }} />
        </View>
        <View style={{ width: 40, height: 20, borderRadius: 10 }} />
      </View>
    </SkeletonPlaceholder>
  );
};

interface IconManagementScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList, 'IconManagement'>;
}

interface IconManagementScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList, 'IconManagement'>;
}

export default function IconManagementScreen({ navigation }: IconManagementScreenProps) {
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
      if (newValue) next.add(appId); else next.delete(appId);
      return next;
    });
    await toggleIconEnabled(appId, newValue);
  };

  const filteredApps = useMemo(() => {
    return getAllApps().filter(app =>
      app.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={28} color={textColor} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: textColor }]}>Manage Icons</Text>
          <View style={{ width: 28 }} />
        </View>

        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={secondaryTextColor} style={styles.searchIcon} />
          <View style={[styles.searchInput, { backgroundColor: Colors.surface, borderRadius: 4 }]} />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <View style={{ height: 20, width: '60%', backgroundColor: Colors.surface, marginBottom: Spacing.xl, borderRadius: 4 }} />
          {[...Array(10)].map((_, i) => (
            <IconRowSkeleton key={i} />
          ))}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: textColor }]}>Manage Icons</Text>
        <View style={{ width: 28 }} />
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={secondaryTextColor} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { color: textColor }]}
          placeholder="Search apps..."
          placeholderTextColor={secondaryTextColor}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.subtitle, { color: secondaryTextColor }]}>
          Select which icons should be visible in the theme editor.
        </Text>

        {filteredApps.map((app) => {
          const detectedPkg = appStatus[app.id]?.packageName || app.packageName;
          return (
            <View key={app.id} style={[styles.iconRow, { backgroundColor: Colors.surface }]}>
              <View style={styles.leftSection}>
                <AppIcon appId={detectedPkg} />
                <Text style={[styles.appName, { color: textColor }]}>{app.name}</Text>
              </View>
              <Switch
                value={enabledIcons.has(app.id)}
                onValueChange={(val) => handleToggle(app.id)}
                trackColor={{ false: '#767577', true: Colors.primary }}
              />
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Layout.screenPadding,
    paddingVertical: Spacing.md,
  },
  backButton: { width: 28, height: 28, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: Typography.sizes.h2, fontWeight: Typography.weights.bold },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(150, 150, 150, 0.1)',
    marginHorizontal: Layout.screenPadding,
    marginVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: Radius.md,
  },
  searchIcon: { marginRight: Spacing.sm },
  searchInput: { flex: 1, fontSize: Typography.sizes.body },
  content: { padding: Layout.screenPadding },
  subtitle: { fontSize: Typography.sizes.body, marginBottom: Spacing.xl, lineHeight: 20 },
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
  appIconPlaceholder: { width: 24, height: 24, borderRadius: 4, justifyContent: 'center', alignItems: 'center', marginRight: Spacing.sm },
  appName: { fontSize: Typography.sizes.body, fontWeight: Typography.weights.medium },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
