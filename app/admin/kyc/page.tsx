import { redirect } from "next/navigation";
import { Shield, Store, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { createSupabaseClient } from "../../../lib/supabase/server";
import { authorizeRoute } from "../../../middleware/auth-guard";
import { KycReviewClient } from "./kyc-review-client";
import type { AppRole } from "../../../types/roles";

const kycVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  approved: "default",
  pending: "secondary",
  manual_review: "outline",
  rejected: "destructive",
  not_started: "outline",
  expired: "secondary",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-KE", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

export default async function AdminKycPage() {
  const supabase = await createSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: roleRows } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
  const roles = (roleRows ?? []).map((row: { role: AppRole }) => row.role);
  const auth = authorizeRoute({ authLevel: "admin", roles });
  if (!auth.allowed) redirect("/");

  const { data: verifications, error } = await supabase
    .from("kyc_verifications")
    .select(`
      id,
      seller_id,
      provider,
      provider_reference,
      status,
      submitted_at,
      reviewed_at,
      reviewed_by,
      rejection_reason,
      metadata,
      sellers:seller_id (
        id,
        store_name,
        slug,
        status,
        kyc_status,
        created_at,
        owner_id,
        profiles:owner_id (
          id,
          display_name,
          email
        )
      )
    `)
    .in("status", ["pending", "manual_review"])
    .order("submitted_at", { ascending: false });

  if (error) throw new Error(`Failed to load KYC verifications: ${error.message}`);

  const pendingCount = (verifications ?? []).filter((v: any) => v.status === "pending").length;
  const reviewCount = (verifications ?? []).filter((v: any) => v.status === "manual_review").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">KYC Reviews</h1>
        <p className="text-sm text-muted-foreground">Review and verify seller identity documents</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Clock className="h-5 w-5 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingCount}</div>
            <p className="text-xs text-muted-foreground">Awaiting initial review</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Manual Review</CardTitle>
            <Shield className="h-5 w-5 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reviewCount}</div>
            <p className="text-xs text-muted-foreground">Flagged for manual review</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Sellers</CardTitle>
            <Store className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(verifications ?? []).length}</div>
            <p className="text-xs text-muted-foreground">Pending + manual review</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>KYC Verifications</CardTitle>
        </CardHeader>
        <CardContent>
          {(verifications ?? []).length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <Shield className="mx-auto mb-2 h-8 w-8" />
              <p>No KYC verifications pending review</p>
            </div>
          ) : (
            <KycReviewClient
              verifications={(verifications ?? []) as any}
              formatDate={formatDate}
              kycVariant={kycVariant}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
