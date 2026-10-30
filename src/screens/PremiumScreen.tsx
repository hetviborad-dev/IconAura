import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking, Alert } from 'react-native';
import RevenueCatUI from 'react-native-purchases-ui';
import { useSubscription } from '../context/SubscriptionContext';
import { Colors, Spacing, Typography, Radius, Layout } from '../constants/design';
import Icon from 'react-native-vector-icons/Ionicons';

export default function PremiumScreen({ navigation }: any) {
  const {
    isPremium,
    planType,
    expirationDate,
    refreshSubscription,
    restorePurchases,
    getManageSubscriptionUrl,
    updateSubscriptionState,
  } = useSubscription();
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
      Linking.openURL(result.url).catch(() => {
        Alert.alert('Error', 'Could not open subscription management page.');
      });
    } else {
      Alert.alert('Error', result.error || 'Could not retrieve management URL.');
    }
  };

  if (!isPremium || showPaywall) {
    return (
      <View style={styles.container}>
        <RevenueCatUI.Paywall
          onPurchaseCompleted={async (customerInfo: any) => {
            console.log('Purchase completed!', customerInfo);
            updateSubscriptionState(customerInfo);
            setShowPaywall(false);
          }}
          onRestoreCompleted={async (customerInfo: any) => {
            console.log('Restore completed!', customerInfo);
            updateSubscriptionState(customerInfo);
            setShowPaywall(false);
          }}
        />
      </View>
    );
  }

  const daysLeft = calculateRemainingDays(expirationDate);
  const planName =
    planType === 'lifetime'
      ? 'Lifetime Access'
      : planType === 'yearly'
      ? 'Yearly Subscription'
      : planType === 'monthly'
      ? 'Monthly Subscription'
      : 'Aura Premium';

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Icon name="chevron-back" size={24} color="#FFFFFF" />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

      <View style={styles.hero}>
        <View style={styles.crownGlow}>
          <View style={styles.crownCircle}>
            <Icon name="ribbon" size={72} color="#FFD700" />
          </View>
        </View>
        <Text style={styles.title}>Aura Premium</Text>
        <Text style={styles.subtitle}>Welcome back. Your premium benefits are active.</Text>
        <View style={styles.activePill}>
          <View style={styles.activeDot} />
          <Text style={styles.activePillText}>PREMIUM ACTIVE</Text>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.rowBetween}>
          <Text style={styles.cardLabel}>CURRENT PLAN</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>ACTIVE</Text>
          </View>
        </View>

        <Text style={styles.planValue}>{planName}</Text>

        {planType !== 'lifetime' && expirationDate ? (
          <View style={styles.detailsRow}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Expires on</Text>
              <Text style={styles.detailValue}>{formatDate(expirationDate)}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Remaining</Text>
              <Text style={styles.detailValue}>{daysLeft} {daysLeft === 1 ? 'day' : 'days'}</Text>
            </View>
          </View>
        ) : (
          <View style={styles.lifetimeNote}>
            <Icon name="infinite" size={20} color="#FFD700" />
            <Text style={styles.lifetimeText}>Lifetime access. No renewals, no expiry.</Text>
          </View>
        )}

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>What you unlock</Text>
        <View style={styles.benefitsContainer}>
          <BenefitItem icon="sparkles" text="100+ premium themes" />
          <BenefitItem icon="layers-outline" text="Exclusive icon styles & layouts" />
          <BenefitItem icon="image-outline" text="HD matching wallpapers" />
          <BenefitItem icon="megaphone-off" text="Completely ad-free experience" />
          <BenefitItem icon="flash-outline" text="Priority updates & new themes" />
        </View>
      </View>

      <View style={styles.actionSection}>
        <Text style={styles.actionHeading}>Quick actions</Text>
        <View style={styles.buttonGrid}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('HomeStack', { screen: 'Themes' })}
          >
            <View style={styles.actionIcon}>
              <Icon name="color-palette-outline" size={22} color="#FFD700" />
            </View>
            <Text style={styles.actionButtonText}>Explore themes</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('HomeStack', { screen: 'Wallpapers' })}
          >
            <View style={styles.actionIcon}>
              <Icon name="images-outline" size={22} color="#FFD700" />
            </View>
            <Text style={styles.actionButtonText}>Set wallpaper</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.footerSection}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => setShowPaywall(true)}
        >
          <Icon name="arrow-up-circle-outline" size={20} color="#FFFFFF" />
          <Text style={styles.primaryButtonText}>Change or upgrade plan</Text>
        </TouchableOpacity>

        {(planType === 'monthly' || planType === 'yearly') && (
          <View style={styles.managementContainer}>
            <TouchableOpacity
              style={styles.outlineButton}
              onPress={handleManageSubscription}
            >
              <Text style={styles.outlineButtonText}>Manage or cancel subscription</Text>
            </TouchableOpacity>
            <Text style={styles.managementNote}>
              Subscriptions are managed through Google Play. Premium stays active until the current billing period ends.
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.restoreButton}
          onPress={async () => {
            const result = await restorePurchases();
            if (result.success) {
              Alert.alert('Success', 'Purchases restored successfully.');
            } else {
              Alert.alert('Error', 'Restore failed: ' + result.error);
            }
          }}
        >
          <Text style={styles.restoreText}>Restore purchases</Text>
        </TouchableOpacity>

      </View>
    </ScrollView>
  );
}

