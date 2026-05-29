# Foursquare Places API — Endpoints Reference

Base URL: `https://places-api.foursquare.com/places/`

> **Note:** The old `api.foursquare.com/v3/` endpoints were deprecated on May 15, 2026.

## Required Headers (all requests)

| Header                 | Value            |
| ---------------------- | ---------------- |
| `X-Places-Api-Version` | `2025-06-17`     |
| `Authorization`        | `<your API key>` |

---

## 1. Place Search

**`GET /places/search`**

Search for places by keyword and/or geolocation. Used as the main entry point and the target for the 10-minute cache (keyed by `query + ll/near`).

| Parameter          | Type    | Description                                     |
| ------------------ | ------- | ----------------------------------------------- |
| `query`            | string  | Keyword (e.g. "coffee", "museum")               |
| `ll`               | string  | `lat,lng` coordinates for geolocation           |
| `near`             | string  | Text location alternative to `ll`               |
| `radius`           | int32   | Search radius in meters (0–100000)              |
| `sort`             | string  | `RELEVANCE`, `RATING`, `DISTANCE`, `POPULARITY` |
| `limit`            | int32   | Results per page (1–50)                         |
| `fields`           | string  | Cherry-pick response fields to reduce payload   |
| `open_now`         | boolean | Filter to currently open places only            |
| `min_price`        | int32   | Minimum price level (1–4)                       |
| `max_price`        | int32   | Maximum price level (1–4)                       |
| `fsq_category_ids` | string  | Filter by Foursquare category IDs               |
| `ne` / `sw`        | string  | Northeast / Southwest bounding box corners      |

---

## 2. Place Details

**`GET /places/{fsq_place_id}`**

Full details for a single place — rating, type, hours, address, etc. Cache by `fsq_place_id`.

| Parameter      | Type          | Description                                  |
| -------------- | ------------- | -------------------------------------------- |
| `fsq_place_id` | string (path) | Unique place identifier (from search result) |
| `fields`       | string        | Select which fields to return                |

---

## 3. Place Photos

**`GET /places/{fsq_place_id}/photos`**

Returns photo URL components to assemble full image URLs. Cache by `fsq_place_id`.

| Parameter         | Type          | Description              |
| ----------------- | ------------- | ------------------------ |
| `fsq_place_id`    | string (path) | Unique place identifier  |
| `limit`           | int32         | Number of photos (1–50)  |
| `sort`            | string        | `POPULAR` or `NEWEST`    |
| `classifications` | string        | Filter by photo category |

---

## 4. Place Tips (Reviews)

**`GET /places/{fsq_place_id}/tips`**

User-written reviews and tips for a place. Cache by `fsq_place_id`.

| Parameter      | Type          | Description                 |
| -------------- | ------------- | --------------------------- |
| `fsq_place_id` | string (path) | Unique place identifier     |
| `limit`        | int32         | Number of tips (1–50)       |
| `sort`         | string        | `POPULAR` or `NEWEST`       |
| `fields`       | string        | Cherry-pick response fields |

---

## Caching Strategy

| Endpoint      | Cache Key                      | TTL        |
| ------------- | ------------------------------ | ---------- |
| Place Search  | `query + ll` or `query + near` | 10 minutes |
| Place Details | `fsq_place_id`                 | 10 minutes |
| Place Photos  | `fsq_place_id`                 | 10 minutes |
| Place Tips    | `fsq_place_id`                 | 10 minutes |
