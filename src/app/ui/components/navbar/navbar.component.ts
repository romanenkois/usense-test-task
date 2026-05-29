import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { WishlistService } from '@services';

@Component({
  selector: 'app-navbar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav class="flex items-center gap-6 px-6 py-3 border-b border-gray-200">
      <a routerLink="/search" class="font-bold text-lg">Travel Tracker</a>
      <a routerLink="/search" routerLinkActive="font-semibold underline">Search</a>
      <a routerLink="/wishlist" routerLinkActive="font-semibold underline" class="flex items-center gap-1">
        Wishlist
        @if (count() > 0) {
          <span class="bg-blue-600 text-white text-xs rounded-full px-1.5 py-0.5">{{ count() }}</span>
        }
      </a>
    </nav>
  `,
})
export class NavbarComponent {
  private readonly _wishlist = inject(WishlistService);
  readonly count = computed(() => this._wishlist.list().length);
}
