import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import type { ThemeLayer } from '../types/data';

interface BackgroundLayerProps {
  layer: ThemeLayer;
  size: number;
}

export default function BackgroundLayer({ layer, size }: BackgroundLayerProps) {
  if (layer.type === 'color') {
    return <View style={[styles.canvas, { backgroundColor: layer.value }]} />;
  }

  const patternUrl = layer.value.startsWith('http') ? layer.value : null;
  console.log('BackgroundLayer patternUrl:', patternUrl);

  if (!patternUrl) {
    console.warn(`Background pattern URL not found in layer value: ${layer.value}`);
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
