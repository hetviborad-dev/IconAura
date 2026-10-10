import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useColorScheme } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { Colors, Spacing, Typography, Radius } from '../constants/design';

export default function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const isDarkMode = useColorScheme() === 'dark';
  const insets = useSafeAreaInsets();

  const activeColor = isDarkMode ? '#FFFFFF' : Colors.textPrimary;
  const inactiveColor = isDarkMode ? '#888888' : Colors.textTertiary;

  const tabBarBg = isDarkMode
    ? 'rgba(30, 30, 30, 0.8)'
    : 'rgba(255, 255, 255, 0.8)';

  return (
    <View style={[styles.container, { bottom: insets.bottom + 16 }]}>
      <View style={[styles.tabBar, { backgroundColor: tabBarBg }]}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label = options.tabBarLabel ?? options.title ?? route.name;
          const isFocused = state.index === index;

          // Use an explicit mapping to avoid any ambiguity
          const iconName = route.name === 'Home' ? 'home' :
                           route.name === 'Settings' ? 'settings' : 'help-circle';

          return (
            <TouchableOpacity
              key={route.key}
              onPress={() => navigation.navigate(route.name)}
              style={styles.tabItem}
              activeOpacity={0.7}
            >
              <Icon
                name={iconName}
                size={24}
                color={isFocused ? activeColor : inactiveColor}
              />
              <Text style={[
                styles.label,
                { color: isFocused ? activeColor : inactiveColor }
              ]}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  tabBar: {
    flexDirection: 'row',
    height: 64,
    paddingHorizontal: 20,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: 'rgba(150, 150, 150, 0.2)',
    alignItems: 'center',
    justifyContent: 'space-around',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
});
