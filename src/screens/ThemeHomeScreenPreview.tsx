import React, { useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { ThemeDefinition } from '../types/data';
import ThemePreviewCard from '../components/ThemePreviewCard';
import Icon from 'react-native-vector-icons/Ionicons';

interface Props {
  navigation: NativeStackNavigationProp<RootStackParamList, 'ThemeHomeScreenPreview'>;
  route: {
    params: {
      theme: ThemeDefinition;
    };
  };
}

export default function ThemeHomeScreenPreview({ navigation, route }: Props) {
  const { theme } = route.params;

  return (
    <View style={styles.container}>
      <ThemePreviewCard theme={theme} />
      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => navigation.goBack()}
      >
        <Icon name="close" size={28} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 100,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
