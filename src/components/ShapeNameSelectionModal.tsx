import React from 'react';
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
  onSelect: (withName: boolean) => void;
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
              style={styles.optionButton}
              onPress={() => onSelect(true)}
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
              style={styles.optionButton}
              onPress={() => onSelect(false)}
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
});

export default ShapeNameSelectionModal;
