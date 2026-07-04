import Link from "next/link";
import { redirect } from "next/navigation";
import { Users, Store, Package, ShoppingCart, TrendingUp, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Avatar, AvatarFallback } from "../../components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { createSupabaseClient } from "../../lib/supabase/server";
import { authorizeRoute } from "../../middleware/auth-guard";
import { listAdminOrders } from "../../lib/orders";
import type { AppRole } from "../../types/roles";

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  Delivered: "default",
  Processing: "secondary",
  Pending: "outline",
  Shipped: "secondary",
};

function formatStatus(status: string) {
  return status.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatMoney(amountMinor: number, currency: string) {
  return new Intl.NumberFormat("en-KE", { style: "currency", currency }).format(amountMinor / 100);
}

function formatDate(value: string | null) {
  if (!value) return "N/A";
  return new Intl.DateTimeFormat("en-KE", { year: "numeric", month: "short", day: "numeric" }).format(new Date(value));
}

export default async function AdminDashboardPage() {
  const supabase = await createSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: roleRows } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
  const roles = (roleRows ?? []).map((row: { role: AppRole }) => row.role);
  const auth = authorizeRoute({ authLevel: "admin", roles });
  if (!auth.allowed) redirect("/");

  const [
    { count: userCount },
    { count: sellerCount },
    { count: productCount },
    { count: orderCount },
    recentOrdersResult,
    { data: recentUsers },
    revenueResult,
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("sellers").select("*", { count: "exact", head: true }),
    supabase.from("products").select("*", { count: "exact", head: true }),
    supabase.from("orders").select("*", { count: "exact", head: true }),
    listAdminOrders(supabase as any, { limit: 5 }),
    supabase
      .from("profiles")
      .select("id, display_name, email, created_at, avatar_url")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase.from("orders").select("total_minor, payment_status").eq("payment_status", "paid"),
  ]);

  const orders = recentOrdersResult.items ?? [];

  const totalRevenueMinor = (revenueResult.data ?? []).reduce(
    (sum: number, o: { total_minor: number }) => sum + (o.total_minor ?? 0),
    0
  );
  const platformFeeMinor = Math.round(totalRevenueMinor * 0.05);

  const stats = [
    { label: "Total Users", value: (userCount ?? 0).toLocaleString(), icon: Users, color: "text-blue-600" },
    { label: "Total Sellers", value: (sellerCount ?? 0).toLocaleString(), icon: Store, color: "text-emerald-600" },
    { label: "Total Products", value: (productCount ?? 0).toLocaleString(), icon: Package, color: "text-violet-600" },
    { label: "Total Orders", value: (orderCount ?? 0).toLocaleString(), icon: ShoppingCart, color: "text-orange-600" },
    { label: "Revenue", value: `KES ${(totalRevenueMinor / 100).toLocaleString()}`, icon: TrendingUp, color: "text-green-600" },
    { label: "Platform Fee (5%)", value: `KES ${(platformFeeMinor / 100).toLocaleString()}`, icon: DollarSign, color: "text-rose-600" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Platform overview at a glance</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
                <Icon className={"h-5 w-5 " + stat.color} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Seller</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order: any) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.orderNumber}</TableCell>
                    <TableCell>{order.buyerName}</TableCell>
                    <TableCell>{order.sellerName}</TableCell>
                    <TableCell>{formatMoney(order.totalMinor, order.currency)}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariant[formatStatus(order.status)] || "outline"}>
                        {formatStatus(order.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{formatDate(order.placedAt ?? order.createdAt)}</TableCell>
                  </TableRow>
                ))}
                {orders.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">No orders yet</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Recent Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(recentUsers ?? []).map((u: any) => (
                <div key={u.id} className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback>{(u.display_name ?? u.email ?? "?")?.slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">{u.display_name ?? "Unknown"}</p>
                    <p className="text-xs text-muted-foreground">{u.email}</p>
                  </div>
                  <div className="text-xs text-muted-foreground">{formatDate(u.created_at)}</div>
                </div>
              ))}
              {(recentUsers ?? []).length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">No users yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
