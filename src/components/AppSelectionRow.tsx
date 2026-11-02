import React, { memo } from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Colors, Spacing } from '../constants/design';
import IconCanvas from './IconCanvas';
import Ionicons from 'react-native-vector-icons/Ionicons';

interface AppSelectionRowProps {
  appId: string;
  appName: string;
  theme: any;
  isSelected: boolean;
  onToggle: () => void;
  currentIconBase64?: string;
  onPlusPress: () => void;
  disabled?: boolean;
  isDarkMode: boolean;
}

const AppSelectionRow = memo(({
  appId,
  appName,
  theme,
  isSelected,
  onToggle,
  currentIconBase64,
  onPlusPress,
  disabled = false,
  isDarkMode,
}: AppSelectionRowProps) => {
  const borderColor = isDarkMode ? Colors.dark.border : Colors.border;

  return (
    <View style={[styles.container, disabled && styles.disabledContainer]}>
      <TouchableOpacity
        onPress={onToggle}
        style={[
          styles.checkbox,
          disabled && !isSelected && styles.disabledCheckbox
        ]}
      >
        <View style={[
          styles.checkboxOuter,
          {
            borderColor: isSelected ? Colors.primary : (!disabled ? '#CCCCCC' : borderColor),
            backgroundColor: isSelected ? Colors.primary + '15' : 'transparent'
          }
        ]}>
          {isSelected && (
            <View style={styles.checkboxInner}>
              <Ionicons name="checkmark" size={16} color={Colors.primary} />
            </View>
          )}
        </View>
      </TouchableOpacity>

      <View style={styles.themeIconContainer}>
        <IconCanvas appId={appId} theme={theme} size={48} />
      </View>

      <View style={styles.line} />

      <TouchableOpacity onPress={onPlusPress} style={styles.currentIconContainer}>
        {currentIconBase64 ? (
          <Image
            source={{ uri: `data:image/png;base64,${currentIconBase64}` }}
            style={styles.currentIcon}
          />
        ) : (
          <View style={[styles.plusContainer, { borderColor }]}>
            <Ionicons name="add" size={20} color={isDarkMode ? Colors.dark.textPrimary : Colors.textPrimary} />
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}, (prev, next) => {
  return (
    prev.isSelected === next.isSelected &&
    prev.currentIconBase64 === next.currentIconBase64 &&
    prev.disabled === next.disabled &&
    prev.isDarkMode === next.isDarkMode
  );
});

export default AppSelectionRow;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(150, 150, 150, 0.1)',
  },
  disabledContainer: {
    opacity: 0.6,
  },
  checkbox: {
    marginRight: Spacing.md,
  },
  disabledCheckbox: {
    opacity: 0.5,
  },
  checkboxOuter: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxInner: {
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  themeIconContainer: {
    marginRight: Spacing.lg,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(150, 150, 150, 0.3)',
    marginHorizontal: Spacing.md,
  },
  currentIconContainer: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  currentIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
  },
  plusContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderStyle: 'dashed',
  },
});
