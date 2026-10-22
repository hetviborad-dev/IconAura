import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import RevenueCatUI from 'react-native-purchases-ui';
import { useSubscription } from '../hooks/useSubscription';
import { Colors, Spacing, Typography, Radius } from '../constants/design';
import Icon from 'react-native-vector-icons/Ionicons';

export default function PremiumScreen() {
  const { isPremium, refreshSubscription, restorePurchases } = useSubscription();
  const [showPaywall, setShowPaywall] = useState(false);

  if (!isPremium || showPaywall) {
    return (
      <View style={styles.container}>
        <RevenueCatUI.Paywall
          onPurchaseCompleted={async (customerInfo) => {
            console.log('Purchase completed!', customerInfo);
            await refreshSubscription();
            setShowPaywall(false);
          }}
          onRestoreCompleted={async (customerInfo) => {
            console.log('Restore completed!', customerInfo);
            await refreshSubscription();
            setShowPaywall(false);
          }}
        />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.centerContainer}>
      <View style={styles.premiumCard}>
        <View style={styles.iconCircle}>
          <Icon name="ribbon" size={60} color="#FFD700" />
        </View>

        <Text style={styles.premiumText}>Premium Member ✨</Text>
        <Text style={styles.statusText}>You have full access to all themes, wallpapers, and an ad-free experience.</Text>

        <View style={styles.divider} />

        <TouchableOpacity
          style={styles.manageButton}
          onPress={() => setShowPaywall(true)}
        >
          <Icon name="swap-horizontal" size={20} color="white" />
          <Text style={styles.manageButtonText}>Change or Upgrade Plan</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.restoreButton}
          onPress={async () => {
            const result = await restorePurchases();
            if (result.success) {
              alert('Purchases restored successfully!');
            } else {
              alert('Restore failed: ' + result.error);
            }
          }}
        >
          <Text style={styles.restoreButtonText}>Restore Purchases</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  centerContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212', // Dark premium feel
    padding: Spacing.lg,
  },
  premiumCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#1E1E1E',
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFD700',
    elevation: 10,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  premiumText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  statusText: {
    fontSize: 16,
    color: '#AAAAAA',
    textAlign: 'center',
    marginBottom: Spacing.xl,
    lineHeight: 24,
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: '#333',
    marginBottom: Spacing.xl,
  },
  manageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFD700',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: Radius.md,
    gap: 8,
    width: '100%',
    marginBottom: Spacing.md,
  },
  manageButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  restoreButton: {
    paddingVertical: Spacing.sm,
    width: '100%',
    alignItems: 'center',
  },
  restoreButtonText: {
    fontSize: 14,
    color: '#888',
    textDecorationLine: 'underline',
  },
});
