import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AMENITY_FILTERS } from '../lib/filters';
import { formatDistanceKm } from '../lib/distance';
import { ZONE_COLORS } from '../lib/stations';
import type { Station } from '../lib/types';
import { colors, radius, spacing, typography } from '../src/theme';
import { OpenStatusBadge } from './OpenStatusBadge';

// "24 Hours" is already represented by the OpenStatusBadge pill, so skip it here.
const CARD_AMENITIES = AMENITY_FILTERS.filter((f) => f.key !== 'is24Hours');
const MAX_VISIBLE_AMENITIES = 2;

interface StationCardProps {
  station: Station;
  distanceKm: number | null;
  onPress: () => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}

export function StationCard({
  station,
  distanceKm,
  onPress,
  isFavorite,
  onToggleFavorite,
}: StationCardProps) {
  const presentAmenities = CARD_AMENITIES.filter((f) => f.get(station));
  const topAmenities = presentAmenities.slice(0, MAX_VISIBLE_AMENITIES);
  const moreCount = presentAmenities.length - topAmenities.length;

  return (
    <Pressable onPress={onPress} style={styles.card}>
      <View style={styles.header}>
        <View style={[styles.zoneDot, { backgroundColor: ZONE_COLORS[station.zone] }]} />
        <View style={styles.titleBlock}>
          <Text style={[typography.headlineSm, styles.name]}>{station.name}</Text>
          <View style={styles.statusRow}>
            <Text style={[typography.bodySm, styles.zoneText]}>{station.zone}</Text>
            <OpenStatusBadge station={station} />
          </View>
        </View>
        {distanceKm !== null && (
          <View style={styles.distancePill}>
            <Text style={[typography.labelDistanceUnit, styles.distanceText]}>
              {formatDistanceKm(distanceKm)}
            </Text>
          </View>
        )}
      </View>

      {topAmenities.length > 0 && (
        <View style={styles.amenityRow}>
          {topAmenities.map((a) => (
            <View key={a.key} style={styles.amenityChip}>
              <Text style={[typography.bodySm, styles.amenityText]}>{a.label}</Text>
            </View>
          ))}
          {moreCount > 0 && (
            <View style={styles.moreChip}>
              <Text style={[typography.bodySm, styles.moreText]}>+{moreCount} more</Text>
            </View>
          )}
        </View>
      )}

      <View style={styles.actionsRow}>
        <View style={styles.directionsAction}>
          <Ionicons name="navigate" size={16} color={colors.onPrimaryContainer} />
          <Text style={[typography.labelButton, styles.directionsText]}>View details</Text>
        </View>
        <Pressable onPress={onToggleFavorite} hitSlop={8}>
          <Ionicons
            name={isFavorite ? 'heart' : 'heart-outline'}
            size={22}
            color={isFavorite ? colors.primary : colors.outline}
          />
        </Pressable>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: spacing.gutter,
    marginBottom: spacing.sm + 4,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceContainerLowest,
    padding: spacing.md,
    shadowColor: '#0F172A',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  zoneDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 6,
    marginRight: spacing.sm,
  },
  titleBlock: {
    flex: 1,
  },
  name: {
    color: colors.onSurface,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2,
    marginTop: 2,
  },
  zoneText: {
    color: colors.onSurfaceVariant,
  },
  distancePill: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    backgroundColor: colors.inverseSurface,
  },
  distanceText: {
    color: colors.inverseOnSurface,
  },
  amenityRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  amenityChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceContainerLow,
  },
  amenityText: {
    color: colors.onSurface,
  },
  moreChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceContainer,
  },
  moreText: {
    color: colors.onSurfaceVariant,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm + 2,
  },
  directionsAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  directionsText: {
    color: colors.onPrimaryContainer,
  },
});
