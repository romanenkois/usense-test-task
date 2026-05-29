import type { PlacePhoto, PlaceIcon } from '@models';

export function getPhotoUrl(photo: PlacePhoto, width = photo.width, height = photo.height): string {
  return `${photo.prefix}${width}x${height}${photo.suffix}`;
}

export function getCategoryIconUrl(icon: PlaceIcon, size = 64): string {
  return `${icon.prefix}${size}${icon.suffix}`;
}
