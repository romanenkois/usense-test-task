import { Injectable, effect, signal } from '@angular/core';
import type { Signal } from '@angular/core';

import type { Place } from '@models';

const STORAGE_KEY = 'fsq_wishlist';

@Injectable({ providedIn: 'root' })
export class WishlistService {
  private readonly _places = signal<Place[]>(this._loadFromStorage());
  private _skipNext = true;

  readonly list: Signal<Place[]> = this._places.asReadonly();

  constructor() {
    effect(() => {
      const value = this._places();
      if (this._skipNext) {
        this._skipNext = false;
        return;
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    });
  }

  private _loadFromStorage(): Place[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as Place[]) : [];
    } catch {
      return [];
    }
  }

  add(place: Place): void {
    this._places.update((list) => [...list, place]);
  }

  remove(fsqPlaceId: string): void {
    this._places.update((list) =>
      list.filter((p) => p.fsq_place_id !== fsqPlaceId),
    );
  }

  isAdded(fsqPlaceId: string): boolean {
    return this._places().some((p) => p.fsq_place_id === fsqPlaceId);
  }
}
