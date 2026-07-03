import { NextRequest, NextResponse } from "next/server";
import { createSupabaseClient } from "../../../../../../lib/supabase/server";
import { createSupabaseConversationRepository } from "../../../../../../lib/messaging/supabase-conversation-repository";
import { createSupabaseMessageRepository } from "../../../../../../lib/messaging/supabase-message-repository";
import { createMessageService } from "../../../../../../lib/messaging/message-service";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createSupabaseClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const cursor = request.nextUrl.searchParams.get("cursor") ?? undefined;
    const limit = request.nextUrl.searchParams.has("limit")
      ? Number(request.nextUrl.searchParams.get("limit"))
      : 30;

    const conversationRepo = createSupabaseConversationRepository(supabase as any);
    const messageRepo = createSupabaseMessageRepository(supabase as any);
    const service = createMessageService({
      conversations: conversationRepo,
      messages: messageRepo
    });

    const conversation = await conversationRepo.findById(id);
    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }
    if (conversation.buyerId !== user.id && conversation.sellerId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const result = await service.listByConversation(
      id,
      user.id,
      conversation.sellerId === user.id,
      cursor,
      limit
    );

    if (!result.ok) {
      return NextResponse.json({ error: result.message }, { status: result.status });
    }

    return NextResponse.json(result.data);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createSupabaseClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const conversationRepo = createSupabaseConversationRepository(supabase as any);
    const messageRepo = createSupabaseMessageRepository(supabase as any);
    const service = createMessageService({
      conversations: conversationRepo,
      messages: messageRepo
    });

    const conversation = await conversationRepo.findById(id);
    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    const isSeller = conversation.sellerId === user.id;
    if (conversation.buyerId !== user.id && !isSeller) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const result = await service.send(
      {
        conversationId: id,
        senderId: user.id,
        body: body.body ?? undefined,
        replyToMessageId: body.replyToMessageId ?? undefined,
        attachments: body.attachments ?? undefined
      },
      isSeller
    );

    if (!result.ok) {
      return NextResponse.json({ error: result.message }, { status: result.status });
    }

    return NextResponse.json(result.data, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
