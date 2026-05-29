import type { QueryParams } from '@api';

export function buildCacheKey(params: object): string {
  return Object.entries(params)
    .filter(([, v]) => v !== undefined)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join('&');
}

export function toQueryParams<T extends object>(params: T): QueryParams {
  return Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined),
  ) as QueryParams;
}
