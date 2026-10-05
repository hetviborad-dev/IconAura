/**
 * IconAura - Premium Android Customization App
 * Create custom home-screen shortcuts with beautiful icon themes
 *
 * @format
 */

import React from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
// @ts-ignore - gesture-handler doesn't have TS types but is required by React Navigation
import 'react-native-gesture-handler';
import RootNavigator from './src/navigation/RootNavigator';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
      />
      <RootNavigator />
    </SafeAreaProvider>
  );
}

export default App;
