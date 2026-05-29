import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { SlicePipe } from '@angular/common';

import { FsqService, WishlistService } from '@services';
import { Status } from '@models';
import { PhotoGalleryComponent } from '../../components/photo-gallery/photo-gallery.component';

@Component({
  selector: 'app-place-details',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PhotoGalleryComponent, SlicePipe],
  templateUrl: './place-details.component.html',
})
export class PlaceDetailsComponent implements AfterViewInit {
  private readonly _route = inject(ActivatedRoute);
  private readonly _router = inject(Router);
  private readonly _fsq = inject(FsqService);
  private readonly _wishlist = inject(WishlistService);

  private readonly _id = this._route.snapshot.paramMap.get('id')!;
  private readonly _state = this._router.lastSuccessfulNavigation()?.extras.state as
    | { returnUrl?: string; scrollY?: number }
    | undefined;

  readonly detailsSig = this._fsq.getPlaceDetails(
    this._id,
    'fsq_place_id,name,categories,location,hours,rating,price,description,tel,website,photos,tips',
  );
  readonly photosSig = this._fsq.getPlacePhotos(this._id, { limit: 20 });
  readonly tipsSig = this._fsq.getPlaceTips(this._id, { limit: 20 });

  readonly place = computed(() => this.detailsSig().data);
  readonly photos = computed(() => this.photosSig().data ?? []);
  readonly tips = computed(() => this.tipsSig().data ?? []);

  readonly isLoading = computed(() => this.detailsSig().status.status === Status.Loading);
  readonly isError = computed(() => this.detailsSig().status.status === Status.Error);
  readonly errorMessage = computed(() => {
    const s = this.detailsSig().status;
    return s.status === Status.Error ? s.errorMessage : null;
  });

  readonly inWishlist = computed(() => this._wishlist.isAdded(this._id));

  readonly category = computed(() => this.place()?.categories?.[0]?.name ?? null);
  readonly address = computed(() => {
    const loc = this.place()?.location;
    if (!loc) return null;
    return [loc.address, loc.locality, loc.region, loc.country].filter(Boolean).join(', ');
  });

  readonly priceLabel = computed(() => {
    const p = this.place()?.price;
    if (!p) return null;
    return '$'.repeat(p);
  });

  ngAfterViewInit(): void {
    const scrollY = this._state?.scrollY;
    if (scrollY !== undefined) {
      window.scrollTo({ top: scrollY, behavior: 'instant' });
    }
  }

  goBack(): void {
    const returnUrl = this._state?.returnUrl;
    if (returnUrl) {
      this._router.navigateByUrl(returnUrl).then(() => {
        const scrollY = this._state?.scrollY ?? 0;
        window.scrollTo({ top: scrollY, behavior: 'instant' });
      });
    } else {
      this._router.navigate(['/search']);
    }
  }

  toggleWishlist(): void {
    const place = this.place();
    if (!place) return;
    if (this._wishlist.isAdded(place.fsq_place_id)) {
      this._wishlist.remove(place.fsq_place_id);
    } else {
      this._wishlist.add(place);
    }
  }
}
