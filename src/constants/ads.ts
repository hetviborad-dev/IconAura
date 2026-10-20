import { TestIds } from 'react-native-google-mobile-ads';

/**
 * AdMob Configuration
 * Replace the values in the 'production' object with your actual IDs from the AdMob console.
 * Keep 'development' as TestIds to avoid getting your account banned during testing.
 */
export const AdConfig = {
  development: {
    banner: TestIds.BANNER,
    interstitial: TestIds.INTERSTITIAL,
    rewarded: TestIds.REWARDED,
    appId: 'ca-app-pub-3940256099942544~3347511713', // Google's test App ID
  },
  production: {
    banner: 'ca-app-pub-3525297377603048/3472239437', // Your Banner Ad Unit ID
    interstitial: 'ca-app-pub-3525297377603048/4286802660',
    rewarded: 'ca-app-pub-3525297377603048/7296109382',
    appId: 'ca-app-pub-3525297377603048~1911745756', // Your actual App ID
  },
};

export const currentAdIds = __DEV__ ? AdConfig.development : AdConfig.production;
