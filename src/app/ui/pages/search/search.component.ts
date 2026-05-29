import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { FsqService } from '@services';
import { Status } from '@models';
import type { PlaceSearchParams } from '@models';
import { PlaceCardComponent } from '../../components/place-card/place-card.component';

@Component({
  selector: 'app-search',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, PlaceCardComponent],
  templateUrl: './search.component.html',
})
export class SearchComponent implements OnInit, OnDestroy {
  private readonly _fsq = inject(FsqService);
  private readonly _router = inject(Router);
  private readonly _route = inject(ActivatedRoute);
  private readonly _fb = inject(FormBuilder);
  private readonly _subs = new Subscription();

  readonly filtersOpen = signal(false);

  readonly form = this._fb.group({
    query: [''],
    near: [''],
    radius: [null as number | null],
    open_now: [false],
    min_price: [null as number | null],
    max_price: [null as number | null],
  });

  private readonly _resultSignal = signal<ReturnType<
    FsqService['searchPlaces']
  > | null>(null);

  readonly result = computed(() => this._resultSignal()?.() ?? null);
  readonly places = computed(() => this.result()?.data?.results ?? []);
  readonly isLoading = computed(
    () => this.result()?.status.status === Status.Loading,
  );
  readonly isError = computed(
    () => this.result()?.status.status === Status.Error,
  );
  readonly errorMessage = computed(() => {
    const s = this.result()?.status;
    return s?.status === Status.Error ? s.errorMessage : null;
  });
  readonly isEmpty = computed(
    () =>
      this.result()?.status.status === Status.Resolved &&
      this.places().length === 0,
  );

  readonly currentUrl = computed(() => {
    const params = this._buildParams();
    const queryParams: Record<string, string> = {};
    if (params.query) queryParams['query'] = params.query;
    if (params.near) queryParams['near'] = params.near;
    if (params.radius) queryParams['radius'] = String(params.radius);
    if (params.open_now) queryParams['open_now'] = 'true';
    if (params.min_price) queryParams['min_price'] = String(params.min_price);
    if (params.max_price) queryParams['max_price'] = String(params.max_price);
    const qs = new URLSearchParams(queryParams).toString();
    return qs ? `/search?${qs}` : '/search';
  });

  ngOnInit(): void {
    const qp = this._route.snapshot.queryParams;
    this.form.patchValue({
      query: qp['query'] ?? '',
      near: qp['near'] ?? '',
      radius: qp['radius'] ? Number(qp['radius']) : null,
      open_now: qp['open_now'] === 'true',
      min_price: qp['min_price'] ? Number(qp['min_price']) : null,
      max_price: qp['max_price'] ? Number(qp['max_price']) : null,
    });

    if (this._hasSearchInput()) {
      this._search();
    }

    this._subs.add(
      this.form.valueChanges
        .pipe(debounceTime(400), distinctUntilChanged())
        .subscribe(() => {
          this._syncQueryParams();
          if (this._hasSearchInput()) {
            this._search();
          } else {
            this._resultSignal.set(null);
          }
        }),
    );
  }

  ngOnDestroy(): void {
    this._subs.unsubscribe();
  }

  toggleFilters(): void {
    this.filtersOpen.update((v) => !v);
  }

  private _hasSearchInput(): boolean {
    const v = this.form.value;
    return !!(v.query?.trim() || v.near?.trim());
  }

  private _buildParams(): PlaceSearchParams {
    const v = this.form.value;
    const params: PlaceSearchParams = {
      sort: 'RELEVANCE',
      fields: 'fsq_place_id,name,categories,location,rating,photos,price',
    };
    if (v.query?.trim()) params.query = v.query.trim();
    if (v.near?.trim()) params.near = v.near.trim();
    if (v.radius) params.radius = v.radius;
    if (v.open_now) params.open_now = true;
    if (v.min_price) params.min_price = v.min_price;
    if (v.max_price) params.max_price = v.max_price;
    return params;
  }

  private _search(): void {
    const sig = this._fsq.searchPlaces(this._buildParams());
    this._resultSignal.set(sig);
  }

  private _syncQueryParams(): void {
    const v = this.form.value;
    const qp: Record<string, string> = {};
    if (v.query?.trim()) qp['query'] = v.query.trim();
    if (v.near?.trim()) qp['near'] = v.near.trim();
    if (v.radius) qp['radius'] = String(v.radius);
    if (v.open_now) qp['open_now'] = 'true';
    if (v.min_price) qp['min_price'] = String(v.min_price);
    if (v.max_price) qp['max_price'] = String(v.max_price);
    this._router.navigate([], { queryParams: qp, replaceUrl: true });
  }
}
