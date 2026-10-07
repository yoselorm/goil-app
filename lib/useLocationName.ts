import * as Location from 'expo-location';
import { useEffect, useRef, useState } from 'react';

const MIN_MOVE_METERS_TO_REGEOCODE = 300;

function distanceMeters(a: { latitude: number; longitude: number }, b: { latitude: number; longitude: number }) {
  const dLat = (b.latitude - a.latitude) * 111_320;
  const dLon = (b.longitude - a.longitude) * 111_320 * Math.cos((a.latitude * Math.PI) / 180);
  return Math.sqrt(dLat * dLat + dLon * dLon);
}

export function useLocationName(location: Location.LocationObjectCoords | null) {
  const [name, setName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const lastGeocodedAt = useRef<{ latitude: number; longitude: number } | null>(null);

  useEffect(() => {
    if (!location) return;

    if (lastGeocodedAt.current && distanceMeters(lastGeocodedAt.current, location) < MIN_MOVE_METERS_TO_REGEOCODE) {
      return;
    }

    let cancelled = false;
    setLoading(true);

    Location.reverseGeocodeAsync(location)
      .then((results) => {
        if (cancelled) return;
        const place = results[0];
        const resolved = place?.subregion || place?.city || place?.district || place?.region || null;
        if (resolved) {
          setName(resolved);
          lastGeocodedAt.current = location;
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [location]);

  return { name, loading };
}
