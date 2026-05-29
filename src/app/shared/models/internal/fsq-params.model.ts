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
