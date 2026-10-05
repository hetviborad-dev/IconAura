import React from 'react';
import { View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

export interface AppSvgIconProps {
  appName: string;
  iconColor: string;
  size?: number;
}

/**
 * 24x24 Instagram icon path
 */
const InstagramPath = "M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8 1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5 5 5 0 0 1-5 5 5 5 0 0 1-5-5 5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3z";

/**
 * 24x24 WhatsApp icon path
 */
const WhatsAppPath = "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004c-1.052 0-2.069.335-2.955.967l-.21.126-2.152-.564.574 2.035-.13.208a4.908 4.908 0 0 0-.667 2.55c0 2.685 2.187 4.874 4.877 4.874.678 0 1.335-.135 1.965-.394l.149.075 2.189.573-.575-2.051.11-.175a4.877 4.877 0 0 0 .786-2.662c.001-2.688-2.186-4.876-4.874-4.876";

export default function AppSvgIcon({ appName, iconColor, size = 24 }: AppSvgIconProps) {
  const normalizedName = appName.toLowerCase();

  let pathData = '';

  if (normalizedName.includes('instagram')) {
    pathData = InstagramPath;
  } else if (normalizedName.includes('whatsapp')) {
    pathData = WhatsAppPath;
  } else {
    // Default fallback
    pathData = InstagramPath;
  }

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Path d={pathData} fill={iconColor} />
      </Svg>
    </View>
  );
}
