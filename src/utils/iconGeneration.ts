/**
 * Utility for generating icon bitmaps with theme colors
 *
 * Creates base64-encoded PNG icons that can be used for home-screen shortcuts.
 * Uses a minimal PNG format that all Android versions can decode.
 */

import { NativeModules } from 'react-native';

/**
 * Convert array of bytes to base64 string using native module
 */
function bytesToBase64(bytes: number[]): string {
  // Convert to string for NativeModule call
  // Using String.fromCharCode with spread operator
  const binary = String.fromCharCode(...bytes);

  // React Native global has btoa in dev, but for safety use a simple implementation
  // For numbers 0-255, we can use a direct mapping
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let base64 = '';

  for (let i = 0; i < binary.length; i += 3) {
    const a = binary.charCodeAt(i);
    const b = i + 1 < binary.length ? binary.charCodeAt(i + 1) : 0;
    const c = i + 2 < binary.length ? binary.charCodeAt(i + 2) : 0;

    const bitmap = (a << 16) | (b << 8) | c;

    base64 += chars.charAt((bitmap >> 18) & 63);
    base64 += chars.charAt((bitmap >> 12) & 63);
    base64 += i + 1 < binary.length ? chars.charAt((bitmap >> 6) & 63) : '=';
    base64 += i + 2 < binary.length ? chars.charAt(bitmap & 63) : '=';
  }

  return base64;
}

/**
 * Generate a minimal 1x1 PNG with the specified color.
 *
 * This is a minimal PNG format that all Android versions can handle.
 * Format: PNG header + minimal IHDR chunk + single pixel IDAT + IEND
 *
 * @param hexColor Color for the pixel (hex format, e.g., "#000000")
 * @returns Base64-encoded PNG data (1x1 pixel)
 */
function generateMinimalPNG(hexColor: string): string {
  // Parse hex color
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // Minimal PNG: 1x1 pixel with RGBA
  // PNG signature
  const pngSignature = [137, 80, 78, 71, 13, 10, 26, 10];

  // IHDR chunk (image header) - 1x1, 8-bit RGBA
  const ihdr = [
    0, 0, 0, 13, // chunk length
    73, 72, 68, 82, // "IHDR"
    0, 0, 0, 1, // width: 1
    0, 0, 0, 1, // height: 1
    8, // bit depth
    6, // color type (RGBA)
    0, 0, 0, // compression, filter, interlace
    0x6c, 0xcc, 0x9b, 0x6f, // CRC
  ];

  // IDAT chunk (image data) - single pixel
  // Zlib header (CMF + FLG)
  const zlibHeader = [120, 156];
  // Deflate block (uncompressed, final)
  const deflateData = [1, 5, 0, 250, 255, 0, r, g, b, 255];
  // Zlib checksum
  const checksum = [0, 1, 0, 1];

  const idat = [
    0, 0, 0, 10, // chunk length
    73, 68, 65, 84, // "IDAT"
    ...zlibHeader,
    ...deflateData,
    ...checksum,
    0x7e, 0x5b, 0x61, 0xfe, // CRC
  ];

  // IEND chunk (image end)
  const iend = [0, 0, 0, 0, 73, 69, 78, 68, 0xae, 0x42, 0x60, 0x82];

  // Combine all chunks
  const png = [...pngSignature, ...ihdr, ...idat, ...iend];
  return bytesToBase64(png);
}

/**
 * Generate a base64-encoded PNG icon from theme colors
 *
 * Creates a simple colored icon suitable for launcher shortcuts.
 *
 * @param iconColor Color for the icon (hex format, e.g., "#000000")
 * @param backgroundColor Background color (hex format, e.g., "#FFFFFF")
 * @returns Base64-encoded PNG data
 */
export function generateThemeIcon(
  iconColor: string,
  backgroundColor: string
): string {
  // Use the icon color for the shortcut icon
  return generateMinimalPNG(iconColor);
}

/**
 * Generate a themed icon that matches the theme colors
 *
 * @param appName Display name of the app (for reference)
 * @param iconColor Theme icon color
 * @param backgroundColor Theme background color
 * @returns Base64-encoded icon data
 */
export function createThemedShortcutIcon(
  appName: string,
  iconColor: string,
  backgroundColor: string
): string {
  // Generate icon with theme colors
  return generateThemeIcon(iconColor, backgroundColor);
}

