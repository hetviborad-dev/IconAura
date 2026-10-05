/**
 * Application data and configuration
 */

import { ThemeDefinition, SupportedAppDefinition } from '../types/index';

export const THEMES: Record<string, ThemeDefinition> = {
  'mono-light': {
    id: 'mono-light',
    name: 'Mono Light',
    description: 'Black icon on white background',
    iconColor: '#000000',
    backgroundColor: '#FFFFFF',
  },
  'mono-white': {
    id: 'mono-white',
    name: 'Mono White',
    description: 'White icon on white background',
    iconColor: '#FFFFFF',
    backgroundColor: '#FFFFFF',
  },
  'mono-grey': {
    id: 'mono-grey',
    name: 'Mono Grey',
    description: 'Black icon on grey background',
    iconColor: '#000000',
    backgroundColor: '#E8E8E8',
  },
};

export const SUPPORTED_APPS: Record<string, SupportedAppDefinition> = {
  instagram: {
    id: 'instagram',
    name: 'Instagram',
    packageName: 'com.instagram.android',
    description: 'Connect with friends and share your moments',
  },
  whatsapp: {
    id: 'whatsapp',
    name: 'WhatsApp',
    packageName: 'com.whatsapp',
    description: 'Send messages and make calls',
  },
};

export const APP_NAME = 'IconAura';
export const APP_VERSION = '1.0.0';
