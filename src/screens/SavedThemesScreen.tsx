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
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { ThemeDefinition } from '../types/data';
import { getSavedThemes, unsaveTheme } from '../services/local/themeStorage';
import { Colors, Spacing, Typography, Radius } from '../constants/design';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function SavedThemesScreen({ navigation }: { navigation: NativeStackNavigationProp<RootStackParamList> }) {
  const [savedThemes, setSavedThemes] = useState<ThemeDefinition[]>([]);
  const [loading, setLoading] = useState(true);

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
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (savedThemes.length === 0) {
    return (
      <View style={styles.center}>
        <Ionicons name="heart-outline" size={64} color="#888" />
        <Text style={styles.emptyText}>No saved themes yet</Text>
      </View>
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
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.themeItem}
            onPress={() => navigation.navigate('ThemeDetail', { theme: item })}
          >
            <View style={styles.themeInfo}>
              <Text style={styles.themeName}>{item.name}</Text>
              <Text style={styles.themeCategory}>{item.category}</Text>
            </View>
            <TouchableOpacity
              onPress={() => handleUnsave(item.id)}
              style={styles.unsaveButton}
            >
              <Ionicons name="trash-outline" size={20} color="#FF4B4B" />
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: Radius.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
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
  unsaveButton: {
    padding: 8,
    borderRadius: Radius.sm,
  },
});
