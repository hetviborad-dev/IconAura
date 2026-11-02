import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Modal,
} from 'react-native';
import {
  Colors,
  Spacing,
  Typography,
  Radius,
} from '../constants/design';
import AsyncStorage from '@react-native-async-storage/async-storage';
import WhatsAppIcon from '../assets/icons/simple-icons--whatsapp.svg';
import FontText from './FontText';

interface ShapeNameSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (withName: boolean, color: string) => void;
  isDarkMode: boolean;
}

const ShapeNameSelectionModal: React.FC<ShapeNameSelectionModalProps> = ({
  visible,
  onClose,
  onSelect,
  isDarkMode,
}) => {
  const textColor = isDarkMode ? Colors.dark.textPrimary : Colors.textPrimary;
  const secondaryTextColor = isDarkMode ? Colors.dark.textSecondary : Colors.textSecondary;
  const [withName, setWithName] = useState(true);
  const [color, setColor] = useState('white');

  useEffect(() => {
    if (visible) {
      (async () => {
        try {
          const savedWithName = await AsyncStorage.getItem('iconLabelWithName');
          const savedColor = await AsyncStorage.getItem('iconLabelColor');
          setWithName(savedWithName === null ? true : savedWithName === 'true');
          setColor(savedColor || 'white');
        } catch {
          setWithName(true);
          setColor('white');
        }
      })();
    }
  }, [visible]);

  const persistPrefs = async (name: boolean, pickedColor: string) => {
    try {
      await AsyncStorage.setItem('iconLabelWithName', String(name));
      await AsyncStorage.setItem('iconLabelColor', name ? pickedColor : (pickedColor || 'white'));
    } catch {}
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: Colors.surface }]}>
          <FontText color={textColor} size={Typography.sizes.h3} name="bold" style={{ textAlign: 'center', marginBottom: Spacing.xs }}>
            Icon Label Preference
          </FontText>
          <FontText color={secondaryTextColor} size={Typography.sizes.bodySmall} name="regular" style={{ textAlign: 'center', marginBottom: Spacing.xl }}>
            Would you like to keep the app names under the icons?
          </FontText>

          <View style={styles.optionsContainer}>
            <TouchableOpacity
              style={[styles.optionButton, withName && styles.optionButtonSelected]}
              onPress={() => setWithName(true)}
            >
              <View style={styles.optionContent}>
                <View style={styles.previewContainer}>
                  <View style={styles.iconPreview}>
                    <WhatsAppIcon width={'60%'} height="60%" />
                  </View>
                  <FontText color={textColor} size={8} name="medium" style={{ textAlign: 'center' }}>WhatsApp</FontText>
                </View>
                <View style={styles.optionTextContainer}>
                  <FontText color={textColor} size={Typography.sizes.body} name="semibold">
                    With Name
                  </FontText>
                  <FontText color={secondaryTextColor} size={Typography.sizes.caption} style={{ marginTop: 2 }}>
                    Display the app name below the icon
                  </FontText>
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.optionButton, !withName && styles.optionButtonSelected]}
              onPress={() => setWithName(false)}
            >
              <View style={styles.optionContent}>
                <View style={styles.previewContainer}>
                  <View style={styles.iconPreview}>
                    <WhatsAppIcon width={'60%'} height="60%" />
                  </View>
                </View>
                <View style={styles.optionTextContainer}>
                  <FontText color={textColor} size={Typography.sizes.body} name="semibold">
                    Without Name
                  </FontText>
                  <FontText color={secondaryTextColor} size={Typography.sizes.caption} style={{ marginTop: 2 }}>
                    Hide the app name for a cleaner look
                  </FontText>
                </View>
              </View>
            </TouchableOpacity>
          </View>

          {withName && (
            <View style={styles.colorSection}>
              <FontText color={textColor} size={Typography.sizes.bodySmall} name="semibold" style={{ marginBottom: Spacing.sm }}>App Name Color</FontText>
              <View style={styles.colorOptions}>
                <TouchableOpacity
                  style={[styles.colorOption, color === 'white' && styles.colorOptionSelected]}
                  onPress={() => setColor('white')}
                >
                  <View style={[styles.colorSwatch, { backgroundColor: '#FFFFFF' }]} />
                  <FontText color={textColor} size={Typography.sizes.caption} name="medium">White</FontText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.colorOption, color === 'black' && styles.colorOptionSelected]}
                  onPress={() => setColor('black')}
                >
                  <View style={[styles.colorSwatch, { backgroundColor: '#000000' }]} />
                  <FontText color={textColor} size={Typography.sizes.caption} name="medium">Black</FontText>
                </TouchableOpacity>
              </View>
            </View>
          )}

          <TouchableOpacity
            style={styles.doneButton}
            onPress={() => {
              persistPrefs(withName, color);
              onSelect(withName, withName ? color : '');
            }}
          >
            <FontText color="#FFFFFF" size={Typography.sizes.body} name="bold">Done</FontText>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
          >
            <FontText color={secondaryTextColor} size={Typography.sizes.bodySmall} name="medium">
              Cancel
            </FontText>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  optionsContainer: {
    width: '100%',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  optionButton: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  previewContainer: {
    width: 50,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconPreview: {
    width: 40,
    height: 40,
    borderRadius: Radius.sm,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  optionTextContainer: {
    flex: 1,
  },
  closeButton: {
    marginTop: Spacing.sm,
    padding: Spacing.md,
  },
  optionButtonSelected: { borderColor: Colors.primary, backgroundColor: 'rgba(255,0,122,0.1)' },
  colorSection: { width: '100%', marginBottom: Spacing.lg, alignItems: 'center' },
  colorOptions: { flexDirection: 'row', gap: Spacing.md },
  colorOption: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, padding: Spacing.sm, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border },
  colorOptionSelected: { borderColor: Colors.primary, backgroundColor: 'rgba(255,0,122,0.1)' },
  colorSwatch: { width: 18, height: 18, borderRadius: 9, borderWidth: 1, borderColor: Colors.border },
  doneButton: { width: '100%', backgroundColor: Colors.primary, paddingVertical: Spacing.md, borderRadius: Radius.md, alignItems: 'center', marginBottom: Spacing.sm },
});

export default ShapeNameSelectionModal;