import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';

import { STATION_FILTERS } from '../lib/filters';
import { colors, radius, spacing, typography } from '../src/theme';

interface FilterChipsRowProps {
  active: string[];
  onToggle: (key: string) => void;
}

export function FilterChipsRow({ active, onToggle }: FilterChipsRowProps) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.row}>
      {STATION_FILTERS.slice(0, 6).map((filter) => {
        const isActive = active.includes(filter.key);
        return (
          <TouchableOpacity
            key={filter.key}
            onPress={() => onToggle(filter.key)}
            style={[styles.chip, isActive && styles.chipActive]}>
            <Ionicons
              name={filter.icon as keyof typeof Ionicons.glyphMap}
              size={14}
              color={isActive ? colors.onSecondary : colors.secondary}
            />
            <Text style={[typography.labelStatus, styles.chipText, isActive && styles.chipTextActive]}>
              {filter.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    flexGrow: 0,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceContainerLowest,
    marginRight: spacing.xs,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  chipActive: {
    backgroundColor: colors.secondary,
  },
  chipText: {
    color: colors.onSurfaceVariant,
    textTransform: 'none',
  },
  chipTextActive: {
    color: colors.onSecondary,
  },
});
