export type DiditSessionKind = "user" | "business";

export type DiditSessionStatus =
  | "Not Started"
  | "In Progress"
  | "Awaiting User"
  | "Approved"
  | "Declined"
  | "In Review"
  | "Expired"
  | "Kyc Expired"
  | "Abandoned"
  | "Resubmitted";

export type DiditCreateSessionRequest = {
  workflow_id: string;
  vendor_data?: string;
  callback?: string;
  callback_method?: "initiator" | "completer" | "both";
  metadata?: Record<string, unknown>;
  language?: string;
  contact_details?: {
    email?: string;
    phone?: string;
    send_notification_emails?: boolean;
    email_lang?: string;
  };
  expected_details?: {
    first_name?: string;
    last_name?: string;
    date_of_birth?: string;
    gender?: "M" | "F" | null;
    nationality?: string;
    id_country?: string;
    poa_country?: string;
    country?: string;
    address?: string;
    identification_number?: string;
    ip_address?: string;
    expected_document_types?: string[];
  };
  portrait_image?: string;
};

export type DiditCreateSessionResponse = {
  session_id: string;
  session_kind: DiditSessionKind;
  session_number: number;
  session_token: string;
  url: string;
  status: DiditSessionStatus;
  workflow_id: string;
  workflow_version: number;
  vendor_data: string | null;
  metadata: Record<string, unknown> | null;
  callback: string | null;
};

export type DiditDecisionResponse = {
  session_id: string;
  session_kind: DiditSessionKind;
  session_number: number;
  session_url: string;
  status: DiditSessionStatus;
  environment: string;
  workflow_id: string;
  workflow_version: number;
  features: string | string[];
  vendor_data: string;
  metadata: Record<string, unknown>;
  expected_details: Record<string, unknown> | null;
  contact_details: {
    email?: string;
    phone?: string;
    send_notification_emails?: boolean;
    email_lang?: string;
  };
  callback: string | null;
  created_at: string;
  expires_at: string;
  reviews: Array<Record<string, unknown>>;
  id_verifications?: Array<{
    node_id: string;
    status: string;
    document_type?: string;
    full_name?: string;
    first_name?: string;
    last_name?: string;
    date_of_birth?: string;
    issuing_state?: string;
    document_number?: string;
    portrait_image?: string;
    front_image?: string;
    back_image?: string;
    mrz?: string;
    warnings?: string[];
  }> | null;
  liveness_checks?: Array<{
    node_id: string;
    status: string;
    method?: string;
    score?: number;
    reference_image?: string;
    video_url?: string;
    age_estimation?: number;
    warnings?: string[];
  }> | null;
  face_matches?: Array<{
    node_id: string;
    status: string;
    score?: number;
    source_image?: string;
    target_image?: string;
    warnings?: string[];
  }> | null;
  poa_verifications?: Array<{
    node_id: string;
    status: string;
    document_file?: string;
    document_type?: string;
    poa_address?: string;
    poa_formatted_address?: string;
    name_on_document?: string;
    warnings?: string[];
  }> | null;
  aml_screenings?: Array<{
    node_id: string;
    status: string;
    total_hits?: number;
    score?: number;
    entity_type?: string;
    hits?: Array<Record<string, unknown>>;
  }> | null;
  phone_verifications?: Array<{
    node_id: string;
    status: string;
    phone_number?: string;
    full_number?: string;
    carrier?: string;
    is_disposable?: boolean;
    verification_method?: string;
    warnings?: string[];
  }> | null;
  email_verifications?: Array<{
    node_id: string;
    status: string;
    email?: string;
    is_breached?: boolean;
    breaches?: Array<Record<string, unknown>>;
    is_disposable?: boolean;
    warnings?: string[];
  }> | null;
  registry_checks?: Array<{
    node_id: string;
    status: string;
    company?: {
      company_name?: string;
      registration_number?: string;
      country_code?: string;
      registry_status?: string;
      officers?: Array<Record<string, unknown>>;
      beneficial_owners?: Array<Record<string, unknown>>;
      financial_summary?: Record<string, unknown>;
    };
    warnings?: string[];
  }> | null;
  document_verifications?: Array<{
    node_id: string;
    status: string;
    items?: Array<Record<string, unknown>>;
    warnings?: string[];
  }> | null;
  key_people_checks?: Array<{
    node_id: string;
    status: string;
    officers?: Array<Record<string, unknown>>;
    beneficial_owners?: Array<Record<string, unknown>>;
    warnings?: string[];
  }> | null;
};

export type DiditKybSearchRequest = {
  country_code: string;
  name?: string;
  registration_number?: string;
  search_type?: "contains" | "start_with" | "fuzzy";
  vendor_data?: string;
  metadata?: Record<string, unknown>;
  webhook_url?: string;
};

export type DiditKybSearchResponse = {
  request_id: string;
  kyb_registry: {
    companies: Array<{
      kyb_response_id: string | null;
      name: string | null;
      registration_number: string | null;
      status: string | null;
      type: string | null;
      risk_level: string | null;
      fetch_status: string | null;
    }>;
    pagination: {
      total: number;
      page: number;
      per_page: number;
    };
    search_status: "pending" | "resolved" | null;
    search_resolved: boolean;
  };
  vendor_data: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
};

export type DiditKybSelectRequest = {
  kyb_response_id: string;
  vendor_data?: string;
  metadata?: Record<string, unknown>;
  save_api_request?: boolean;
};

export type DiditKybSelectResponse = {
  request_id: string;
  kyb_registry: {
    uuid: string;
    node_id: string;
    status: string;
    registry_status: string | null;
    data_resolved: boolean;
    company_name: string;
    registration_number: string | null;
    country_code: string;
    region: string | null;
    company_type: string | null;
    incorporation_date: string | null;
    registered_address: string | null;
    tax_number: string | null;
    risk_level: string | null;
    verification_status: string | null;
    is_from_registry: boolean;
    fetch_status: string;
    officers: Array<{
      uuid: string;
      name: string;
      designation: string;
      role: string;
      nationality: string;
      is_active: boolean;
      kyc_status: string;
      kyc_session_url: string | null;
    }>;
    beneficial_owners: Array<{
      uuid: string;
      name: string;
      entity_type: string;
      roles: string[];
      ownership_min_shares: number | null;
      ownership_max_shares: number | null;
      is_active: boolean;
      kyc_status: string;
      effective_ownership_percent: number | null;
    }>;
    addresses: Array<{
      address: string;
      type: string;
      description: string;
    }> | null;
    industries: Array<Record<string, unknown>> | null;
    accounts: Record<string, unknown> | null;
    financial_summary: Record<string, unknown> | null;
    registry_data: Record<string, unknown> | null;
    is_editable: boolean;
  };
  vendor_data: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
};

export type DiditWebhookPayload = {
  event_id: string;
  webhook_type: string;
  timestamp: number;
  created_at: number;
  application_id: string;
  environment: string;
  session_id: string;
  status: DiditSessionStatus;
  workflow_id: string;
  workflow_version: number;
  vendor_data: string;
  metadata: Record<string, unknown>;
  decision?: DiditDecisionResponse;
  business_session_id?: string;
  session_kind?: DiditSessionKind;
  vendor_business_id?: string;
  trigger?: string;
  resubmit_info?: {
    nodes_to_resubmit: string[];
    reasons: Record<string, unknown>;
  };
};
