

import { Theme, ThemeDefinition } from './data';

export type RootStackParamList = {
  HomeStack: undefined;
  ThemeDetail: { theme: ThemeDefinition };
  ThemeHomeScreenPreview: { theme: ThemeDefinition };
  ThemeExplore: undefined;
  SavedThemes: undefined;
  Settings: undefined;
  Premium: undefined;
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
