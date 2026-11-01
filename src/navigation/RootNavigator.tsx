

import React from 'react';
import { Platform } from 'react-native';
import BootSplash from 'react-native-bootsplash';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/HomeScreen';
import ThemeDetailScreen from '../screens/ThemeDetailScreen';
import ThemeHomeScreenPreview from '../screens/ThemeHomeScreenPreview';
import ThemeExploreScreen from '../screens/ThemeExploreScreen';
import SavedThemesScreen from '../screens/SavedThemesScreen';
import SettingsScreen from '../screens/SettingsScreen';
import PremiumScreen from '../screens/PremiumScreen';
import IconManagementScreen from '../screens/IconManagementScreen';
import WallpaperScreen from '../screens/WallpaperScreen';
import CustomTabBar from '../components/CustomTabBar';
import { SubscriptionProvider } from '../context/SubscriptionContext';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
        }}
      />
      <Tab.Screen
        name="Themes"
        component={ThemeExploreScreen}
        options={{
          tabBarLabel: 'Themes',
        }}
      />
      <Tab.Screen
        name="Wallpapers"
        component={WallpaperScreen}
        options={{
          tabBarLabel: 'Wallpapers',
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: 'Settings',
        }}
      />
    </Tab.Navigator>
  );
}

export default function RootNavigator() {
  return (
    <SubscriptionProvider>
      <NavigationContainer onReady={() => {
        if (Platform.OS === 'android') {
          BootSplash.hide();
        }
      }}>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="HomeStack" component={MainTabs} />
          <Stack.Screen name="ThemeDetail" component={ThemeDetailScreen} />
          <Stack.Screen name="ThemeHomeScreenPreview" component={ThemeHomeScreenPreview} />
          <Stack.Screen name="SavedThemes" component={SavedThemesScreen} />
          <Stack.Screen
            name="Premium"
            component={PremiumScreen}
            options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
          />
          <Stack.Screen name="IconManagement" component={IconManagementScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SubscriptionProvider>
  );
}
