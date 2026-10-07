export interface RouteCoordinate {
  latitude: number;
  longitude: number;
}

export interface RouteResult {
  coordinates: RouteCoordinate[];
  distanceKm: number;
  durationMin: number;
  approximate: boolean;
}

const OSRM_URL = 'https://router.project-osrm.org/route/v1/driving';
const FETCH_TIMEOUT_MS = 8000;

function straightLineFallback(from: RouteCoordinate, to: RouteCoordinate): RouteResult {
  return {
    coordinates: [from, to],
    distanceKm: 0,
    durationMin: 0,
    approximate: true,
  };
}

export async function fetchRoute(from: RouteCoordinate, to: RouteCoordinate): Promise<RouteResult> {
  const url = `${OSRM_URL}/${from.longitude},${from.latitude};${to.longitude},${to.latitude}?overview=full&geometries=geojson`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) return straightLineFallback(from, to);

    const data = await response.json();
    const route = data?.routes?.[0];
    if (!route?.geometry?.coordinates) return straightLineFallback(from, to);

    const coordinates: RouteCoordinate[] = route.geometry.coordinates.map(
      ([longitude, latitude]: [number, number]) => ({ latitude, longitude })
    );

    return {
      coordinates,
      distanceKm: route.distance / 1000,
      durationMin: route.duration / 60,
      approximate: false,
    };
  } catch {
    return straightLineFallback(from, to);
  } finally {
    clearTimeout(timeout);
  }
}
