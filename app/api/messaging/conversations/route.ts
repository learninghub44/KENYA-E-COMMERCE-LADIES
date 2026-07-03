import { NextRequest, NextResponse } from "next/server";
import { createSupabaseClient } from "../../../../lib/supabase/server";
import { createSupabaseConversationRepository } from "../../../../lib/messaging/supabase-conversation-repository";
import { createSupabaseMessageRepository } from "../../../../lib/messaging/supabase-message-repository";
import { createConversationService } from "../../../../lib/messaging/conversation-service";
import { createMessageService } from "../../../../lib/messaging/message-service";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const params = request.nextUrl.searchParams;
    const role = params.get("role") ?? "all";
    const cursor = params.get("cursor") ?? undefined;
    const limit = params.has("limit") ? Number(params.get("limit")) : 20;

    const repo = createSupabaseConversationRepository(supabase as any);
    const service = createConversationService({ conversations: repo });

    if (role === "buyer") {
      const result = await service.listForBuyer(user.id, cursor, limit);
      if (!result.ok) {
        return NextResponse.json({ error: result.message }, { status: result.status });
      }
      return NextResponse.json(result.data);
    }

    if (role === "seller") {
      const result = await service.listForSeller(user.id, cursor, limit);
      if (!result.ok) {
        return NextResponse.json({ error: result.message }, { status: result.status });
      }
      return NextResponse.json(result.data);
    }

    const [buyerResult, sellerResult] = await Promise.all([
      service.listForBuyer(user.id, undefined, limit),
      service.listForSeller(user.id, undefined, limit)
    ]);

    const all = [
      ...(buyerResult.ok ? buyerResult.data.items : []),
      ...(sellerResult.ok ? sellerResult.data.items : [])
    ];

    all.sort((a, b) => {
      const aTime = a.lastMessageAt ?? a.createdAt;
      const bTime = b.lastMessageAt ?? b.createdAt;
      return bTime.localeCompare(aTime);
    });

    const deduped = all.filter((item, index, self) => self.findIndex((i) => i.id === item.id) === index);
    const sliced = cursor && deduped.length > limit ? deduped.slice(0, limit) : deduped;

    return NextResponse.json({
      items: sliced,
      nextCursor: sliced.length >= limit && sliced.length < deduped.length
        ? Buffer.from(sliced[sliced.length - 1]!.lastMessageAt ?? sliced[sliced.length - 1]!.createdAt).toString("base64")
        : null
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const conversationRepo = createSupabaseConversationRepository(supabase as any);
    const conversationService = createConversationService({ conversations: conversationRepo });

    const result = await conversationService.start({
      buyerId: user.id,
      sellerId: body.sellerId,
      productId: body.productId ?? undefined,
      variantId: body.variantId ?? undefined,
      orderId: body.orderId ?? undefined
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.message }, { status: result.status });
    }

    if (body.initialMessage) {
      const messageRepo = createSupabaseMessageRepository(supabase as any);
      const messageService = createMessageService({
        conversations: conversationRepo,
        messages: messageRepo
      });

      await messageService.send(
        {
          conversationId: result.data.id,
          senderId: user.id,
          body: body.initialMessage
        },
        false
      );
    }

    return NextResponse.json(result.data, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
