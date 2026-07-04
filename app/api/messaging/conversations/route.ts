import { NextRequest, NextResponse } from "next/server";
import { createSupabaseClient } from "../../../../lib/supabase/server";
import { createSupabaseConversationRepository } from "../../../../lib/messaging/supabase-conversation-repository";
import { createSupabaseMessageRepository } from "../../../../lib/messaging/supabase-message-repository";
import { createConversationService } from "../../../../lib/messaging/conversation-service";
import { createMessageService } from "../../../../lib/messaging/message-service";
import { resolveManagedSellerIds } from "../../../../lib/messaging/seller-identity";
import type { ConversationRecord, CursorPage, MessagingResult } from "../../../../lib/messaging/types";

/**
 * Merges one or more cursor pages of conversations (e.g. one per seller
 * account a user manages) into a single sorted, deduped, re-paginated page.
 */
function mergeConversationPages(
  pages: MessagingResult<CursorPage<ConversationRecord>>[],
  limit: number
): CursorPage<ConversationRecord> {
  const all = pages.flatMap((page) => (page.ok ? page.data.items : []));

  all.sort((a, b) => {
    const aTime = a.lastMessageAt ?? a.createdAt;
    const bTime = b.lastMessageAt ?? b.createdAt;
    return bTime.localeCompare(aTime);
  });

  const deduped = all.filter((item, index, self) => self.findIndex((i) => i.id === item.id) === index);
  const sliced = deduped.slice(0, limit);

  const nextCursor = deduped.length > limit && sliced.length > 0
    ? Buffer.from(sliced[sliced.length - 1]!.lastMessageAt ?? sliced[sliced.length - 1]!.createdAt).toString("base64")
    : null;

  return { items: sliced, nextCursor };
}

/**
 * Shapes a raw ConversationRecord into what the storefront inbox UI renders:
 * resolves the "other party" (seller store when viewer is the buyer, buyer
 * profile when viewer is the seller), and picks the viewer-specific unread count.
 */
async function enrichConversations(supabase: any, items: ConversationRecord[], viewerId: string) {
  const sellerIds = new Set<string>();
  const buyerIds = new Set<string>();
  for (const item of items) {
    const viewerIsBuyer = item.buyerId === viewerId;
    if (viewerIsBuyer) sellerIds.add(item.sellerId);
    else buyerIds.add(item.buyerId);
  }

  const [sellersRes, profilesRes]: [any, any] = await Promise.all([
    sellerIds.size
      ? supabase.from("sellers").select("id, store_name, logo_url").in("id", [...sellerIds])
      : Promise.resolve({ data: [] }),
    buyerIds.size
      ? supabase.from("profiles").select("id, display_name, avatar_url").in("id", [...buyerIds])
      : Promise.resolve({ data: [] })
  ]);

  const sellersById = new Map<string, { store_name: string; logo_url: string | null }>(
    (sellersRes.data ?? []).map((s: any) => [s.id, s])
  );
  const profilesById = new Map<string, { display_name: string; avatar_url: string | null }>(
    (profilesRes.data ?? []).map((p: any) => [p.id, p])
  );

  return items.map((item) => {
    const viewerIsBuyer = item.buyerId === viewerId;
    const otherParty = viewerIsBuyer
      ? (() => {
          const seller = sellersById.get(item.sellerId);
          return { name: seller?.store_name ?? "Seller", avatar: seller?.logo_url ?? null };
        })()
      : (() => {
          const profile = profilesById.get(item.buyerId);
          return { name: profile?.display_name ?? "Buyer", avatar: profile?.avatar_url ?? null };
        })();

    return {
      id: item.id,
      otherParty,
      lastMessage: item.lastMessagePreview,
      lastMessageAt: item.lastMessageAt ?? item.createdAt,
      unread: viewerIsBuyer ? item.buyerUnreadCount : item.sellerUnreadCount,
      isBuyer: viewerIsBuyer,
      status: item.status,
      productId: item.productId,
      orderId: item.orderId,
      createdAt: item.createdAt
    };
  });
}

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
      const items = await enrichConversations(supabase, result.data.items, user.id);
      return NextResponse.json({ items, nextCursor: result.data.nextCursor });
    }

    if (role === "seller") {
      const sellerIds = await resolveManagedSellerIds(supabase, user.id);
      if (sellerIds.length === 0) {
        return NextResponse.json({ items: [], nextCursor: null });
      }

      const sellerPages = await Promise.all(
        sellerIds.map((sellerId) => service.listForSeller(sellerId, cursor, limit))
      );
      const merged = mergeConversationPages(sellerPages, limit);
      const items = await enrichConversations(supabase, merged.items, user.id);
      return NextResponse.json({ items, nextCursor: merged.nextCursor });
    }

    const sellerIds = await resolveManagedSellerIds(supabase, user.id);
    const [buyerResult, ...sellerResults] = await Promise.all([
      service.listForBuyer(user.id, undefined, limit),
      ...sellerIds.map((sellerId) => service.listForSeller(sellerId, undefined, limit))
    ]);

    const merged = mergeConversationPages([buyerResult, ...sellerResults], limit);
    const items = await enrichConversations(supabase, merged.items, user.id);

    return NextResponse.json({ items, nextCursor: merged.nextCursor });
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