function BenefitItem({ icon, text }: { icon: string; text: string }) {
  return (
    <View style={styles.benefitItem}>
      <View style={styles.checkCircle}>
        <Icon name="checkmark" size={12} color="#000000" />
      </View>
      <Text style={styles.benefitText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0B0F',
  },
  scrollContent: {
    flexGrow: 1,
    backgroundColor: '#0B0B0F',
    paddingHorizontal: 20,
    paddingTop: 52,
    paddingBottom: 48,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    marginBottom: 18,
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  backText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  hero: {
    alignItems: 'center',
    marginBottom: 26,
  },
  crownGlow: {
    width: 124,
    height: 124,
    borderRadius: 62,
    backgroundColor: 'rgba(255, 215, 0, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.18)',
    marginBottom: 18,
  },
  crownCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(255, 215, 0, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  subtitle: {
    marginTop: 6,
    fontSize: 15,
    color: '#A7A7B2',
    textAlign: 'center',
  },
  activePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 215, 0, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.28)',
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
  },
  activePillText: {
    color: '#FFD700',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  card: {
    backgroundColor: '#15151C',
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 14,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardLabel: {
    fontSize: 12,
    color: '#8A8A96',
    fontWeight: '800',
    letterSpacing: 1.4,
  },
  badge: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  badgeText: {
    fontSize: 10,
    color: '#111111',
    fontWeight: '800',
  },
  planValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 12,
    marginBottom: 18,
  },
  detailsRow: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#1E1E28',
    borderRadius: 16,
    padding: 16,
    marginBottom: 18,
  },
  detailItem: {
    flex: 1,
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 12,
    color: '#8A8A96',
    marginBottom: 5,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  lifetimeNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 215, 0, 0.08)',
    borderRadius: 14,
    padding: 14,
    marginBottom: 18,
  },
  lifetimeText: {
    color: '#E8D7A6',
    fontSize: 14,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 14,
  },
  benefitsContainer: {
    gap: 12,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FFD700',
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitText: {
    fontSize: 15,
    color: '#D2D2DC',
    fontWeight: '500',
  },
  actionSection: {
    marginBottom: 24,
  },
  actionHeading: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 14,
  },
  buttonGrid: {
    flexDirection: 'row',
    gap: 14,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#15151C',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 18,
    padding: 18,
    alignItems: 'center',
    gap: 10,
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 215, 0, 0.10)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
    textAlign: 'center',
  },
  footerSection: {
    gap: 12,
    alignItems: 'center',
  },
  primaryButton: {
    width: '100%',
    backgroundColor: '#FFD700',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  primaryButtonText: {
    color: '#15151C',
    fontWeight: '800',
    fontSize: 16,
  },
  outlineButton: {
    width: '100%',
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
    backgroundColor: '#121218',
  },
  outlineButtonText: {
    color: '#D8D8E2',
    fontSize: 14,
    fontWeight: '600',
  },
  managementContainer: {
    width: '100%',
    gap: 8,
  },
  managementNote: {
    fontSize: 12,
    color: '#8A8A96',
    textAlign: 'center',
    lineHeight: 18,
  },
  restoreButton: {
    paddingVertical: 8,
  },
  restoreText: {
    color: '#8A8A96',
    fontSize: 13,
    textDecorationLine: 'underline',
  },
  supportRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
  },
  supportLink: {
    color: '#A7A7B2',
    fontSize: 13,
  },
  supportDivider: {
    color: '#555561',
  },
});
