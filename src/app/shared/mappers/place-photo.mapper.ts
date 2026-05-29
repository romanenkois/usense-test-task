import type { FsqPhotoIncomingDTO, PlacePhoto } from '@models';

export function mapFsqPhotoToPlacePhoto(dto: FsqPhotoIncomingDTO): PlacePhoto {
  return { ...dto };
}
