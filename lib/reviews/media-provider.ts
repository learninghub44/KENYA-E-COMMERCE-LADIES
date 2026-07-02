import type { ReviewMediaInput, ReviewResult } from "./types.js";

export const REVIEW_IMAGE_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export type CloudinaryImagePolicy = {
  maxImages: number;
  maxImageBytes: number;
};

export function validateReviewMedia(
  media: readonly ReviewMediaInput[] | undefined,
  policy: CloudinaryImagePolicy
): ReviewResult<ReviewMediaInput[]> {
  const normalized = (media ?? []).map((item, index) => ({ ...item, position: item.position ?? index }));

  if (normalized.length > policy.maxImages) {
    return { ok: false, code: "TOO_MANY_IMAGES", message: `Reviews support up to ${policy.maxImages} images.`, status: 400 };
  }

  const positions = new Set<number>();
  for (const item of normalized) {
    if (!REVIEW_IMAGE_MIME_TYPES.has(item.mimeType)) {
      return { ok: false, code: "UNSUPPORTED_IMAGE_TYPE", message: "Review images must be JPEG, PNG, WebP, or GIF.", status: 400 };
    }
    if (item.bytes > policy.maxImageBytes) {
      return { ok: false, code: "IMAGE_TOO_LARGE", message: "A review image exceeds the configured file size limit.", status: 400 };
    }
    if (positions.has(item.position ?? 0)) {
      return { ok: false, code: "DUPLICATE_IMAGE_POSITION", message: "Review image ordering positions must be unique.", status: 400 };
    }
    positions.add(item.position ?? 0);
  }

  return { ok: true, data: normalized.sort((a, b) => (a.position ?? 0) - (b.position ?? 0)) };
}
