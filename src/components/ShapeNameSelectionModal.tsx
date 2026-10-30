import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
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
import Ionicons from 'react-native-vector-icons/Ionicons';
import WhatsAppIcon from '../assets/icons/simple-icons--whatsapp.svg';

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
      setWithName(true);
      setColor('white');
    }
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: Colors.surface }]}>
          <Text style={[styles.modalHeaderTitle, { color: textColor }]}>
            Icon Label Preference
          </Text>
          <Text style={[styles.modalSubtitle, { color: secondaryTextColor }]}>
            Would you like to keep the app names under the icons?
          </Text>

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
                  <Text style={[styles.previewLabel, { color: textColor }]}>WhatsApp</Text>
                </View>
                <View style={styles.optionTextContainer}>
                  <Text style={[styles.optionTitle, { color: textColor }]}>
                    With Name
                  </Text>
                  <Text style={[styles.optionDescription, { color: secondaryTextColor }]}>
                    Display the app name below the icon
                  </Text>
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
                  <Text style={[styles.optionTitle, { color: textColor }]}>
                    Without Name
                  </Text>
                  <Text style={[styles.optionDescription, { color: secondaryTextColor }]}>
                    Hide the app name for a cleaner look
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.colorSection}>
            <Text style={[styles.colorTitle, { color: textColor }]}>App Name Color</Text>
            <View style={styles.colorOptions}>
              <TouchableOpacity
                style={[styles.colorOption, color === 'white' && styles.colorOptionSelected]}
                onPress={() => setColor('white')}
                disabled={!withName}
              >
                <View style={[styles.colorSwatch, { backgroundColor: '#FFFFFF' }]} />
                <Text style={[styles.colorOptionText, { color: textColor }]}>White</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.colorOption, color === 'black' && styles.colorOptionSelected]}
                onPress={() => setColor('black')}
                disabled={!withName}
              >
                <View style={[styles.colorSwatch, { backgroundColor: '#000000' }]} />
                <Text style={[styles.colorOptionText, { color: textColor }]}>Black</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={styles.doneButton}
            onPress={() => onSelect(withName, withName ? color : '')}
          >
            <Text style={styles.doneButtonText}>Done</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
          >
            <Text style={[styles.closeButtonText, { color: secondaryTextColor }]}>
              Cancel
            </Text>
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
  modalHeaderTitle: {
    fontSize: Typography.sizes.h3,
    fontWeight: Typography.weights.bold,
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: Typography.sizes.bodySmall,
    fontWeight: Typography.weights.regular,
    textAlign: 'center',
    marginBottom: Spacing.xl,
    lineHeight: Typography.sizes.bodySmall * 1.4,
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
  previewLabel: {
    fontSize: 8,
    fontWeight: '500',
    textAlign: 'center',
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: Typography.sizes.body,
    fontWeight: Typography.weights.semibold,
  },
  optionDescription: {
    fontSize: Typography.sizes.caption,
    marginTop: 2,
  },
  closeButton: {
    marginTop: Spacing.sm,
    padding: Spacing.md,
  },
  closeButtonText: {
    fontSize: Typography.sizes.bodySmall,
    fontWeight: Typography.weights.medium,
  },
  optionButtonSelected: { borderColor: Colors.primary, backgroundColor: 'rgba(255,0,122,0.1)' },
  colorSection: { width: '100%', marginBottom: Spacing.lg, alignItems: 'center' },
  colorTitle: { fontSize: Typography.sizes.bodySmall, fontWeight: Typography.weights.semibold, marginBottom: Spacing.sm },
  colorOptions: { flexDirection: 'row', gap: Spacing.md },
  colorOption: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, padding: Spacing.sm, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border },
  colorOptionSelected: { borderColor: Colors.primary, backgroundColor: 'rgba(255,0,122,0.1)' },
  colorSwatch: { width: 18, height: 18, borderRadius: 9, borderWidth: 1, borderColor: Colors.border },
  colorOptionText: { fontSize: Typography.sizes.caption, fontWeight: Typography.weights.medium },
  doneButton: { width: '100%', backgroundColor: Colors.primary, paddingVertical: Spacing.md, borderRadius: Radius.md, alignItems: 'center', marginBottom: Spacing.sm },
  doneButtonText: { color: '#FFFFFF', fontSize: Typography.sizes.body, fontWeight: Typography.weights.bold },

});

export default ShapeNameSelectionModal;
