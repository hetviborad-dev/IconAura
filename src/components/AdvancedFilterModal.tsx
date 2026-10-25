import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
} from 'react-native';
import { Colors, Radius, Spacing, Typography, TouchTarget } from '../constants/design';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface AdvancedFilterModalProps {
  isVisible: boolean;
  onClose: () => void;
  onApply: (filters: { colors: string[]; tags: string[] }) => void;
  initialFilters: { colors: string[]; tags: string[] };
}

const COMMON_COLORS = [
  { name: 'White', value: 'white', color: '#FFFFFF' },
  { name: 'Black', value: 'black', color: '#000000' },
  { name: 'Red', value: 'red', color: '#FF0000' },
  { name: 'Blue', value: 'blue', color: '#0000FF' },
  { name: 'Green', value: 'green', color: '#00FF00' },
  { name: 'Yellow', value: 'yellow', color: '#FFFF00' },
  { name: 'Pink', value: 'pink', color: '#FFC0CB' },
  { name: 'Purple', value: 'purple', color: '#800080' },
  { name: 'Orange', value: 'orange', color: '#FFA500' },
  { name: 'Brown', value: 'brown', color: '#A52A2A' },
  { name: 'Beige', value: 'beige', color: '#F5F5DC' },
  { name: 'Grey', value: 'grey', color: '#808080' },
];

const COMMON_TAGS = [
  'Minimalist', 'Bold', 'Nature', 'Abstract', 'Cute', 'Dark', 'Light', 'Premium', 'Modern', 'Aesthetic'
];

export default function AdvancedFilterModal({
  isVisible,
  onClose,
  onApply,
  initialFilters,
}: AdvancedFilterModalProps) {
  const insets = useSafeAreaInsets();
  const [selectedColors, setSelectedColors] = useState(initialFilters.colors);
  const [selectedTags, setSelectedTags] = useState(initialFilters.tags);

  useEffect(() => {
    if (isVisible) {
      setSelectedColors(initialFilters.colors);
      setSelectedTags(initialFilters.tags);
    }
  }, [isVisible, initialFilters]);

  const toggleColor = (value: string) => {
    setSelectedColors(prev =>
      prev.includes(value) ? prev.filter(c => c !== value) : [...prev, value]
    );
  };

  const toggleTag = (value: string) => {
    setSelectedTags(prev =>
      prev.includes(value) ? prev.filter(t => t !== value) : [...prev, value]
    );
  };

  const clearAll = () => {
    setSelectedColors([]);
    setSelectedTags([]);
  };

  const handleApply = () => {
    onApply({ colors: selectedColors, tags: selectedTags });
    onClose();
  };

  const backgroundColor = Colors.surface;
  const textColor = Colors.textPrimary;
  const secondaryTextColor = Colors.textSecondary;

  return (
    <Modal visible={isVisible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={[
          styles.modalContainer,
          {
            backgroundColor,
            paddingBottom: Math.max(Spacing.xxxl, insets.bottom + Spacing.xl)
          }
        ]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: textColor }]}>Advanced Filters</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Icon name="close" size={24} color={secondaryTextColor} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>Colors</Text>
            <View style={styles.chipContainer}>
              {COMMON_COLORS.map(color => (
                <TouchableOpacity
                  key={color.value}
                  style={{ alignItems: 'center', gap: 4 }}
                  onPress={() => toggleColor(color.value)}
                >
                  <View style={[
                    styles.colorChipWrapper,
                    selectedColors.includes(color.value) && styles.selectedColorChipWrapper
                  ]}>
                    <View style={[
                      styles.colorChip,
                      { backgroundColor: color.color, borderColor: Colors.border }
                    ]} />
                  </View>
                  <Text style={[styles.colorText, { color: textColor }]}>{color.name}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.sectionTitle, { color: textColor }]}>Keywords</Text>
            <View style={styles.chipContainer}>
              {COMMON_TAGS.map(tag => (
                <TouchableOpacity
                  key={tag}
                  style={[
                    styles.tagChip,
                    { borderColor: Colors.border },
                    selectedTags.includes(tag.toLowerCase()) && {
                      backgroundColor: Colors.primary,
                      borderColor: Colors.primary,
                    }
                  ]}
                  onPress={() => toggleTag(tag.toLowerCase())}
                >
                  <Text style={[
                    styles.chipText,
                    { color: selectedTags.includes(tag.toLowerCase()) ? 'white' : secondaryTextColor }
                  ]}>
                    {tag}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.clearButton} onPress={clearAll}>
                <Text style={[styles.clearButtonText, { color: secondaryTextColor }]}>Clear All</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.applyButton,
                  { backgroundColor: Colors.primary }
                ]}
                onPress={handleApply}
              >
                <Text style={[
                  styles.applyButtonText,
                  { color: 'white' }
                ]}>Apply Filters</Text>
              </TouchableOpacity>
            </View>
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
    justifyContent: 'flex-end',
  },
  modalContainer: {
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    padding: Spacing.xl,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  closeButton: {
    width: TouchTarget.min,
    height: TouchTarget.min,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: Typography.sizes.h3,
    fontWeight: Typography.weights.bold,
  },
  content: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.sizes.body,
    fontWeight: Typography.weights.semibold,
    marginBottom: Spacing.md,
    marginTop: Spacing.lg,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  colorChipWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
    borderRadius: Radius.full,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedColorChipWrapper: {
    borderColor: Colors.primary,
  },
  colorChip: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  checkBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
  },
  colorText: {
    fontSize: Typography.sizes.caption,
    fontWeight: Typography.weights.medium,
  },
  tagChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.sm,
    borderWidth: 1,
  },
  chipText: {
    fontSize: Typography.sizes.caption,
    fontWeight: Typography.weights.medium,
  },
  footer: {
    marginTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.md,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  clearButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  clearButtonText: {
    fontSize: Typography.sizes.body,
    fontWeight: Typography.weights.medium,
  },
  applyButton: {
    flex: 2,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    alignItems: 'center',
    marginTop: 0,
  },
  applyButtonText: {
    fontSize: Typography.sizes.body,
    fontWeight: Typography.weights.bold,
  },
});
