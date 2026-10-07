import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import type { AlertEvent } from '../lib/alertsLog';
import { colors, radius, spacing, typography } from '../src/theme';

function formatRelativeTime(timestamp: number): string {
  const diffMs = Date.now() - timestamp;
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function AlertEventCard({ event }: { event: AlertEvent }) {
  const isSimulated = event.source === 'simulated';
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={[styles.iconBox, isSimulated && styles.iconBoxDemo]}>
          <Ionicons name="navigate" size={18} color={isSimulated ? colors.onSurface : colors.onPrimaryContainer} />
        </View>
        <View style={styles.textBlock}>
          <View style={styles.titleRow}>
            <Text style={[typography.headlineSm, styles.title]}>{event.stationName}</Text>
            {isSimulated && (
              <View style={styles.demoBadge}>
                <Text style={[typography.labelStatus, styles.demoBadgeText]}>DEMO</Text>
              </View>
            )}
          </View>
          <Text style={[typography.bodySm, styles.subtitle]}>
            {event.amenityLabel} · {formatRelativeTime(event.timestamp)}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBoxDemo: {
    backgroundColor: colors.surfaceContainerHigh,
  },
  textBlock: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  title: {
    color: colors.onSurface,
    flexShrink: 1,
  },
  subtitle: {
    color: colors.onSurfaceVariant,
    marginTop: 2,
  },
  demoBadge: {
    backgroundColor: colors.onSurface,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: radius.sm,
  },
  demoBadgeText: {
    color: colors.surfaceContainerLowest,
    fontSize: 9,
    lineHeight: 11,
  },
});
