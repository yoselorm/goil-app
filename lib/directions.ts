import { Linking, Platform } from 'react-native';

import type { MapProvider } from './settingsStore';

const GOOGLE_WEB_FALLBACK = (lat: number, lng: number) =>
  `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

function schemeFor(provider: MapProvider, latitude: number, longitude: number, label: string) {
  const encodedLabel = encodeURIComponent(label);
  switch (provider) {
    case 'apple':
      return `maps:0,0?q=${encodedLabel}@${latitude},${longitude}`;
    case 'google':
      return Platform.OS === 'ios'
        ? `comgooglemaps://?daddr=${latitude},${longitude}&q=${encodedLabel}`
        : `geo:0,0?q=${latitude},${longitude}(${encodedLabel})`;
    case 'waze':
      return `waze://?ll=${latitude},${longitude}&navigate=yes`;
  }
}

export async function openDirections(
  latitude: number,
  longitude: number,
  label: string,
  provider: MapProvider = Platform.OS === 'ios' ? 'apple' : 'google'
) {
  const scheme = schemeFor(provider, latitude, longitude, label);
  const fallback = GOOGLE_WEB_FALLBACK(latitude, longitude);

  const supported = scheme ? await Linking.canOpenURL(scheme) : false;
  await Linking.openURL(supported ? scheme : fallback);
}
