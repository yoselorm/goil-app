import { CANONICAL_PRODUCTS, stationSellsProduct } from './products';
import type { Station } from './types';

export interface StationFilter {
  key: string;
  label: string;
  icon: string;
  category: 'amenity' | 'product';
  get: (station: Station) => boolean;
}

export const STATION_FILTERS: StationFilter[] = [
  { key: 'goCafe', label: 'Go Café', icon: 'cafe-outline', category: 'amenity', get: (s) => s.amenities.goCafe },
  { key: 'pharmacy', label: 'Pharmacy', icon: 'medkit-outline', category: 'amenity', get: (s) => s.amenities.pharmacy },
  { key: 'is24Hours', label: '24 Hours', icon: 'time-outline', category: 'amenity', get: (s) => s.hours.is24Hours },
  { key: 'lpgExchange', label: 'LPG Exchange', icon: 'flame-outline', category: 'amenity', get: (s) => s.amenities.lpgExchange },
  { key: 'atm', label: 'ATM', icon: 'cash-outline', category: 'amenity', get: (s) => s.amenities.atm },
  { key: 'restaurant', label: 'Restaurant', icon: 'restaurant-outline', category: 'amenity', get: (s) => s.amenities.restaurant },
  { key: 'goCard', label: 'Go Card', icon: 'card-outline', category: 'amenity', get: (s) => s.amenities.goCard },
  { key: 'bankCards', label: 'Bank Cards', icon: 'wallet-outline', category: 'amenity', get: (s) => s.amenities.bankCards },
  { key: 'mobilePay', label: 'Mobile Pay', icon: 'phone-portrait-outline', category: 'amenity', get: (s) => s.amenities.mobilePay },
  { key: 'coupons', label: 'Coupons', icon: 'pricetag-outline', category: 'amenity', get: (s) => s.amenities.coupons },
  { key: 'vehicleService', label: 'Vehicle Service', icon: 'construct-outline', category: 'amenity', get: (s) => s.services.vehicleService },
  { key: 'tyreService', label: 'Tyre Service', icon: 'disc-outline', category: 'amenity', get: (s) => s.services.tyreService },
  { key: 'washingBay', label: 'Washing Bay', icon: 'water-outline', category: 'amenity', get: (s) => s.services.washingBay },
  ...CANONICAL_PRODUCTS.map(
    (product): StationFilter => ({
      key: `product-${product}`,
      label: product,
      icon: 'water-outline',
      category: 'product',
      get: (s) => stationSellsProduct(s.products, product),
    })
  ),
];

export const AMENITY_FILTERS = STATION_FILTERS.filter((f) => f.category === 'amenity');
export const PRODUCT_FILTERS = STATION_FILTERS.filter((f) => f.category === 'product');

export function matchesFilters(station: Station, activeFilters: string[]): boolean {
  return activeFilters.every((key) => {
    const filter = STATION_FILTERS.find((f) => f.key === key);
    return filter ? filter.get(station) : true;
  });
}

export function matchesSearch(station: Station, query: string): boolean {
  if (!query.trim()) return true;
  const haystack = `${station.name} ${station.zone} ${station.amenities.others ?? ''}`.toLowerCase();
  return haystack.includes(query.trim().toLowerCase());
}

export function matchesZones(station: Station, activeZones: string[]): boolean {
  if (activeZones.length === 0) return true;
  return activeZones.includes(station.zone);
}
