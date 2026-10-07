import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import * as TaskManager from 'expo-task-manager';
import { Platform } from 'react-native';

import { addAlertEvent } from './alertsLog';
import { haversineDistanceKm } from './distance';
import { DEFAULT_GEOFENCE_RADIUS_METERS, readSettings } from './settingsStore';
import { fetchStationById, fetchStations } from './stations';
import { hasCoordinates, type Station } from './types';

export const GEOFENCE_TASK = 'goil-station-geofence';
export { DEFAULT_GEOFENCE_RADIUS_METERS };

// iOS (CoreLocation) hard-caps concurrently monitored regions at 20; Android allows 100.
export const GEOFENCE_LIMIT = Platform.OS === 'ios' ? 20 : 100;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export function topAmenityLabel(station: Station): string {
  const { amenities } = station;
  if (amenities.goCafe) return 'Go Café';
  if (amenities.pharmacy) return 'Pharmacy';
  if (amenities.restaurant) return 'Restaurant';
  if (amenities.atm) return 'ATM';
  if (amenities.goCard) return 'Go Card accepted';
  return 'fuel and services';
}

export async function notifyStationArrival(
  station: Station,
  source: 'geofence' | 'simulated' = 'simulated'
) {
  const amenityLabel = topAmenityLabel(station);
  await Notifications.scheduleNotificationAsync({
    content: {
      title: `You're near ${station.name}`,
      body: `${amenityLabel} available at this station.`,
    },
    trigger: null,
  });
  await addAlertEvent({
    stationId: station.id,
    stationName: station.name,
    amenityLabel,
    source,
  });
}

TaskManager.defineTask(GEOFENCE_TASK, async ({ data, error }) => {
  if (error) return;
  const { eventType, region } = data as {
    eventType: Location.GeofencingEventType;
    region: Location.LocationRegion;
  };

  if (eventType === Location.GeofencingEventType.Enter && region.identifier) {
    const station = await fetchStationById(region.identifier);
    if (station) await notifyStationArrival(station, 'geofence');
  }
});

export type SetupStep =
  | 'notifications'
  | 'foreground-location'
  | 'background-location'
  | 'loading-zones'
  | 'registering-geofences'
  | 'ready'
  | 'permission-denied';

export interface GeofencingResult {
  success: boolean;
  /** Stations actually registered as OS-level regions (capped by GEOFENCE_LIMIT). */
  registeredCount: number;
  /** Stations with coordinates that could be monitored at all. */
  eligibleCount: number;
}

export async function setupGeofencing(
  onStep?: (step: SetupStep) => void
): Promise<GeofencingResult> {
  onStep?.('notifications');
  const notificationPermission = await Notifications.requestPermissionsAsync();
  if (!notificationPermission.granted) {
    onStep?.('permission-denied');
    return { success: false, registeredCount: 0, eligibleCount: 0 };
  }

  onStep?.('foreground-location');
  const foreground = await Location.requestForegroundPermissionsAsync();
  if (!foreground.granted) {
    onStep?.('permission-denied');
    return { success: false, registeredCount: 0, eligibleCount: 0 };
  }

  onStep?.('background-location');
  const background = await Location.requestBackgroundPermissionsAsync();
  if (!background.granted) {
    onStep?.('permission-denied');
    return { success: false, registeredCount: 0, eligibleCount: 0 };
  }

  onStep?.('loading-zones');
  const allStations = await fetchStations();
  const stations = allStations.filter(hasCoordinates);
  const settings = await readSettings();

  if (!settings.backgroundMonitoringEnabled) {
    onStep?.('ready');
    return { success: true, registeredCount: 0, eligibleCount: stations.length };
  }

  onStep?.('registering-geofences');

  // The OS only allows a limited number of concurrently monitored regions, so
  // once the dataset grows past that we prioritize the stations nearest to
  // the user rather than registering an arbitrary first-N.
  let targetStations = stations;
  if (stations.length > GEOFENCE_LIMIT) {
    let origin: { latitude: number; longitude: number } | null = null;
    try {
      const last = await Location.getLastKnownPositionAsync();
      origin = last?.coords ?? null;
    } catch {
      origin = null;
    }

    targetStations = origin
      ? [...stations]
          .sort((a, b) => haversineDistanceKm(origin!, a) - haversineDistanceKm(origin!, b))
          .slice(0, GEOFENCE_LIMIT)
      : stations.slice(0, GEOFENCE_LIMIT);
  }

  await Location.startGeofencingAsync(
    GEOFENCE_TASK,
    targetStations.map((station) => ({
      identifier: station.id,
      latitude: station.latitude,
      longitude: station.longitude,
      radius: settings.geofenceRadiusMeters,
      notifyOnEnter: true,
      notifyOnExit: false,
    }))
  );

  onStep?.('ready');
  return { success: true, registeredCount: targetStations.length, eligibleCount: stations.length };
}

export async function stopGeofencing(): Promise<void> {
  const isRegistered = await Location.hasStartedGeofencingAsync(GEOFENCE_TASK);
  if (isRegistered) await Location.stopGeofencingAsync(GEOFENCE_TASK);
}

export async function restartGeofencing(
  onStep?: (step: SetupStep) => void
): Promise<GeofencingResult> {
  await stopGeofencing();
  return setupGeofencing(onStep);
}
