/**
 * Navigation type definitions and parameters
 */

import { Theme } from './index';

export type RootStackParamList = {
  Home: undefined;
  ThemeDetail: { themeId: Theme };
  Settings: undefined;
  HomeStack: undefined;
};

export type HomeStackParamList = {
  Home: undefined;
  ThemeDetail: { themeId: Theme };
};

export type NavigationProps = {
  navigate: (screen: keyof RootStackParamList, params?: any) => void;
  goBack: () => void;
};
