import { Ionicons } from '@expo/vector-icons';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AmenityGrid } from '../../components/AmenityGrid';
import { OpenStatusBadge } from '../../components/OpenStatusBadge';
import { openDirections } from '../../lib/directions';
import { useFavorites } from '../../lib/favorites';
import { notifyStationArrival } from '../../lib/geofencing';
import { getOpenStatus } from '../../lib/openStatus';
import { useRouteState } from '../../lib/RouteContext';
import { useSettings } from '../../lib/settingsStore';
import { ZONE_COLORS } from '../../lib/stations';
import { hasCoordinates } from '../../lib/types';
import { useStation } from '../../lib/useStation';
import { colors, radius, spacing, typography } from '../../src/theme';

export default function StationDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { station, loading } = useStation(id);
  const { isFavorite, toggleFavorite } = useFavorites();
  const { settings } = useSettings();
  const { previewRoute } = useRouteState();

  if (loading || !station) {
    return (
      <SafeAreaView style={styles.loadingScreen}>
        <Text style={[typography.bodySm, styles.loadingText]}>
          {loading ? 'Loading…' : 'Station not found.'}
        </Text>
      </SafeAreaView>
    );
  }

  const favorite = isFavorite(station.id);
  const openStatus = getOpenStatus(station);
  const locatable = hasCoordinates(station);
  const hoursLabel = station.hours.is24Hours
    ? 'Open 24 Hours'
    : station.hours.opening && station.hours.closing
      ? `${station.hours.opening} – ${station.hours.closing}`
      : 'Hours not available';

  const goDirections = () => {
    if (!hasCoordinates(station)) return;
    openDirections(station.latitude, station.longitude, station.name, settings.mapProvider);
  };

  const handleDirections = () => {
    if (settings.autoLaunchNavigation) {
      goDirections();
      return;
    }
    Alert.alert('Open navigation?', `This opens ${station.name} in your maps app.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Open', onPress: goDirections },
    ]);
  };

  const handleSimulateArrival = async () => {
    await notifyStationArrival(station, 'simulated');
    Alert.alert('Simulated arrival', `Sent a geofence notification for ${station.name}.`);
  };

  const handlePreviewRoute = () => {
    previewRoute(station.id);
    router.push('/');
  };

  return (
    <SafeAreaView edges={['bottom']} style={styles.screen}>
      <Stack.Screen options={{ title: station.name }} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <View style={[styles.zoneDot, { backgroundColor: ZONE_COLORS[station.zone] }]} />
            <Text style={[typography.headlineLg, styles.name]}>{station.name}</Text>
          </View>
          <Text style={[typography.bodySm, styles.zoneLabel]}>{station.zone} Zone</Text>

          {station.gpsAddress && (
            <View style={styles.infoRow}>
              <Ionicons name="location-outline" size={16} color={colors.onSurfaceVariant} />
              <Text style={[typography.bodyMd, styles.infoText]}>{station.gpsAddress}</Text>
            </View>
          )}
          <View style={styles.infoRow}>
            <Ionicons name="time-outline" size={16} color={colors.onSurfaceVariant} />
            <Text style={[typography.bodyMd, styles.infoText]}>{hoursLabel}</Text>
            {openStatus.kind !== 'unknown' && openStatus.kind !== '24h' && (
              <Text style={[typography.bodySm, styles.hoursDetail]}>· {openStatus.detail}</Text>
            )}
          </View>
          <View style={styles.badgeRow}>
            <OpenStatusBadge station={station} />
          </View>

          {station.comments && (
            <View style={styles.commentBox}>
              <Text style={[typography.bodySm, styles.commentText]}>{station.comments}</Text>
            </View>
          )}
        </View>

        <Text style={[typography.headlineSm, styles.sectionTitle]}>Amenities &amp; Services</Text>
        <AmenityGrid station={station} />

        <View style={styles.actions}>
          {locatable ? (
            <>
              <Pressable onPress={handlePreviewRoute} style={styles.directionsButton}>
                <Ionicons name="map" size={18} color={colors.onPrimary} />
                <Text style={[typography.labelButton, styles.directionsText]}>Preview Route</Text>
              </Pressable>

              <Pressable onPress={handleDirections} style={styles.secondaryButton}>
                <Ionicons name="navigate-outline" size={18} color={colors.onSurface} />
                <Text style={[typography.labelButton, styles.secondaryText]}>Open in Maps</Text>
              </Pressable>
            </>
          ) : (
            <View style={styles.noLocationNote}>
              <Ionicons name="warning-outline" size={16} color={colors.onSurfaceVariant} />
              <Text style={[typography.bodySm, styles.noLocationText]}>
                Coordinates not yet verified for this station — directions unavailable.
              </Text>
            </View>
          )}

          <Pressable
            onPress={() => toggleFavorite(station.id)}
            style={[styles.favoriteButton, favorite && styles.favoriteButtonActive]}>
            <Ionicons
              name={favorite ? 'heart' : 'heart-outline'}
              size={18}
              color={favorite ? colors.primary : colors.onSurfaceVariant}
            />
            <Text
              style={[typography.labelButton, styles.favoriteText, favorite && styles.favoriteTextActive]}>
              {favorite ? 'Saved to Favorites' : 'Save to Favorites'}
            </Text>
          </Pressable>
        </View>

        <View style={styles.demoBlock}>
          <View style={styles.demoRow}>
            <View style={styles.demoTextBlock}>
              <View style={styles.demoTitleRow}>
                <View style={styles.demoBadge}>
                  <Text style={[typography.labelStatus, styles.demoBadgeText]}>DEMO</Text>
                </View>
                <Text style={[typography.bodySm, styles.demoTitle]}>Simulate geofence entry</Text>
              </View>
              <Text style={[typography.bodySm, styles.demoSubtitle]}>
                Fires the same alert a real GPS entry would trigger.
              </Text>
            </View>
            <Pressable onPress={handleSimulateArrival} style={styles.demoButton}>
              <Text style={[typography.labelStatus, styles.demoButtonText]}>Simulate</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  loadingScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  loadingText: {
    color: colors.outline,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  header: {
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  zoneDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: spacing.xs + 2,
  },
  name: {
    color: colors.onSurface,
    flexShrink: 1,
  },
  zoneLabel: {
    color: colors.onSurfaceVariant,
    marginTop: spacing.xs,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: spacing.sm,
  },
  infoText: {
    color: colors.onSurfaceVariant,
  },
  hoursDetail: {
    color: colors.onSurfaceVariant,
  },
  badgeRow: {
    marginTop: spacing.xs + 2,
  },
  commentBox: {
    marginTop: spacing.sm,
    backgroundColor: colors.primaryFixed,
    borderRadius: radius.md,
    padding: spacing.sm + 4,
  },
  commentText: {
    color: colors.onPrimaryFixedVariant,
  },
  sectionTitle: {
    color: colors.onSurface,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.gutter,
  },
  actions: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.gutter,
    gap: spacing.sm,
  },
  directionsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs + 2,
    height: 54,
    borderRadius: radius.full,
    backgroundColor: colors.primaryContainer,
    shadowColor: colors.primaryContainer,
    shadowOpacity: 0.35,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
  },
  directionsText: {
    color: colors.onPrimary,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs + 2,
    height: 50,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceContainer,
  },
  secondaryText: {
    color: colors.onSurface,
  },
  noLocationNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2,
    padding: spacing.sm + 4,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceContainerLow,
  },
  noLocationText: {
    flex: 1,
    color: colors.onSurfaceVariant,
  },
  favoriteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs + 2,
    height: 50,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: colors.surfaceContainerHigh,
  },
  favoriteButtonActive: {
    backgroundColor: colors.primaryFixed,
    borderColor: colors.primary,
  },
  favoriteText: {
    color: colors.onSurfaceVariant,
  },
  favoriteTextActive: {
    color: colors.primary,
  },
  demoBlock: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.gutter,
  },
  demoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.surfaceDim,
    backgroundColor: colors.surfaceContainerLow,
  },
  demoTextBlock: {
    flex: 1,
  },
  demoTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
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
  demoTitle: {
    color: colors.onSurface,
  },
  demoSubtitle: {
    color: colors.onSurfaceVariant,
    marginTop: 2,
  },
  demoButton: {
    paddingHorizontal: spacing.sm + 4,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.onSurface,
  },
  demoButtonText: {
    color: colors.surfaceContainerLowest,
  },
});
