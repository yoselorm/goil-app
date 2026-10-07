import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

interface RouteContextValue {
  activeRouteStationId: string | null;
  previewRoute: (stationId: string) => void;
  clearRoute: () => void;
}

const RouteContext = createContext<RouteContextValue | null>(null);

export function RouteProvider({ children }: { children: ReactNode }) {
  const [activeRouteStationId, setActiveRouteStationId] = useState<string | null>(null);

  const previewRoute = useCallback((stationId: string) => setActiveRouteStationId(stationId), []);
  const clearRoute = useCallback(() => setActiveRouteStationId(null), []);

  const value = useMemo(
    () => ({ activeRouteStationId, previewRoute, clearRoute }),
    [activeRouteStationId, previewRoute, clearRoute]
  );

  return <RouteContext.Provider value={value}>{children}</RouteContext.Provider>;
}

export function useRouteState() {
  const context = useContext(RouteContext);
  if (!context) throw new Error('useRouteState must be used within a RouteProvider');
  return context;
}
