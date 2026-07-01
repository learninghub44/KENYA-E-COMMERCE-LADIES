# Foreign Key Strategy

## Standard

Every relationship that must remain valid is enforced with a foreign key. Application code may validate earlier, but the database enforces the final rule.

## Delete Behavior

| Relationship Type | Delete Behavior | Reason |
|---|---|---|
| User-owned preferences and temporary data | `on delete cascade` | Remove dependent data when the owner disappears. |
| Product children such as images, variants, attributes | `on delete cascade` | Children have no meaning without the product. |
| Seller products and seller configuration | `on delete cascade` from seller | Seller-owned records follow seller deletion in non-production cleanup. |
| Historical order references | `on delete restrict` or `set null` | Preserve financial history and order snapshots. |
| Staff actor references | `on delete set null` | Keep audit history even if the actor account changes. |
| Category and brand references | `on delete set null` | Products can survive taxonomy changes. |

## Ownership Paths

RLS policies should follow stable ownership paths:

- Buyer-owned: `profiles.id -> table.user_id` or `profiles.id -> table.buyer_id`.
- Seller-managed: `profiles.id -> sellers.owner_id` or `profiles.id -> seller_members.user_id`.
- Staff-managed: `profiles.id -> user_roles.user_id` with `admin` or `moderator`.

## Cross-Domain References

Database support may reference another module's records when the relationship is fundamental, such as:

- `orders.product_id` references `products.id`.
- `messages.conversation_id` references `conversations.id`.
- `reviews.order_item_id` references `order_items.id`.

Feature behavior still belongs to the owning application module.

## Constraints

Use check constraints for core invariants:

- Quantities must be positive or non-negative as appropriate.
- Ratings must be between 1 and 5.
- Currency codes must be three characters.
- Money values must be non-negative integers.
- Anonymous carts must have either a `user_id` or `anonymous_id`.
