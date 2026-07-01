# Naming Conventions

## General

- Use lowercase `snake_case` for tables, columns, indexes, constraints, policies, functions, triggers, views, and enum values.
- Use plural nouns for tables: `products`, `orders`, `messages`.
- Use singular descriptive names for enum types: `order_status`, `product_status`.
- Use `_id` suffixes for foreign keys: `seller_id`, `buyer_id`, `product_id`.
- Use `_at` suffixes for timestamps: `created_at`, `updated_at`, `published_at`.
- Use `_minor` suffixes for integer money amounts: `total_minor`, `base_price_minor`.
- Use `_url` suffixes for externally hosted media references.
- Use `_status` suffixes for lifecycle state fields only when the table needs a business workflow.

## Primary Keys

- Use `id` for single-column UUID primary keys.
- Join tables may use composite primary keys when the relationship itself is the entity, such as `wishlist_items` and `collection_products`.

## Foreign Keys

- Name foreign key columns after the referenced entity role, not only the referenced table.
- Use `buyer_id` and `seller_id` on orders to clarify roles.
- Use `user_id` for generic profile ownership.
- Use `owner_id` for the primary seller account owner.

## Indexes

Index names follow:

```text
idx_<table>_<column_or_access_pattern>
```

Examples:

- `idx_products_seller_status_created`
- `idx_orders_buyer_created`
- `idx_messages_conversation_created`

## Policies

RLS policy names should read as short authorization statements:

```text
"products public active read"
"orders buyer seller staff read"
"addresses user managed"
```

## Functions and Triggers

- Helper functions use verb phrases: `current_user_can_manage_seller`.
- Triggers use `set_<table>_<field>` or `set_<table>_<purpose>` patterns.

## Reserved Avoidances

- Do not use quoted mixed-case identifiers.
- Do not use ambiguous names such as `data`, `type`, `user`, or `order` as table names.
- Do not encode environment names in table names.
