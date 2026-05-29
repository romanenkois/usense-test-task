import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '@env';
import { ApiService, QueryParams } from './api.service';

@Injectable({ providedIn: 'root' })
export class FsqApiService {
  private readonly _api = inject(ApiService);
  private readonly _baseUrl = environment.fsq.baseUrl;

  get<T>(path: string, params?: QueryParams): Observable<T> {
    return this._api.get<T>(`${this._baseUrl}${path}`, params);
  }
}
