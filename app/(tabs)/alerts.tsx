import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AlertEventCard } from '../../components/AlertEventCard';
import { useAlertsLog } from '../../lib/alertsLog';
import { haversineDistanceKm } from '../../lib/distance';
import { GEOFENCE_LIMIT, notifyStationArrival } from '../../lib/geofencing';
import { useSettings } from '../../lib/settingsStore';
import { hasCoordinates } from '../../lib/types';
import { useCurrentLocation } from '../../lib/useCurrentLocation';
import { useStations } from '../../lib/useStations';
import { colors, radius, spacing, typography } from '../../src/theme';

export default function AlertsScreen() {
  const { stations } = useStations();
  const { location } = useCurrentLocation();
  const { settings } = useSettings();
  const { events, loading, refresh } = useAlertsLog();
  const [simulating, setSimulating] = useState(false);

  const monitorableStations = useMemo(() => stations.filter(hasCoordinates), [stations]);
  const monitoredCount = Math.min(monitorableStations.length, GEOFENCE_LIMIT);

  const nearestStation = useMemo(() => {
    if (monitorableStations.length === 0) return null;
    if (!location) return monitorableStations[0];
    return monitorableStations.reduce((closest, station) =>
      haversineDistanceKm(location, station) < haversineDistanceKm(location, closest)
        ? station
        : closest
    );
  }, [monitorableStations, location]);

  const handleSimulate = async () => {
    if (!nearestStation || simulating) return;
    setSimulating(true);
    await notifyStationArrival(nearestStation, 'simulated');
    refresh();
    setSimulating(false);
  };

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <View style={styles.header}>
        <Text style={[typography.headlineMd, styles.title]}>Alerts</Text>
        <Text style={[typography.bodySm, styles.subtitle]}>Geofence proximity history</Text>
      </View>

      <View style={styles.radarBanner}>
        <View style={styles.radarHeader}>
          <View style={styles.radarIconBox}>
            <Ionicons name="radio" size={20} color={colors.onSecondary} />
          </View>
          <View style={styles.radarTextBlock}>
            <View style={styles.radarTitleRow}>
              <Text style={[typography.headlineSm, styles.radarTitle]}>Geofencing Active</Text>
              <View style={styles.slotsPill}>
                <View style={styles.liveDot} />
                <Text style={[typography.labelStatus, styles.slotsText]}>
                  {monitoredCount}/{monitorableStations.length} Stations
                </Text>
              </View>
            </View>
            <Text style={[typography.bodySm, styles.radarSubtitle]}>
              Zone radius: {settings.geofenceRadiusMeters}m
            </Text>
          </View>
          <Pressable onPress={handleSimulate} style={styles.simulateButton} disabled={simulating}>
            <Ionicons name="hand-left" size={14} color={colors.onPrimary} />
            <Text style={[typography.labelStatus, styles.simulateText]}>
              {simulating ? 'Sending…' : 'Simulate'}
            </Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.feedHeader}>
        <Text style={[typography.headlineSm, styles.feedTitle]}>Proximity Triggers</Text>
        <Text style={[typography.bodySm, styles.feedCount]}>{events.length} logged</Text>
      </View>

      {loading ? (
        <View style={styles.emptyBlock}>
          <Text style={[typography.bodySm, styles.emptyText]}>Loading…</Text>
        </View>
      ) : (
        <FlatList
          data={events}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyBlock}>
              <Ionicons name="notifications-outline" size={36} color={colors.surfaceDim} />
              <Text style={[typography.bodySm, styles.emptyText]}>
                No alerts yet. Drive near a station, or tap Simulate to preview one.
              </Text>
            </View>
          }
          renderItem={({ item }) => <AlertEventCard event={item} />}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  header: {
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  title: {
    color: colors.onSurface,
  },
  subtitle: {
    color: colors.onSurfaceVariant,
    marginTop: 2,
  },
  radarBanner: {
    marginHorizontal: spacing.gutter,
    marginBottom: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceContainerLow,
    padding: spacing.md,
  },
  radarHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  radarIconBox: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radarTextBlock: {
    flex: 1,
  },
  radarTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flexWrap: 'wrap',
  },
  radarTitle: {
    color: colors.onSurface,
  },
  slotsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.xs + 2,
    paddingVertical: 2,
    borderRadius: radius.full,
    backgroundColor: colors.secondaryContainer,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.secondary,
  },
  slotsText: {
    color: colors.onSecondaryContainer,
  },
  radarSubtitle: {
    color: colors.onSurfaceVariant,
    marginTop: 2,
  },
  simulateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
  },
  simulateText: {
    color: colors.onPrimary,
  },
  feedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.gutter,
    marginBottom: spacing.sm,
  },
  feedTitle: {
    color: colors.onSurface,
  },
  feedCount: {
    color: colors.onSurfaceVariant,
  },
  listContent: {
    paddingHorizontal: spacing.gutter,
    paddingBottom: spacing.xl,
  },
  emptyBlock: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
  },
  emptyText: {
    color: colors.outline,
    textAlign: 'center',
  },
});
