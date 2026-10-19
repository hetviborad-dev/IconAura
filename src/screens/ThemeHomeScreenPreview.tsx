import React from 'react';
import {
  View,
  StyleSheet,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { ThemeDefinition } from '../types/data';
import ThemePreviewCard from '../components/ThemePreviewCard';

interface Props {
  navigation: NativeStackNavigationProp<RootStackParamList, 'ThemeHomeScreenPreview'>;
  route: {
    params: {
      theme: ThemeDefinition;
    };
  };
}

export default function ThemeHomeScreenPreview({ route }: Props) {
  const { theme } = route.params;

  return (
    <ThemePreviewCard theme={theme} />
  );
}

const styles = StyleSheet.create({
  // Styles moved to ThemePreviewCard
});
