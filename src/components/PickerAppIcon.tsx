import React, { memo, useEffect, useState } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { NativeModules } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Colors } from '../constants/design';

const { HomeShortcut } = NativeModules;

interface PickerAppIconProps {
  appId: string;
  currentIcons: Record<string, string>;
  setCurrentIcons: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  isDarkMode: boolean;
}

const PickerAppIcon: React.FC<PickerAppIconProps> = memo(
  ({ appId, currentIcons, setCurrentIcons, isDarkMode }) => {
    const [icon, setIcon] = useState(currentIcons[appId]);

    useEffect(() => {
      if (icon) return;
      let isMounted = true;
      async function load() {
        try {
          const result = await HomeShortcut.getCurrentAppIcon({
            packageName: appId,
          });
          if (isMounted) {
            setIcon(result.base64);
            setCurrentIcons(prev => ({ ...prev, [appId]: result.base64 }));
          }
        } catch {
        }
      }
      load();
      return () => {
        isMounted = false;
      };
    }, [appId, setCurrentIcons, icon]);

    if (!icon) {
      const placeholderDynamic = { backgroundColor: isDarkMode ? '#333' : '#EEE' };
      return (
        <View
          style={[
            styles.appOptionIconPlaceholder,
            placeholderDynamic,
          ]}
        >
          <Ionicons
            name="apps"
            size={20}
            color={isDarkMode ? Colors.dark.textSecondary : Colors.textSecondary}
          />
        </View>
      );
    }

    return (
      <Image
        source={{ uri: `data:image/png;base64,${icon}` }}
        style={styles.appOptionIcon}
      />
    );
  },
);

const styles = StyleSheet.create({
  appOptionIcon: {
    width: 32,
    height: 32,
    borderRadius: 6,
    marginRight: 12,
  },
  appOptionIconPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
});

export default PickerAppIcon;
