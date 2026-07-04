import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { createSupabaseClient } from "../../../../lib/supabase/server";
import { createSupabaseKycRepository } from "../../../../lib/kyc/supabase-kyc-repository";
import { createKycService } from "../../../../lib/kyc/kyc-service";
import { createDiditProvider } from "../../../../lib/kyc/didit-provider";

const processedEvents = new Set<string>();
const IDEMPOTENCY_CLEANUP_MS = 3_600_000;
setInterval(() => processedEvents.clear(), IDEMPOTENCY_CLEANUP_MS);

function hexBuffer(hex: string): Buffer {
  const hexStr = hex.length % 2 === 0 ? hex : `0${hex}`;
  return Buffer.from(hexStr, "hex");
}

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("X-Signature-V2");
    const timestamp = request.headers.get("X-Timestamp");

    if (!signature || !timestamp) {
      return NextResponse.json({ error: "Missing signature or timestamp" }, { status: 401 });
    }

    const now = Math.floor(Date.now() / 1000);
    const ts = parseInt(timestamp, 10);
    if (isNaN(ts) || Math.abs(now - ts) > 300) {
      return NextResponse.json({ error: "Invalid timestamp" }, { status: 401 });
    }

    const secret = process.env.DIDIT_WEBHOOK_SECRET;
    if (!secret) {
      console.error("DIDIT_WEBHOOK_SECRET is not set");
      return NextResponse.json({ error: "Configuration error" }, { status: 500 });
    }

    const expectedSig = crypto
      .createHmac("sha256", secret)
      .update(`${ts}.${rawBody}`)
      .digest("hex");

    const receivedBuf = hexBuffer(signature);
    const expectedBuf = hexBuffer(expectedSig);

    if (
      receivedBuf.length !== expectedBuf.length ||
      !crypto.timingSafeEqual(receivedBuf, expectedBuf)
    ) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    let body: Record<string, unknown>;
    try {
      body = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
    }

    const eventId =
      ((body.metadata as Record<string, unknown> | undefined)?.event_id as string | undefined) ??
      (body.id as string | undefined);

    if (eventId && processedEvents.has(eventId)) {
      return NextResponse.json({ status: "ok" });
    }

    const supabase = await createSupabaseClient();
    const repository = createSupabaseKycRepository(supabase);
    const provider = createDiditProvider(null);
    const service = createKycService({ repository, provider });

    const result = await service.handleWebhook(body);

    if (!result.ok) {
      console.error(`Webhook processing issue: ${result.code} ${result.message}`);
    }

    if (eventId) {
      processedEvents.add(eventId);
    }

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("Didit webhook error:", error);
    return NextResponse.json({ status: "ok" });
  }
}
