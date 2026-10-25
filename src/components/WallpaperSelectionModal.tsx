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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography, Radius } from '../constants/design';
import Ionicons from 'react-native-vector-icons/Ionicons';

interface WallpaperSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  wallpaperUrl: string;
  onApply: (target: 'home' | 'lock' | 'both') => Promise<void>;
  onApplyTheme?: () => void;
  showApplyTheme?: boolean;
  isDarkMode: boolean;
  isPremiumTheme?: boolean;
  isUserPremium?: boolean;
}

export default function WallpaperSelectionModal({
  visible,
  onClose,
  wallpaperUrl,
  onApply,
  onApplyTheme,
  showApplyTheme,
  isPremiumTheme = false,
  isUserPremium = false,
}: WallpaperSelectionModalProps) {
  const insets = useSafeAreaInsets();
  const [isLoading, setIsLoading] = useState(false);
  const isLocked = isPremiumTheme && !isUserPremium;

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
      <View style={styles.fullScreenContainer}>
        <Image source={{ uri: wallpaperUrl }} style={styles.fullScreenImage} resizeMode="cover" />

        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Ionicons name="close" size={28} color="white" />
        </TouchableOpacity>

        {isLocked && (
          <View style={styles.premiumBadge}>
            <Ionicons name="lock-closed" size={16} color="white" />
            <Text style={styles.premiumText}>Premium Wallpaper</Text>
          </View>
        )}

        <View style={[styles.bottomControls, { paddingBottom: insets.bottom + Spacing.xl }]}>
          <Text style={[styles.optionLabel, { color: 'white' }]}>Apply to:</Text>

          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={[styles.actionButton, isLocked && styles.lockedButton]}
              onPress={() => handleApply('home')}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <>
                  {isLocked && <Ionicons name="lock-closed" size={12} color={Colors.primary} style={styles.lockIcon} />}
                  <Ionicons name="home-outline" size={24} color="white" />
                  <Text style={[styles.actionText, { color: 'white' }]}>Home</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, isLocked && styles.lockedButton]}
              onPress={() => handleApply('lock')}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <>
                  {isLocked && <Ionicons name="lock-closed" size={12} color={Colors.primary} style={styles.lockIcon} />}
                  <Ionicons name="lock-closed-outline" size={24} color="white" />
                  <Text style={[styles.actionText, { color: 'white' }]}>Lock</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, isLocked && styles.lockedButton]}
              onPress={() => handleApply('both')}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <>
                  {isLocked && <Ionicons name="lock-closed" size={12} color={Colors.primary} style={styles.lockIcon} />}
                  <Ionicons name="layers-outline" size={24} color="white" />
                  <Text style={[styles.actionText, { color: 'white' }]}>Both</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {showApplyTheme && (
            <TouchableOpacity
              style={styles.themeButton}
              onPress={onApplyTheme}
            >
              <Ionicons name="color-palette-outline" size={20} color="white" />
              <Text style={styles.themeButtonText}>Apply Matching Theme</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
    backgroundColor: 'black',
  },
  fullScreenImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 20,
    padding: 8,
  },
  premiumBadge: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  premiumText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  lockIcon: {
    position: 'absolute',
    top: -5,
    right: -5,
    zIndex: 1,
  },
  bottomControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.lg,
    paddingBottom: Spacing.xxxl + 20, // Increased padding to account for safe area/navigation bar
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    alignItems: 'center',
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
    width: '100%',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: Spacing.xs,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.md,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    position: 'relative',
  },
  lockedButton: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderColor: 'rgba(255, 0, 122, 0.3)',
    opacity: 0.8,
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
    width: '100%',
  },
  themeButtonText: {
    color: 'white',
    fontSize: Typography.sizes.bodySmall,
    fontWeight: Typography.weights.bold,
  },
});
