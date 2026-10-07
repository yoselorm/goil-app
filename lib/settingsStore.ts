import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { useCallback, useEffect, useState } from 'react';

export type MapProvider = 'apple' | 'google' | 'waze';

export interface Settings {
  geofenceRadiusMeters: number;
  backgroundMonitoringEnabled: boolean;
  mapProvider: MapProvider;
  defaultAmenityFilters: string[];
  autoLaunchNavigation: boolean;
}

export const DEFAULT_GEOFENCE_RADIUS_METERS = 300;

export const DEFAULT_SETTINGS: Settings = {
  geofenceRadiusMeters: DEFAULT_GEOFENCE_RADIUS_METERS,
  backgroundMonitoringEnabled: true,
  mapProvider: Platform.OS === 'ios' ? 'apple' : 'google',
  defaultAmenityFilters: [],
  autoLaunchNavigation: true,
};

const STORAGE_KEY = 'goil.settings';

export async function readSettings(): Promise<Settings> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return DEFAULT_SETTINGS;
  return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
}

async function writeSettings(settings: Settings): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    readSettings().then((value) => {
      setSettings(value);
      setLoaded(true);
    });
  }, []);

  const updateSettings = useCallback((patch: Partial<Settings>) => {
    setSettings((current) => {
      const next = { ...current, ...patch };
      writeSettings(next);
      return next;
    });
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    writeSettings(DEFAULT_SETTINGS);
  }, []);

  return { settings, loaded, updateSettings, resetSettings };
}
