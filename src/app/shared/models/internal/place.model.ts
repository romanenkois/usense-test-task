import type { PlacePhoto } from './place-photo.model';
import type { PlaceTip } from './place-tip.model';

export interface PlaceIcon {
  prefix: string;
  suffix: string;
}

export interface PlaceCategory {
  id: number;
  name: string;
  icon: PlaceIcon;
}

export interface PlaceLocation {
  address?: string;
  locality?: string;
  region?: string;
  postcode?: string;
  country?: string;
}

export interface GeocodePoint {
  latitude: number;
  longitude: number;
}

export interface Geocodes {
  main: GeocodePoint;
}

export interface HoursRegular {
  day: number;
  open: string;
  close: string;
}

export interface PlaceHours {
  regular?: HoursRegular[];
  open_now?: boolean;
  display?: string;
}

export interface PlaceStats {
  total_photos: number;
  total_ratings: number;
  total_tips: number;
}

export interface Place {
  fsq_place_id: string;
  name: string;
  categories?: PlaceCategory[];
  location?: PlaceLocation;
  geocodes?: Geocodes;
  distance?: number;
  tel?: string;
  email?: string;
  website?: string;
  description?: string;
  hours?: PlaceHours;
  photos?: PlacePhoto[];
  tips?: PlaceTip[];
  rating?: number;
  price?: number;
  popularity?: number;
  stats?: PlaceStats;
  tastes?: string[];
  link?: string;
}

export interface PlaceSearchResponse {
  results: Place[];
}
