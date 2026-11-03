import React, { memo } from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Colors, Spacing, Typography } from '../constants/design';
import IconCanvas from './IconCanvas';
import FontText from './FontText';
import { getAllApps } from '../data/apps';
import Ionicons from 'react-native-vector-icons/Ionicons';

interface AppSelectionRowProps {
  appId: string;
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
  theme,
  isSelected,
  onToggle,
  currentIconBase64,
  onPlusPress,
  disabled = false,
  isDarkMode,
}: AppSelectionRowProps) => {
  const borderColor = isDarkMode ? Colors.dark.border : Colors.border;
  const checkboxOuterDynamic = {
    borderColor: isSelected ? Colors.primary : (!disabled ? '#B9B0C9' : borderColor),
    backgroundColor: isSelected ? Colors.primary : 'transparent',
  };
  const plusDynamic = { borderColor };
  const app = getAllApps().find((a: any) => a.id === appId);

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
          checkboxOuterDynamic
        ]}>
          {isSelected && (
            <View style={styles.checkboxInner}>
              <Ionicons name="checkmark" size={16} color={Colors.textPrimary} />
            </View>
          )}
        </View>
      </TouchableOpacity>

      <View style={styles.themeIconContainer}>
        <IconCanvas appId={appId} theme={theme} size={48} />
        <FontText color={isDarkMode ? Colors.dark.textPrimary : Colors.textPrimary} size={10} name="medium" style={styles.appNameText}>
          {app?.name || appId}
        </FontText>
      </View>

      <View style={styles.line} />

      <TouchableOpacity onPress={onPlusPress} style={styles.currentIconContainer}>
        {currentIconBase64 ? (
          <Image
            source={{ uri: `data:image/png;base64,${currentIconBase64}` }}
            style={styles.currentIcon}
          />
        ) : (
          <View style={[styles.plusContainer, plusDynamic]}>
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
    alignItems: 'center',
  },
  appNameText: {
    marginTop: 4,
    textAlign: 'center',
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
