import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useWindowDimensions } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { ThemeDefinition } from '../types/data';
import { getSavedThemes, unsaveTheme } from '../services/local/themeStorage';
import { ThemeCard } from '../components';
import { Colors, Spacing, Typography, Radius } from '../constants/design';
import Ionicons from 'react-native-vector-icons/Ionicons';
import IconCanvas from '../components/IconCanvas';

export default function SavedThemesScreen({ navigation }: { navigation: NativeStackNavigationProp<RootStackParamList> }) {
  const [savedThemes, setSavedThemes] = useState<ThemeDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const { width: screenWidth } = useWindowDimensions();

  useEffect(() => {
    loadSavedThemes();
  }, []);

  async function loadSavedThemes() {
    setLoading(true);
    try {
      const themes = await getSavedThemes();
      setSavedThemes(themes);
    } catch (error) {
      console.error('Failed to load saved themes:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleUnsave = async (themeId: string) => {
    const success = await unsaveTheme(themeId);
    if (success) {
      setSavedThemes(prev => prev.filter(t => t.id !== themeId));
    } else {
      Alert.alert('Error', 'Failed to unsave theme');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>Saved Themes</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (savedThemes.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>Saved Themes</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.center}>
          <Ionicons name="heart-outline" size={64} color="#888" />
          <Text style={styles.emptyText}>No saved themes yet</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Saved Themes</Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        data={savedThemes}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        numColumns={3}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.themeItem, { width: (screenWidth - 48) / 3 }]}
            onPress={() => navigation.navigate('ThemeDetail', { theme: item })}
            activeOpacity={0.85}
          >
            <View
              style={[
                styles.preview,
                {
                  backgroundColor:
                    item.background.type === 'color' ? item.background.value : 'transparent',
                },
              ]}
            >
              {(item.featuredApps || []).slice(0, 4).map((appId) => (
                <View key={appId} style={styles.iconTile}>
                  <IconCanvas appId={appId} theme={item} size={55} />
                </View>
              ))}
            </View>
            <Text style={styles.themeName} numberOfLines={1}>
              {item.name}
            </Text>
            <TouchableOpacity
              onPress={() => handleUnsave(item.id)}
              style={styles.unsaveButton}
            >
              <Ionicons name="trash-outline" size={16} color="#FF4B4B" />
            </TouchableOpacity>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  emptyText: {
    marginTop: 12,
    fontSize: Typography.sizes.body,
    color: Colors.textSecondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: Typography.sizes.h2,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
  },
  listContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  themeItem: {
    margin: 4,
    padding: Spacing.xs,
    borderRadius: Radius.md,
    backgroundColor: Colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: Colors.border,
    position: 'relative',
  },
  preview: {
    width: '100%',
    aspectRatio: 1,
    padding: Spacing.xs,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignContent: 'space-between',
    overflow: 'hidden',
  },
  iconTile: {
    width: '48%',
    height: '48%',
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  themeName: {
    marginTop: Spacing.xs,
    fontSize: Typography.sizes.caption,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  unsaveButton: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 12,
    padding: 4,
    zIndex: 20,
  },
  themeInfo: {
    flexDirection: 'column',
  },
  themeName: {
    fontSize: Typography.sizes.body,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
  },
  themeCategory: {
    fontSize: Typography.sizes.caption,
    color: Colors.textSecondary,
  },
});
