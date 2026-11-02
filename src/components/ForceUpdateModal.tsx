import React from 'react';
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { Colors, Spacing, Typography, Radius } from '../constants/design';
import FontText from './FontText';
import Ionicons from 'react-native-vector-icons/Ionicons';

interface ForceUpdateModalProps {
  visible: boolean;
  storeUrl: string | null;
  message: string | null;
  latestVersion: string | null;
}

export default function ForceUpdateModal({
  visible,
  storeUrl,
  message,
  latestVersion,
}: ForceUpdateModalProps) {
  const [opening, setOpening] = React.useState(false);

  const handleUpdate = async () => {
    if (!storeUrl) return;
    try {
      setOpening(true);
      await Linking.openURL(storeUrl);
    } finally {
      setOpening(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={() => {}}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.iconWrap}>
            <Ionicons name="arrow-up-circle-outline" size={46} color={Colors.primary} />
          </View>
          <FontText color={Colors.textPrimary} size={Typography.sizes.h3} name="bold" style={styles.title}>
            Update Required
          </FontText>
          <FontText color={Colors.textSecondary} size={Typography.sizes.bodySmall} name="regular" style={styles.message}>
            {message ?? 'A newer version of IconAura is required to continue.'}
            {latestVersion ? `\n\nLatest version: ${latestVersion}` : ''}
          </FontText>
          <TouchableOpacity
            style={[styles.button, opening && styles.buttonDisabled]}
            onPress={handleUpdate}
            activeOpacity={0.8}
            disabled={opening || !storeUrl}
          >
            {opening ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <FontText color="#FFFFFF" size={Typography.sizes.body} name="bold">
                Update Now
              </FontText>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: Colors.background,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,0,122,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  message: {
    textAlign: 'center',
    marginBottom: Spacing.xl,
    lineHeight: 20,
  },
  button: {
    minWidth: 140,
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
});