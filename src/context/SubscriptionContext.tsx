import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import Purchases, { CustomerInfo } from 'react-native-purchases';
import { SubscriptionConfig } from '../constants/subscriptions';

export interface SubscriptionState {
  isPremium: boolean;
  loading: boolean;
  planType: 'none' | 'monthly' | 'yearly' | 'lifetime';
  expirationDate: string | null;
}

interface SubscriptionContextType extends SubscriptionState {
  purchasePackage: (packageToBuy: any) => Promise<{ success: boolean; isPremium: boolean; error?: string }>;
  restorePurchases: () => Promise<{ success: boolean; isPremium: boolean; error?: string }>;
  getManageSubscriptionUrl: () => Promise<{ success: boolean; url?: string; error?: string }>;
  refreshSubscription: () => Promise<void>;
  updateSubscriptionState: (customerInfo: CustomerInfo) => void;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SubscriptionState>({
    isPremium: false,
    loading: true,
    planType: 'none',
    expirationDate: null,
  });

  const updateStateFromCustomerInfo = useCallback((customerInfo: CustomerInfo) => {
    if (!customerInfo || !customerInfo.entitlements) return;
    const activeEntitlements = customerInfo.entitlements.active || {};
    const entitlement = activeEntitlements[SubscriptionConfig.premiumEntitlementId];
    const isPremium = entitlement !== undefined;

    let planType: 'none' | 'monthly' | 'yearly' | 'lifetime' = 'none';
    let expirationDate: string | null = null;

    if (entitlement) {
      expirationDate = entitlement.expirationDate instanceof Date
        ? entitlement.expirationDate.toISOString()
        : (typeof entitlement.expirationDate === 'string'
            ? entitlement.expirationDate
            : null);

      const productId = entitlement.productIdentifier || '';
      if (productId.toLowerCase().includes('lifetime')) {
        planType = 'lifetime';
      } else if (productId.toLowerCase().includes('yearly') || productId.toLowerCase().includes('annual')) {
        planType = 'yearly';
      } else if (productId.toLowerCase().includes('monthly')) {
        planType = 'monthly';
      }
    }

    
    
    
    
    
    

    setState({
      isPremium,
      loading: false,
      planType,
      expirationDate,
    });
  }, []);

  const checkSubscription = useCallback(async () => {
    try {
      const customerInfo = await Purchases.getCustomerInfo();
      updateStateFromCustomerInfo(customerInfo);
    } catch (e) {
      console.error('RevenueCat Error:', e);
      setState(prev => ({ ...prev, loading: false }));
    }
  }, [updateStateFromCustomerInfo]);

  useEffect(() => {
    checkSubscription();

    const listener = Purchases.addCustomerInfoUpdateListener((info) => {
      updateStateFromCustomerInfo(info);
    });

    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        checkSubscription();
      }
    });

    return () => {
      listener();
      subscription.remove();
    };
  }, [checkSubscription, updateStateFromCustomerInfo]);

  const purchasePackage = async (packageToBuy: any) => {
    try {
      const { customerInfo } = await Purchases.purchasePackage(packageToBuy);
      updateStateFromCustomerInfo(customerInfo);

      const entitlement = customerInfo.entitlements.active[SubscriptionConfig.premiumEntitlementId];
      return { success: true, isPremium: entitlement !== undefined };
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
      updateStateFromCustomerInfo(customerInfo);

      const entitlement = customerInfo.entitlements.active[SubscriptionConfig.premiumEntitlementId];
      return { success: true, isPremium: entitlement !== undefined };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  };

  const getManageSubscriptionUrl = async () => {
    try {
      if (typeof Purchases.getManagementURL === 'function') {
        const url = await Purchases.getManagementURL();
        if (url) return { success: true, url };
      }

      
      return {
        success: true,
        url: 'https://play.google.com/store/account/subscriptions'
      };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  };

  return (
    <SubscriptionContext.Provider
      value={{
        ...state,
        purchasePackage,
        restorePurchases,
        getManageSubscriptionUrl,
        refreshSubscription: checkSubscription,
        updateSubscriptionState: updateStateFromCustomerInfo,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
}
