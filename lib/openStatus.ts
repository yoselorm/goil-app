import type { Station } from './types';

interface ParsedTime {
  hours: number;
  minutes: number;
}

function parseTimeString(raw: string | null): ParsedTime | null {
  if (!raw) return null;

  const cleaned = raw.toUpperCase().replace(/\./g, '').trim();
  const meridiemMatch = cleaned.match(/(AM|PM)\s*$/);
  const meridiem = meridiemMatch?.[1] ?? null;
  const numericPart = cleaned.replace(/(AM|PM)\s*$/, '').trim();

  if (!numericPart) return null;

  let hours: number;
  let minutes = 0;

  if (numericPart.includes(':')) {
    const [h, m] = numericPart.split(':');
    hours = parseInt(h, 10);
    minutes = parseInt(m, 10) || 0;
  } else {
    hours = parseInt(numericPart, 10);
  }

  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;

  if (meridiem === 'PM' && hours !== 12) hours += 12;
  if (meridiem === 'AM' && hours === 12) hours = 0;

  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;

  return { hours, minutes };
}

function formatTime({ hours, minutes }: ParsedTime): string {
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 === 0 ? 12 : hours % 12;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}

export type OpenStatus =
  | { kind: '24h'; label: string }
  | { kind: 'open'; label: string; detail: string }
  | { kind: 'closed'; label: string; detail: string }
  | { kind: 'unknown'; label: null };

export function getOpenStatus(station: Station, now: Date = new Date()): OpenStatus {
  if (station.hours.is24Hours) {
    return { kind: '24h', label: 'Open 24/7' };
  }

  const open = parseTimeString(station.hours.opening);
  const close = parseTimeString(station.hours.closing);
  if (!open || !close) {
    return { kind: 'unknown', label: null };
  }

  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const openMinutes = open.hours * 60 + open.minutes;
  const closeMinutes = close.hours * 60 + close.minutes;

  const isOpen =
    closeMinutes <= openMinutes
      ? nowMinutes >= openMinutes || nowMinutes < closeMinutes // overnight wrap
      : nowMinutes >= openMinutes && nowMinutes < closeMinutes;

  return isOpen
    ? { kind: 'open', label: 'Open Now', detail: `Closes ${formatTime(close)}` }
    : { kind: 'closed', label: 'Closed', detail: `Opens ${formatTime(open)}` };
}
