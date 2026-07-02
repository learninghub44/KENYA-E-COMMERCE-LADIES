# Storage Feature

File storage abstraction with provider adapters, validation, and security.

## Adapters

- **Cloudinary** — direct REST API integration with signature-based auth (no SDK)
- **Supabase** — (future) storage bucket integration
- **S3** — (future) AWS S3 integration
- **Local** — (future) local filesystem for development

## Validation

Files are validated against category-based MIME type allowlists and size limits:

| Category         | Allowed MIME Types                        | Max Size |
|------------------|-------------------------------------------|----------|
| productImages    | jpeg, png, webp, avif                     | 10 MB    |
| sellerDocuments  | pdf, jpeg, png                            | 20 MB    |
| kycDocuments     | pdf, jpeg, png                            | 20 MB    |
| reviewImages     | jpeg, png, webp                           | 10 MB    |
| messageAttachments| jpeg, png, pdf, zip                      | 25 MB    |
| storeBranding    | jpeg, png, webp, avif                     | 10 MB    |
| userAvatars      | jpeg, png, webp, avif                     | 5 MB     |
