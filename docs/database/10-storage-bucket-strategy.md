# Storage Bucket Strategy

## Principle

Cloudinary is the primary image pipeline for production product and seller media. Supabase Storage exists for controlled platform storage surfaces and local development support.

## Buckets

| Bucket | Visibility | Purpose | Max Size |
|---|---|---|---|
| `product-images` | Public read | Product image assets or local fallback references. | 10 MB |
| `seller-assets` | Public read | Seller logos, banners, and branding assets. | 10 MB |
| `private-documents` | Private | KYC support files or restricted operational documents when storage is required. | 20 MB |

## MIME Types

Public image buckets accept:

- `image/jpeg`
- `image/png`
- `image/webp`
- `image/avif`

Private documents accept:

- `application/pdf`
- `image/jpeg`
- `image/png`

## Access Policy

- Public image buckets allow public reads.
- Public image bucket writes require authenticated users.
- Private document reads are staff-only.
- Private document writes require authenticated users or trusted server workflows.

## Path Conventions

Use stable prefixes:

```text
seller-assets/{seller_id}/...
product-images/{seller_id}/{product_id}/...
private-documents/{seller_id}/{verification_id}/...
```

Do not embed user names, emails, phone numbers, or raw document identifiers in object paths.

## Retention

Private documents should be retained only as long as legally or operationally required. Prefer provider-hosted KYC document storage and store only provider references when possible.
