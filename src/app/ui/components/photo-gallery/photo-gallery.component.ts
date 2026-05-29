import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';

import type { PlacePhoto } from '@models';
import { getPhotoUrl } from '@utils';

@Component({
  selector: 'app-photo-gallery',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgOptimizedImage],
  template: `
    @if (photos().length) {
      <div class="flex flex-col gap-2">
        <div class="relative">
          <img
            [ngSrc]="currentUrl()"
            [width]="current().width"
            [height]="current().height"
            class="w-full max-h-96 object-cover rounded"
            [alt]="'Photo ' + (index() + 1) + ' of ' + photos().length"
            priority
          />
          @if (photos().length > 1) {
            <button
              type="button"
              class="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded px-2 py-1"
              (click)="prev()"
              aria-label="Previous photo"
            >
              ‹
            </button>
            <button
              type="button"
              class="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded px-2 py-1"
              (click)="next()"
              aria-label="Next photo"
            >
              ›
            </button>
            <span class="absolute bottom-2 right-2 bg-black/50 text-white text-xs rounded px-1.5 py-0.5">
              {{ index() + 1 }} / {{ photos().length }}
            </span>
          }
        </div>
      </div>
    }
  `,
})
export class PhotoGalleryComponent {
  readonly photos = input.required<PlacePhoto[]>();

  readonly index = signal(0);

  readonly current = computed(() => this.photos()[this.index()]);
  readonly currentUrl = computed(() => getPhotoUrl(this.current()));

  prev(): void {
    this.index.update((i) => (i === 0 ? this.photos().length - 1 : i - 1));
  }

  next(): void {
    this.index.update((i) => (i === this.photos().length - 1 ? 0 : i + 1));
  }
}
