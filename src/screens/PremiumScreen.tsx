import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking, Alert } from 'react-native';
import RevenueCatUI from 'react-native-purchases-ui';
import { useSubscription } from '../context/SubscriptionContext';
import { Colors, Spacing, Typography, Radius, Layout } from '../constants/design';
import Icon from 'react-native-vector-icons/Ionicons';

export default function PremiumScreen({ navigation }: any) {
  const { isPremium, planType, expirationDate, refreshSubscription, restorePurchases, getManageSubscriptionUrl, updateSubscriptionState } = useSubscription();
  const [showPaywall, setShowPaywall] = useState(false);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const calculateRemainingDays = (dateString: string | null) => {
    if (!dateString) return null;
    const now = new Date();
    const exp = new Date(dateString);
    const diffTime = exp.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const handleManageSubscription = async () => {
    const result = await getManageSubscriptionUrl();
    if (result.success && result.url) {
      Linking.openURL(result.url).catch(err =>
        Alert.alert('Error', 'Could not open subscription management page.')
      );
    } else {
      Alert.alert('Error', result.error || 'Could not retrieve management URL.');
    }
  };

  if (!isPremium || showPaywall) {
    return (
      <View style={styles.container}>
        <RevenueCatUI.Paywall
          onPurchaseCompleted={async (customerInfo) => {
            console.log('Purchase completed!', customerInfo);
            updateSubscriptionState(customerInfo);
            setShowPaywall(false);
          }}
          onRestoreCompleted={async (customerInfo) => {
            console.log('Restore completed!', customerInfo);
            updateSubscriptionState(customerInfo);
            setShowPaywall(false);
          }}
        />
      </View>
    );
  }

  const daysLeft = calculateRemainingDays(expirationDate);

  return (
    <ScrollView contentContainerStyle={styles.centerContainer} showsVerticalScrollIndicator={false}>
      <View style={styles.headerSection}>
        <View style={styles.crownContainer}>
          <Icon name="ribbon" size={80} color="#FFD700" />
        </View>
        <Text style={styles.premiumTitle}>Aura Premium</Text>
        <Text style={styles.welcomeText}>Welcome to the Elite Circle ✨</Text>
      </View>

      <View style={styles.mainCard}>
        <View style={styles.planHeader}>
          <Text style={styles.planLabel}>CURRENT PLAN</Text>
          <View style={styles.premiumBadge}>
            <Text style={styles.badgeText}>ACTIVE</Text>
          </View>
        </View>

        <Text style={styles.planValue}>
          {planType === 'lifetime' ? 'Lifetime Access' :
           planType === 'yearly' ? 'Yearly Subscription' :
           planType === 'monthly' ? 'Monthly Subscription' : 'Standard'}
        </Text>

        <View style={styles.detailsRow}>
          {planType !== 'lifetime' && expirationDate && (
            <>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Expires on</Text>
                <Text style={styles.detailValue}>{formatDate(expirationDate)}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Remaining</Text>
                <Text style={styles.detailValue}>{daysLeft} Days</Text>
              </View>
            </>
          )}
        </View>

        <View style={styles.benefitsContainer}>
          <BenefitItem icon="checkmark-circle" text="All 100+ Premium Themes Unlocked" />
          <BenefitItem icon="megaphone-off" text="Completely Ad-Free Experience" />
          <BenefitItem icon="image" text="HD Matching Wallpapers" />
          <BenefitItem icon="flash" text="Priority Updates & New Themes" />
        </View>
      </View>

      <View style={styles.actionSection}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.buttonGrid}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('HomeStack', { screen: 'Themes' })}
          >
            <Icon name="palette" size={24} color="#FFD700" />
            <Text style={styles.actionButtonText}>Explore Themes</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('HomeStack', { screen: 'Wallpapers' })}
          >
            <Icon name="image" size={24} color="#FFD700" />
            <Text style={styles.actionButtonText}>Set Wallpaper</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.footerSection}>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => setShowPaywall(true)}
        >
          <Text style={styles.secondaryButtonText}>Change or Upgrade Plan</Text>
        </TouchableOpacity>

        {planType === 'monthly' || planType === 'yearly' ? (
          <View style={styles.managementContainer}>
            <TouchableOpacity
              style={styles.outlineButton}
              onPress={handleManageSubscription}
            >
              <Text style={styles.outlineButtonText}>Manage or Cancel Subscription</Text>
            </TouchableOpacity>
            <Text style={styles.managementNote}>
              Subscriptions are managed through the Google Play Store.
            </Text>
          </View>
        ) : null}

        <TouchableOpacity
          style={styles.restoreLink}
          onPress={async () => {
            const result = await restorePurchases();
            if (result.success) {
              Alert.alert('Success', 'Purchases restored successfully!');
            } else {
              Alert.alert('Error', 'Restore failed: ' + result.error);
            }
          }}
        >
          <Text style={styles.restoreLinkText}>Restore Purchases</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

function BenefitItem({ icon, text }: { icon: string; text: string }) {
  return (
    <View style={styles.benefitItem}>
      <Icon name={icon} size={18} color="#FFD700" />
      <Text style={styles.benefitText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  centerContainer: {
    flexGrow: 1,
    alignItems: 'center',
    backgroundColor: '#0F0F0F',
    padding: Layout.screenPadding,
    paddingBottom: 60,
  },
  headerSection: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 30,
  },
  crownContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  premiumTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFD700',
    textAlign: 'center',
    letterSpacing: 1,
  },
  welcomeText: {
    fontSize: 16,
    color: '#AAAAAA',
    textAlign: 'center',
    marginTop: 4,
  },
  mainCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#1A1A1A',
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: '#333',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 10,
    marginBottom: 30,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  planLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  premiumBadge: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  badgeText: {
    fontSize: 10,
    color: '#000',
    fontWeight: 'bold',
  },
  planValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#252525',
    padding: 16,
    borderRadius: Radius.md,
    marginBottom: 24,
  },
  detailItem: {
    alignItems: 'center',
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  benefitsContainer: {
    gap: 12,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  benefitText: {
    fontSize: 15,
    color: '#CCC',
  },
  actionSection: {
    width: '100%',
    maxWidth: 400,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 16,
    textAlign: 'center',
  },
  buttonGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: Radius.lg,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  actionButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  footerSection: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    gap: 12,
  },
  secondaryButton: {
    backgroundColor: '#FFD700',
    width: '100%',
    paddingVertical: 16,
    borderRadius: Radius.md,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16,
  },
  outlineButton: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: Radius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  outlineButtonText: {
    color: '#888',
    fontSize: 14,
  },
  managementContainer: {
    alignItems: 'center',
    gap: 8,
    width: '100%',
  },
  managementNote: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  restoreLink: {
    marginTop: 16,
    paddingVertical: 8,
  },
  restoreLinkText: {
    color: '#666',
    fontSize: 13,
    textDecorationLine: 'underline',
  },
});
