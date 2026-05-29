import { Injectable, inject, signal } from '@angular/core';
import type { Signal, WritableSignal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';

import { FsqApiService } from '@api';
import type {
  FsqPlaceSearchResponseIncomingDTO,
  FsqPlaceIncomingDTO,
  FsqPhotoIncomingDTO,
  FsqTipIncomingDTO,
  PlaceSearchResponse,
  Place,
  PlacePhoto,
  PlaceTip,
  PlaceSearchParams,
  PlacePhotosParams,
  PlaceTipsParams,
  ItemState,
  ErrorType,
} from '@models';
import { Status } from '@models';
import {
  mapFsqPlaceSearchResponseToPlaceSearchResponse,
  mapFsqPlaceToPlace,
  mapFsqPhotoToPlacePhoto,
  mapFsqTipToPlaceTip,
  mockPhotos,
  mockTips,
  stripPremiumFields,
} from '@mappers';
import { buildCacheKey, toQueryParams } from '@utils';
import { environment } from '@env';

const STORAGE_PREFIX = 'fsq:v1:';
const PLACE_FIELDS_PREFIX = 'fsq:v1:fields:';

interface PersistedEntry<T> {
  data: T;
  addedAt: string;
}

@Injectable({ providedIn: 'root' })
export class FsqService {
  private readonly _api = inject(FsqApiService);
  private readonly _cache = new Map<
    string,
    WritableSignal<ItemState<unknown>>
  >();
  private readonly _inFlight = new Set<string>();
  private readonly _placeFields = new Map<string, Set<string>>();

  private _readPersisted<T>(key: string): { data: T; addedAt: Date } | null {
    try {
      const raw = localStorage.getItem(STORAGE_PREFIX + key);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as PersistedEntry<T>;
      const addedAt = new Date(parsed.addedAt);
      if (!this._isFresh(addedAt)) {
        localStorage.removeItem(STORAGE_PREFIX + key);
        return null;
      }
      return { data: parsed.data, addedAt };
    } catch {
      return null;
    }
  }

  private _writePersisted<T>(key: string, data: T, addedAt: Date): void {
    try {
      const entry: PersistedEntry<T> = { data, addedAt: addedAt.toISOString() };
      localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(entry));
    } catch {
      // quota exceeded or storage unavailable — ignore
    }
  }

  private _getSignal<T>(key: string): WritableSignal<ItemState<T>> {
    if (!this._cache.has(key)) {
      const persisted = this._readPersisted<T>(key);
      const initial: ItemState<T> = persisted
        ? {
            data: persisted.data,
            status: { status: Status.Resolved },
            addedAt: persisted.addedAt,
          }
        : { data: null, status: { status: Status.Idle }, addedAt: null };
      this._cache.set(
        key,
        signal<ItemState<unknown>>(initial as ItemState<unknown>),
      );
    }
    return this._cache.get(key)! as WritableSignal<ItemState<T>>;
  }

  private _isFresh(addedAt: Date | null): boolean {
    return (
      addedAt !== null &&
      Date.now() - addedAt.getTime() < environment.cacheTtlMs
    );
  }

  private _placeKey(fsqPlaceId: string): string {
    return `place:${fsqPlaceId}`;
  }

  private _getKnownFields(fsqPlaceId: string): Set<string> {
    let known = this._placeFields.get(fsqPlaceId);
    if (known) return known;
    try {
      const raw = localStorage.getItem(PLACE_FIELDS_PREFIX + fsqPlaceId);
      known = raw ? new Set(JSON.parse(raw) as string[]) : new Set<string>();
    } catch {
      known = new Set<string>();
    }
    this._placeFields.set(fsqPlaceId, known);
    return known;
  }

  private _addKnownFields(fsqPlaceId: string, fields: string[]): void {
    if (fields.length === 0) return;
    const known = this._getKnownFields(fsqPlaceId);
    for (const f of fields) known.add(f);
    try {
      localStorage.setItem(
        PLACE_FIELDS_PREFIX + fsqPlaceId,
        JSON.stringify([...known]),
      );
    } catch {
      // ignore
    }
  }

  private _storePlace(place: Place, fields: string[]): void {
    const key = this._placeKey(place.fsq_place_id);
    const sig = this._getSignal<Place>(key);
    const current = sig();
    const merged: Place = current.data ? { ...current.data, ...place } : place;
    const addedAt = new Date();
    sig.set({ data: merged, status: { status: Status.Resolved }, addedAt });
    this._writePersisted(key, merged, addedAt);
    this._addKnownFields(place.fsq_place_id, fields);
  }

  private _load<T>(
    key: string,
    fetch: () => Observable<T>,
  ): Signal<ItemState<T>> {
    const sig = this._getSignal<T>(key);
    const current = sig();

    if (this._isFresh(current.addedAt) && current.data !== null) {
      return sig;
    }

    if (this._inFlight.has(key)) {
      return sig;
    }

    sig.set({
      data: current.data,
      status: { status: Status.Loading },
      addedAt: current.addedAt,
    });
    this._inFlight.add(key);

    fetch().subscribe({
      next: (data) => {
        this._inFlight.delete(key);
        const addedAt = new Date();
        sig.set({ data, status: { status: Status.Resolved }, addedAt });
        this._writePersisted(key, data, addedAt);
      },
      error: (err: { message?: string }) => {
        this._inFlight.delete(key);
        sig.set({
          data: null,
          status: {
            status: Status.Error,
            error: undefined as unknown as ErrorType,
            errorMessage: err?.message ?? String(err),
          },
          addedAt: null,
        });
      },
    });

    return sig;
  }

  searchPlaces(
    params: PlaceSearchParams,
  ): Signal<ItemState<PlaceSearchResponse>> {
    const effectiveParams = environment.fsq.premium
      ? params
      : { ...params, fields: stripPremiumFields(params.fields) };
    const key = `search:${buildCacheKey(effectiveParams)}`;
    const fields = effectiveParams.fields
      ? effectiveParams.fields.split(',')
      : [];
    return this._load(key, () =>
      this._api
        .get<FsqPlaceSearchResponseIncomingDTO>(
          '/search',
          toQueryParams(effectiveParams),
        )
        .pipe(
          map(mapFsqPlaceSearchResponseToPlaceSearchResponse),
          tap((res) => {
            for (const place of res.results) this._storePlace(place, fields);
          }),
        ),
    );
  }

  getPlaceDetails(
    fsqPlaceId: string,
    fields?: string,
  ): Signal<ItemState<Place>> {
    const effectiveFields = environment.fsq.premium
      ? fields
      : stripPremiumFields(fields);
    const key = this._placeKey(fsqPlaceId);
    const sig = this._getSignal<Place>(key);
    const current = sig();

    const requested = effectiveFields ? effectiveFields.split(',') : [];
    const known = this._getKnownFields(fsqPlaceId);
    const hasAllRequested =
      requested.length === 0 || requested.every((f) => known.has(f));

    if (
      this._isFresh(current.addedAt) &&
      current.data !== null &&
      hasAllRequested
    ) {
      return sig;
    }

    if (this._inFlight.has(key)) {
      return sig;
    }

    sig.set({
      data: current.data,
      status: { status: Status.Loading },
      addedAt: current.addedAt,
    });
    this._inFlight.add(key);

    this._api
      .get<FsqPlaceIncomingDTO>(
        `/${fsqPlaceId}`,
        effectiveFields ? { fields: effectiveFields } : undefined,
      )
      .pipe(map(mapFsqPlaceToPlace))
      .subscribe({
        next: (place) => {
          this._inFlight.delete(key);
          this._storePlace(place, requested);
        },
        error: (err: { message?: string }) => {
          this._inFlight.delete(key);
          sig.set({
            data: current.data,
            status: {
              status: Status.Error,
              error: undefined as unknown as ErrorType,
              errorMessage: err?.message ?? String(err),
            },
            addedAt: current.addedAt,
          });
        },
      });

    return sig;
  }

  getPlacePhotos(
    fsqPlaceId: string,
    params?: PlacePhotosParams,
  ): Signal<ItemState<PlacePhoto[]>> {
    const key = `photos:${fsqPlaceId}${params ? `:${buildCacheKey(params)}` : ''}`;
    return this._load(key, () => {
      if (!environment.fsq.premium) {
        return of(mockPhotos(fsqPlaceId, params?.limit ?? 8));
      }
      return this._api
        .get<
          FsqPhotoIncomingDTO[]
        >(`/${fsqPlaceId}/photos`, params ? toQueryParams(params) : undefined)
        .pipe(map((photos) => photos.map(mapFsqPhotoToPlacePhoto)));
    });
  }

  getPlaceTips(
    fsqPlaceId: string,
    params?: PlaceTipsParams,
  ): Signal<ItemState<PlaceTip[]>> {
    const key = `tips:${fsqPlaceId}${params ? `:${buildCacheKey(params)}` : ''}`;
    return this._load(key, () => {
      if (!environment.fsq.premium) {
        return of(mockTips(fsqPlaceId, params?.limit ?? 5));
      }
      return this._api
        .get<
          FsqTipIncomingDTO[]
        >(`/${fsqPlaceId}/tips`, params ? toQueryParams(params) : undefined)
        .pipe(map((tips) => tips.map(mapFsqTipToPlaceTip)));
    });
  }
}
