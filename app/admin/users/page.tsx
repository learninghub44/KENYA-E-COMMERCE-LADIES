import Link from "next/link";
import { redirect } from "next/navigation";
import { Search, ShoppingCart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Badge } from "../../../components/ui/badge";
import { Avatar, AvatarFallback } from "../../../components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table";
import { createSupabaseClient } from "../../../lib/supabase/server";
import { authorizeRoute } from "../../../middleware/auth-guard";
import { UsersClient } from "./users-client";
import type { AppRole } from "../../../types/roles";

type SearchParams = {
  q?: string;
  role?: string;
  page?: string;
};

const ITEMS_PER_PAGE = 10;

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  active: "default",
  suspended: "secondary",
  deleted: "destructive",
};

const roleVariant: Record<string, "default" | "secondary" | "outline"> = {
  admin: "default",
  seller: "secondary",
  buyer: "outline",
};

export default async function AdminUsersPage({ searchParams }: { searchParams?: Promise<SearchParams> }) {
  const params = (await searchParams) ?? {};
  const supabase = await createSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: roleRows } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
  const roles = (roleRows ?? []).map((row: { role: AppRole }) => row.role);
  const auth = authorizeRoute({ authLevel: "admin", roles, permissions: "user.manage" });
  if (!auth.allowed) redirect("/");

  const q = params.q?.trim() || undefined;
  const roleFilter = params.role && params.role !== "all" ? params.role : undefined;
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);

  let profileQuery = supabase
    .from("profiles")
    .select("id, email, display_name, phone, avatar_url, status, created_at", { count: "exact" });

  if (q) {
    profileQuery = profileQuery.or(`display_name.ilike.%${q}%,email.ilike.%${q}%`);
  }

  const from = (page - 1) * ITEMS_PER_PAGE;
  const to = from + ITEMS_PER_PAGE - 1;

  const { data: profiles, count, error: profilesError } = await profileQuery
    .order("created_at", { ascending: false })
    .range(from, to);

  if (profilesError) throw new Error(`Failed to load users: ${profilesError.message}`);

  const userIds = (profiles ?? []).map((p) => p.id);
  const { data: userRoles } = await supabase
    .from("user_roles")
    .select("user_id, role")
    .in("user_id", userIds);

  const rolesByUser: Record<string, string[]> = {};
  for (const r of userRoles ?? []) {
    (rolesByUser[r.user_id] ??= []).push(r.role);
  }

  let filteredProfiles = (profiles ?? []).map((p) => ({
    ...p,
    roles: rolesByUser[p.id] ?? ["buyer"],
  }));

  if (roleFilter) {
    filteredProfiles = filteredProfiles.filter((p) => p.roles.includes(roleFilter));
  }

  const totalPages = Math.ceil((count ?? 0) / ITEMS_PER_PAGE);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
        <p className="text-sm text-muted-foreground">Manage platform users and their roles</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>Users ({count ?? 0})</CardTitle>
            <form className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input name="q" placeholder="Search users..." className="pl-9 w-64" defaultValue={q ?? ""} />
              </div>
              <select name="role" className="flex h-10 w-36 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                <option value="all" selected={!roleFilter}>All Roles</option>
                <option value="buyer" selected={roleFilter === "buyer"}>Buyer</option>
                <option value="seller" selected={roleFilter === "seller"}>Seller</option>
                <option value="admin" selected={roleFilter === "admin"}>Admin</option>
              </select>
              <Button type="submit" variant="outline" size="sm">Filter</Button>
            </form>
          </div>
        </CardHeader>
        <CardContent>
          <UsersClient initialUsers={filteredProfiles as any} />
        </CardContent>
      </Card>
    </div>
  );
}
