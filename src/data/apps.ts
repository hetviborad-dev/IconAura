/**
 * Application definitions - source of truth for supported apps
 */

import { AppDefinition, AppId } from '../types/data';

/**
 * Supported applications with real Android package names
 * Extend this object to add more apps without modifying UI components
 */
export const APPS: Record<AppId, AppDefinition> = {
  instagram: { id: 'instagram', name: 'Instagram', packageName: 'com.instagram.android', description: 'Connect with friends and share your moments', icon: { fallbackColor: '#E4405F' } },
  whatsapp: { id: 'whatsapp', name: 'WhatsApp', packageName: 'com.whatsapp', description: 'Send messages and make calls', icon: { fallbackColor: '#25D366' } },
  youtube: { id: 'youtube', name: 'YouTube', packageName: 'com.google.android.youtube', description: 'Watch and share videos', icon: { fallbackColor: '#FF0000' } },
  spotify: { id: 'spotify', name: 'Spotify', packageName: 'com.spotify.music', description: 'Stream music and podcasts', icon: { fallbackColor: '#1DB954' } },
  telegram: { id: 'telegram', name: 'Telegram', packageName: 'org.telegram.messenger', description: 'Fast and secure messaging', icon: { fallbackColor: '#0088CC' } },
  facebook: { id: 'facebook', name: 'Facebook', packageName: 'com.facebook.katana', description: 'Connect with people you know', icon: { fallbackColor: '#1877F2' } },
  chrome: { id: 'chrome', name: 'Chrome', packageName: 'com.android.chrome', description: 'Browse the web fast', icon: { fallbackColor: '#4285F4' } },
  gmail: { id: 'gmail', name: 'Gmail', packageName: 'com.google.android.gm', description: 'Email from Google', icon: { fallbackColor: '#EA4335' } },
  tiktok: { id: 'tiktok', name: 'TikTok', packageName: 'com.zhiliaoapp.musically', description: 'Watch and create short videos', icon: { fallbackColor: '#000000' } },
  x: { id: 'x', name: 'X', packageName: 'com.twitter.android', description: 'Follow conversations and news', icon: { fallbackColor: '#000000' } },
  discord: { id: 'discord', name: 'Discord', packageName: 'com.discord', description: 'Chat and build communities', icon: { fallbackColor: '#5865F2' } },
  reddit: { id: 'reddit', name: 'Reddit', packageName: 'com.reddit.frontpage', description: 'Explore communities and discussions', icon: { fallbackColor: '#FF4500' } },
  netflix: { id: 'netflix', name: 'Netflix', packageName: 'com.netflix.mediaclient', description: 'Watch movies and series', icon: { fallbackColor: '#E50914' } },
  snapchat: { id: 'snapchat', name: 'Snapchat', packageName: 'com.snapchat.android', description: 'Share moments with friends', icon: { fallbackColor: '#FFFC00' } },
  uber: { id: 'uber', name: 'Uber', packageName: 'com.ubercab', description: 'Request rides', icon: { fallbackColor: '#000000' } },
  paypal: { id: 'paypal', name: 'PayPal', packageName: 'com.paypal.android.p2pmobile', description: 'Send and receive payments', icon: { fallbackColor: '#003087' } },
  'google-maps': { id: 'google-maps', name: 'Google Maps', packageName: 'com.google.android.apps.maps', description: 'Navigate and explore places', icon: { fallbackColor: '#4285F4' } },
  'google-drive': { id: 'google-drive', name: 'Google Drive', packageName: 'com.google.android.apps.docs', description: 'Store and share files', icon: { fallbackColor: '#0F9D58' } },
  'google-photos': { id: 'google-photos', name: 'Google Photos', packageName: 'com.google.android.apps.photos', description: 'Back up and organize photos', icon: { fallbackColor: '#4285F4' } },
  'google-play': { id: 'google-play', name: 'Google Play Store', packageName: 'com.android.vending', description: 'Discover apps and games', icon: { fallbackColor: '#34A853' } },
  'google-calendar': { id: 'google-calendar', name: 'Google Calendar', packageName: 'com.google.android.calendar', description: 'Manage your schedule', icon: { fallbackColor: '#4285F4' } },
  'google-meet': { id: 'google-meet', name: 'Google Meet', packageName: 'com.google.android.apps.meetings', description: 'Make video calls', icon: { fallbackColor: '#00897B' } },
  zoom: { id: 'zoom', name: 'Zoom', packageName: 'us.zoom.videomeetings', description: 'Join video meetings', icon: { fallbackColor: '#2D8CFF' } },
  pinterest: { id: 'pinterest', name: 'Pinterest', packageName: 'com.pinterest', description: 'Find and save inspiration', icon: { fallbackColor: '#E60023' } },
  twitch: { id: 'twitch', name: 'Twitch', packageName: 'tv.twitch.android.app', description: 'Watch live streams', icon: { fallbackColor: '#9146FF' } },
  steam: { id: 'steam', name: 'Steam', packageName: 'com.valvesoftware.android.steam.community', description: 'Connect with the Steam community', icon: { fallbackColor: '#171A21' } },
  roblox: { id: 'roblox', name: 'Roblox', packageName: 'com.roblox.client', description: 'Play and create games', icon: { fallbackColor: '#E2231A' } },
  airbnb: { id: 'airbnb', name: 'Airbnb', packageName: 'com.airbnb.android', description: 'Find places to stay', icon: { fallbackColor: '#FF5A5F' } },
  doordash: { id: 'doordash', name: 'DoorDash', packageName: 'com.dd.doordash', description: 'Order food and groceries', icon: { fallbackColor: '#EB1700' } },
  'uber-eats': { id: 'uber-eats', name: 'Uber Eats', packageName: 'com.ubercab.eats', description: 'Order food delivery', icon: { fallbackColor: '#06C167' } },
  etsy: { id: 'etsy', name: 'Etsy', packageName: 'com.etsy.android', description: 'Shop unique handmade goods', icon: { fallbackColor: '#F1641E' } },
  ebay: { id: 'ebay', name: 'eBay', packageName: 'com.ebay.mobile', description: 'Shop and sell online', icon: { fallbackColor: '#3665F3' } },
  'cash-app': { id: 'cash-app', name: 'Cash App', packageName: 'com.squareup.cash', description: 'Send and receive money', icon: { fallbackColor: '#00D632' } },
  venmo: { id: 'venmo', name: 'Venmo', packageName: 'com.venmo', description: 'Pay and split purchases', icon: { fallbackColor: '#008CFF' } },
  coinbase: { id: 'coinbase', name: 'Coinbase', packageName: 'com.coinbase.android', description: 'Manage your crypto', icon: { fallbackColor: '#0052FF' } },
  dropbox: { id: 'dropbox', name: 'Dropbox', packageName: 'com.dropbox.android', description: 'Store and sync files', icon: { fallbackColor: '#0061FF' } },
  notion: { id: 'notion', name: 'Notion', packageName: 'notion.id', description: 'Organize notes and projects', icon: { fallbackColor: '#000000' } },
  shazam: { id: 'shazam', name: 'Shazam', packageName: 'com.shazam.android', description: 'Identify music playing nearby', icon: { fallbackColor: '#0088FF' } },
  soundcloud: { id: 'soundcloud', name: 'SoundCloud', packageName: 'com.soundcloud.android', description: 'Stream music and audio', icon: { fallbackColor: '#FF5500' } },
  signal: { id: 'signal', name: 'Signal', packageName: 'org.thoughtcrime.securesms', description: 'Send private messages', icon: { fallbackColor: '#3A76F0' } },
  line: { id: 'line', name: 'LINE', packageName: 'jp.naver.line.android', description: 'Message and call friends', icon: { fallbackColor: '#06C755' } },
  viber: { id: 'viber', name: 'Viber', packageName: 'com.viber.voip', description: 'Call and message worldwide', icon: { fallbackColor: '#7360F2' } },
  wechat: { id: 'wechat', name: 'WeChat', packageName: 'com.tencent.mm', description: 'Message and connect', icon: { fallbackColor: '#07C160' } },
  threads: { id: 'threads', name: 'Threads', packageName: 'com.instagram.barcelona', description: 'Join public conversations', icon: { fallbackColor: '#000000' } },
  tinder: { id: 'tinder', name: 'Tinder', packageName: 'com.tinder', description: 'Meet new people', icon: { fallbackColor: '#FE3C72' } },
  duolingo: { id: 'duolingo', name: 'Duolingo', packageName: 'com.duolingo', description: 'Learn a language', icon: { fallbackColor: '#58CC02' } },
  strava: { id: 'strava', name: 'Strava', packageName: 'com.strava', description: 'Track activities and training', icon: { fallbackColor: '#FC4C02' } },
  fitbit: { id: 'fitbit', name: 'Fitbit', packageName: 'com.fitbit.FitbitMobile', description: 'Track health and fitness', icon: { fallbackColor: '#00B0B9' } },
  wikipedia: { id: 'wikipedia', name: 'Wikipedia', packageName: 'org.wikipedia', description: 'Read the free encyclopedia', icon: { fallbackColor: '#000000' } },
  messenger: { id: 'messenger', name: 'Messenger', packageName: 'com.facebook.orca', description: 'Message and call friends', icon: { fallbackColor: '#0866FF' } },
};

/** Get app definition by ID. */
export function getApp(appId: AppId): AppDefinition {
  const app = APPS[appId];
  if (!app) throw new Error(`App not found: ${appId}`);
  return app;
}

/** Get all supported apps as an array. */
export function getAllApps(): AppDefinition[] {
  return Object.values(APPS);
}

/** Get MVP apps (first 2 supported apps). */
export function getMvpApps(): AppDefinition[] {
  return [APPS.instagram, APPS.whatsapp];
}
