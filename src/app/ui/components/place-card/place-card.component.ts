import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgOptimizedImage } from '@angular/common';

import type { Place } from '@models';
import { WishlistService } from '@services';
import { getPhotoUrl } from '@utils';

@Component({
  selector: 'app-place-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, NgOptimizedImage],
  template: `
    <div class="border border-gray-200 rounded overflow-hidden flex flex-col">
      <a [routerLink]="['/places', place().fsq_place_id]" [state]="navState()">
        @if (heroUrl()) {
          <img
            [ngSrc]="heroUrl()!"
            width="400"
            height="200"
            class="w-full h-40 object-cover"
            [alt]="place().name"
          />
        } @else {
          <div class="w-full h-40 bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
            No photo
          </div>
        }
      </a>

      <div class="p-3 flex flex-col gap-1 flex-1">
        <a
          [routerLink]="['/places', place().fsq_place_id]"
          [state]="navState()"
          class="font-semibold text-base leading-tight hover:underline"
        >
          {{ place().name }}
        </a>

        @if (category()) {
          <p class="text-sm text-gray-500">{{ category() }}</p>
        }

        @if (address()) {
          <p class="text-sm text-gray-500">{{ address() }}</p>
        }

        <div class="flex items-center justify-between mt-auto pt-2">
          @if (place().rating) {
            <span class="text-sm font-medium">★ {{ place().rating }}</span>
          } @else {
            <span></span>
          }

          <div class="flex items-center gap-2">
            @if (showRemove()) {
              <button
                type="button"
                class="text-sm text-red-600 border border-red-300 rounded px-2 py-0.5"
                (click)="remove.emit(place().fsq_place_id)"
                [attr.aria-label]="'Remove ' + place().name + ' from wishlist'"
              >
                Remove
              </button>
            } @else {
              <button
                type="button"
                class="text-xl leading-none"
                (click)="toggleWishlist()"
                [attr.aria-label]="(inWishlist() ? 'Remove ' : 'Add ') + place().name + ' to wishlist'"
                [attr.aria-pressed]="inWishlist()"
              >
                {{ inWishlist() ? '♥' : '♡' }}
              </button>
            }
          </div>
        </div>
      </div>
    </div>
  `,
})
export class PlaceCardComponent {
  private readonly _wishlist = inject(WishlistService);

  readonly place = input.required<Place>();
  readonly showRemove = input(false);
  readonly returnUrl = input<string>('');
  readonly scrollY = input<number>(0);

  readonly remove = output<string>();

  readonly heroUrl = computed(() => {
    const photos = this.place().photos;
    if (!photos?.length) return null;
    return getPhotoUrl(photos[0], 400, 200);
  });

  readonly category = computed(() => this.place().categories?.[0]?.name ?? null);

  readonly address = computed(() => {
    const loc = this.place().location;
    if (!loc) return null;
    return [loc.address, loc.locality, loc.region].filter(Boolean).join(', ');
  });

  readonly inWishlist = computed(() => this._wishlist.isAdded(this.place().fsq_place_id));

  readonly navState = computed(() => ({
    returnUrl: this.returnUrl(),
    scrollY: this.scrollY(),
  }));

  toggleWishlist(): void {
    const place = this.place();
    if (this._wishlist.isAdded(place.fsq_place_id)) {
      this._wishlist.remove(place.fsq_place_id);
    } else {
      this._wishlist.add(place);
    }
  }
}
