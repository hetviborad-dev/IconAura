/**
 * Root Navigator - Tab-based navigation with Home and Settings
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useColorScheme } from 'react-native';
import HomeScreen from '../screens/HomeScreen';
import SettingsScreen from '../screens/SettingsScreen';
import { RootStackParamList } from '../types/navigation';
import { Colors } from '../constants/design';

const Tab = createBottomTabNavigator<RootStackParamList>();

export default function RootNavigator() {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundColor = isDarkMode ? '#1E1E1E' : Colors.background;
  const activeColor = isDarkMode ? '#FFFFFF' : Colors.textPrimary;
  const inactiveColor = isDarkMode ? '#888888' : Colors.textTertiary;
  const borderTopColor = isDarkMode ? '#333333' : Colors.border;

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor,
            borderTopColor,
            borderTopWidth: 1,
            paddingBottom: 8,
            paddingTop: 8,
            height: 60,
          },
          tabBarActiveTintColor: activeColor,
          tabBarInactiveTintColor: inactiveColor,
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '500',
            marginTop: -2,
          },
        }}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            tabBarLabel: 'Home',
            tabBarIcon: ({ color }) => (
              <TabIcon icon="🏠" color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            tabBarLabel: 'Settings',
            tabBarIcon: ({ color }) => (
              <TabIcon icon="⚙️" color={color} />
            ),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

interface TabIconProps {
  icon: string;
  color: string;
}

function TabIcon({ icon }: TabIconProps) {
  return <>{icon}</>;
}
