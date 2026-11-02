import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import type { ThemeLayer } from '../types/data';

interface BackgroundLayerProps {
  layer: ThemeLayer;
  size: number;
}

export default function BackgroundLayer({ layer, size }: BackgroundLayerProps) {
  if (layer.type === 'color') {
    const colorStyle = { backgroundColor: layer.value };
    return <View style={[styles.canvas, colorStyle]} />;
  }

  const sizeStyle = { width: size, height: size };
  const patternUrl = layer.value.startsWith('http') ? layer.value : null;

  if (!patternUrl) {
    console.warn(`Background pattern URL not found in layer value: ${layer.value}`);
    const fallbackStyle = { backgroundColor: '#eee' };
    return <View style={[styles.canvas, fallbackStyle]} />;
  }

  return (
    <Image
      source={{ uri: patternUrl }}
      style={[styles.canvas, sizeStyle]}
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
