/**
 * Navigation type definitions and parameters
 */

import { Theme, ThemeDefinition } from './data';

export type RootStackParamList = {
  HomeStack: undefined;
  ThemeDetail: { theme: ThemeDefinition };
  ThemeCategory: { categoryId: import('./data').ThemeCategoryId };
  Settings: undefined;
  IconManagement: undefined;
};

export type HomeStackParamList = {
  Home: undefined;
  ThemeDetail: { theme: ThemeDefinition };
  ThemeCategory: { categoryId: import('./data').ThemeCategoryId };
};

export type NavigationProps = {
  navigate: (screen: keyof RootStackParamList, params?: any) => void;
  goBack: () => void;
};
