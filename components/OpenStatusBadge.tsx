import { StyleSheet, Text, View } from 'react-native';

import { getOpenStatus } from '../lib/openStatus';
import type { Station } from '../lib/types';
import { colors, radius, spacing, typography } from '../src/theme';

export function OpenStatusBadge({ station }: { station: Station }) {
  const status = getOpenStatus(station);

  if (status.kind === 'unknown') return null;

  const isOpen = status.kind === 'open' || status.kind === '24h';

  return (
    <View style={[styles.pill, isOpen ? styles.pillOpen : styles.pillClosed]}>
      <View style={[styles.dot, isOpen ? styles.dotOpen : styles.dotClosed]} />
      <Text style={[typography.labelStatus, isOpen ? styles.textOpen : styles.textClosed]}>
        {status.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.xs + 2,
    paddingVertical: 2,
    borderRadius: radius.full,
    alignSelf: 'flex-start',
  },
  pillOpen: {
    backgroundColor: colors.secondaryFixed,
  },
  pillClosed: {
    backgroundColor: colors.surfaceContainer,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  dotOpen: {
    backgroundColor: colors.secondary,
  },
  dotClosed: {
    backgroundColor: colors.onSurfaceVariant,
  },
  textOpen: {
    color: colors.onSecondaryFixedVariant,
    fontSize: 10,
    lineHeight: 12,
  },
  textClosed: {
    color: colors.onSurfaceVariant,
    fontSize: 10,
    lineHeight: 12,
  },
});
