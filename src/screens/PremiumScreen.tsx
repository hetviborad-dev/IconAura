import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSubscription } from '../context/SubscriptionContext';
// (design tokens reserved for future theming)
import { SubscriptionConfig } from '../constants/subscriptions';

const FEATURE_GRAPHIC = require('../assets/images/aura_feature_graphic.png');

type PlanType = 'monthly' | 'annual' | 'lifetime';

const PLAN_META: Record<PlanType, { title: string; subtitle: string; period: string; fallbackPrice: string; highlight?: boolean }> = {
  monthly: { title: 'Monthly', subtitle: 'Flexible access', period: '/mo', fallbackPrice: '$4.99/mo' },
  annual: { title: 'Annual', subtitle: 'Best value', period: '/yr', fallbackPrice: '$39.99/yr', highlight: true },
  lifetime: { title: 'Lifetime', subtitle: 'Pay once, own forever', period: '', fallbackPrice: '$99.99' },
};

const BENEFITS = [
  { icon: 'sparkles', text: '100+ premium icon themes' },
  { icon: 'layers-outline', text: 'Exclusive icon styles & layouts' },
  { icon: 'images-outline', text: 'HD matching wallpapers' },
  { icon: 'megaphone-off', text: 'Completely ad-free experience' },
  { icon: 'flash-outline', text: 'Priority updates & new themes' },
  { icon: 'color-wand-outline', text: 'Unlimited customization' },
];

