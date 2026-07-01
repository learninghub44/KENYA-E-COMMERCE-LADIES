export const SELLER_STATUSES = [
  "draft",
  "pending",
  "under_review",
  "approved",
  "rejected",
  "suspended",
  "inactive",
  "closed"
] as const;

export type SellerStatus = (typeof SELLER_STATUSES)[number];

export const STORED_SELLER_STATUSES = [
  ...SELLER_STATUSES,
  "pending_kyc",
  "active"
] as const;

export type StoredSellerStatus = (typeof STORED_SELLER_STATUSES)[number];

export const KYC_STATUSES = [
  "not_started",
  "pending",
  "manual_review",
  "approved",
  "rejected",
  "expired"
] as const;

export type KycStatus = (typeof KYC_STATUSES)[number];

export type StoreVisibility = "public" | "private" | "paused";

export type SellerNotificationEvent =
  | "seller.application.received"
  | "seller.kyc.submitted"
  | "seller.kyc.failed"
  | "seller.approved"
  | "seller.rejected"
  | "seller.documents.requested";

export type SellerApplicationInput = {
  userId: string;
  storeName: string;
  storeDescription?: string;
  storeUrl?: string;
  businessCategory: string;
  countryCode?: string;
  defaultCurrency?: string;
  supportEmail?: string;
  supportPhone?: string;
  businessAddress?: StoreAddress;
  taxInformation?: TaxInformation;
};

export type StoreProfileInput = {
  sellerId: string;
  storeName?: string;
  storeDescription?: string;
  logoUrl?: string | null;
  bannerUrl?: string | null;
  storeUrl?: string;
  businessCategory?: string;
  supportEmail?: string | null;
  supportPhone?: string | null;
  businessAddress?: StoreAddress;
  storePolicies?: StorePolicies;
  businessHours?: BusinessHours;
  visibility?: StoreVisibility;
};

export type StoreAddress = {
  line1: string;
  line2?: string;
  city: string;
  region?: string;
  postalCode?: string;
  countryCode: string;
};

export type TaxInformation = {
  taxId?: string;
  vatNumber?: string;
  registrationNumber?: string;
};

export type StorePolicies = {
  returns?: string;
  shipping?: string;
  privacy?: string;
  terms?: string;
};

export type BusinessHours = Record<string, { opens: string; closes: string; closed?: boolean }>;

export type SellerRecord = {
  id: string;
  ownerId: string;
  storeName: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
  bannerUrl: string | null;
  status: StoredSellerStatus;
  kycStatus: KycStatus;
  countryCode: string | null;
  defaultCurrency: string;
  supportEmail: string | null;
  supportPhone: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};

export type SellerDashboard = {
  seller: SellerRecord;
  applicationStatus: SellerStatus;
  kycStatus: KycStatus;
  storeCompletion: number;
  statistics: {
    productsReady: boolean;
    salesAnalyticsReady: false;
  };
  recentActivity: string[];
  notifications: SellerNotificationEvent[];
  quickActions: string[];
};

export type SellerResult<T> =
  | { ok: true; data: T }
  | { ok: false; code: string; message: string; status: number };

export type SellerRepository = {
  findByOwnerId(userId: string): Promise<SellerRecord | null>;
  findById(sellerId: string): Promise<SellerRecord | null>;
  createSeller(input: {
    ownerId: string;
    storeName: string;
    slug: string;
    description?: string;
    status: SellerStatus;
    kycStatus: KycStatus;
    countryCode?: string;
    defaultCurrency: string;
    supportEmail?: string;
    supportPhone?: string;
    metadata: Record<string, unknown>;
  }): Promise<SellerRecord>;
  updateSeller(input: {
    sellerId: string;
    values: Partial<Pick<SellerRecord, "storeName" | "slug" | "description" | "logoUrl" | "bannerUrl" | "status" | "kycStatus" | "countryCode" | "defaultCurrency" | "supportEmail" | "supportPhone">> & {
      metadata?: Record<string, unknown>;
    };
  }): Promise<SellerRecord>;
  addOwnerMember(input: { sellerId: string; userId: string }): Promise<void>;
};

export type SellerRoleRepository = {
  grantSellerRole(input: { userId: string; grantedBy: string }): Promise<void>;
};

export type SellerEventPublisher = {
  publish(event: { type: SellerNotificationEvent; sellerId: string; userId: string; metadata?: Record<string, unknown> }): Promise<void>;
};
