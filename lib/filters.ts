import type { Station } from './types';

export interface StationFilter {
  key: string;
  label: string;
  icon: string;
  get: (station: Station) => boolean;
}

export const STATION_FILTERS: StationFilter[] = [
  { key: 'goCafe', label: 'Go Café', icon: 'cafe-outline', get: (s) => s.amenities.goCafe },
  { key: 'pharmacy', label: 'Pharmacy', icon: 'medkit-outline', get: (s) => s.amenities.pharmacy },
  { key: 'is24Hours', label: '24 Hours', icon: 'time-outline', get: (s) => s.hours.is24Hours },
  { key: 'lpgExchange', label: 'LPG Exchange', icon: 'flame-outline', get: (s) => s.amenities.lpgExchange },
  { key: 'atm', label: 'ATM', icon: 'cash-outline', get: (s) => s.amenities.atm },
  { key: 'restaurant', label: 'Restaurant', icon: 'restaurant-outline', get: (s) => s.amenities.restaurant },
  { key: 'goCard', label: 'Go Card', icon: 'card-outline', get: (s) => s.amenities.goCard },
  { key: 'bankCards', label: 'Bank Cards', icon: 'wallet-outline', get: (s) => s.amenities.bankCards },
  { key: 'mobilePay', label: 'Mobile Pay', icon: 'phone-portrait-outline', get: (s) => s.amenities.mobilePay },
  { key: 'coupons', label: 'Coupons', icon: 'pricetag-outline', get: (s) => s.amenities.coupons },
  { key: 'vehicleService', label: 'Vehicle Service', icon: 'construct-outline', get: (s) => s.services.vehicleService },
  { key: 'tyreService', label: 'Tyre Service', icon: 'disc-outline', get: (s) => s.services.tyreService },
  { key: 'washingBay', label: 'Washing Bay', icon: 'water-outline', get: (s) => s.services.washingBay },
];

export function matchesFilters(station: Station, activeFilters: string[]): boolean {
  return activeFilters.every((key) => {
    const filter = STATION_FILTERS.find((f) => f.key === key);
    return filter ? filter.get(station) : true;
  });
}

export function matchesSearch(station: Station, query: string): boolean {
  if (!query.trim()) return true;
  const haystack = `${station.name} ${station.zone}`.toLowerCase();
  return haystack.includes(query.trim().toLowerCase());
}

export function matchesZones(station: Station, activeZones: string[]): boolean {
  if (activeZones.length === 0) return true;
  return activeZones.includes(station.zone);
}
