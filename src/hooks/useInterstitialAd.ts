import { useEffect, useState } from 'react';
import { InterstitialAd, AdEventType } from 'react-native-google-mobile-ads';
import { currentAdIds } from '../constants/ads';

export function useInterstitialAd() {
  const [loaded, setLoaded] = useState(false);
  const [ad, setAd] = useState<InterstitialAd | null>(null);

  useEffect(() => {
    
    const interstitial = InterstitialAd.createForAdRequest(currentAdIds.interstitial);

    interstitial.addAdEventListener(AdEventType.LOADED, () => {
      setLoaded(true);
    });

    interstitial.addAdEventListener(AdEventType.CLOSED, () => {
      setLoaded(false);
      
      interstitial.load();
    });

    interstitial.addAdEventListener(AdEventType.ERROR, (error) => {
      console.error('Interstitial Ad Error:', error);
      setLoaded(false);
    });

    setAd(interstitial);
    interstitial.load();

    return () => {
      interstitial.setAdEventListener(AdEventType.LOADED, () => {});
      interstitial.setAdEventListener(AdEventType.CLOSED, () => {});
      interstitial.setAdEventListener(AdEventType.ERROR, () => {});
    };
  }, []);

  const showAd = () => {
    if (loaded && ad) {
      ad.show();
    } else {
      console.log('Ad not loaded yet');
      ad?.load();
    }
  };

  return { showAd, loaded };
}
