import { Injectable, signal } from '@angular/core';
import { environment } from '@env';

@Injectable({ providedIn: 'root' })
export class FsqAuthService {
  private readonly _apiKey = signal(environment.fsq.apiKey);

  readonly apiKey = this._apiKey.asReadonly();
}
