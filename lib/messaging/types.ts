export type MessagingResult<T> =
  | { ok: true; data: T }
  | { ok: false; code: string; message: string; status: number };

export type ConversationStatus = "active" | "archived";

export type ConversationParticipantRole = "buyer" | "seller";

export type ProductSnapshot = {
  productId: string;
  productName: string;
  productSlug: string;
  variantId?: string | null | undefined;
  variantTitle?: string | null | undefined;
  imageUrl?: string | null | undefined;
  priceMinor?: number | null | undefined;
  currency?: string | null | undefined;
};

export type ConversationRecord = {
  id: string;
  buyerId: string;
  sellerId: string;
  productId: string | null;
  variantId: string | null;
  orderId: string | null;
  productSnapshot: ProductSnapshot | null;
  status: ConversationStatus;
  buyerDeletedAt: string | null;
  sellerDeletedAt: string | null;
  buyerUnreadCount: number;
  sellerUnreadCount: number;
  lastMessageAt: string | null;
  lastMessagePreview: string | null;
  createdAt: string;
  updatedAt: string;
};

export type MessageAttachmentRecord = {
  id: string;
  messageId: string;
  url: string;
  cloudinaryPublicId: string;
  mimeType: string;
  width: number | null;
  height: number | null;
  bytes: number | null;
  position: number;
  createdAt: string;
};

export type MessageRecord = {
  id: string;
  conversationId: string;
  senderId: string;
  body: string | null;
  replyToMessageId: string | null;
  deliveredAt: string | null;
  readAt: string | null;
  editedAt: string | null;
  deletedAt: string | null;
  deletedBy: string | null;
  createdAt: string;
  attachments: MessageAttachmentRecord[];
};

export type ModerationEventType = "reported" | "deleted" | "user_blocked" | "suspicious_content";

export type ModerationEventRecord = {
  id: string;
  messageId: string | null;
  conversationId: string | null;
  eventType: ModerationEventType;
  actorId: string | null;
  targetUserId: string | null;
  reason: string | null;
  createdAt: string;
};

export type StartConversationInput = {
  buyerId: string;
  sellerId: string;
  productId?: string | null | undefined;
  variantId?: string | null | undefined;
  orderId?: string | null | undefined;
  productSnapshot?: ProductSnapshot | null | undefined;
};

export type SendMessageInput = {
  conversationId: string;
  senderId: string;
  body?: string | undefined;
  replyToMessageId?: string | null | undefined;
  attachments?: PendingAttachment[] | undefined;
};

export type PendingAttachment = {
  url: string;
  cloudinaryPublicId: string;
  mimeType: string;
  width?: number | null | undefined;
  height?: number | null | undefined;
  bytes?: number | null | undefined;
};

export type CursorPage<T> = {
  items: T[];
  nextCursor: string | null;
};

export type ConversationRepository = {
  findById(conversationId: string): Promise<ConversationRecord | null>;
  findByParticipants(input: { buyerId: string; sellerId: string; productId: string | null }): Promise<ConversationRecord | null>;
  create(input: Omit<ConversationRecord, "id" | "status" | "buyerDeletedAt" | "sellerDeletedAt" | "buyerUnreadCount" | "sellerUnreadCount" | "lastMessageAt" | "lastMessagePreview" | "createdAt" | "updatedAt">): Promise<ConversationRecord>;
  listForBuyer(input: { buyerId: string; cursor?: string | undefined; limit: number; includeArchived: boolean }): Promise<CursorPage<ConversationRecord>>;
  listForSeller(input: { sellerId: string; cursor?: string | undefined; limit: number; includeArchived: boolean }): Promise<CursorPage<ConversationRecord>>;
  searchForParticipant(input: { participantId: string; role: ConversationParticipantRole; query: string; cursor?: string | undefined; limit: number }): Promise<CursorPage<ConversationRecord>>;
  updateStatus(input: { conversationId: string; status: ConversationStatus }): Promise<ConversationRecord>;
  softDeleteForParticipant(input: { conversationId: string; role: ConversationParticipantRole }): Promise<ConversationRecord>;
  resetUnreadCount(input: { conversationId: string; role: ConversationParticipantRole }): Promise<ConversationRecord>;
};

export type MessageRepository = {
  create(input: {
    conversationId: string;
    senderId: string;
    body: string | null;
    replyToMessageId: string | null;
    attachments: PendingAttachment[];
  }): Promise<MessageRecord>;
  findById(messageId: string): Promise<MessageRecord | null>;
  listByConversation(input: { conversationId: string; cursor?: string | undefined; limit: number }): Promise<CursorPage<MessageRecord>>;
  searchByConversation(input: { conversationId: string; query: string; cursor?: string | undefined; limit: number }): Promise<CursorPage<MessageRecord>>;
  editBody(input: { messageId: string; body: string; editedAt: string }): Promise<MessageRecord>;
  softDelete(input: { messageId: string; deletedBy: string; deletedAt: string }): Promise<MessageRecord>;
  markDelivered(input: { conversationId: string; recipientId: string; deliveredAt: string }): Promise<number>;
  markRead(input: { conversationId: string; recipientId: string; readAt: string }): Promise<number>;
};

export type ModerationEventPublisher = {
  record(event: {
    eventType: ModerationEventType;
    messageId?: string | null | undefined;
    conversationId?: string | null | undefined;
    actorId: string;
    targetUserId?: string | null | undefined;
    reason?: string | undefined;
  }): Promise<void>;
};

export type MessagingEventPublisher = {
  publish(event: {
    type: "conversation.created" | "message.new" | "message.read" | "message.deleted";
    conversationId: string;
    messageId?: string | undefined;
    buyerId: string;
    sellerId: string;
    metadata?: Record<string, unknown> | undefined;
  }): Promise<void>;
};

export type AttachmentUploadInput = {
  fileBase64: string;
  mimeType: string;
  filename?: string | undefined;
};

export type AttachmentProvider = {
  upload(input: AttachmentUploadInput): Promise<PendingAttachment>;
  destroy(cloudinaryPublicId: string): Promise<void>;
};
