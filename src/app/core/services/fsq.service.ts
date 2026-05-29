import { Injectable, inject, signal } from '@angular/core';
import type { Signal, WritableSignal } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

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
} from '@mappers';
import { buildCacheKey, toQueryParams } from '@utils';
import { environment } from '@env';

@Injectable({ providedIn: 'root' })
export class FsqService {
  private readonly api = inject(FsqApiService);
  private readonly cache = new Map<string, WritableSignal<ItemState<unknown>>>();

  private getSignal<T>(key: string): WritableSignal<ItemState<T>> {
    if (!this.cache.has(key)) {
      this.cache.set(
        key,
        signal<ItemState<unknown>>({ data: null, status: { status: Status.Idle }, addedAt: null }),
      );
    }
    return this.cache.get(key)! as WritableSignal<ItemState<T>>;
  }

  private isFresh(addedAt: Date | null): boolean {
    return addedAt !== null && Date.now() - addedAt.getTime() < environment.cacheTtlMs;
  }

  private load<T>(key: string, fetch: () => Observable<T>): Signal<ItemState<T>> {
    const sig = this.getSignal<T>(key);

    if (this.isFresh(sig().addedAt) && sig().data !== null) {
      return sig;
    }

    sig.set({ data: null, status: { status: Status.Loading }, addedAt: null });

    fetch().subscribe({
      next: (data) => sig.set({ data, status: { status: Status.Resolved }, addedAt: new Date() }),
      error: (err: { message?: string }) =>
        sig.set({
          data: null,
          status: {
            status: Status.Error,
            error: undefined as unknown as ErrorType,
            errorMessage: err?.message ?? String(err),
          },
          addedAt: null,
        }),
    });

    return sig;
  }

  searchPlaces(params: PlaceSearchParams): Signal<ItemState<PlaceSearchResponse>> {
    const key = `search:${buildCacheKey(params)}`;
    return this.load(key, () =>
      this.api
        .get<FsqPlaceSearchResponseIncomingDTO>('/search', toQueryParams(params))
        .pipe(map(mapFsqPlaceSearchResponseToPlaceSearchResponse)),
    );
  }

  getPlaceDetails(fsqPlaceId: string, fields?: string): Signal<ItemState<Place>> {
    const key = `place:${fsqPlaceId}${fields ? `:${fields}` : ''}`;
    return this.load(key, () =>
      this.api
        .get<FsqPlaceIncomingDTO>(`/${fsqPlaceId}`, fields ? { fields } : undefined)
        .pipe(map(mapFsqPlaceToPlace)),
    );
  }

  getPlacePhotos(fsqPlaceId: string, params?: PlacePhotosParams): Signal<ItemState<PlacePhoto[]>> {
    const key = `photos:${fsqPlaceId}${params ? `:${buildCacheKey(params)}` : ''}`;
    return this.load(key, () =>
      this.api
        .get<FsqPhotoIncomingDTO[]>(
          `/${fsqPlaceId}/photos`,
          params ? toQueryParams(params) : undefined,
        )
        .pipe(map((photos) => photos.map(mapFsqPhotoToPlacePhoto))),
    );
  }

  getPlaceTips(fsqPlaceId: string, params?: PlaceTipsParams): Signal<ItemState<PlaceTip[]>> {
    const key = `tips:${fsqPlaceId}${params ? `:${buildCacheKey(params)}` : ''}`;
    return this.load(key, () =>
      this.api
        .get<FsqTipIncomingDTO[]>(
          `/${fsqPlaceId}/tips`,
          params ? toQueryParams(params) : undefined,
        )
        .pipe(map((tips) => tips.map(mapFsqTipToPlaceTip))),
    );
  }
}
