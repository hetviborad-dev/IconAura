/**
 * Navigation type definitions and parameters
 */

import { Theme } from './index';

export type RootStackParamList = {
  HomeStack: undefined;
  ThemeDetail: { themeId: Theme };
  ThemeCategory: { categoryId: import('./data').ThemeCategoryId };
  Settings: undefined;
  IconManagement: undefined;
};

export type HomeStackParamList = {
  Home: undefined;
  ThemeDetail: { themeId: Theme };
  ThemeCategory: { categoryId: import('./data').ThemeCategoryId };
};

export type NavigationProps = {
  navigate: (screen: keyof RootStackParamList, params?: any) => void;
  goBack: () => void;
};
