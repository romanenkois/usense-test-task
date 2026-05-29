
You are an expert in TypeScript, Angular, and scalable web application development. You write functional, maintainable, performant, and accessible code following Angular and TypeScript best practices.

## TypeScript Best Practices

- Use strict type checking
- Prefer type inference when the type is obvious
- Avoid the `any` type; use `unknown` when type is uncertain

## Angular Best Practices

- Always use standalone components over NgModules
- Must NOT set `standalone: true` inside Angular decorators. It's the default in Angular v20+.
- Use signals for state management
- Implement lazy loading for feature routes
- Do NOT use the `@HostBinding` and `@HostListener` decorators. Put host bindings inside the `host` object of the `@Component` or `@Directive` decorator instead
- Use `NgOptimizedImage` for all static images.
  - `NgOptimizedImage` does not work for inline base64 images.

## Accessibility Requirements

- It MUST pass all AXE checks.
- It MUST follow all WCAG AA minimums, including focus management, color contrast, and ARIA attributes.

### Components

- Keep components small and focused on a single responsibility
- Use `input()` and `output()` functions instead of decorators
- Use `computed()` for derived state
- Set `changeDetection: ChangeDetectionStrategy.OnPush` in `@Component` decorator
- Prefer inline templates for small components
- Prefer Reactive forms instead of Template-driven ones
- Do NOT use `ngClass`, use `class` bindings instead
- Do NOT use `ngStyle`, use `style` bindings instead
- When using external templates/styles, use paths relative to the component TS file.

## State Management

- Use signals for local component state
- Use `computed()` for derived state
- Keep state transformations pure and predictable
- Do NOT use `mutate` on signals, use `update` or `set` instead

## Templates

- Keep templates simple and avoid complex logic
- Use native control flow (`@if`, `@for`, `@switch`) instead of `*ngIf`, `*ngFor`, `*ngSwitch`
- Use the async pipe to handle observables
- Do not assume globals like (`new Date()`) are available.

## Services

- Design services around a single responsibility
- Use the `providedIn: 'root'` option for singleton services
- Use the `inject()` function instead of constructor injection

---

## Naming Conventions

- **Incoming DTO interfaces**: suffix `IncomingDTO` — e.g. `FsqPlaceIncomingDTO`, `FsqPhotoIncomingDTO`
- **Internal model interfaces**: no suffix — e.g. `Place`, `PlacePhoto`, `PlaceTip`
- **Mapper functions**: `mapFsq*To*` — e.g. `mapFsqPlaceToPlace`
- **Services**: `*.service.ts`
- **Interceptors**: `*.interceptor.ts`

## Barrel Files (`index.ts`)

Every folder exposes its public API via an `index.ts` that uses `export *` — never individual named exports:

```ts
// correct
export * from './place.model';
export * from './place-photo.model';

// wrong
export { Place, PlacePhoto } from './place.model';
```

## Path Aliases

All cross-folder imports must use the configured aliases — never relative `../../` paths across boundaries:

| Alias | Resolves to |
|---|---|
| `@api` | `src/app/core/api` |
| `@interceptors` | `src/app/core/interceptors` |
| `@services` | `src/app/core/services` |
| `@models` | `src/app/shared/models` |
| `@mappers` | `src/app/shared/mappers` |
| `@env` | `src/environments/environment` |

Relative imports are fine only within the same folder (e.g. `./place-photo.mapper`).

## Formatting

Prettier is configured (`.prettierrc`). Run `npm run format` before committing. Config: `printWidth: 100`, `singleQuote: true`, Angular HTML parser for `*.html`.

---

## Project Structure

```
src/
├── environments/
│   └── environment.ts          # FSQ API key, baseUrl, apiVersion
└── app/
    ├── app.config.ts           # provideHttpClient + fsqAuthInterceptor wired here
    ├── app.routes.ts
    ├── core/
    │   ├── api/
    │   │   ├── api.service.ts          # Generic get<T>(url, params?) over HttpClient
    │   │   └── fsq-api.service.ts      # Prepends environment.fsq.baseUrl; delegates to ApiService
    │   ├── interceptors/
    │   │   └── fsq-auth.interceptor.ts # Adds Authorization + X-Places-Api-Version for FSQ URLs only
    │   └── services/
    │       ├── fsq-auth.service.ts     # Holds API key as readonly signal from environment
    │       └── fsq.service.ts          # Typed methods for all 4 FSQ endpoints
    ├── shared/
    │   ├── models/
    │   │   ├── incoming-dtos/          # Raw FSQ API response shapes (Fsq*IncomingDTO)
    │   │   │   ├── fsq-photo.dto.ts
    │   │   │   ├── fsq-tip.dto.ts
    │   │   │   └── fsq-place.dto.ts    # Also contains FsqCategoryIncomingDTO, FsqHoursIncomingDTO, etc.
    │   │   └── internal/               # App-internal domain types (identical shape to DTOs for now)
    │   │       ├── place-photo.model.ts
    │   │       ├── place-tip.model.ts
    │   │       └── place.model.ts      # Also contains PlaceCategory, PlaceHours, PlaceStats, etc.
    │   └── mappers/
    │       ├── place-photo.mapper.ts   # FsqPhotoIncomingDTO → PlacePhoto
    │       ├── place-tip.mapper.ts     # FsqTipIncomingDTO → PlaceTip
    │       └── place.mapper.ts         # FsqPlaceIncomingDTO → Place (also handles nested photos/tips)
    └── ui/
        └── pages/                      # Feature page components (lazy-loaded routes go here)
```

## API Layer

`FsqService` (`@services`) exposes four typed methods:

| Method | Endpoint | Params type |
|---|---|---|
| `searchPlaces(params)` | `GET /places/search` | `PlaceSearchParams` |
| `getPlaceDetails(id, fields?)` | `GET /places/{fsq_place_id}` | — |
| `getPlacePhotos(id, params?)` | `GET /places/{fsq_place_id}/photos` | `PlacePhotosParams` |
| `getPlaceTips(id, params?)` | `GET /places/{fsq_place_id}/tips` | `PlaceTipsParams` |

Every method returns an `Observable<InternalType>` — the DTO-to-model mapping happens inside the service via the mappers.
