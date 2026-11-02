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
      interstitial.removeAllListeners();
    };
  }, []);

  const showAd = () => {
    if (loaded && ad) {
      ad.show();
    } else {
      ad?.load();
    }
  };

  return { showAd, loaded };
}
