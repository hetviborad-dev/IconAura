import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { Colors, Spacing, Typography, Radius } from '../constants/design';
import Ionicons from 'react-native-vector-icons/Ionicons';

interface WallpaperSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  wallpaperUrl: string;
  onApply: (target: 'home' | 'lock' | 'both') => Promise<void>;
  onApplyTheme: () => void;
  isDarkMode: boolean;
}

export default function WallpaperSelectionModal({
  visible,
  onClose,
  wallpaperUrl,
  onApply,
  onApplyTheme,
  isDarkMode,
}: WallpaperSelectionModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const backgroundColor = isDarkMode ? Colors.dark.surface : 'white';
  const textColor = isDarkMode ? Colors.dark.textPrimary : Colors.textPrimary;
  const secondaryTextColor = isDarkMode ? Colors.dark.textSecondary : Colors.textSecondary;

  const handleApply = async (target: 'home' | 'lock' | 'both') => {
    setIsLoading(true);
    try {
      await onApply(target);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: textColor }]}>Set Wallpaper</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={textColor} />
            </TouchableOpacity>
          </View>

          <View style={styles.previewContainer}>
            <Image source={{ uri: wallpaperUrl }} style={styles.previewImage} resizeMode="cover" />
          </View>

          <View style={styles.optionsContainer}>
            <Text style={[styles.optionLabel, { color: secondaryTextColor }]}>Apply to:</Text>

            <View style={styles.buttonGroup}>
              <TouchableOpacity
                style={[styles.actionButton, isLoading && { opacity: 0.5 }]}
                onPress={() => handleApply('home')}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color={textColor} />
                ) : (
                  <>
                    <Ionicons name="home-outline" size={20} color={textColor} />
                    <Text style={[styles.actionText, { color: textColor }]}>Home Screen</Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, isLoading && { opacity: 0.5 }]}
                onPress={() => handleApply('lock')}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color={textColor} />
                ) : (
                  <>
                    <Ionicons name="lock-closed-outline" size={20} color={textColor} />
                    <Text style={[styles.actionText, { color: textColor }]}>Lock Screen</Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, isLoading && { opacity: 0.5 }]}
                onPress={() => handleApply('both')}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color={textColor} />
                ) : (
                  <>
                    <Ionicons name="layers-outline" size={20} color={textColor} />
                    <Text style={[styles.actionText, { color: textColor }]}>Both</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.themeButton}
              onPress={onApplyTheme}
            >
              <Ionicons name="color-palette-outline" size={20} color={Colors.primary} />
              <Text style={styles.themeButtonText}>Apply Matching Theme</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  container: {
    width: '100%',
    maxWidth: 400,
    borderRadius: Radius.xl,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: Typography.sizes.h3,
    fontWeight: Typography.weights.bold,
  },
  previewContainer: {
    width: '100%',
    height: 300,
    backgroundColor: '#000',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  optionsContainer: {
    padding: Spacing.lg,
  },
  optionLabel: {
    fontSize: Typography.sizes.bodySmall,
    marginBottom: Spacing.md,
    textAlign: 'center',
    fontWeight: Typography.weights.medium,
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.xl,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: Spacing.xs,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.md,
    backgroundColor: 'rgba(150,150,150,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(150,150,150,0.2)',
  },
  actionText: {
    fontSize: Typography.sizes.caption,
    fontWeight: Typography.weights.medium,
    marginTop: 4,
  },
  themeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    backgroundColor: Colors.primary,
    gap: 8,
  },
  themeButtonText: {
    color: 'white',
    fontSize: Typography.sizes.bodySmall,
    fontWeight: Typography.weights.bold,
  },
});
