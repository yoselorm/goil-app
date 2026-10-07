import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { readSettings } from './settingsStore';
import type { Zone } from './types';

interface FilterState {
  searchQuery: string;
  activeAmenityFilters: string[];
  activeZones: Zone[];
  searchRadiusKm: number;
  favoritesOnly: boolean;
}

interface FilterContextValue extends FilterState {
  setSearchQuery: (value: string) => void;
  toggleAmenityFilter: (key: string) => void;
  toggleZone: (zone: Zone) => void;
  setSearchRadiusKm: (value: number) => void;
  setFavoritesOnly: (value: boolean) => void;
  resetFilters: () => void;
}

export const DEFAULT_SEARCH_RADIUS_KM = 5;

const DEFAULT_STATE: FilterState = {
  searchQuery: '',
  activeAmenityFilters: [],
  activeZones: [],
  searchRadiusKm: DEFAULT_SEARCH_RADIUS_KM,
  favoritesOnly: false,
};

const FilterContext = createContext<FilterContextValue | null>(null);

export function FilterProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<FilterState>(DEFAULT_STATE);

  useEffect(() => {
    readSettings().then((settings) => {
      if (settings.defaultAmenityFilters.length > 0) {
        setState((s) => ({ ...s, activeAmenityFilters: settings.defaultAmenityFilters }));
      }
    });
  }, []);

  const setSearchQuery = useCallback(
    (value: string) => setState((s) => ({ ...s, searchQuery: value })),
    []
  );

  const toggleAmenityFilter = useCallback(
    (key: string) =>
      setState((s) => ({
        ...s,
        activeAmenityFilters: s.activeAmenityFilters.includes(key)
          ? s.activeAmenityFilters.filter((k) => k !== key)
          : [...s.activeAmenityFilters, key],
      })),
    []
  );

  const toggleZone = useCallback(
    (zone: Zone) =>
      setState((s) => ({
        ...s,
        activeZones: s.activeZones.includes(zone)
          ? s.activeZones.filter((z) => z !== zone)
          : [...s.activeZones, zone],
      })),
    []
  );

  const setSearchRadiusKm = useCallback(
    (value: number) => setState((s) => ({ ...s, searchRadiusKm: value })),
    []
  );

  const setFavoritesOnly = useCallback(
    (value: boolean) => setState((s) => ({ ...s, favoritesOnly: value })),
    []
  );

  const resetFilters = useCallback(() => setState(DEFAULT_STATE), []);

  const value = useMemo<FilterContextValue>(
    () => ({
      ...state,
      setSearchQuery,
      toggleAmenityFilter,
      toggleZone,
      setSearchRadiusKm,
      setFavoritesOnly,
      resetFilters,
    }),
    [state, setSearchQuery, toggleAmenityFilter, toggleZone, setSearchRadiusKm, setFavoritesOnly, resetFilters]
  );

  return <FilterContext.Provider value={value}>{children}</FilterContext.Provider>;
}

export function useFilterState() {
  const context = useContext(FilterContext);
  if (!context) throw new Error('useFilterState must be used within a FilterProvider');
  return context;
}
