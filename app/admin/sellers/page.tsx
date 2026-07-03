import { redirect } from "next/navigation";
import { Search, Store } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Badge } from "../../../components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table";
import { createSupabaseClient } from "../../../lib/supabase/server";
import { authorizeRoute } from "../../../middleware/auth-guard";
import { SellersClient } from "./sellers-client";
import type { AppRole } from "../../../types/roles";

type SearchParams = {
  q?: string;
  status?: string;
  kycStatus?: string;
  page?: string;
};

const ITEMS_PER_PAGE = 10;

export default async function AdminSellersPage({ searchParams }: { searchParams?: Promise<SearchParams> }) {
  const params = (await searchParams) ?? {};
  const supabase = await createSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: roleRows } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
  const roles = (roleRows ?? []).map((row: { role: AppRole }) => row.role);
  const auth = authorizeRoute({ authLevel: "admin", roles, permissions: "user.manage" });
  if (!auth.allowed) redirect("/");

  const q = params.q?.trim() || undefined;
  const statusFilter = params.status && params.status !== "all" ? params.status : undefined;
  const kycFilter = params.kycStatus && params.kycStatus !== "all" ? params.kycStatus : undefined;
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);

  let query = supabase
    .from("sellers")
    .select("id, store_name, slug, description, logo_url, status, kyc_status, owner_id, default_currency, created_at, profiles:owner_id(id, display_name, email)", { count: "exact" });

  if (q) {
    query = query.or(`store_name.ilike.%${q}%,profiles.display_name.ilike.%${q}%`);
  }
  if (statusFilter) {
    query = query.eq("status", statusFilter);
  }
  if (kycFilter) {
    query = query.eq("kyc_status", kycFilter);
  }

  const from = (page - 1) * ITEMS_PER_PAGE;
  const to = from + ITEMS_PER_PAGE - 1;

  const { data: sellers, count, error } = await query
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) throw new Error(`Failed to load sellers: ${error.message}`);

  const totalPages = Math.ceil((count ?? 0) / ITEMS_PER_PAGE);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Seller Management</h1>
        <p className="text-sm text-muted-foreground">Manage sellers, KYC, and store approvals</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>Sellers ({count ?? 0})</CardTitle>
            <form className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input name="q" placeholder="Search sellers..." className="pl-9 w-48" defaultValue={q ?? ""} />
              </div>
              <select name="status" className="flex h-10 w-36 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background">
                <option value="all" selected={!statusFilter}>All Status</option>
                <option value="draft" selected={statusFilter === "draft"}>Draft</option>
                <option value="pending" selected={statusFilter === "pending"}>Pending</option>
                <option value="active" selected={statusFilter === "active"}>Active</option>
                <option value="suspended" selected={statusFilter === "suspended"}>Suspended</option>
                <option value="rejected" selected={statusFilter === "rejected"}>Rejected</option>
              </select>
              <select name="kycStatus" className="flex h-10 w-40 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background">
                <option value="all" selected={!kycFilter}>All KYC</option>
                <option value="approved" selected={kycFilter === "approved"}>Approved</option>
                <option value="pending" selected={kycFilter === "pending"}>Pending</option>
                <option value="manual_review" selected={kycFilter === "manual_review"}>Manual Review</option>
                <option value="rejected" selected={kycFilter === "rejected"}>Rejected</option>
                <option value="not_started" selected={kycFilter === "not_started"}>Not Started</option>
              </select>
              <Button type="submit" variant="outline" size="sm">Filter</Button>
            </form>
          </div>
        </CardHeader>
        <CardContent>
          <SellersClient
            initialSellers={(sellers ?? []) as any}
            totalPages={totalPages}
            currentPage={page}
            q={q}
            statusFilter={params.status}
            kycFilter={params.kycStatus}
          />
        </CardContent>
      </Card>
    </div>
  );
}
