// The dataset has inconsistent spacing across zones ("SXP91" vs "SXP 91"),
// so comparisons go through a normalized lookup rather than exact string match.
export const CANONICAL_PRODUCTS = ['SXP 91', 'SXP 95', 'DXP'] as const;
export type CanonicalProduct = (typeof CANONICAL_PRODUCTS)[number];

function normalize(raw: string): string {
  return raw.replace(/\s+/g, '').toUpperCase();
}

const LOOKUP: Record<string, CanonicalProduct> = {};
CANONICAL_PRODUCTS.forEach((product) => {
  LOOKUP[normalize(product)] = product;
});

export function canonicalProduct(raw: string): CanonicalProduct | null {
  return LOOKUP[normalize(raw)] ?? null;
}

export function getStationProducts(products: string[]): CanonicalProduct[] {
  const present = new Set(products.map(canonicalProduct).filter((p): p is CanonicalProduct => p !== null));
  return CANONICAL_PRODUCTS.filter((product) => present.has(product));
}

export function stationSellsProduct(products: string[], target: CanonicalProduct): boolean {
  return products.some((p) => canonicalProduct(p) === target);
}
