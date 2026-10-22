/**
 * RevenueCat Configuration
 */
export const SubscriptionConfig = {
  // Replace this with your Public API Key from the RevenueCat Dashboard
  apiKey: 'goog_asJHfhJKFXeaSMtLHjrQGZHPoTt',

  // The identifier for the premium entitlement
  premiumEntitlementId: 'premium',

  // The offering identifier that contains your subscription packages
  offeringId: 'default_offering',

  // Fallback prices for testing/UI purposes when RevenueCat is not configured
  fallbackPrices: {
    monthly: '$4.99/mo',
    annual: '$39.99/yr',
    lifetime: '$99.99',
  },
};
