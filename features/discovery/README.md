# Discovery Feature

Owns public discovery rails and user recently viewed products.

Primary entry points:

- `lib/discovery/createDiscoveryService`
- `lib/discovery/createRecentlyViewedService`

Discovery reads existing product, seller, inventory, and rating data through repository contracts. It does not own product writes or analytics dashboards.
