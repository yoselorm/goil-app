import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { useCallback, useEffect, useState } from 'react';

interface PermissionsStatus {
  foregroundLocation: Location.PermissionStatus | null;
  backgroundLocation: Location.PermissionStatus | null;
  notifications: Notifications.PermissionStatus | null;
}

export function usePermissionsStatus() {
  const [status, setStatus] = useState<PermissionsStatus>({
    foregroundLocation: null,
    backgroundLocation: null,
    notifications: null,
  });

  const refresh = useCallback(async () => {
    const [foreground, background, notifs] = await Promise.all([
      Location.getForegroundPermissionsAsync(),
      Location.getBackgroundPermissionsAsync(),
      Notifications.getPermissionsAsync(),
    ]);
    setStatus({
      foregroundLocation: foreground.status,
      backgroundLocation: background.status,
      notifications: notifs.status,
    });
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { status, refresh };
}
