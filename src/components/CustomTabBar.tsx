import React, { useEffect, useRef } from 'react';
import { View, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { Colors } from '../constants/design';
import FontText from './FontText';

export default function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  const activeColor = Colors.primary;
  const inactiveColor = Colors.textTertiary;

  const tabBarBg = 'rgba(28, 28, 30, 0.8)'; 

  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const activeRouteName = state.routes[state.index].name;

    if (activeRouteName === 'Themes') {
      Animated.timing(translateY, {
        toValue: 150, 
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [state.index, translateY]);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          bottom: insets.bottom + 16,
          transform: [{ translateY }]
        }
      ]}
    >
      <View style={[styles.tabBar, { backgroundColor: tabBarBg }]}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label = options.tabBarLabel ?? options.title ?? route.name;
          const isFocused = state.index === index;

          
          const iconName = route.name === 'Home' ? 'home' :
                           route.name === 'Themes' ? 'color-palette' :
                           route.name === 'Wallpapers' ? 'image' :
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
              <FontText color={isFocused ? activeColor : inactiveColor} size={12} name="semibold" style={{ marginTop: 4 }}>
                {label}
              </FontText>
            </TouchableOpacity>
          );
        })}
      </View>
    </Animated.View>
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
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});