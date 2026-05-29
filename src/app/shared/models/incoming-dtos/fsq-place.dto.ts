import type { FsqPhotoIncomingDTO } from './fsq-photo.dto';
import type { FsqTipIncomingDTO } from './fsq-tip.dto';

export interface FsqIconIncomingDTO {
  prefix: string;
  suffix: string;
}

export interface FsqCategoryIncomingDTO {
  id: number;
  name: string;
  icon: FsqIconIncomingDTO;
}

export interface FsqLocationIncomingDTO {
  address?: string;
  locality?: string;
  region?: string;
  postcode?: string;
  country?: string;
}

export interface FsqGeocodePointIncomingDTO {
  latitude: number;
  longitude: number;
}

export interface FsqGeocodesIncomingDTO {
  main: FsqGeocodePointIncomingDTO;
}

export interface FsqHoursRegularIncomingDTO {
  day: number;
  open: string;
  close: string;
}

export interface FsqHoursIncomingDTO {
  regular?: FsqHoursRegularIncomingDTO[];
  open_now?: boolean;
  display?: string;
}

export interface FsqStatsIncomingDTO {
  total_photos: number;
  total_ratings: number;
  total_tips: number;
}

export interface FsqPlaceIncomingDTO {
  fsq_place_id: string;
  name: string;
  categories?: FsqCategoryIncomingDTO[];
  location?: FsqLocationIncomingDTO;
  geocodes?: FsqGeocodesIncomingDTO;
  distance?: number;
  tel?: string;
  email?: string;
  website?: string;
  description?: string;
  hours?: FsqHoursIncomingDTO;
  photos?: FsqPhotoIncomingDTO[];
  tips?: FsqTipIncomingDTO[];
  rating?: number;
  price?: number;
  popularity?: number;
  stats?: FsqStatsIncomingDTO;
  tastes?: string[];
  link?: string;
}

export interface FsqPlaceSearchResponseIncomingDTO {
  results: FsqPlaceIncomingDTO[];
}
