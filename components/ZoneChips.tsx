import { ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';

import { ZONES } from '../lib/stations';
import type { Zone } from '../lib/types';
import { colors, radius, spacing, typography } from '../src/theme';

interface ZoneChipsProps {
  active: Zone[];
  onToggle: (zone: Zone) => void;
}

export function ZoneChips({ active, onToggle }: ZoneChipsProps) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.row}>
      {ZONES.map((zone) => {
        const isActive = active.includes(zone);
        return (
          <TouchableOpacity
            key={zone}
            onPress={() => onToggle(zone)}
            style={[styles.chip, isActive && styles.chipActive]}>
            <Text style={[typography.labelButton, styles.chipText, isActive && styles.chipTextActive]}>
              {zone}
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
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
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
    color: colors.onSurface,
  },
  chipTextActive: {
    color: colors.onSecondary,
  },
});
