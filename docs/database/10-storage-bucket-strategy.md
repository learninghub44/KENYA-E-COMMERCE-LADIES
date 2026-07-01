# Storage Bucket Strategy

## Principle

Cloudinary is the primary image pipeline for production product and seller media. Supabase Storage exists for controlled platform storage surfaces and local development support.

## Buckets

| Bucket | Visibility | Purpose | Max Size |
|---|---|---|---|
| `product-images` | Public read | Product image assets or local fallback references. | 10 MB |
| `seller-documents` | Private | Seller business registration, payout, tax, and support documents. | 20 MB |
| `kyc-documents` | Private | KYC verification files when provider-hosted references are not enough. | 20 MB |
| `store-logos` | Public read | Seller logo images. | 5 MB |
| `store-banners` | Public read | Seller storefront banner images. | 10 MB |
| `user-avatars` | Public read | Buyer, seller, and staff avatar images. | 5 MB |
| `promotional-banners` | Public read | Staff-managed merchandising and campaign banners. | 10 MB |
| `cms-assets` | Public read | Staff-managed CMS images and PDF assets. | 10 MB |

Legacy buckets from the initial foundation migration, `seller-assets` and `private-documents`, may exist in older local databases. New application code must use the explicit buckets above.

## MIME Types

Public image buckets accept:

- `image/jpeg`
- `image/png`
- `image/webp`
- `image/avif`

Private document buckets accept:

- `application/pdf`
- `image/jpeg`
- `image/png`

## Access Policy

- Public asset buckets allow public reads only.
- Product images, store logos, and store banners can be written only by users who can manage the seller ID in the first path segment.
- User avatars can be written only by the profile owner whose user ID is the first path segment.
- Seller documents and KYC documents can be read or written by staff or users who can manage the seller ID in the first path segment.
- Promotional banners and CMS assets can be written only by staff.

## Path Conventions

Use stable prefixes:

```text
product-images/{seller_id}/{product_id}/...
seller-documents/{seller_id}/{document_type}/...
kyc-documents/{seller_id}/{verification_id}/...
store-logos/{seller_id}/...
store-banners/{seller_id}/...
user-avatars/{user_id}/...
promotional-banners/{placement}/...
cms-assets/{page_or_asset_group}/...
```

Do not embed user names, emails, phone numbers, or raw document identifiers in object paths.

## Retention

Private documents should be retained only as long as legally or operationally required. Prefer provider-hosted KYC document storage and store only provider references when possible.
