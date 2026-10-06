import type { ComponentType } from 'react';
import type { SvgProps } from 'react-native-svg';
import type { AppId } from '../types/data';
import Instagram from '../assets/icons/simple-icons--instagram.svg';
import WhatsApp from '../assets/icons/simple-icons--whatsapp.svg';
import YouTube from '../assets/icons/simple-icons--youtube.svg';
import Spotify from '../assets/icons/simple-icons--spotify.svg';
import Telegram from '../assets/icons/simple-icons--telegram.svg';
import Facebook from '../assets/icons/simple-icons--facebook.svg';
import Chrome from '../assets/icons/simple-icons--googlechrome.svg';
import Gmail from '../assets/icons/simple-icons--gmail.svg';
import TikTok from '../assets/icons/simple-icons--tiktok.svg';
import X from '../assets/icons/simple-icons--x.svg';
import Discord from '../assets/icons/simple-icons--discord.svg';
import Reddit from '../assets/icons/simple-icons--reddit.svg';
import Netflix from '../assets/icons/simple-icons--netflix.svg';
import Snapchat from '../assets/icons/simple-icons--snapchat.svg';
import Uber from '../assets/icons/simple-icons--uber.svg';
import PayPal from '../assets/icons/simple-icons--paypal.svg';
import GoogleMaps from '../assets/icons/simple-icons--googlemaps.svg';
import GoogleDrive from '../assets/icons/simple-icons--googledrive.svg';
import GooglePhotos from '../assets/icons/simple-icons--googlephotos.svg';
import GooglePlay from '../assets/icons/simple-icons--googleplay.svg';
import GoogleCalendar from '../assets/icons/simple-icons--googlecalendar.svg';
import GoogleMeet from '../assets/icons/simple-icons--googlemeet.svg';
import Zoom from '../assets/icons/simple-icons--zoom.svg';
import Pinterest from '../assets/icons/simple-icons--pinterest.svg';
import Twitch from '../assets/icons/simple-icons--twitch.svg';
import Steam from '../assets/icons/simple-icons--steam.svg';
import Roblox from '../assets/icons/simple-icons--roblox.svg';
import Airbnb from '../assets/icons/simple-icons--airbnb.svg';
import DoorDash from '../assets/icons/simple-icons--doordash.svg';
import UberEats from '../assets/icons/simple-icons--ubereats.svg';
import Etsy from '../assets/icons/simple-icons--etsy.svg';
import Ebay from '../assets/icons/simple-icons--ebay.svg';
import CashApp from '../assets/icons/simple-icons--cashapp.svg';
import Venmo from '../assets/icons/simple-icons--venmo.svg';
import Coinbase from '../assets/icons/simple-icons--coinbase.svg';
import Dropbox from '../assets/icons/simple-icons--dropbox.svg';
import Notion from '../assets/icons/simple-icons--notion.svg';
import Shazam from '../assets/icons/simple-icons--shazam.svg';
import SoundCloud from '../assets/icons/simple-icons--soundcloud.svg';
import Signal from '../assets/icons/simple-icons--signal.svg';
import Line from '../assets/icons/simple-icons--line.svg';
import Viber from '../assets/icons/simple-icons--viber.svg';
import WeChat from '../assets/icons/simple-icons--wechat.svg';
import Threads from '../assets/icons/simple-icons--threads.svg';
import Tinder from '../assets/icons/simple-icons--tinder.svg';
import Duolingo from '../assets/icons/simple-icons--duolingo.svg';
import Strava from '../assets/icons/simple-icons--strava.svg';
import Fitbit from '../assets/icons/simple-icons--fitbit.svg';
import Wikipedia from '../assets/icons/simple-icons--wikipedia.svg';
import Messenger from '../assets/icons/simple-icons--messenger.svg';

export const APP_ICON_COMPONENTS: Record<AppId, ComponentType<SvgProps>> = {
  instagram: Instagram,
  whatsapp: WhatsApp,
  youtube: YouTube,
  spotify: Spotify,
  telegram: Telegram,
  facebook: Facebook,
  chrome: Chrome,
  gmail: Gmail,
  tiktok: TikTok,
  x: X,
  discord: Discord,
  reddit: Reddit,
  netflix: Netflix,
  snapchat: Snapchat,
  uber: Uber,
  paypal: PayPal,
  'google-maps': GoogleMaps,
  'google-drive': GoogleDrive,
  'google-photos': GooglePhotos,
  'google-play': GooglePlay,
  'google-calendar': GoogleCalendar,
  'google-meet': GoogleMeet,
  zoom: Zoom,
  pinterest: Pinterest,
  twitch: Twitch,
  steam: Steam,
  roblox: Roblox,
  airbnb: Airbnb,
  doordash: DoorDash,
  'uber-eats': UberEats,
  etsy: Etsy,
  ebay: Ebay,
  'cash-app': CashApp,
  venmo: Venmo,
  coinbase: Coinbase,
  dropbox: Dropbox,
  notion: Notion,
  shazam: Shazam,
  soundcloud: SoundCloud,
  signal: Signal,
  line: Line,
  viber: Viber,
  wechat: WeChat,
  threads: Threads,
  tinder: Tinder,
  duolingo: Duolingo,
  strava: Strava,
  fitbit: Fitbit,
  wikipedia: Wikipedia,
  messenger: Messenger,
};

export const APP_ICON_ASSET_IDS: Record<AppId, string> = {
  instagram: 'instagram', whatsapp: 'whatsapp', youtube: 'youtube', spotify: 'spotify', telegram: 'telegram',
  facebook: 'facebook', chrome: 'googlechrome', gmail: 'gmail', tiktok: 'tiktok', x: 'x', discord: 'discord',
  reddit: 'reddit', netflix: 'netflix', snapchat: 'snapchat', uber: 'uber', paypal: 'paypal',
  'google-maps': 'googlemaps', 'google-drive': 'googledrive', 'google-photos': 'googlephotos',
  'google-play': 'googleplay', 'google-calendar': 'googlecalendar', 'google-meet': 'googlemeet', zoom: 'zoom',
  pinterest: 'pinterest', twitch: 'twitch', steam: 'steam', roblox: 'roblox', airbnb: 'airbnb',
  doordash: 'doordash', 'uber-eats': 'ubereats', etsy: 'etsy', ebay: 'ebay', 'cash-app': 'cashapp',
  venmo: 'venmo', coinbase: 'coinbase', dropbox: 'dropbox', notion: 'notion', shazam: 'shazam',
  soundcloud: 'soundcloud', signal: 'signal', line: 'line', viber: 'viber', wechat: 'wechat',
  threads: 'threads', tinder: 'tinder', duolingo: 'duolingo', strava: 'strava', fitbit: 'fitbit',
  wikipedia: 'wikipedia', messenger: 'messenger',
};
