# UI Plan — Travel Places Tracker

## Routes

```
/             → redirect to /search
/search       — lazy-loaded
/wishlist     — lazy-loaded
/places/:id   — lazy-loaded
```

## Navigation

Persistent top navbar: **Logo** | **Search** | **Wishlist** (badge with saved count)

---

## Search Page (`/search`)

- Two inputs: keyword + location (text), both optional
- Combined into one FSQ search call sorted by `RELEVANCE` — best-matching results rise to the top
- Collapsible filters: radius, open_now, price range
- Card grid results — each card: first photo or placeholder, name, category, address, rating, heart button (add to wishlist)
- Loading / empty / error states

---

## Place Details Page (`/places/:id`)

- **Back button** — navigates to `/search` preserving the exact query params (keyword, location, all active filters) the user had when they opened this page, AND restores the scroll position to the card the user clicked. Implementation notes:
  - Store the current search URL (path + query string) and the clicked card's scroll offset in the navigation `state` (`router.navigate(['/places', id], { state: { returnUrl, scrollY } })`) when leaving the search page.
  - On the Back button click, read `history.state.returnUrl` and `history.state.scrollY`, navigate to `returnUrl`, then call `window.scrollTo({ top: scrollY, behavior: 'instant' })` after the navigation settles.
  - If `history.state` is absent (e.g. user landed on the details page directly or from wishlist), fall back to navigating to `/search` without scroll restoration.
- Hero photo carousel
- Name, category, address, hours (open/closed), rating, price level
- Add / Remove from Wishlist button
- Photos grid
- Tips / reviews list

---

## Wishlist Page (`/wishlist`)

- Same card grid layout, sourced from localStorage
- Each card has a remove button
- Clicking a card navigates to `/places/:id`
- Empty state: "No saved places yet"

---

## New Services

| Service          | Responsibility                                                        |
| ---------------- | --------------------------------------------------------------------- |
| `WishlistService` | Persists / restores place list to localStorage; exposes as signal    |
| `CacheService`   | Generic 10-min TTL cache; used inside `FsqService` before each HTTP call |

---

## Shared Components

| Component              | Used in                  |
| ---------------------- | ------------------------ |
| `PlaceCardComponent`   | Search page, Wishlist page |
| `PhotoGalleryComponent` | Place details page       |

---

## Decisions

1. Search triggers on **400 ms debounce** as the user types — no explicit button.
2. Wishlist card body **navigates to `/places/:id`**; there is also a separate remove button.
