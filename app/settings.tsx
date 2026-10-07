import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RadiusSlider } from '../components/RadiusSlider';
import {
  SettingsCard,
  SettingsDivider,
  SettingsRow,
  SettingsSectionLabel,
  SettingsToggleRow,
} from '../components/SettingsRow';
import { GEOFENCE_LIMIT, restartGeofencing, stopGeofencing } from '../lib/geofencing';
import { AMENITY_FILTERS } from '../lib/filters';
import packageJson from '../package.json';
import { useSettings, type MapProvider } from '../lib/settingsStore';
import { hasCoordinates } from '../lib/types';
import { useStations } from '../lib/useStations';
import { usePermissionsStatus } from '../lib/usePermissionsStatus';
import { colors, radius, spacing, typography } from '../src/theme';

const MAP_PROVIDERS: { key: MapProvider; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'apple', label: 'Apple', icon: 'compass-outline' },
  { key: 'google', label: 'Google', icon: 'map-outline' },
  { key: 'waze', label: 'Waze', icon: 'navigate-outline' },
];

const DEFAULT_FILTER_OPTIONS = AMENITY_FILTERS.slice(0, 6);

function formatPermission(status: string | null): string {
  if (status === 'granted') return 'Granted';
  if (status === 'denied') return 'Denied';
  if (status === 'undetermined') return 'Not requested';
  return 'Unknown';
}

