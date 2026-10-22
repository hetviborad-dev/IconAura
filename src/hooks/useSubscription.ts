import { useState, useEffect } from 'react';
import Purchases, { CustomerInfo } from 'react-native-purchases';
import { SubscriptionConfig } from '../constants/subscriptions';

export function useSubscription() {
  const [isPremium, setIsPremium] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  const checkSubscription = async () => {
    try {
      // Check current customer info
      const customerInfo = await Purchases.getCustomerInfo();
      const active = customerInfo.entitlements.active[SubscriptionConfig.premiumEntitlementId] !== undefined;
      setIsPremium(active);
    } catch (e) {
      console.error('RevenueCat Error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkSubscription();
  }, []);

  const purchasePackage = async (packageToBuy: any) => {
    try {
      const { customerInfo } = await Purchases.purchasePackage(packageToBuy);
      const active = customerInfo.entitlements.active[SubscriptionConfig.premiumEntitlementId] !== undefined;
      setIsPremium(active);
      return { success: true, isPremium: active };
    } catch (e: any) {
      if (e.userCancelled) {
        return { success: false, error: 'User cancelled' };
      }
      return { success: false, error: e.message };
    }
  };

  const restorePurchases = async () => {
    try {
      const customerInfo = await Purchases.restorePurchases();
      const active = customerInfo.entitlements.active[SubscriptionConfig.premiumEntitlementId] !== undefined;
      setIsPremium(active);
      return { success: true, isPremium: active };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  };

  return { isPremium, loading, purchasePackage, restorePurchases, refreshSubscription: checkSubscription };
}
