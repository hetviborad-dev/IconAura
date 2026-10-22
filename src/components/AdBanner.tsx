import React from 'react';
import { View, StyleSheet } from 'react-native';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
import { currentAdIds } from '../constants/ads';
import { useSubscription } from '../hooks/useSubscription';

export default function AdBanner() {
  const { isPremium } = useSubscription();

  if (isPremium) return null;

  return (
    <View style={styles.container}>
      <BannerAd
        unitId={currentAdIds.banner}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingVertical: 8,
    backgroundColor: 'transparent',
    zIndex: 1000,
  },
});
