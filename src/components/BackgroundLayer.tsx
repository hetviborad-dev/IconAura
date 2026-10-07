import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import type { ThemeLayer } from '../types/data';
import { BACKGROUND_PATTERNS } from '../data/patterns';

interface BackgroundLayerProps {
  layer: ThemeLayer;
  size: number;
}

export default function BackgroundLayer({ layer, size }: BackgroundLayerProps) {
  if (layer.type === 'color') {
    return <View style={[styles.canvas, { backgroundColor: layer.value }]} />;
  }

  const patternImage = BACKGROUND_PATTERNS[layer.value];
  if (!patternImage) {
    console.warn(`Background pattern not found: ${layer.value}`);
    return <View style={[styles.canvas, { backgroundColor: '#eee' }]} />;
  }

  return (
    <Image
      source={patternImage}
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
