import type { PlacePhoto, PlaceTip } from '@models';

const PREMIUM_FIELDS = new Set(['rating', 'price', 'photos', 'tips']);

const TIP_SAMPLES = [
  'Cozy spot with great vibes — would come back.',
  'Service was quick and the staff was friendly.',
  'Loved the atmosphere, perfect for a casual evening.',
  'Bit pricey but worth it for the quality.',
  'Hidden gem, surprised more people don’t know about it.',
  'Solid choice if you’re in the area.',
  'Decent, but nothing special.',
  'Highly recommend the seasonal menu.',
];

function _hash(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return h;
}

export function stripPremiumFields(fields: string | undefined): string | undefined {
  if (!fields) return fields;
  const filtered = fields
    .split(',')
    .map((f) => f.trim())
    .filter((f) => f && !PREMIUM_FIELDS.has(f));
  return filtered.length ? filtered.join(',') : undefined;
}

export function mockRating(seed: string): number {
  const h = _hash(seed);
  return Math.round((6 + (h % 36) / 10) * 10) / 10;
}

export function mockPrice(seed: string): number {
  return (_hash(seed) % 4) + 1;
}

export function mockPhotos(seed: string, count = 4): PlacePhoto[] {
  const base = _hash(seed);
  return Array.from({ length: count }, (_, i) => ({
    id: `mock-photo-${seed}-${i}`,
    created_at: new Date(2025, 0, 1 + ((base + i) % 300)).toISOString(),
    classifications: [],
    prefix: 'https://placehold.co/',
    suffix: `/png?text=${encodeURIComponent(`${seed.slice(0, 6)}+${i + 1}`)}`,
    width: 800,
    height: 600,
  }));
}

export function mockTips(seed: string, count = 5): PlaceTip[] {
  const base = _hash(seed);
  return Array.from({ length: count }, (_, i) => ({
    created_at: new Date(2025, 0, 1 + ((base + i * 7) % 300)).toISOString(),
    text: TIP_SAMPLES[(base + i) % TIP_SAMPLES.length],
  }));
}
