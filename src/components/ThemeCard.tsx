import React, { memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import { Colors, Radius, Spacing, Typography } from '../constants/design';
import type { ThemeDefinition } from '../types/data';
import IconCanvas from './IconCanvas';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSubscription } from '../context/SubscriptionContext';

interface ThemeCardProps {
  theme: ThemeDefinition;
  onPress: () => void;
}

const ThemeCard = memo(({
  theme,
  onPress,
}: ThemeCardProps) => {
  const isDarkMode = useColorScheme() === 'dark';
  const { isPremium } = useSubscription();
  const borderColor = isDarkMode ? Colors.dark.border : Colors.border;
  const cardColor = isDarkMode ? Colors.dark.surface : Colors.background;
  const secondaryTextColor = isDarkMode ? Colors.dark.textSecondary : Colors.textSecondary;

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
          <Text style={styles.premiumText}>Premium</Text>
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
      <Text style={[styles.name, { color: isDarkMode ? Colors.dark.textPrimary : Colors.textPrimary }]} numberOfLines={1}>
        {theme.name}
      </Text>
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
    backgroundColor: 'rgba(0,0,0,0.6)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    gap: 2,
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.5)',
    zIndex: 10,
  },
  premiumText: {
    color: 'white',
    fontSize: 8,
    fontWeight: 'bold',
    textTransform: 'uppercase',
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
  name: {
    marginTop: Spacing.sm,
    fontSize: Typography.sizes.caption,
    fontWeight: Typography.weights.semibold,
    left: 4,
  },
  description: {
    marginTop: Spacing.xs,
    fontSize: Typography.sizes.caption,
  },
});
