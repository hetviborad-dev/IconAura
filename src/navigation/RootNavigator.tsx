/**
 * Root Navigator - Stack and tab-based navigation
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useColorScheme } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import HomeScreen from '../screens/HomeScreen';
import ThemeDetailScreen from '../screens/ThemeDetailScreen';
import ThemeCategoryScreen from '../screens/ThemeCategoryScreen';
import SettingsScreen from '../screens/SettingsScreen';
import { RootStackParamList } from '../types/navigation';
import { Colors } from '../constants/design';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

function HomeStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name="ThemeDetail"
        component={ThemeDetailScreen}
        options={{
          gestureEnabled: true,
        }}
      />
      <Stack.Screen name="ThemeCategory" component={ThemeCategoryScreen} />
    </Stack.Navigator>
  );
}

export default function RootNavigator() {
  const isDarkMode = useColorScheme() === 'dark';
  const insets = useSafeAreaInsets();

  const backgroundColor = isDarkMode ? '#1E1E1E' : Colors.background;
  const activeColor = isDarkMode ? '#FFFFFF' : Colors.textPrimary;
  const inactiveColor = isDarkMode ? '#888888' : Colors.textTertiary;
  const borderTopColor = isDarkMode ? '#333333' : Colors.border;

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarStyle: {
            backgroundColor,
            borderTopColor,
            borderTopWidth: 1,
            paddingBottom: insets.bottom + 8,
            paddingTop: 8,
            height: 60 + insets.bottom,
          },
          tabBarActiveTintColor: activeColor,
          tabBarInactiveTintColor: inactiveColor,
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '500',
            marginTop: -2,
          },
          tabBarIcon: ({ color, size }) => {
            let iconName: string = '';

            if (route.name === 'HomeStack') {
              iconName = 'home';
            } else if (route.name === 'Settings') {
              iconName = 'settings';
            }

            return (
              <Ionicons
                name={iconName}
                size={size}
                color={color}
              />
            );
          },
        })}
      >
        <Tab.Screen
          name="HomeStack"
          component={HomeStackNavigator}
          options={{
            tabBarLabel: 'Home',
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
    </NavigationContainer>
  );
}
