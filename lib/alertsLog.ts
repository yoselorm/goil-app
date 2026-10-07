import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

export interface AlertEvent {
  id: string;
  stationId: string;
  stationName: string;
  amenityLabel: string;
  timestamp: number;
  source: 'geofence' | 'simulated';
}

const STORAGE_KEY = 'goil.alertsLog';
const MAX_EVENTS = 50;

export async function addAlertEvent(event: Omit<AlertEvent, 'id' | 'timestamp'>): Promise<void> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  const events: AlertEvent[] = raw ? JSON.parse(raw) : [];
  const next: AlertEvent[] = [
    { ...event, id: `${Date.now()}-${event.stationId}`, timestamp: Date.now() },
    ...events,
  ].slice(0, MAX_EVENTS);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

export async function readAlertEvents(): Promise<AlertEvent[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

export async function clearAlertEvents(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY);
}

export function useAlertsLog() {
  const [events, setEvents] = useState<AlertEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    setLoading(true);
    readAlertEvents().then((value) => {
      setEvents(value);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const clear = useCallback(async () => {
    await clearAlertEvents();
    setEvents([]);
  }, []);

  return { events, loading, refresh, clear };
}
