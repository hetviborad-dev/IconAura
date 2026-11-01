/**
 * IconAura - Premium Android Customization App
 * Create custom home-screen shortcuts with beautiful icon themes
 *
 * @format
 */

import React from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
// @ts-ignore - gesture-handler doesn't have TS types but is required by React Navigation
import 'react-native-gesture-handler';
import RootNavigator from './src/navigation/RootNavigator';
import { AppDetectionProvider } from './src/context/AppDetectionContext';
import Purchases from 'react-native-purchases';
import { SubscriptionConfig } from './src/constants/subscriptions';

Purchases.configure({ apiKey: SubscriptionConfig.apiKey });

// Warm up RevenueCat offerings as early as possible so the paywall
// can render without waiting for a network fetch on navigation.
Purchases.getOfferings().catch(() => {});

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <AppDetectionProvider>
        <StatusBar
          barStyle={isDarkMode ? 'light-content' : 'dark-content'}
          backgroundColor="transparent"
          translucent={true}
        />
        <RootNavigator />
      </AppDetectionProvider>
    </SafeAreaProvider>
  );
}

export default App;