export default function SettingsScreen() {
  const { settings, updateSettings, resetSettings } = useSettings();
  const { stations } = useStations();
  const monitorableCount = stations.filter(hasCoordinates).length;
  const monitoredCount = Math.min(monitorableCount, GEOFENCE_LIMIT);
  const { status, refresh } = usePermissionsStatus();
  const [restarting, setRestarting] = useState(false);

  const handleToggleBackgroundMonitoring = async (value: boolean) => {
    updateSettings({ backgroundMonitoringEnabled: value });
    if (!value) {
      await stopGeofencing();
    } else {
      setRestarting(true);
      await restartGeofencing();
      setRestarting(false);
      refresh();
    }
  };

  const handleRadiusChange = async (meters: number) => {
    updateSettings({ geofenceRadiusMeters: Math.round(meters) });
  };

  const handleRadiusComplete = async () => {
    if (!settings.backgroundMonitoringEnabled) return;
    setRestarting(true);
    await restartGeofencing();
    setRestarting(false);
  };

  const toggleDefaultFilter = (key: string) => {
    const next = settings.defaultAmenityFilters.includes(key)
      ? settings.defaultAmenityFilters.filter((k) => k !== key)
      : [...settings.defaultAmenityFilters, key];
    updateSettings({ defaultAmenityFilters: next });
  };

  const handleReset = () => {
    Alert.alert('Reset preferences?', 'This resets radius, navigation, and filter defaults.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reset',
        style: 'destructive',
        onPress: () => resetSettings(),
      },
    ]);
  };

  return (
    <SafeAreaView edges={['bottom']} style={styles.screen}>
      <Stack.Screen options={{ title: 'Settings' }} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View>
          <SettingsSectionLabel icon="radio" title="Geofence & Proximity Radar" />
          <SettingsCard>
            <View style={styles.radiusBlock}>
              <RadiusSlider
                label="Geofence Radius"
                sublabel="Distance that triggers a proximity alert"
                value={settings.geofenceRadiusMeters}
                minimumValue={100}
                maximumValue={2000}
                step={50}
                unit="m"
                onValueChange={handleRadiusChange}
                onSlidingComplete={handleRadiusComplete}
                formatValue={(v) => Math.round(v).toString()}
              />
              {restarting && (
                <Text style={[typography.bodySm, styles.restartingText]}>Restarting radar…</Text>
              )}
            </View>
            <SettingsDivider />
            <SettingsToggleRow
              icon="pulse-outline"
              title="Background Monitoring"
              subtitle={`Monitors the ${monitoredCount} nearest of ${monitorableCount} mapped stations`}
              value={settings.backgroundMonitoringEnabled}
              onValueChange={handleToggleBackgroundMonitoring}
            />
          </SettingsCard>
        </View>

        <View>
          <SettingsSectionLabel icon="navigate" title="Navigation Routing App" />
          <SettingsCard>
            <View style={styles.providerRow}>
              {MAP_PROVIDERS.map((provider) => {
                const isActive = settings.mapProvider === provider.key;
                return (
                  <Pressable
                    key={provider.key}
                    onPress={() => updateSettings({ mapProvider: provider.key })}
                    style={[styles.providerButton, isActive && styles.providerButtonActive]}>
                    <Ionicons
                      name={provider.icon}
                      size={16}
                      color={isActive ? colors.primary : colors.onSurfaceVariant}
                    />
                    <Text
                      style={[
                        typography.labelButton,
                        styles.providerText,
                        isActive && styles.providerTextActive,
                      ]}>
                      {provider.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <SettingsDivider />
            <SettingsToggleRow
              icon="help-circle-outline"
              title="Confirm Before Navigating"
              subtitle="Ask before opening the external map app"
              value={!settings.autoLaunchNavigation}
              onValueChange={(v) => updateSettings({ autoLaunchNavigation: !v })}
            />
          </SettingsCard>
        </View>

        <View>
          <SettingsSectionLabel icon="pricetags-outline" title="Default Amenity Filters" />
          <SettingsCard>
            <View style={styles.chipWrap}>
              {DEFAULT_FILTER_OPTIONS.map((filter) => {
                const isActive = settings.defaultAmenityFilters.includes(filter.key);
                return (
                  <Pressable
                    key={filter.key}
                    onPress={() => toggleDefaultFilter(filter.key)}
                    style={[styles.filterChip, isActive && styles.filterChipActive]}>
                    <Ionicons
                      name={filter.icon as keyof typeof Ionicons.glyphMap}
                      size={14}
                      color={isActive ? colors.onSecondary : colors.onSurfaceVariant}
                    />
                    <Text
                      style={[
                        typography.labelStatus,
                        styles.filterChipText,
                        isActive && styles.filterChipTextActive,
                      ]}>
                      {filter.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </SettingsCard>
        </View>

        <View>
          <SettingsSectionLabel icon="server-outline" title="Bundled Station Dataset" />
          <SettingsCard>
            <SettingsRow
              icon="cloud-done-outline"
              title={`${stations.length} stations loaded`}
              subtitle="Offline Ready · No network required"
            />
          </SettingsCard>
        </View>

        <View>
          <SettingsSectionLabel icon="shield-outline" title="Device Permissions" />
          <SettingsCard>
            <SettingsRow
              icon="location-outline"
              iconColor={colors.secondary}
              title="Location Access"
              subtitle={`Foreground: ${formatPermission(status.foregroundLocation)} · Background: ${formatPermission(status.backgroundLocation)}`}
            />
            <SettingsDivider />
            <SettingsRow
              icon="notifications-outline"
              iconColor={colors.primaryContainer}
              title="Push Notifications"
              subtitle={formatPermission(status.notifications)}
            />
          </SettingsCard>
        </View>

        <Pressable onPress={handleReset} style={styles.resetButton}>
          <Ionicons name="refresh" size={18} color={colors.error} />
          <Text style={[typography.labelButton, styles.resetText]}>Reset All Preferences</Text>
        </Pressable>

        <Text style={[typography.bodySm, styles.footer]}>
          Ghana Oil Company PLC (GOIL) · Good Energy for Life{'\n'}v{packageJson.version} · Expo 57
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  scrollContent: {
    padding: spacing.gutter,
    gap: spacing.lg,
  },
  radiusBlock: {
    padding: spacing.md,
    gap: spacing.xs,
  },
  restartingText: {
    color: colors.secondary,
  },
  providerRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    padding: spacing.sm,
  },
  providerButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceContainer,
  },
  providerButtonActive: {
    backgroundColor: colors.surfaceContainerLowest,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  providerText: {
    color: colors.onSurfaceVariant,
  },
  providerTextActive: {
    color: colors.primary,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    padding: spacing.md,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceContainer,
  },
  filterChipActive: {
    backgroundColor: colors.secondary,
  },
  filterChipText: {
    color: colors.onSurfaceVariant,
    textTransform: 'none',
  },
  filterChipTextActive: {
    color: colors.onSecondary,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm + 6,
    borderRadius: radius.lg,
    backgroundColor: colors.errorContainer + '66',
  },
  resetText: {
    color: colors.error,
  },
  footer: {
    textAlign: 'center',
    color: colors.outline,
    lineHeight: 18,
  },
});
