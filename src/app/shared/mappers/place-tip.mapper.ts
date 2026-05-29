import type { FsqTipIncomingDTO, PlaceTip } from '@models';

export function mapFsqTipToPlaceTip(dto: FsqTipIncomingDTO): PlaceTip {
  return { ...dto };
}
