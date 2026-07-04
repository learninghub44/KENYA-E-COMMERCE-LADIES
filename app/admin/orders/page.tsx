import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronRight, Eye, RefreshCw, Search, ShoppingCart, Undo2, XCircle } from "lucide-react";

import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "../../../components/ui/table";
import { listAdminOrders, ORDER_STATUSES, type OrderStatus } from "../../../lib/orders";
import { createSupabaseClient } from "../../../lib/supabase/server";
import { authorizeRoute } from "../../../middleware/auth-guard";
import type { AppRole } from "../../../types/roles";

type SearchParams = {
  q?: string;
  status?: string;
  cursor?: string;
};

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  draft: "outline",
  pending_payment: "outline",
  pending: "outline",
  paid: "secondary",
  confirmed: "secondary",
  processing: "secondary",
  ready_for_shipment: "secondary",
  shipped: "secondary",
  delivered: "default",
  completed: "default",
  cancelled: "destructive",
  refunded: "destructive",
  returned: "destructive"
};

function formatStatus(status: string) {
  return status.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatMoney(amountMinor: number, currency: string) {
  return new Intl.NumberFormat("en-KE", { style: "currency", currency }).format(amountMinor / 100);
}

function formatDate(value: string | null) {
  if (!value) return "Not placed";
  return new Intl.DateTimeFormat("en-KE", { year: "numeric", month: "short", day: "numeric" }).format(new Date(value));
}

function statusHref(status: OrderStatus | "all", q?: string) {
  const params = new URLSearchParams();
  if (status !== "all") params.set("status", status);
  if (q) params.set("q", q);
  const query = params.toString();
  return query ? `/admin/orders?${query}` : "/admin/orders";
}

export default async function AdminOrdersPage({ searchParams }: { searchParams?: Promise<SearchParams> }) {
  const params = (await searchParams) ?? {};
  const supabase = await createSupabaseClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: roleRows, error: rolesError } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
  if (rolesError) throw new Error(`Failed to load admin roles: ${rolesError.message}`);
  const roles = (roleRows ?? []).map((row: { role: AppRole }) => row.role);
  const auth = authorizeRoute({ authLevel: "admin", roles, permissions: "order.manage" });
  if (!auth.allowed) redirect("/");

  const q = params.q?.trim() || undefined;
  const status = ORDER_STATUSES.includes(params.status as OrderStatus) ? (params.status as OrderStatus) : undefined;
  const result = await listAdminOrders(supabase as any, {
    q,
    status,
    cursor: params.cursor,
    limit: 25
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Order Management</h1>
        <p className="text-sm text-muted-foreground">View and manage all platform orders</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>Orders</CardTitle>
            <form className="flex flex-col gap-2 sm:flex-row sm:items-center" action="/admin/orders">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input name="q" placeholder="Search order number..." className="w-64 pl-9" defaultValue={q ?? ""} />
              </div>
              {status && <input type="hidden" name="status" value={status} />}
              <Button type="submit" variant="outline">Search</Button>
            </form>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-wrap gap-2">
            <Button asChild size="sm" variant={!status ? "default" : "secondary"}>
              <Link href={statusHref("all", q)}>All</Link>
            </Button>
            {(["pending", "processing", "shipped", "delivered", "cancelled"] as OrderStatus[]).map((item) => (
              <Button key={item} asChild size="sm" variant={status === item ? "default" : "secondary"}>
                <Link href={statusHref(item, q)}>{formatStatus(item)}</Link>
              </Button>
            ))}
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Seller</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="w-[180px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.items.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.orderNumber}</TableCell>
                  <TableCell>{order.buyerName}</TableCell>
                  <TableCell>{order.sellerName}</TableCell>
                  <TableCell>{order.items.reduce((sum, item) => sum + item.quantity, 0)}</TableCell>
                  <TableCell className="font-medium">{formatMoney(order.totalMinor, order.currency)}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[order.status]}>{formatStatus(order.status)}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(order.placedAt ?? order.createdAt)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button asChild variant="ghost" size="icon">
                        <Link href={`/admin/orders/${order.id}`} aria-label={`View ${order.orderNumber}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" disabled aria-label="Update status">
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" disabled aria-label="Issue refund">
                        <Undo2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" disabled aria-label="Cancel order">
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {result.items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="py-12 text-center text-muted-foreground">
                    <ShoppingCart className="mx-auto mb-2 h-8 w-8" />
                    No orders found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {result.nextCursor && (
            <div className="mt-4 flex justify-end">
              <Button asChild variant="outline" size="sm">
                <Link href={`/admin/orders?cursor=${encodeURIComponent(result.nextCursor)}${q ? `&q=${encodeURIComponent(q)}` : ""}${status ? `&status=${status}` : ""}`}>
                  Next page
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
