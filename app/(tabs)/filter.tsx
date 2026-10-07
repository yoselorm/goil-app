import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AmenityFilterGrid } from '../../components/AmenityFilterGrid';
import { RadiusSlider } from '../../components/RadiusSlider';
import { ZoneChips } from '../../components/ZoneChips';
import { haversineDistanceKm } from '../../lib/distance';
import { useFilterState } from '../../lib/FilterContext';
import { AMENITY_FILTERS, matchesFilters, matchesSearch, matchesZones, PRODUCT_FILTERS } from '../../lib/filters';
import { hasCoordinates } from '../../lib/types';
import { useCurrentLocation } from '../../lib/useCurrentLocation';
import { useStations } from '../../lib/useStations';
import { colors, radius, spacing, typography } from '../../src/theme';

export default function FilterScreen() {
  const { stations } = useStations();
  const { location } = useCurrentLocation();
  const {
    searchQuery,
    setSearchQuery,
    activeAmenityFilters,
    toggleAmenityFilter,
    activeZones,
    toggleZone,
    searchRadiusKm,
    setSearchRadiusKm,
    resetFilters,
  } = useFilterState();

  const activeAmenityCount = activeAmenityFilters.filter((key) =>
    AMENITY_FILTERS.some((f) => f.key === key)
  ).length;

  const matchingCount = useMemo(() => {
    return stations.filter(
      (station) =>
        matchesSearch(station, searchQuery) &&
        matchesFilters(station, activeAmenityFilters) &&
        matchesZones(station, activeZones) &&
        (!location || !hasCoordinates(station) || haversineDistanceKm(location, station) <= searchRadiusKm)
    ).length;
  }, [stations, searchQuery, activeAmenityFilters, activeZones, location, searchRadiusKm]);

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerRow}>
          <View>
            <Text style={[typography.headlineMd, styles.title]}>Filter Stations</Text>
            <Text style={[typography.bodySm, styles.subtitle]}>
              Find the perfect stop along your journey
            </Text>
          </View>
          <View style={styles.verifiedPill}>
            <Ionicons name="shield-checkmark" size={14} color={colors.onSecondaryContainer} />
            <Text style={[typography.labelStatus, styles.verifiedText]}>
              {stations.length} Loaded
            </Text>
          </View>
        </View>

        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={colors.primaryContainer} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Station name or zone..."
            placeholderTextColor={colors.outline}
            style={[typography.bodyMd, styles.searchInput]}
          />
        </View>

        <Text style={[typography.headlineSm, styles.sectionTitle]}>Zone</Text>
        <ZoneChips active={activeZones} onToggle={toggleZone} />

        <View>
          <Text style={[typography.headlineSm, styles.sectionTitle]}>Fuel Products</Text>
          <View style={styles.productRow}>
            {PRODUCT_FILTERS.map((filter) => {
              const isActive = activeAmenityFilters.includes(filter.key);
              return (
                <Pressable
                  key={filter.key}
                  onPress={() => toggleAmenityFilter(filter.key)}
                  style={[styles.productChip, isActive && styles.productChipActive]}>
                  <Ionicons
                    name={filter.icon as keyof typeof Ionicons.glyphMap}
                    size={14}
                    color={isActive ? colors.onPrimary : colors.onSurfaceVariant}
                  />
                  <Text
                    style={[
                      typography.labelButton,
                      styles.productChipText,
                      isActive && styles.productChipTextActive,
                    ]}>
                    {filter.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.sectionHeaderRow}>
          <Text style={[typography.headlineSm, styles.sectionTitle]}>Amenities &amp; Services</Text>
          <Text style={[typography.labelStatus, styles.activeCount]}>
            {activeAmenityCount} active
          </Text>
        </View>
        <AmenityFilterGrid active={activeAmenityFilters} onToggle={toggleAmenityFilter} />

        <View style={styles.radiusSection}>
          <RadiusSlider
            label="Search Radius"
            sublabel="Shown on the Map tab too"
            value={searchRadiusKm}
            minimumValue={0}
            maximumValue={10}
            step={0.5}
            unit="km"
            formatValue={(v) => v.toFixed(1)}
            onValueChange={setSearchRadiusKm}
          />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable onPress={resetFilters} style={styles.resetButton}>
          <Ionicons name="refresh" size={18} color={colors.onSurfaceVariant} />
          <Text style={[typography.labelButton, styles.resetText]}>Reset</Text>
        </Pressable>
        <Pressable onPress={() => router.push('/nearby')} style={styles.applyButton}>
          <Ionicons name="options" size={18} color={colors.onPrimary} />
          <Text style={[typography.labelButton, styles.applyText]}>
            Apply Filters ({matchingCount} Stations)
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  scrollContent: {
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
    gap: spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  title: {
    color: colors.onSurface,
  },
  subtitle: {
    color: colors.onSurfaceVariant,
    marginTop: 2,
  },
  verifiedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.secondaryContainer,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  verifiedText: {
    color: colors.onSecondaryContainer,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    height: 48,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceContainerLowest,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  searchInput: {
    flex: 1,
    color: colors.onSurface,
  },
  sectionTitle: {
    color: colors.onSurface,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  activeCount: {
    color: colors.secondary,
  },
  productRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  productChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceContainerLowest,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  productChipActive: {
    backgroundColor: colors.primaryContainer,
  },
  productChipText: {
    color: colors.onSurfaceVariant,
  },
  productChipTextActive: {
    color: colors.onPrimary,
  },
  radiusSection: {
    gap: spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.gutter,
    paddingVertical: spacing.sm + 4,
    backgroundColor: colors.surfaceContainerLowest,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceContainer,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    height: 48,
    borderRadius: radius.lg,
  },
  resetText: {
    color: colors.onSurfaceVariant,
  },
  applyButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    height: 48,
    borderRadius: radius.lg,
    backgroundColor: colors.primaryContainer,
    shadowColor: colors.primaryContainer,
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  applyText: {
    color: colors.onPrimary,
  },
});
