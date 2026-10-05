/**
 * Navigation type definitions and parameters
 */

export type RootStackParamList = {
  Home: undefined;
  Settings: undefined;
};

export type NavigationProps = {
  navigate: (screen: keyof RootStackParamList, params?: any) => void;
  goBack: () => void;
};
