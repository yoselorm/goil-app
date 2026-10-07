import rawStations from '../assets/data/sample-stations.json';
import type { Station } from './types';

const STATIONS = rawStations as Station[];

// Single point of access for station data. Swapping the bundled JSON for a
// real API later only means changing the body of this function.
export async function fetchStations(): Promise<Station[]> {
  return STATIONS;
}

export async function fetchStationById(id: string): Promise<Station | undefined> {
  return STATIONS.find((station) => station.id === id);
}

export const ZONES: Station['zone'][] = [
  'SOUTH',
  'WEST',
  'TEMA',
  'UMBZ',
  'NORTH',
  'SOUTH EAST',
  'MBZ',
];

export const ZONE_COLORS: Record<Station['zone'], string> = {
  SOUTH: '#E11D2E',
  WEST: '#F97316',
  TEMA: '#0EA5E9',
  UMBZ: '#22C55E',
  NORTH: '#A855F7',
  'SOUTH EAST': '#EAB308',
  MBZ: '#0F766E',
};
