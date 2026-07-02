import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createFileService } from "./files.js";

function createMockClient() {
  const store = new Map<string, Record<string, unknown>>();

  return {
    from: (_table: string) => ({
      select: (_columns: string) => ({
        eq: (col: string, val: unknown) => ({
          single: async () => {
            for (const row of store.values()) {
              if ((row as Record<string, unknown>)[col] === val) {
                return { data: row, error: null };
              }
            }
            return { data: null, error: { message: "not found" } };
          },
          in: (_col: string, _vals: unknown[]) => ({
            eq: (_col2: string, _val2: unknown) => Promise.resolve({ data: [], error: null }),
          }),
          order: (_col: string, _opts: { ascending: boolean }) => ({
            limit: async (_n: number) => ({ data: Array.from(store.values()), error: null }),
          }),
        }),
      }),
      insert: (values: Record<string, unknown>) => ({
        select: async () => {
          const id = crypto.randomUUID();
          const row = { id, ...values };
          store.set(id, row);
          return { data: [row], error: null };
        },
      }),
      update: (values: Record<string, unknown>) => ({
        eq: (col: string, val: unknown) => ({
          select: async () => {
            const row = store.get(val as string);
            if (row) {
              Object.assign(row, values);
            }
            return { data: row ? [row] : [], error: null };
          },
        }),
      }),
    }),
  };
}

describe("file service", () => {
  it("records an upload", async () => {
    const svc = createFileService({ supabaseClient: createMockClient() as never });
    const file = await svc.recordUpload({
      filePath: "products/abc.jpg",
      fileName: "abc.jpg",
      mimeType: "image/jpeg",
      fileSizeBytes: 1024,
      storageProvider: "cloudinary",
    });
    assert.ok(file.id);
    assert.equal(file.fileName, "abc.jpg");
    assert.equal(file.isDeleted, false);
  });

  it("marks file deleted", async () => {
    const svc = createFileService({ supabaseClient: createMockClient() as never });
    const file = await svc.recordUpload({
      filePath: "products/del.jpg",
      fileName: "del.jpg",
      mimeType: "image/jpeg",
      fileSizeBytes: 512,
      storageProvider: "cloudinary",
    });
    await svc.markDeleted(file.id);

    const fetched = await svc.getFile(file.id);
    assert.ok(fetched);
    assert.equal(fetched.isDeleted, true);
  });

  it("returns null for unknown file", async () => {
    const svc = createFileService({ supabaseClient: createMockClient() as never });
    const file = await svc.getFile("nonexistent-id");
    assert.equal(file, null);
  });

  it("findByChecksum returns matching file", async () => {
    const svc = createFileService({ supabaseClient: createMockClient() as never });
    await svc.recordUpload({
      filePath: "dup.jpg",
      fileName: "dup.jpg",
      mimeType: "image/jpeg",
      fileSizeBytes: 100,
      storageProvider: "cloudinary",
      checksum: "abc123",
    });
    const found = await svc.findByChecksum("abc123");
    assert.ok(found);
    assert.equal(found.fileName, "dup.jpg");
  });
});
