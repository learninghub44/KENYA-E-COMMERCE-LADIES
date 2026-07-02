import { FileValidationInput, FileValidationResult, SIZE_LIMITS, ALLOWED_MIME_TYPES, StorageProviderAdapter, StorageService, UploadInput, UploadResult, DeleteInput } from "./types";

export interface StorageServiceDependencies {
  adapter: StorageProviderAdapter;
}

export function createStorageService(deps: StorageServiceDependencies): StorageService {
  const { adapter } = deps;

  function validate(input: FileValidationInput): FileValidationResult {
    const errors: string[] = [];
    const allowedMimes = ALLOWED_MIME_TYPES[input.category];

    if (!allowedMimes) {
      errors.push(`Unknown upload category: ${input.category}`);
      return { valid: false, errors };
    }

    if (!(allowedMimes as readonly string[]).includes(input.mimeType)) {
      errors.push(`MIME type '${input.mimeType}' not allowed for category '${input.category}'. Allowed: ${allowedMimes.join(", ")}`);
    }

    const sizeLimit = SIZE_LIMITS[input.category];
    if (input.fileSizeBytes > sizeLimit) {
      errors.push(`File size ${input.fileSizeBytes} exceeds limit of ${sizeLimit} for category '${input.category}'`);
    }

    const extension = input.fileName.split(".").pop()?.toLowerCase();
    const validExtension = allowedMimes.some((mime) => {
      const extMap: Record<string, string> = {
        "image/jpeg": "jpg",
        "image/png": "png",
        "image/webp": "webp",
        "image/avif": "avif",
        "application/pdf": "pdf",
        "application/zip": "zip",
      };
      return extMap[mime] === extension;
    });
    if (!validExtension) {
      errors.push(`File extension '.${extension}' does not match allowed MIME types for category '${input.category}'`);
    }

    return { valid: errors.length === 0, errors };
  }

  return {
    async upload(input: UploadInput): Promise<UploadResult> {
      const validation = validate({
        fileName: input.fileName,
        mimeType: input.mimeType,
        fileSizeBytes: input.fileSizeBytes,
        category: input.category,
      });
      if (!validation.valid) {
        throw new Error(`Upload validation failed: ${validation.errors.join("; ")}`);
      }
      return adapter.upload(input);
    },

    async delete(input: DeleteInput): Promise<void> {
      return adapter.delete(input);
    },

    validate,

    getAdapter(): StorageProviderAdapter {
      return adapter;
    },
  };
}
