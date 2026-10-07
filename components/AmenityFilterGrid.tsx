import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { AMENITY_FILTERS } from '../lib/filters';
import { colors, radius, spacing, typography } from '../src/theme';

interface AmenityFilterGridProps {
  active: string[];
  onToggle: (key: string) => void;
}

export function AmenityFilterGrid({ active, onToggle }: AmenityFilterGridProps) {
  return (
    <View style={styles.grid}>
      {AMENITY_FILTERS.map((filter) => {
        const isActive = active.includes(filter.key);
        return (
          <TouchableOpacity
            key={filter.key}
            onPress={() => onToggle(filter.key)}
            style={[styles.card, isActive && styles.cardActive]}>
            <View style={[styles.iconBox, isActive && styles.iconBoxActive]}>
              <Ionicons
                name={filter.icon as keyof typeof Ionicons.glyphMap}
                size={20}
                color={isActive ? colors.onSecondary : colors.onSurfaceVariant}
              />
            </View>
            <Text style={[typography.labelButton, styles.label]} numberOfLines={1}>
              {filter.label}
            </Text>
            {isActive && (
              <View style={styles.badge}>
                <Ionicons name="checkmark" size={12} color={colors.onSecondary} />
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const CARD_WIDTH = '48%';

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  card: {
    width: CARD_WIDTH,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.sm + 6,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceContainerLowest,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  cardActive: {
    backgroundColor: colors.secondaryFixed,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBoxActive: {
    backgroundColor: colors.secondary,
  },
  label: {
    flex: 1,
    color: colors.onSurface,
  },
  badge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
