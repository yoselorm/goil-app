import * as Location from 'expo-location';
import { useEffect, useState } from 'react';

export function useCurrentLocation() {
  const [location, setLocation] = useState<Location.LocationObjectCoords | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);

  useEffect(() => {
    let subscription: Location.LocationSubscription | null = null;
    let mounted = true;

    (async () => {
      const { granted } = await Location.requestForegroundPermissionsAsync();
      if (!granted) {
        if (mounted) setPermissionDenied(true);
        return;
      }

      const current = await Location.getCurrentPositionAsync();
      if (mounted) setLocation(current.coords);

      // Keep tracking afterwards so the UI stays current if the user moves
      // (or changes the simulator's simulated location).
      subscription = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.Balanced, timeInterval: 5000, distanceInterval: 25 },
        (update) => {
          if (mounted) setLocation(update.coords);
        }
      );
    })();

    return () => {
      mounted = false;
      subscription?.remove();
    };
  }, []);

  return { location, permissionDenied };
}
