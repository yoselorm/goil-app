import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import MapView, { Circle, Marker, Polyline } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FuelPin } from '../../components/FuelPin';
import { OpenStatusBadge } from '../../components/OpenStatusBadge';
import { RadiusSlider } from '../../components/RadiusSlider';
import { haversineDistanceKm } from '../../lib/distance';
import { useFilterState } from '../../lib/FilterContext';
import { useRouteState } from '../../lib/RouteContext';
import { fetchRoute, type RouteResult } from '../../lib/routing';
import { ZONE_COLORS } from '../../lib/stations';
import { hasCoordinates, type Station } from '../../lib/types';
import { useCurrentLocation } from '../../lib/useCurrentLocation';
import { useLocationName } from '../../lib/useLocationName';
import { useStations } from '../../lib/useStations';
import { colors, radius, spacing, typography } from '../../src/theme';

const MAP_TYPE = Platform.select<'mutedStandard' | 'standard'>({
  ios: 'mutedStandard',
  default: 'standard',
});

const GHANA_REGION = {
  latitude: 7.0,
  longitude: -1.0,
  latitudeDelta: 6.5,
  longitudeDelta: 6.5,
};

const AMENITY_LABELS: { key: keyof Station['amenities']; label: string }[] = [
  { key: 'goCafe', label: 'Go Café' },
  { key: 'pharmacy', label: 'Pharmacy' },
  { key: 'atm', label: 'ATM' },
  { key: 'restaurant', label: 'Restaurant' },
];

