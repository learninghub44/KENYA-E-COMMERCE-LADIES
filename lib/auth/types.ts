export type SupabaseAuthError = {
  message: string;
  status?: number;
};

export type SupabaseAuthUser = {
  id: string;
  email?: string;
  email_confirmed_at?: string | null;
};

export type SupabaseAuthSession = {
  access_token: string;
  refresh_token: string;
  expires_at?: number;
  user: SupabaseAuthUser;
};

export type SupabaseAuthPort = {
  signUp(input: {
    email: string;
    password: string;
    options?: { data?: Record<string, unknown>; emailRedirectTo?: string };
  }): Promise<{ data: { user: SupabaseAuthUser | null; session: SupabaseAuthSession | null }; error: SupabaseAuthError | null }>;
  signInWithPassword(input: {
    email: string;
    password: string;
  }): Promise<{ data: { user: SupabaseAuthUser | null; session: SupabaseAuthSession | null }; error: SupabaseAuthError | null }>;
  signOut(input?: { scope?: "global" | "local" | "others" }): Promise<{ error: SupabaseAuthError | null }>;
  resetPasswordForEmail(
    email: string,
    options?: { redirectTo?: string }
  ): Promise<{ data: unknown; error: SupabaseAuthError | null }>;
  updateUser(input: {
    email?: string;
    password?: string;
    data?: Record<string, unknown>;
  }): Promise<{ data: { user: SupabaseAuthUser | null }; error: SupabaseAuthError | null }>;
  getUser(): Promise<{ data: { user: SupabaseAuthUser | null }; error: SupabaseAuthError | null }>;
  getSession(): Promise<{ data: { session: SupabaseAuthSession | null }; error: SupabaseAuthError | null }>;
  refreshSession(): Promise<{ data: { session: SupabaseAuthSession | null }; error: SupabaseAuthError | null }>;
};

export type ProfileRepository = {
  createProfile(input: { id: string; email: string; fullName?: string }): Promise<void>;
  setProfileStatus(userId: string, status: "active" | "inactive" | "deleted"): Promise<void>;
  updateProfile(input: {
    userId: string;
    displayName?: string;
    email?: string;
    phone?: string;
    avatarUrl?: string | null;
  }): Promise<void>;
  findByUserId(userId: string): Promise<{
    id: string;
    email: string;
    displayName: string | null;
    phone: string | null;
    avatarUrl: string | null;
  } | null>;
};

export type RoleRepository = {
  listRoles(userId: string): Promise<string[]>;
  grantRole(input: { userId: string; role: string; grantedBy: string }): Promise<void>;
};
