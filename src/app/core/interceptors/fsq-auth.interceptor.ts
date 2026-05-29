import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '@env';
import { FsqAuthService } from '@services';

export const fsqAuthInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith(environment.fsq.baseUrl)) {
    return next(req);
  }

  const apiKey = inject(FsqAuthService).apiKey();

  return next(
    req.clone({
      setHeaders: {
        Authorization: `Bearer ${apiKey}`,
        'X-Places-Api-Version': environment.fsq.apiVersion,
      },
    }),
  );
};
