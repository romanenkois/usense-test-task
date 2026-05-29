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

- Back button, hero photo carousel
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

## Open Questions

1. Should search trigger on **button click only** or also **on input debounce** (auto-search as you type)?
2. On the wishlist card — does clicking the card body navigate to `/places/:id`, or is it view-only with just a remove button?
