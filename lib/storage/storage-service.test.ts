import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createStorageService } from "./storage-service";
import type { StorageProviderAdapter } from "./types";

function createMockAdapter(): StorageProviderAdapter {
  return {
    async upload(input) {
      return {
        url: "https://example.com/file.jpg",
        publicId: `test/${input.fileName}`,
        fileName: input.fileName,
        mimeType: input.mimeType,
        fileSizeBytes: input.fileSizeBytes,
        checksum: "mock-checksum",
        provider: "cloudinary",
      };
    },
    async delete(_input) {},
    getPublicUrl(publicId: string) {
      return `https://example.com/${publicId}`;
    },
  };
}

describe("storage service", () => {
  it("validates and uploads a valid file", async () => {
    const adapter = createMockAdapter();
    const svc = createStorageService({ adapter });

    const result = await svc.upload({
      fileName: "photo.jpg",
      mimeType: "image/jpeg",
      fileSizeBytes: 1024,
      buffer: Buffer.from("fake-image-data"),
      category: "productImages",
    });

    assert.equal(result.mimeType, "image/jpeg");
    assert.ok(result.url);
  });

  it("rejects invalid MIME type", () => {
    const adapter = createMockAdapter();
    const svc = createStorageService({ adapter });

    const result = svc.validate({
      fileName: "file.exe",
      mimeType: "application/x-msdownload",
      fileSizeBytes: 100,
      category: "productImages",
    });

    assert.equal(result.valid, false);
    assert.ok(result.errors.length > 0);
  });

  it("rejects oversized file", () => {
    const adapter = createMockAdapter();
    const svc = createStorageService({ adapter });

    const result = svc.validate({
      fileName: "large.jpg",
      mimeType: "image/jpeg",
      fileSizeBytes: 50 * 1024 * 1024,
      category: "productImages",
    });

    assert.equal(result.valid, false);
    assert.ok(result.errors.some((e) => e.includes("exceeds limit")));
  });

  it("rejects unknown category", () => {
    const adapter = createMockAdapter();
    const svc = createStorageService({ adapter });

    const result = svc.validate({
      fileName: "file.pdf",
      mimeType: "application/pdf",
      fileSizeBytes: 100,
      category: "unknown" as never,
    });

    assert.equal(result.valid, false);
    assert.ok(result.errors.some((e) => e.includes("Unknown upload category")));
  });

  it("throws on upload with invalid file", async () => {
    const adapter = createMockAdapter();
    const svc = createStorageService({ adapter });

    await assert.rejects(
      () => svc.upload({
        fileName: "bad.exe",
        mimeType: "application/x-msdownload",
        fileSizeBytes: 100,
        buffer: Buffer.from("bad"),
        category: "productImages",
      }),
      /Upload validation failed/,
    );
  });

  it("delegates delete to adapter", async () => {
    let deleted = false;
    const adapter: StorageProviderAdapter = {
      ...createMockAdapter(),
      async delete(_input) { deleted = true; },
    };
    const svc = createStorageService({ adapter });

    await svc.delete({ publicId: "test/123", provider: "cloudinary" });
    assert.equal(deleted, true);
  });
});
