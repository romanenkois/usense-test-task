import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '@env';
import { ApiService, QueryParams } from './api.service';

@Injectable({ providedIn: 'root' })
export class FsqApiService {
  private readonly api = inject(ApiService);
  private readonly baseUrl = environment.fsq.baseUrl;

  get<T>(path: string, params?: QueryParams): Observable<T> {
    return this.api.get<T>(`${this.baseUrl}${path}`, params);
  }
}