export default function MapScreen() {
  const { stations, loading } = useStations();
  const { location } = useCurrentLocation();
  const { name: locationName, loading: locationNameLoading } = useLocationName(location);
  const { searchRadiusKm, setSearchRadiusKm } = useFilterState();
  const { activeRouteStationId, clearRoute } = useRouteState();
  const [selected, setSelected] = useState<Station | null>(null);
  const [route, setRoute] = useState<RouteResult | null>(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const mapRef = useRef<MapView>(null);
  const hasCentered = useRef(false);

  const activeRouteStation = useMemo(
    () => stations.find((station) => station.id === activeRouteStationId) ?? null,
    [stations, activeRouteStationId]
  );

  useEffect(() => {
    if (activeRouteStation) setSelected(activeRouteStation);
  }, [activeRouteStation]);

  useEffect(() => {
    if (!activeRouteStation || !location || !hasCoordinates(activeRouteStation)) {
      setRoute(null);
      return;
    }

    let cancelled = false;
    setRouteLoading(true);
    fetchRoute(location, { latitude: activeRouteStation.latitude, longitude: activeRouteStation.longitude }).then(
      (result) => {
        if (cancelled) return;
        setRoute(result);
        setRouteLoading(false);
        mapRef.current?.fitToCoordinates(result.coordinates, {
          edgePadding: { top: 160, right: 60, bottom: 220, left: 60 },
          animated: true,
        });
      }
    );

    return () => {
      cancelled = true;
    };
  }, [activeRouteStation, location]);

  const handleClearRoute = () => {
    clearRoute();
    setRoute(null);
  };

  useEffect(() => {
    if (!location || hasCentered.current) return;

    // Zoom to the user's location once, right when the app opens.
    hasCentered.current = true;
    mapRef.current?.animateToRegion(
      {
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      },
      600
    );
  }, [location]);

  const mappableStations = useMemo(() => stations.filter(hasCoordinates), [stations]);

  const stationsWithDistance = useMemo(
    () =>
      mappableStations.map((station) => ({
        station,
        inRadius: location ? haversineDistanceKm(location, station) <= searchRadiusKm : true,
      })),
    [mappableStations, location, searchRadiusKm]
  );

  const topAmenities = selected
    ? AMENITY_LABELS.filter(({ key }) => selected.amenities[key]).slice(0, 2)
    : [];

  return (
    <View style={styles.screen}>
      {loading ? (
        <View style={styles.loadingBlock}>
          <Text style={[typography.bodySm, styles.loadingText]}>Loading stations…</Text>
        </View>
      ) : (
        <MapView
          ref={mapRef}
          style={StyleSheet.absoluteFill}
          initialRegion={GHANA_REGION}
          mapType={MAP_TYPE}>
          {stationsWithDistance.map(({ station, inRadius }) => {
            const isSelected = selected?.id === station.id;
            return (
              <Marker
                key={`${station.id}-${isSelected}`}
                coordinate={{ latitude: station.latitude, longitude: station.longitude }}
                anchor={{ x: 0.5, y: 1 }}
                zIndex={isSelected ? 5 : 1}
                onPress={() => setSelected(station)}>
                <FuelPin color={ZONE_COLORS[station.zone]} muted={!inRadius} selected={isSelected} />
              </Marker>
            );
          })}

          {route && (
            <Polyline
              coordinates={route.coordinates}
              strokeColor={colors.secondary}
              strokeWidth={4}
              lineDashPattern={route.approximate ? [8, 6] : undefined}
            />
          )}

          {location && (
            <>
              <Circle
                center={location}
                radius={searchRadiusKm * 1000}
                strokeColor={colors.primaryContainer + '99'}
                fillColor={colors.primaryContainer + '1F'}
                strokeWidth={2}
              />
              <Marker coordinate={location} anchor={{ x: 0.5, y: 0.5 }} zIndex={10}>
                <View style={styles.userPin}>
                  <Ionicons name="navigate" size={12} color={colors.onPrimaryContainer} />
                </View>
              </Marker>
            </>
          )}
        </MapView>
      )}

      {routeLoading && (
        <View style={styles.routeLoadingOverlay} pointerEvents="none">
          <View style={styles.routeLoadingCard}>
            <ActivityIndicator size="small" color={colors.primaryContainer} />
            <Text style={[typography.bodyMd, styles.routeLoadingText]}>Calculating route…</Text>
          </View>
        </View>
      )}

      <SafeAreaView edges={['top']} style={styles.topOverlay}>
        <View style={styles.radiusCard}>
          <View style={styles.locationRow}>
            <Ionicons name="location" size={14} color={colors.secondary} />
            {locationNameLoading && !locationName ? (
              <ActivityIndicator size="small" color={colors.secondary} />
            ) : (
              <Text style={[typography.labelStatus, styles.locationText]} numberOfLines={1}>
                {locationName ?? (location ? 'Locating you…' : 'Location unavailable')}
              </Text>
            )}
          </View>
          <RadiusSlider
            label="Search radius"
            value={searchRadiusKm}
            minimumValue={0}
            maximumValue={10}
            step={0.5}
            unit="km"
            onValueChange={setSearchRadiusKm}
            formatValue={(v) => v.toFixed(1)}
          />
          <Text style={[typography.bodySm, styles.hint]}>
            {location
              ? 'Grayed-out pins are outside your radius.'
              : 'Enable location to highlight stations near you.'}
          </Text>
        </View>
      </SafeAreaView>

      {selected && (
        <SafeAreaView edges={['bottom']} style={styles.bottomOverlay}>
          <View style={styles.previewCard}>
            <View style={styles.previewHeader}>
              <View style={styles.previewTitleBlock}>
                <View style={styles.previewTitleRow}>
                  <View style={[styles.zoneDot, { backgroundColor: ZONE_COLORS[selected.zone] }]} />
                  <Text style={[typography.headlineSm, styles.previewName]}>{selected.name}</Text>
                </View>
                <View style={styles.previewMetaRow}>
                  <Text style={[typography.bodySm, styles.previewZone]}>{selected.zone}</Text>
                  <OpenStatusBadge station={selected} />
                </View>
                {topAmenities.length > 0 && (
                  <Text style={[typography.bodySm, styles.previewAmenities]}>
                    {topAmenities.map((a) => a.label).join(' · ')}
                  </Text>
                )}
              </View>
              <Pressable onPress={() => setSelected(null)} hitSlop={8}>
                <Ionicons name="close" size={20} color={colors.outline} />
              </Pressable>
            </View>

            {activeRouteStation?.id === selected.id && (
              <View style={styles.routeInfoRow}>
                {routeLoading ? (
                  <ActivityIndicator size="small" color={colors.secondary} />
                ) : (
                  <Ionicons name="navigate" size={14} color={colors.secondary} />
                )}
                <Text style={[typography.bodySm, styles.routeInfoText]}>
                  {routeLoading
                    ? 'Fetching route…'
                    : route?.approximate
                      ? 'Approximate route (straight line)'
                      : route
                        ? `${route.distanceKm.toFixed(1)} km · ${Math.round(route.durationMin)} min drive`
                        : null}
                </Text>
                <Pressable onPress={handleClearRoute} hitSlop={8}>
                  <Text style={[typography.labelStatus, styles.clearRouteText]}>Clear</Text>
                </Pressable>
              </View>
            )}

            <Pressable
              onPress={() => router.push(`/station/${selected.id}`)}
              style={styles.detailsButton}>
              <Text style={[typography.labelButton, styles.detailsButtonText]}>View details</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  loadingBlock: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: colors.outline,
  },
  userPin: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.surfaceContainerLowest,
    backgroundColor: colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  routeLoadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  routeLoadingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceContainerLowest,
    shadowColor: '#0F172A',
    shadowOpacity: 0.15,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
  },
  routeLoadingText: {
    color: colors.onSurface,
  },
  radiusCard: {
    marginHorizontal: spacing.gutter,
    marginTop: spacing.sm,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceContainerLowest,
    padding: spacing.md,
    shadowColor: '#0F172A',
    shadowOpacity: 0.12,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  locationText: {
    color: colors.secondary,
    textTransform: 'none',
    flexShrink: 1,
  },
  hint: {
    marginTop: spacing.xs,
    color: colors.outline,
  },
  bottomOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  previewCard: {
    marginHorizontal: spacing.gutter,
    marginBottom: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceContainerLowest,
    padding: spacing.md,
    shadowColor: '#0F172A',
    shadowOpacity: 0.12,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  previewTitleBlock: {
    flex: 1,
  },
  previewTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  zoneDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: spacing.xs + 2,
  },
  previewName: {
    color: colors.onSurface,
  },
  previewMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2,
    marginTop: 2,
  },
  previewZone: {
    color: colors.onSurfaceVariant,
  },
  previewAmenities: {
    color: colors.primary,
    marginTop: 4,
  },
  routeInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceContainer,
  },
  routeInfoText: {
    flex: 1,
    color: colors.onSurfaceVariant,
  },
  clearRouteText: {
    color: colors.primary,
  },
  detailsButton: {
    marginTop: spacing.sm + 4,
    alignItems: 'center',
    borderRadius: radius.full,
    backgroundColor: colors.primaryContainer,
    paddingVertical: spacing.sm + 4,
    shadowColor: colors.primaryContainer,
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  detailsButtonText: {
    color: colors.onPrimary,
  },
});
