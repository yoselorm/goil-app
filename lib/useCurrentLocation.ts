import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import { AppState } from 'react-native';

// Module-level singleton: the permission request + GPS watch is started once,
// by whichever screen asks for location first, and shared by every
// subsequent useCurrentLocation() call for the rest of the session — so
// switching screens never re-triggers a fresh GPS wait.
let cachedLocation: Location.LocationObjectCoords | null = null;
let cachedPermissionDenied = false;
let startPromise: Promise<void> | null = null;
let watching = false;
const listeners = new Set<(location: Location.LocationObjectCoords | null, denied: boolean) => void>();

function notify() {
  listeners.forEach((listener) => listener(cachedLocation, cachedPermissionDenied));
}

async function startWatching() {
  if (watching) return;
  watching = true;

  const current = await Location.getCurrentPositionAsync();
  cachedLocation = current.coords;
  cachedPermissionDenied = false;
  notify();

  // Keep tracking afterwards so the UI stays current if the user moves
  // (or changes the simulator's simulated location) — same as a ride-hailing app.
  await Location.watchPositionAsync(
    { accuracy: Location.Accuracy.Balanced, timeInterval: 5000, distanceInterval: 25 },
    (update) => {
      cachedLocation = update.coords;
      notify();
    }
  );
}

function ensureStarted(): Promise<void> {
  if (startPromise) return startPromise;

  startPromise = (async () => {
    const { granted } = await Location.requestForegroundPermissionsAsync();
    if (!granted) {
      cachedPermissionDenied = true;
      notify();
      return;
    }

    await startWatching();
  })();

  return startPromise;
}

// Catches permission being revoked (or finally granted) while the app is
// backgrounded — e.g. the user only tapped "Allow Once" last time, or went
// into Settings mid-session — by re-checking whenever the app comes back
// to the foreground, instead of only ever checking once at first request.
AppState.addEventListener('change', (state) => {
  if (state !== 'active' || !startPromise) return;

  Location.getForegroundPermissionsAsync().then(({ granted }) => {
    if (!granted) {
      cachedPermissionDenied = true;
      watching = false;
      notify();
    } else if (cachedPermissionDenied || !watching) {
      cachedPermissionDenied = false;
      startWatching();
    }
  });
});

export function useCurrentLocation() {
  const [location, setLocation] = useState(cachedLocation);
  const [permissionDenied, setPermissionDenied] = useState(cachedPermissionDenied);

  useEffect(() => {
    const listener = (nextLocation: Location.LocationObjectCoords | null, denied: boolean) => {
      setLocation(nextLocation);
      setPermissionDenied(denied);
    };
    listeners.add(listener);
    ensureStarted();

    return () => {
      listeners.delete(listener);
    };
  }, []);

  return { location, permissionDenied };
}
