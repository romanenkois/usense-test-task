import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'search', pathMatch: 'full' },
  {
    path: 'search',
    loadComponent: () =>
      import('./ui/pages/search/search.component').then((m) => m.SearchComponent),
  },
  {
    path: 'wishlist',
    loadComponent: () =>
      import('./ui/pages/wishlist/wishlist.component').then((m) => m.WishlistComponent),
  },
  {
    path: 'places/:id',
    loadComponent: () =>
      import('./ui/pages/place-details/place-details.component').then(
        (m) => m.PlaceDetailsComponent,
      ),
  },
];
