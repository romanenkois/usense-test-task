import type {
  FsqPlaceIncomingDTO,
  FsqPlaceSearchResponseIncomingDTO,
  Place,
  PlaceSearchResponse,
} from '@models';
import { mapFsqPhotoToPlacePhoto } from './place-photo.mapper';
import { mapFsqTipToPlaceTip } from './place-tip.mapper';

export function mapFsqPlaceToPlace(dto: FsqPlaceIncomingDTO): Place {
  return {
    ...dto,
    photos: dto.photos?.map(mapFsqPhotoToPlacePhoto),
    tips: dto.tips?.map(mapFsqTipToPlaceTip),
  };
}

export function mapFsqPlaceSearchResponseToPlaceSearchResponse(
  dto: FsqPlaceSearchResponseIncomingDTO,
): PlaceSearchResponse {
  return {
    results: dto.results.map(mapFsqPlaceToPlace),
  };
}
