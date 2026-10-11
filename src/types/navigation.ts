/**
 * Navigation type definitions and parameters
 */

import { Theme, ThemeDefinition } from './data';

export type RootStackParamList = {
  HomeStack: undefined;
  ThemeDetail: { theme: ThemeDefinition };
  Settings: undefined;
  IconManagement: undefined;
  Wallpaper: undefined;
};

export type HomeStackParamList = {
  Home: undefined;
  ThemeDetail: { theme: ThemeDefinition };
};

export type NavigationProps = {
  navigate: (screen: keyof RootStackParamList, params?: any) => void;
  goBack: () => void;
};
