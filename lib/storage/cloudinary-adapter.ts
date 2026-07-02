import { createHash } from "node:crypto";
import { DeleteInput, StorageProviderAdapter, UploadInput, UploadResult } from "./types.js";

function computeChecksum(buffer: Buffer): string {
  return createHash("sha256").update(buffer).digest("hex");
}

export interface CloudinaryConfig {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
  secure?: boolean;
}

export function createCloudinaryAdapter(config: CloudinaryConfig): StorageProviderAdapter {
  return {
    async upload(input: UploadInput): Promise<UploadResult> {
      const timestamp = Math.floor(Date.now() / 1000);
      const publicId = `${input.category}/${input.fileName.replace(/[^a-zA-Z0-9_-]/g, "_")}_${timestamp}`;
      const checksum = computeChecksum(input.buffer);

      const signature = createHash("sha256")
        .update(`public_id=${publicId}&timestamp=${timestamp}${config.apiSecret}`)
        .digest("hex");

      const formData = new FormData();
      formData.append("file", new Blob([input.buffer as BlobPart], { type: input.mimeType }));
      formData.append("public_id", publicId);
      formData.append("api_key", config.apiKey);
      formData.append("timestamp", String(timestamp));
      formData.append("signature", signature);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${config.cloudName}/image/upload`,
        { method: "POST", body: formData },
      );

      if (!response.ok) {
        const body = await response.text();
        throw new Error(`Cloudinary upload failed: ${response.status} ${body}`);
      }

      const result = await response.json() as {
        secure_url: string;
        public_id: string;
        width?: number;
        height?: number;
        format?: string;
        bytes: number;
      };

      return {
        url: result.secure_url,
        publicId: result.public_id,
        fileName: input.fileName,
        mimeType: input.mimeType,
        fileSizeBytes: result.bytes,
        width: result.width,
        height: result.height,
        format: result.format,
        checksum,
        provider: "cloudinary",
      };
    },

    async delete(input: DeleteInput): Promise<void> {
      const timestamp = Math.floor(Date.now() / 1000);
      const signature = createHash("sha256")
        .update(`public_id=${input.publicId}&timestamp=${timestamp}${config.apiSecret}`)
        .digest("hex");

      const formData = new FormData();
      formData.append("public_id", input.publicId);
      formData.append("api_key", config.apiKey);
      formData.append("timestamp", String(timestamp));
      formData.append("signature", signature);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${config.cloudName}/image/destroy`,
        { method: "POST", body: formData },
      );

      if (!response.ok) {
        const body = await response.text();
        throw new Error(`Cloudinary delete failed: ${response.status} ${body}`);
      }
    },

    getPublicUrl(publicId: string): string {
      return `https://res.cloudinary.com/${config.cloudName}/image/upload/${publicId}`;
    },
  };
}