export default function PremiumScreen({ navigation }: any) {
  const {
    isPremium,
    planType: activePlanType,
    expirationDate,
    restorePurchases,
    getManageSubscriptionUrl,
    updateSubscriptionState,
    purchasePackage,
    currentOffering,
    offeringLoading,
  } = useSubscription();

  const [selectedPlan, setSelectedPlan] = useState<PlanType>('annual');
  const [purchasing, setPurchasing] = useState(false);
  const [upgrading, setUpgrading] = useState(false);

  const packages = currentOffering?.availablePackages ?? [];

  const packageForPlan = useCallback(
    (plan: PlanType) => {
      return packages.find((pkg: any) => {
        if (plan === 'monthly') return pkg.packageType === 'MONTHLY';
        if (plan === 'annual') return pkg.packageType === 'ANNUAL';
        return pkg.packageType === 'LIFETIME';
      });
    },
    [packages],
  );

  const selectedPackage = packageForPlan(selectedPlan);

  const availablePlans = useMemo(() => {
    const plans: PlanType[] = [];
    if (packageForPlan('monthly') || !currentOffering) plans.push('monthly');
    if (packageForPlan('annual') || !currentOffering) plans.push('annual');
    if (packageForPlan('lifetime') || !currentOffering) plans.push('lifetime');
    return plans;
  }, [currentOffering, packageForPlan]);

  const getPrice = useCallback(
    (plan: PlanType) => {
      const pkg = packageForPlan(plan);
      if (pkg?.product?.priceString) {
        return `${pkg.product.priceString}${PLAN_META[plan].period}`;
      }
      return PLAN_META[plan].fallbackPrice;
    },
    [packageForPlan],
  );

  useEffect(() => {
    if (!availablePlans.includes(selectedPlan)) {
      setSelectedPlan(availablePlans[0] ?? 'annual');
    }
  }, [availablePlans, selectedPlan]);

  const handlePurchase = async () => {
    if (!selectedPackage) {
      Alert.alert('Unavailable', 'Subscription products could not be loaded. Please try again later.');
      return;
    }

    setPurchasing(true);
    try {
      const result = await purchasePackage(selectedPackage);
      if (result.success && result.isPremium) {
        Alert.alert('Welcome to Premium', 'Your premium access is now active.', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else if (result.error && result.error !== 'User cancelled') {
        Alert.alert('Purchase failed', result.error);
      }
    } catch (error: any) {
      Alert.alert('Purchase failed', error?.message ?? 'Something went wrong. Please try again.');
    } finally {
      setPurchasing(false);
    }
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

  const handleRestore = async () => {
    try {
      const result = await restorePurchases();
      if (result.success && result.isPremium) {
        Alert.alert('Success', 'Purchases restored successfully.');
      } else if (!result.isPremium) {
        Alert.alert('No purchases found', 'We could not find an active premium subscription.');
      } else if (result.error) {
        Alert.alert('Restore failed', result.error);
      }
    } catch (error: any) {
      Alert.alert('Restore failed', error?.message ?? 'Could not restore purchases.');
    }
  };

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

  // Purchased state UI
  if (isPremium && !upgrading) {
    const daysLeft = calculateRemainingDays(expirationDate);
    const planName =
      activePlanType === 'lifetime'
        ? 'Lifetime Access'
        : activePlanType === 'yearly'
          ? 'Yearly Subscription'
          : activePlanType === 'monthly'
            ? 'Monthly Subscription'
            : 'Aura Premium';

    return (
      <LinearGradient colors={['#0B0B0F', '#12101A', '#0B0B0F']} style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <View style={styles.topBar}>
              <TouchableOpacity style={styles.iconButton} onPress={() => navigation.goBack()}>
                <Icon name="close" size={22} color="#FFFFFF" />
              </TouchableOpacity>
              <Text style={styles.topBarTitle}>Premium</Text>
              <View style={styles.iconButtonPlaceholder} />
            </View>

            <View style={styles.heroCard}>
              <Image source={FEATURE_GRAPHIC} style={styles.featureImage} resizeMode="cover" />
              <View style={styles.activeBadgeRow}>
                <View style={styles.activeDot} />
                <Text style={styles.activeBadgeText}>PREMIUM ACTIVE</Text>
              </View>
              <Text style={styles.heroTitle}>Aura Premium</Text>
              <Text style={styles.heroSubtitle}>Welcome back. Your premium benefits are active.</Text>
            </View>

            <View style={styles.activePlanCard}>
              <View style={styles.rowBetween}>
                <Text style={styles.cardLabel}>CURRENT PLAN</Text>
                <View style={styles.activeTag}>
                  <Text style={styles.activeTagText}>ACTIVE</Text>
                </View>
              </View>
              <Text style={styles.planValue}>{planName}</Text>
              {activePlanType !== 'lifetime' && expirationDate ? (
                <View style={styles.detailsRow}>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Expires on</Text>
                    <Text style={styles.detailValue}>{formatDate(expirationDate)}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Remaining</Text>
                    <Text style={styles.detailValue}>
                      {daysLeft} {daysLeft === 1 ? 'day' : 'days'}
                    </Text>
                  </View>
                </View>
              ) : (
                <View style={styles.lifetimeRow}>
                  <Icon name="infinite" size={18} color="#FFD700" />
                  <Text style={styles.lifetimeText}>Lifetime access. No renewals, no expiry.</Text>
                </View>
              )}
            </View>

            <View style={styles.benefitsCard}>
              <Text style={styles.sectionTitle}>What you unlocked</Text>
              {BENEFITS.map((item) => (
                <View key={item.text} style={styles.benefitRow}>
                  <View style={styles.benefitIconWrap}>
                    <Icon name={item.icon} size={16} color="#FFD700" />
                  </View>
                  <Text style={styles.benefitText}>{item.text}</Text>
                </View>
              ))}
            </View>

            <View style={styles.actionSection}>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => setUpgrading(true)}
                activeOpacity={0.9}
              >
                <Icon name="arrow-up-circle-outline" size={20} color="#0B0B0F" />
                <Text style={styles.primaryButtonText}>Change or upgrade plan</Text>
              </TouchableOpacity>

              {(activePlanType === 'monthly' || activePlanType === 'yearly') && (
                <TouchableOpacity style={styles.outlineButton} onPress={handleManageSubscription}>
                  <Text style={styles.outlineButtonText}>Manage or cancel subscription</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity style={styles.restoreButton} onPress={handleRestore}>
                <Text style={styles.restoreText}>Restore purchases</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  const isOfferingsLoading = offeringLoading && !currentOffering;

  return (
    <LinearGradient colors={['#0B0B0F', '#12101A', '#0B0B0F']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {isOfferingsLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FFD700" />
            <Text style={styles.loadingText}>Preparing premium plans…</Text>
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <View style={styles.topBar}>
              <TouchableOpacity style={styles.iconButton} onPress={() => navigation.goBack()}>
                <Icon name="close" size={22} color="#FFFFFF" />
              </TouchableOpacity>
              <Text style={styles.topBarTitle}>Aura Premium</Text>
              <View style={styles.iconButtonPlaceholder} />
            </View>

            <View style={styles.heroCard}>
              <Image source={FEATURE_GRAPHIC} style={styles.featureImage} resizeMode="cover" />
              <View style={styles.glow} />
              <Text style={styles.heroTitle}>Unlock Aura Premium</Text>
              <Text style={styles.heroSubtitle}>
                Transform your home screen with exclusive themes, wallpapers, and an ad-free experience.
              </Text>
            </View>

            <View style={styles.benefitsCard}>
              <Text style={styles.sectionTitle}>Premium benefits</Text>
              {BENEFITS.map((item) => (
                <View key={item.text} style={styles.benefitRow}>
                  <View style={styles.benefitIconWrap}>
                    <Icon name={item.icon} size={16} color="#FFD700" />
                  </View>
                  <Text style={styles.benefitText}>{item.text}</Text>
                </View>
              ))}
            </View>

            <Text style={styles.planHeading}>Choose your plan</Text>

            {availablePlans.map((plan) => {
              const meta = PLAN_META[plan];
              const selected = selectedPlan === plan;
              return (
                <TouchableOpacity
                  key={plan}
                  activeOpacity={0.9}
                  onPress={() => setSelectedPlan(plan)}
                  style={[styles.planCard, selected && styles.planCardSelected]}
                >
                  <View style={styles.planCardLeft}>
                    <View style={[styles.planRadio, selected && styles.planRadioSelected]}>
                      {selected ? <View style={styles.planRadioDot} /> : null}
                    </View>
                    <View>
                      <View style={styles.planTitleRow}>
                        <Text style={[styles.planTitle, selected && styles.planTitleSelected]}>
                          {meta.title}
                        </Text>
                        {meta.highlight ? (
                          <View style={styles.highlightBadge}>
                            <Text style={styles.highlightBadgeText}>BEST VALUE</Text>
                          </View>
                        ) : null}
                      </View>
                      <Text style={styles.planSubtitle}>{meta.subtitle}</Text>
                    </View>
                  </View>
                  <Text style={[styles.planPrice, selected && styles.planPriceSelected]}>
                    {getPrice(plan)}
                  </Text>
                </TouchableOpacity>
              );
            })}

            {currentOffering === null && !offeringLoading ? (
              <Text style={styles.warningText}>
                Could not load live store prices. Default prices are shown and purchase may be unavailable offline.
              </Text>
            ) : null}

            <TouchableOpacity
              style={[styles.ctaButton, purchasing && styles.ctaButtonDisabled]}
              onPress={handlePurchase}
              disabled={purchasing || !selectedPackage}
              activeOpacity={0.9}
            >
              {purchasing ? (
                <ActivityIndicator color="#0B0B0F" />
              ) : (
                <>
                  <Icon name="lock-open-outline" size={20} color="#0B0B0F" />
                  <Text style={styles.ctaText}>Continue with {PLAN_META[selectedPlan].title}</Text>
                </>
              )}
            </TouchableOpacity>

            <View style={styles.legalRow}>
              <TouchableOpacity onPress={() => Linking.openURL('https://www.apple.com/legal/internet-services/itunes/dev/stdeula/').catch(() => {})}>
                <Text style={styles.legalLink}>Terms</Text>
              </TouchableOpacity>
              <Text style={styles.legalDivider}>•</Text>
              <TouchableOpacity onPress={() => Linking.openURL('https://revenuecat.com/privacy').catch(() => {})}>
                <Text style={styles.legalLink}>Privacy</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.restoreButton} onPress={handleRestore}>
              <Text style={styles.restoreText}>Restore purchases</Text>
            </TouchableOpacity>

            <Text style={styles.finePrint}>
              Subscriptions auto-renew unless cancelled at least 24 hours before the end of the current period.
            </Text>
          </ScrollView>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 40 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButtonPlaceholder: { width: 40, height: 40 },
  topBarTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '800', letterSpacing: 0.3 },
  heroCard: {
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor: '#15151C',
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.16)',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 12 },
    elevation: 12,
  },
  featureImage: { width: '100%', height: 180 },
  glow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 180,
    backgroundColor: 'rgba(255,215,0,0.06)',
  },
  heroTitle: { color: '#FFFFFF', fontSize: 28, fontWeight: '800', paddingHorizontal: 18, paddingTop: 16 },
  heroSubtitle: { color: '#A7A7B2', fontSize: 14, lineHeight: 20, paddingHorizontal: 18, paddingBottom: 18, paddingTop: 6 },
  activeBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 18,
    paddingTop: 14,
  },
  activeDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#4CAF50' },
  activeBadgeText: { color: '#FFD700', fontSize: 11, fontWeight: '800', letterSpacing: 1.2 },
  benefitsCard: {
    backgroundColor: '#15151C',
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    marginBottom: 20,
  },
  sectionTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '800', marginBottom: 12 },
  benefitRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 },
  benefitIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,215,0,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitText: { color: '#D2D2DC', fontSize: 14, fontWeight: '500', flex: 1 },
  planHeading: { color: '#FFFFFF', fontSize: 18, fontWeight: '800', marginBottom: 12 },
  planCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#15151C',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 16,
    marginBottom: 12,
  },
  planCardSelected: {
    borderColor: '#FFD700',
    backgroundColor: 'rgba(255,215,0,0.08)',
  },
  planCardLeft: { flexDirection: 'row', alignItems: 'center', gap: 14, flex: 1 },
  planRadio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.28)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  planRadioSelected: { borderColor: '#FFD700' },
  planRadioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#FFD700' },
  planTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 },
  planTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  planTitleSelected: { color: '#FFD700' },
  highlightBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: '#FFD700',
  },
  highlightBadgeText: { color: '#0B0B0F', fontSize: 9, fontWeight: '800', letterSpacing: 0.6 },
  planSubtitle: { color: '#8A8A96', fontSize: 12, fontWeight: '500' },
  planPrice: { color: '#FFFFFF', fontSize: 17, fontWeight: '800' },
  planPriceSelected: { color: '#FFD700' },
  warningText: { color: '#FFB74D', fontSize: 12, textAlign: 'center', marginBottom: 14 },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFD700',
    borderRadius: 16,
    paddingVertical: 16,
    marginTop: 6,
    marginBottom: 12,
    shadowColor: '#FFD700',
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  ctaButtonDisabled: { opacity: 0.6 },
  ctaText: { color: '#0B0B0F', fontSize: 16, fontWeight: '800' },
  legalRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 4 },
  legalLink: { color: '#8A8A96', fontSize: 12, textDecorationLine: 'underline' },
  legalDivider: { color: '#555561', fontSize: 12 },
  restoreButton: { alignItems: 'center', paddingVertical: 10, marginTop: 6 },
  restoreText: { color: '#A7A7B2', fontSize: 13, textDecorationLine: 'underline', fontWeight: '600' },
  finePrint: { color: '#6E6E7A', fontSize: 11, textAlign: 'center', lineHeight: 16, marginTop: 8 },
  activePlanCard: {
    backgroundColor: '#15151C',
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    marginBottom: 20,
  },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardLabel: { color: '#8A8A96', fontSize: 11, fontWeight: '800', letterSpacing: 1.3 },
  activeTag: { backgroundColor: '#FFD700', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  activeTagText: { color: '#0B0B0F', fontSize: 10, fontWeight: '800' },
  planValue: { color: '#FFFFFF', fontSize: 26, fontWeight: '800', marginTop: 10, marginBottom: 14 },
  detailsRow: { flexDirection: 'row', gap: 12, backgroundColor: '#1E1E28', borderRadius: 14, padding: 14, marginBottom: 4 },
  detailItem: { flex: 1, alignItems: 'center' },
  detailLabel: { color: '#8A8A96', fontSize: 11, marginBottom: 4 },
  detailValue: { color: '#FFFFFF', fontSize: 14, fontWeight: '700', textAlign: 'center' },
  lifetimeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,215,0,0.08)', borderRadius: 14, padding: 14 },
  lifetimeText: { color: '#E8D7A6', fontSize: 13, fontWeight: '600' },
  actionSection: { gap: 10 },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFD700',
    borderRadius: 16,
    paddingVertical: 16,
  },
  primaryButtonText: { color: '#0B0B0F', fontSize: 16, fontWeight: '800' },
  outlineButton: {
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    backgroundColor: '#121218',
  },
  outlineButtonText: { color: '#D8D8E2', fontSize: 14, fontWeight: '600' },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { color: '#A7A7B2', fontSize: 14, fontWeight: '600' },
});