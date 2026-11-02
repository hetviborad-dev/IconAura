import React from 'react';
import {
  View,
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
import RevenueCatUI from 'react-native-purchases-ui';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSubscription } from '../context/SubscriptionContext';
import FontText from '../components/FontText';

const FEATURE_GRAPHIC = require('../assets/images/aura_feature_graphic.png');

const BENEFITS = [
  { icon: 'sparkles', text: '100+ premium icon themes' },
  { icon: 'layers-outline', text: 'Exclusive icon styles & layouts' },
  { icon: 'images-outline', text: 'HD matching wallpapers' },
  { icon: 'volume-mute-outline', text: 'Completely ad-free experience' },
  { icon: 'flash-outline', text: 'Priority updates & new themes' },
];

export default function PremiumScreen({ navigation }: any) {
  const {
    isPremium,
    planType: activePlanType,
    expirationDate,
    restorePurchases,
    getManageSubscriptionUrl,
    updateSubscriptionState,
    currentOffering,
    offeringLoading,
  } = useSubscription();

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

  // For non-subscribers, use RevenueCat's paywall UI directly.
  if (!isPremium) {
    if (offeringLoading) {
      return (
        <LinearGradient colors={['#0B0B0F', '#12101A', '#0B0B0F']} style={styles.container}>
          <SafeAreaView style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FFD700" />
            <FontText color="#A7A7B2" size={14} name="semibold" style={styles.loadingText}>Preparing premium plans…</FontText>
          </SafeAreaView>
        </LinearGradient>
      );
    }

    return (
      <View style={styles.container}>
        <RevenueCatUI.Paywall
          options={currentOffering ? { offering: currentOffering } : undefined}
          onPurchaseCompleted={async (customerInfo: any) => {
            updateSubscriptionState(customerInfo);
          }}
          onRestoreCompleted={async (customerInfo: any) => {
            updateSubscriptionState(customerInfo);
          }}
        />
      </View>
    );
  }

  // Purchased state
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
            <FontText color="#FFFFFF" size={18} name="bold" style={styles.topBarTitle}>Premium</FontText>
            <View style={styles.iconButtonPlaceholder} />
          </View>

          <Image source={FEATURE_GRAPHIC} style={styles.featureImage} resizeMode="cover" />

          <View style={styles.activeRow}>
            <View style={styles.activeDot} />
            <FontText color="#FFD700" size={11} name="bold" style={styles.activeText}>PREMIUM ACTIVE</FontText>
          </View>

          <FontText color="#FFFFFF" size={28} name="bold" style={styles.heroTitle}>Aura Premium</FontText>
          <FontText color="#A7A7B2" size={14} name="regular" style={styles.heroSubtitle}>Welcome back. Your premium benefits are active.</FontText>

          <View style={styles.card}>
            <View style={styles.rowBetween}>
              <FontText color="#8A8A96" size={11} name="bold" style={styles.cardLabel}>CURRENT PLAN</FontText>
              <View style={styles.activeTag}>
                <FontText color="#0B0B0F" size={10} name="bold" style={styles.activeTagText}>ACTIVE</FontText>
              </View>
            </View>
            <FontText color="#FFFFFF" size={26} name="bold" style={styles.planValue}>{planName}</FontText>
            {activePlanType !== 'lifetime' && expirationDate ? (
              <View style={styles.detailsRow}>
                <View style={styles.detailItem}>
                  <FontText color="#8A8A96" size={11} name="regular" style={styles.detailLabel}>Expires on</FontText>
                  <FontText color="#FFFFFF" size={14} name="bold" style={styles.detailValue}>{formatDate(expirationDate)}</FontText>
                </View>
                <View style={styles.detailItem}>
                  <FontText color="#8A8A96" size={11} name="regular" style={styles.detailLabel}>Remaining</FontText>
                  <FontText color="#FFFFFF" size={14} name="bold" style={styles.detailValue}>{daysLeft} {daysLeft === 1 ? 'day' : 'days'}</FontText>
                </View>
              </View>
            ) : (
              <View style={styles.lifetimeRow}>
                <Icon name="infinite" size={18} color="#FFD700" />
                <FontText color="#E8D7A6" size={13} name="semibold" style={styles.lifetimeText}>Lifetime access. No renewals, no expiry.</FontText>
              </View>
            )}
          </View>

          <View style={styles.benefitsCard}>
            <FontText color="#FFFFFF" size={16} name="bold" style={styles.sectionTitle}>What you unlocked</FontText>
            {BENEFITS.map((item) => (
              <View key={item.text} style={styles.benefitRow}>
                <View style={styles.benefitIconWrap}>
                  <Icon name={item.icon} size={16} color="#FFD700" />
                </View>
                <FontText color="#D2D2DC" size={14} name="medium" style={styles.benefitText}>{item.text}</FontText>
              </View>
            ))}
          </View>

          <TouchableOpacity style={styles.outlineButton} onPress={handleManageSubscription}>
            <FontText color="#D8D8E2" size={14} name="semibold" style={styles.outlineButtonText}>Manage subscription</FontText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.restoreButton} onPress={handleRestore}>
            <FontText color="#A7A7B2" size={13} name="semibold" style={styles.restoreText}>Restore purchases</FontText>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0B0F' },
  safeArea: { flex: 1 },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { color: '#A7A7B2', fontSize: 14, fontWeight: '600' },
  scrollContent: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 40 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  iconButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center' },
  iconButtonPlaceholder: { width: 40, height: 40 },
  topBarTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '800', letterSpacing: 0.3 },
  featureImage: { width: '100%', height: 180, borderRadius: 24, marginBottom: 16 },
  activeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  activeDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#4CAF50' },
  activeText: { color: '#FFD700', fontSize: 11, fontWeight: '800', letterSpacing: 1.2 },
  heroTitle: { color: '#FFFFFF', fontSize: 28, fontWeight: '800' },
  heroSubtitle: { color: '#A7A7B2', fontSize: 14, lineHeight: 20, marginTop: 6, marginBottom: 18 },
  card: { backgroundColor: '#15151C', borderRadius: 22, padding: 18, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', marginBottom: 20 },
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
  benefitsCard: { backgroundColor: '#15151C', borderRadius: 22, padding: 18, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', marginBottom: 20 },
  sectionTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '800', marginBottom: 12 },
  benefitRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 },
  benefitIconWrap: { width: 30, height: 30, borderRadius: 15, backgroundColor: 'rgba(255,215,0,0.10)', alignItems: 'center', justifyContent: 'center' },
  benefitText: { color: '#D2D2DC', fontSize: 14, fontWeight: '500', flex: 1 },
  outlineButton: { borderRadius: 16, paddingVertical: 15, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.14)', backgroundColor: '#121218', marginBottom: 12 },
  outlineButtonText: { color: '#D8D8E2', fontSize: 14, fontWeight: '600' },
  restoreButton: { alignItems: 'center', paddingVertical: 10 },
  restoreText: { color: '#A7A7B2', fontSize: 13, textDecorationLine: 'underline', fontWeight: '600' },
});