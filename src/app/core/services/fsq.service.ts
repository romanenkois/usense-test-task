import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { FsqApiService, type QueryParams } from '@api';
import type {
  FsqPlaceSearchResponseIncomingDTO,
  FsqPlaceIncomingDTO,
  FsqPhotoIncomingDTO,
  FsqTipIncomingDTO,
  PlaceSearchResponse,
  Place,
  PlacePhoto,
  PlaceTip,
} from '@models';
import {
  mapFsqPlaceSearchResponseToPlaceSearchResponse,
  mapFsqPlaceToPlace,
  mapFsqPhotoToPlacePhoto,
  mapFsqTipToPlaceTip,
} from '@mappers';

export interface PlaceSearchParams {
  query?: string;
  ll?: string;
  near?: string;
  radius?: number;
  sort?: 'RELEVANCE' | 'RATING' | 'DISTANCE' | 'POPULARITY';
  limit?: number;
  fields?: string;
  open_now?: boolean;
  min_price?: number;
  max_price?: number;
  fsq_category_ids?: string;
}

export interface PlacePhotosParams {
  limit?: number;
  sort?: 'POPULAR' | 'NEWEST';
  classifications?: string;
}

export interface PlaceTipsParams {
  limit?: number;
  sort?: 'POPULAR' | 'NEWEST';
  fields?: string;
}

function toQueryParams<T extends object>(params: T): QueryParams {
  return Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined),
  ) as QueryParams;
}

@Injectable({ providedIn: 'root' })
export class FsqService {
  private readonly api = inject(FsqApiService);

  searchPlaces(params: PlaceSearchParams): Observable<PlaceSearchResponse> {
    return this.api
      .get<FsqPlaceSearchResponseIncomingDTO>('/search', toQueryParams(params))
      .pipe(map(mapFsqPlaceSearchResponseToPlaceSearchResponse));
  }

  getPlaceDetails(fsqPlaceId: string, fields?: string): Observable<Place> {
    return this.api
      .get<FsqPlaceIncomingDTO>(
        `/${fsqPlaceId}`,
        fields ? { fields } : undefined,
      )
      .pipe(map(mapFsqPlaceToPlace));
  }

  getPlacePhotos(
    fsqPlaceId: string,
    params?: PlacePhotosParams,
  ): Observable<PlacePhoto[]> {
    return this.api
      .get<
        FsqPhotoIncomingDTO[]
      >(`/${fsqPlaceId}/photos`, params ? toQueryParams(params) : undefined)
      .pipe(map((photos) => photos.map(mapFsqPhotoToPlacePhoto)));
  }

  getPlaceTips(
    fsqPlaceId: string,
    params?: PlaceTipsParams,
  ): Observable<PlaceTip[]> {
    return this.api
      .get<
        FsqTipIncomingDTO[]
      >(`/${fsqPlaceId}/tips`, params ? toQueryParams(params) : undefined)
      .pipe(map((tips) => tips.map(mapFsqTipToPlaceTip)));
  }
}
