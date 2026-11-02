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
  const borderColor = Colors.border;
  const cardColor = Colors.surface;
  const secondaryTextColor = Colors.textSecondary;

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: cardColor, borderColor }]}
      onPress={onPress}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={`${theme.name} icon pack`}
    >
      {theme.isPremium && !isPremium && (
        <View style={styles.premiumBadge}>
          <Icon name="lock-closed" size={10} color="white" />
          <FontText color="#FFFFFF" size={8} name="bold" style={{ textTransform: 'uppercase' }}>Premium</FontText>
        </View>
      )}
      <View
        style={[
          styles.preview,
          {
            backgroundColor: theme.background.type === 'color' ? theme.background.value : 'transparent',
            borderColor,
          },
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
      <FontText color={Colors.textPrimary} size={Typography.sizes.caption} name="semibold" style={{ marginTop: Spacing.sm, left: 4 }} numberOfLines={1}>
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
    borderWidth: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignContent: 'space-between',
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