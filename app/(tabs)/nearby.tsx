import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FilterChipsRow } from '../../components/FilterChipsRow';
import { StationCard } from '../../components/StationCard';
import { haversineDistanceKm } from '../../lib/distance';
import { useFavorites } from '../../lib/favorites';
import { useFilterState } from '../../lib/FilterContext';
import { matchesFilters, matchesSearch, matchesZones } from '../../lib/filters';
import { hasCoordinates } from '../../lib/types';
import { useCurrentLocation } from '../../lib/useCurrentLocation';
import { useStations } from '../../lib/useStations';
import { colors, radius, spacing, typography } from '../../src/theme';

export default function NearbyScreen() {
  const { stations, loading } = useStations();
  const { location, permissionDenied } = useCurrentLocation();
  const { isFavorite, toggleFavorite, favoriteIds } = useFavorites();
  const {
    searchQuery,
    setSearchQuery,
    activeAmenityFilters,
    toggleAmenityFilter,
    activeZones,
    favoritesOnly,
    setFavoritesOnly,
  } = useFilterState();

  const data = useMemo(() => {
    const withDistance = stations.map((station) => ({
      station,
      distanceKm: location && hasCoordinates(station) ? haversineDistanceKm(location, station) : null,
    }));

    const filtered = withDistance.filter(
      ({ station }) =>
        matchesSearch(station, searchQuery) &&
        matchesFilters(station, activeAmenityFilters) &&
        matchesZones(station, activeZones) &&
        (!favoritesOnly || favoriteIds.includes(station.id))
    );

    return filtered.sort((a, b) => {
      if (a.distanceKm === null || b.distanceKm === null) return 0;
      return a.distanceKm - b.distanceKm;
    });
  }, [stations, location, searchQuery, activeAmenityFilters, activeZones, favoritesOnly, favoriteIds]);

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <View style={styles.header}>
        <View>
          <Text style={[typography.headlineMd, styles.title]}>GOIL Stations</Text>
          <Text style={[typography.bodySm, styles.subtitle]}>{stations.length} stations · Nearest first</Text>
        </View>
        <Pressable onPress={() => router.push('/settings')} hitSlop={8}>
          <Ionicons name="settings-outline" size={24} color={colors.onSurfaceVariant} />
        </Pressable>
      </View>

      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color={colors.onSurfaceVariant} />
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search by name or zone"
          placeholderTextColor={colors.onSurfaceVariant}
          style={[typography.bodyMd, styles.searchInput]}
        />
      </View>

      <View style={styles.chipsRow}>
        <Pressable
          onPress={() => setFavoritesOnly(!favoritesOnly)}
          style={[styles.favoriteChip, favoritesOnly && styles.favoriteChipActive]}>
          <Ionicons
            name={favoritesOnly ? 'heart' : 'heart-outline'}
            size={14}
            color={favoritesOnly ? colors.onPrimary : colors.primary}
          />
          <Text
            style={[
              typography.labelStatus,
              styles.favoriteChipText,
              favoritesOnly && styles.favoriteChipTextActive,
            ]}>
            Favorites
          </Text>
        </Pressable>
        <FilterChipsRow active={activeAmenityFilters} onToggle={toggleAmenityFilter} />
      </View>

      {!location && !permissionDenied && (
        <View style={styles.locatingBanner}>
          <ActivityIndicator size="small" color={colors.secondary} />
          <Text style={[typography.bodySm, styles.locatingText]}>
            Finding your location to sort by distance…
          </Text>
        </View>
      )}

      {loading ? (
        <View style={styles.loadingBlock}>
          <Text style={[typography.bodySm, styles.loadingText]}>Loading stations…</Text>
        </View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => item.station.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyBlock}>
              <Text style={[typography.bodySm, styles.loadingText]}>
                No stations match your search.
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <StationCard
              station={item.station}
              distanceKm={item.distanceKm}
              isFavorite={isFavorite(item.station.id)}
              onToggleFavorite={() => toggleFavorite(item.station.id)}
              onPress={() => router.push(`/station/${item.station.id}`)}
            />
          )}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.gutter,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceContainerLow,
  },
  searchInput: {
    marginLeft: spacing.sm,
    flex: 1,
    color: colors.onSurface,
  },
  chipsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.gutter,
    paddingBottom: spacing.sm,
  },
  favoriteChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.full,
    backgroundColor: colors.primaryFixed,
  },
  favoriteChipActive: {
    backgroundColor: colors.primary,
  },
  favoriteChipText: {
    color: colors.onPrimaryFixedVariant,
    textTransform: 'none',
  },
  favoriteChipTextActive: {
    color: colors.onPrimary,
  },
  loadingBlock: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  locatingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginHorizontal: spacing.gutter,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.secondaryContainer,
  },
  locatingText: {
    flex: 1,
    color: colors.onSecondaryContainer,
  },
  emptyBlock: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  loadingText: {
    color: colors.outline,
  },
  listContent: {
    paddingTop: spacing.xs,
    paddingBottom: spacing.xl,
  },
});
