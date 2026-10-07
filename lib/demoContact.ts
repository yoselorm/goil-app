// We don't have real per-station contact numbers in the dataset. These are
// deterministically generated from the station id purely for demo purposes —
// stable across renders, but not real phone numbers.
const GHANA_MOBILE_PREFIXES = ['24', '20', '27', '50', '54', '55', '59', '26', '56'];

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}

export function getDemoContactPhone(stationId: string): string {
  const hash = hashString(stationId);
  const prefix = GHANA_MOBILE_PREFIXES[hash % GHANA_MOBILE_PREFIXES.length];
  const rest = (hash % 10_000_000).toString().padStart(7, '0');
  return `+233 ${prefix} ${rest.slice(0, 3)} ${rest.slice(3)}`;
}

export function getDemoContactTelUrl(stationId: string): string {
  return `tel:${getDemoContactPhone(stationId).replace(/\s/g, '')}`;
}
