import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { WishlistService } from '@services';
import { PlaceCardComponent } from '../../components/place-card/place-card.component';

@Component({
  selector: 'app-wishlist',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PlaceCardComponent],
  template: `
    <section class="flex flex-col gap-4">
      <h1 class="text-2xl font-bold">Wishlist</h1>

      @if (places().length === 0) {
        <p class="text-gray-500">No saved places yet.</p>
      } @else {
        <ul class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 list-none p-0">
          @for (place of places(); track place.fsq_place_id) {
            <li>
              <app-place-card
                [place]="place"
                [showRemove]="true"
                (remove)="wishlist.remove($event)"
              />
            </li>
          }
        </ul>
      }
    </section>
  `,
})
export class WishlistComponent {
  readonly wishlist = inject(WishlistService);
  readonly places = this.wishlist.list;
}
