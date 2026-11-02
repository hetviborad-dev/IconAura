import React from 'react';
import { Text, TextProps } from 'react-native';
import { Colors } from '../constants/design';
import { fonts } from '../assets';

interface FontTextProps extends TextProps {
  children: React.ReactNode;
  color?: string;
  pureColor?: string;
  size?: number;
  name?: 'default' | 'regular' | 'medium' | 'bold' | 'semibold';
  lineHeightFactor?: number;
  lines?: number;
  opacity?: number;
  pTop?: number;
  pLeft?: number;
  pRight?: number;
  pBottom?: number;
  textAlign?: 'left' | 'center' | 'right';
  textDecoration?: 'underline' | 'line-through' | 'none' | null;
  [key: string]: any;
}

const FontText: React.FC<FontTextProps> = ({
  children,
  style,
  color,
  pureColor,
  size,
  name = 'default',
  lineHeightFactor,
  lines = 0,
  opacity,
  pTop = 0,
  pLeft = 0,
  pRight = 0,
  pBottom = 0,
  textAlign,
  textDecoration,
  ...rest
}) => {
  const textStyle: any = {
    fontFamily: fonts[name],
  };

  if (size !== undefined) {
    textStyle.fontSize = size;
    textStyle.lineHeight = size * (lineHeightFactor ?? 1.2);
  }

  const resolvedColor = pureColor || (color ? (Colors as any)[color] || color : undefined);
  if (resolvedColor) {
    textStyle.color = resolvedColor;
  }

  if (opacity !== undefined) {
    textStyle.opacity = opacity;
  }

  if (pTop || pLeft || pRight || pBottom) {
    textStyle.paddingTop = pTop;
    textStyle.paddingLeft = pLeft;
    textStyle.paddingRight = pRight;
    textStyle.paddingBottom = pBottom;
  }

  if (textAlign) {
    textStyle.textAlign = textAlign;
  }

  if (textDecoration) {
    textStyle.textDecorationLine = textDecoration;
    if (resolvedColor) {
      textStyle.textDecorationColor = resolvedColor;
    }
    textStyle.textDecorationStyle = 'solid';
  }

  return (
    <Text
      allowFontScaling={false}
      numberOfLines={lines}
      {...rest}
      style={[style, textStyle]}>
      {children}
    </Text>
  );
};

export default FontText;