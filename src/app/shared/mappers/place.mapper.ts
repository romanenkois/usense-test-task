import type {
  FsqPlaceIncomingDTO,
  FsqPlaceSearchResponseIncomingDTO,
  Place,
  PlaceSearchResponse,
} from '@models';
import { environment } from '@env';
import { mapFsqPhotoToPlacePhoto } from './place-photo.mapper';
import { mapFsqTipToPlaceTip } from './place-tip.mapper';
import { mockPhotos, mockPrice, mockRating, mockTips } from './mock-place.util';

export function mapFsqPlaceToPlace(dto: FsqPlaceIncomingDTO): Place {
  const place: Place = {
    ...dto,
    photos: dto.photos?.map(mapFsqPhotoToPlacePhoto),
    tips: dto.tips?.map(mapFsqTipToPlaceTip),
  };

  if (!environment.fsq.premium) {
    const seed = dto.fsq_place_id;
    if (place.rating === undefined) place.rating = mockRating(seed);
    if (place.price === undefined) place.price = mockPrice(seed);
    if (!place.photos?.length) place.photos = mockPhotos(seed);
    if (!place.tips?.length) place.tips = mockTips(seed);
  }

  return place;
}

export function mapFsqPlaceSearchResponseToPlaceSearchResponse(
  dto: FsqPlaceSearchResponseIncomingDTO,
): PlaceSearchResponse {
  return {
    results: dto.results.map(mapFsqPlaceToPlace),
  };
}
