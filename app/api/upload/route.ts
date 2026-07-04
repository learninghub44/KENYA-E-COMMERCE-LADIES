import { NextResponse } from "next/server";
import { createSupabaseClient } from "../../../lib/supabase/server";
import { createCloudinaryAdapter } from "../../../lib/storage/cloudinary-adapter";
import { ALLOWED_MIME_TYPES, SIZE_LIMITS } from "../../../lib/storage/types";
import type { UploadCategory } from "../../../lib/storage/types";

export async function POST(request: Request) {
  try {
    const supabase = await createSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      return NextResponse.json({ error: "Upload service not configured" }, { status: 500 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const category = formData.get("category") as UploadCategory | null;

    if (!file || !category) {
      return NextResponse.json({ error: "File and category are required" }, { status: 400 });
    }

    const allowedMimeTypes = ALLOWED_MIME_TYPES[category];
    if (!allowedMimeTypes || !(allowedMimeTypes as readonly string[]).includes(file.type)) {
      return NextResponse.json(
        { error: `Invalid file type for category "${category}". Allowed: ${allowedMimeTypes?.join(", ") ?? "none"}` },
        { status: 400 }
      );
    }

    const sizeLimit = SIZE_LIMITS[category];
    if (file.size > sizeLimit) {
      return NextResponse.json(
        { error: `File exceeds size limit of ${Math.round(sizeLimit / 1024 / 1024)}MB for category "${category}"` },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const adapter = createCloudinaryAdapter({ cloudName, apiKey, apiSecret });

    const result = await adapter.upload({
      fileName: file.name,
      mimeType: file.type,
      fileSizeBytes: file.size,
      buffer,
      category,
      userId: user.id,
    });

    return NextResponse.json({ url: result.url, publicId: result.publicId }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
