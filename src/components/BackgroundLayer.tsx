import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import type { ThemeLayer } from '../types/data';

const PATTERN_URLS: Record<string, string> = {
  'crimson-bloom': 'https://nekvkaquyfvygstytbfv.supabase.co/storage/v1/object/public/theme-previews/crystle_flower.png',
};

interface BackgroundLayerProps {
  layer: ThemeLayer;
  size: number;
}

export default function BackgroundLayer({ layer, size }: BackgroundLayerProps) {
  if (layer.type === 'color') {
    return <View style={[styles.canvas, { backgroundColor: layer.value }]} />;
  }

  // If the value is a URL, use it directly. Otherwise, look up the pattern keyword.
  const patternUrl = layer.value.startsWith('http')
    ? layer.value
    : PATTERN_URLS[layer.value];

  if (!patternUrl) {
    console.warn(`Background pattern not found: ${layer.value}`);
    return <View style={[styles.canvas, { backgroundColor: '#eee' }]} />;
  }

  return (
    <Image
      source={{ uri: patternUrl }}
      style={[styles.canvas, { width: size, height: size }]}
      resizeMode="cover"
    />
  );
}

const styles = StyleSheet.create({
  canvas: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
});
