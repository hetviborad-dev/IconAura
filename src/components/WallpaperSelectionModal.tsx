import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Image,
  Platform,
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
  isDarkMode,
  isPremiumTheme = false,
  isUserPremium = false,
}: WallpaperSelectionModalProps) {
  const insets = useSafeAreaInsets();
  const [isLoading, setIsLoading] = useState(false);
  const [selected, setSelected] = useState<'home' | 'lock' | 'both'>('both');
  const isLocked = isPremiumTheme && !isUserPremium;

  const handleApply = async (target: 'home' | 'lock' | 'both') => {
    setIsLoading(true);
    try {
      await onApply(target);
    } finally {
      setIsLoading(false);
    }
  };

  const font = Platform.select({ ios: 'DM Sans', android: 'sans-serif', default: 'System' });

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.root}>
        {wallpaperUrl ? (
          <Image
            source={{ uri: wallpaperUrl }}
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%' }}
            resizeMode="cover"
            onError={(e) => console.log('WallpaperSelectionModal image error:', e.nativeEvent, wallpaperUrl)}
          />
        ) : (
          <View style={[StyleSheet.absoluteFillObject, { backgroundColor: Colors.background }]} />
        )}

        <View style={[styles.topBar, { top: insets.top + 20 }]}>
          <View style={styles.premiumPill}>
            <Ionicons name="star" size={16} color={Colors.primary} />
            <Text style={[styles.premiumText, { fontFamily: font }]}>PREMIUM</Text>
          </View>
          <TouchableOpacity style={styles.closeButton} onPress={onClose} hitSlop={8}>
            <Ionicons name="close" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <View style={[styles.sheetWrap, { bottom: insets.bottom + 12 }]}>
          <View style={styles.sheet}>
            <View style={styles.handle} />

            <View style={styles.headerRow}>
              <Text style={[styles.title, { fontFamily: font }]}>Set wallpaper</Text>
              <Text style={[styles.subtitle, { fontFamily: font }]}>Choose where</Text>
            </View>

            <View style={styles.segmentContainer}>
              {(['home', 'lock', 'both'] as const).map((key) => {
                const isActive = selected === key;
                const icon =
                  key === 'home' ? 'home-outline' : key === 'lock' ? 'phone-portrait-outline' : 'layers-outline';
                const label = key === 'home' ? 'Home' : key === 'lock' ? 'Lock' : 'Both';
                return (
                  <TouchableOpacity
                    key={key}
                    style={[styles.segment, isActive && styles.segmentSelected]}
                    onPress={() => setSelected(key)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name={icon} size={22} color={isActive ? '#FFFFFF' : '#FFF5EE'} />
                    <Text
                      style={[
                        styles.segmentLabel,
                        { fontFamily: font, color: isActive ? '#FFFFFF' : '#FFF5EE', fontWeight: isActive ? '700' : '500' },
                      ]}
                    >
                      {label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => handleApply(isLocked ? 'both' : selected)}
              disabled={isLoading}
              activeOpacity={0.85}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons
                    name={isLocked ? 'star' : 'checkmark'}
                    size={20}
                    color="#FFFFFF"
                  />
                  <Text style={[styles.primaryText, { fontFamily: font }]}>
                    {isLocked ? 'Unlock with Premium' : 'Apply wallpaper'}
                  </Text>
                </>
              )}
            </TouchableOpacity>

            {showApplyTheme && (
              <TouchableOpacity style={styles.secondaryButton} onPress={onApplyTheme} activeOpacity={0.8}>
                <View style={styles.swatches}>
                  <View style={[styles.swatch, { backgroundColor: '#B58A5A' }]} />
                  <View style={[styles.swatch, { backgroundColor: '#F2B8AA' }]} />
                  <View style={[styles.swatch, { backgroundColor: '#2A1710' }]} />
                </View>
                <Text style={[styles.secondaryText, { fontFamily: font }]}>Apply matching theme</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  topBar: {
    position: 'absolute',
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 20,
  },
  premiumPill: {
    height: 36,
    borderRadius: 18,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(20,20,22,0.6)',
    borderWidth: 1,
    borderColor: 'rgba(255,0,122,0.45)',
  },
  premiumText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.96,
    color: Colors.textPrimary,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(20,20,22,0.6)',
  },
  sheetWrap: {
    position: 'absolute',
    left: 12,
    right: 12,
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor: 'rgba(28,28,30,0.9)',
  },
  sheet: {
    padding: 12,
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 16,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,245,238,0.35)',
    alignSelf: 'center',
    marginTop: 4,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF5EE',
  },
  subtitle: {
    fontSize: 13,
    color: '#E6CFC4',
  },
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,245,238,0.1)',
    borderRadius: 18,
    padding: 4,
    gap: 4,
  },
  segment: {
    flex: 1,
    height: 64,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  segmentSelected: {
    backgroundColor: Colors.primary,
  },
  segmentLabel: {
    fontSize: 13,
  },
  primaryButton: {
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  secondaryButton: {
    height: 52,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: 'rgba(255,245,238,0.35)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  swatches: {
    flexDirection: 'row',
    marginLeft: -4,
  },
  swatch: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginLeft: -4,
    borderWidth: 1.5,
    borderColor: '#262020',
  },
  secondaryText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#FFF5EE',
  },
});
