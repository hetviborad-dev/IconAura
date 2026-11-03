import React, { memo } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Colors, Radius, Spacing, Typography } from '../constants/design';
import type { ThemeDefinition } from '../types/data';
import IconCanvas from './IconCanvas';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSubscription } from '../context/SubscriptionContext';
import FontText from './FontText';

interface ThemeCardProps {
  theme: ThemeDefinition;
  onPress: () => void;
  isPremium?: boolean;
}

const ThemeCard = memo(({
  theme,
  onPress,
  isPremium: isPremiumProp,
}: ThemeCardProps) => {
  const { isPremium: contextPremium } = useSubscription();
  const isPremium = isPremiumProp ?? contextPremium;
  const borderColor = '#2C2438';
  const cardColor = '#1A1522';
  const cardDynamic = { backgroundColor: cardColor, borderColor };
  const previewDynamic = { backgroundColor: 'transparent', borderColor };

  return (
    <TouchableOpacity
      style={[styles.card, cardDynamic]}
      onPress={onPress}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={`${theme.name} icon pack`}
    >
      {theme.isPremium && !isPremium && (
        <View style={styles.premiumBadge}>
          <Icon name="lock-closed" size={8} color="white" />
          <FontText pureColor="#FFFFFF" size={9} name="bold" style={styles.uppercaseText}>PRO</FontText>
        </View>
      )}
      <View
        style={[
          styles.preview,
          previewDynamic,
        ]}
      >
        {theme.featuredApps
          .slice(0, 4)
          .map((appId) => (
            <View key={appId} style={styles.iconTile}>
              <IconCanvas appId={appId} theme={theme} size={55} />
            </View>
          ))}
      </View>
      <FontText color={'rgb(245, 241, 250)'} size={13} name="bold" style={styles.nameText} numberOfLines={1}>
        {theme.name}
      </FontText>
    </TouchableOpacity>
  );
});

export default ThemeCard;

const styles = StyleSheet.create({
  card: {
    width: 120,
    padding: Spacing.xs,
    borderRadius: Radius.lg,
    borderWidth: 1,
    marginRight: Spacing.md,
    position: 'relative',
  },
  premiumBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    gap: 2,
    borderWidth: 1,
    borderColor: 'rgba(255, 0, 122, 0.5)',
    zIndex: 10,
  },
  preview: {
    width: 110,
    height: 110,
    padding: Spacing.sm,
    borderRadius: Radius.md,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignContent: 'space-between',
  },
  uppercaseText: {
    textTransform: 'uppercase',
  },
  nameText: {
    marginTop: Spacing.xs,
    marginLeft: 8,
  },
  iconTile: {
    width: 45,
    height: 45,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
});