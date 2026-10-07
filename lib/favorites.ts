import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'goil.favorites';

export function useFavorites() {
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((value) => {
      setFavoriteIds(value ? JSON.parse(value) : []);
      setLoaded(true);
    });
  }, []);

  const toggleFavorite = useCallback((stationId: string) => {
    setFavoriteIds((current) => {
      const next = current.includes(stationId)
        ? current.filter((id) => id !== stationId)
        : [...current, stationId];
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const isFavorite = useCallback(
    (stationId: string) => favoriteIds.includes(stationId),
    [favoriteIds]
  );

  return { favoriteIds, isFavorite, toggleFavorite, loaded };
}
