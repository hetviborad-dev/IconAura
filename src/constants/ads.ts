import { TestIds } from 'react-native-google-mobile-ads';


export const AdConfig = {
  development: {
    banner: TestIds.BANNER,
    interstitial: TestIds.INTERSTITIAL,
    rewarded: TestIds.REWARDED,
    appId: 'ca-app-pub-3940256099942544~3347511713', 
  },
  production: {
    banner: 'ca-app-pub-3525297377603048/3472239437', 
    interstitial: 'ca-app-pub-3525297377603048/4286802660',
    rewarded: 'ca-app-pub-3525297377603048/7296109382',
    appId: 'ca-app-pub-3525297377603048~1911745756', 
  },
};

export const currentAdIds = __DEV__ ? AdConfig.development : AdConfig.production;
