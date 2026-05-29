import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export type QueryParams = Record<string, string | number | boolean>;

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);

  get<T>(url: string, params?: QueryParams): Observable<T> {
    return this.http.get<T>(url, {
      params: params
        ? new HttpParams({ fromObject: params as Record<string, string> })
        : undefined,
    });
  }
}
