export type Zone = 'SOUTH' | 'WEST' | 'TEMA' | 'UMBZ' | 'NORTH' | 'SOUTH EAST' | 'MBZ';

export interface StationServices {
  vehicleService: boolean;
  tyreService: boolean;
  washingBay: boolean;
}

export interface StationAmenities {
  goCafe: boolean;
  goCard: boolean;
  coupons: boolean;
  bankCards: boolean;
  mobilePay: boolean;
  atm: boolean;
  pharmacy: boolean;
  restaurant: boolean;
  lpgExchange: boolean;
  others: string | null;
}

export interface StationHours {
  opening: string | null;
  closing: string | null;
  is24Hours: boolean;
}

export interface Station {
  id: string;
  name: string;
  zone: Zone;
  /** Null when the survey didn't record a GPS address for this station yet. */
  gpsAddress: string | null;
  /** Null when coordinates weren't recorded or need on-site verification. */
  latitude: number | null;
  longitude: number | null;
  products: string[];
  services: StationServices;
  amenities: StationAmenities;
  hours: StationHours;
  comments: string | null;
}

export interface StationWithCoords extends Station {
  latitude: number;
  longitude: number;
}

export function hasCoordinates(station: Station): station is StationWithCoords {
  return station.latitude !== null && station.longitude !== null;
}

export interface StationWithDistance extends Station {
  distanceKm: number | null;
}
