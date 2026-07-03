import Link from "next/link";
import { redirect } from "next/navigation";
import {
  TrendingUp,
  TrendingDown,
  Package,
  ShoppingCart,
  Users,
  DollarSign,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { RevenueChart } from "./revenue-chart";
import { createSupabaseClient } from "../../lib/supabase/server";
import { createSupabaseSellerRepository } from "../../lib/seller";
import { createOrderService, createSupabaseOrderRepository } from "../../lib/orders";
import { createSellerAnalyticsService, getDateRange, formatDate } from "../../lib/analytics/seller/service";
import { createSupabaseAnalyticsRepository } from "../../lib/analytics/seller/supabase-repository";
import { createSupabasePermissionChecker } from "../../lib/analytics/seller/permission-checker";

function formatMoney(amountMinor: number, currency: string) {
  return new Intl.NumberFormat("en-KE", { style: "currency", currency }).format(amountMinor / 100);
}

function formatDateDisplay(value: string | null) {
  if (!value) return "Not placed";
  return new Intl.DateTimeFormat("en-KE", { year: "numeric", month: "short", day: "numeric" }).format(new Date(value));
}

const statusColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  delivered: "default",
  completed: "default",
  shipped: "secondary",
  ready_for_shipment: "secondary",
  processing: "outline",
  confirmed: "outline",
  paid: "outline",
  pending: "outline",
  pending_payment: "outline",
  draft: "outline",
  cancelled: "destructive",
  refunded: "destructive",
  returned: "destructive",
};

function formatStatus(status: string) {
  return status.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function StatCard({
  title,
  value,
  trend,
  icon: Icon,
}: {
  title: string;
  value: string;
  trend: number | null;
  icon: React.ElementType;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {trend !== null && (
          <div className="mt-1 flex items-center gap-1 text-xs">
            {trend >= 0 ? (
              <TrendingUp className="h-3 w-3 text-emerald-500" />
            ) : (
              <TrendingDown className="h-3 w-3 text-red-500" />
            )}
            <span className={trend >= 0 ? "text-emerald-500" : "text-red-500"}>
              {trend >= 0 ? "+" : ""}
              {trend.toFixed(1)}%
            </span>
            <span className="text-muted-foreground">vs previous 7 days</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default async function SellerDashboardPage() {
  const supabase = await createSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const seller = await createSupabaseSellerRepository(supabase as any).findByOwnerId(user.id);
  if (!seller) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Welcome to Zuri Market Seller Hub.</p>
        </div>
        <Card>
          <CardContent className="space-y-4 py-12 text-center text-muted-foreground">
            <p>No seller account is linked to this session.</p>
            <Button asChild>
              <Link href="/become-a-seller/apply">Apply to become a seller</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currency = seller.defaultCurrency ?? "KES";

  const analyticsService = createSellerAnalyticsService({
    analyticsRepository: createSupabaseAnalyticsRepository(supabase as any),
    permissionChecker: createSupabasePermissionChecker(supabase as any),
  });

  const today = new Date();
  const last7 = getDateRange("last_7_days");
  const prev7End = new Date(last7.startDate);
  prev7End.setDate(prev7End.getDate() - 1);
  const prev7Start = new Date(prev7End);
  prev7Start.setDate(prev7Start.getDate() - 6);

  // "All time" revenue/orders are computed by grouping monthly rather than fetching every
  // order row, so the totals stay cheap even for a seller with years of order history.
  const allTimeStart = "2020-01-01";

  const [last7Result, prev7Result, allTimeResult, productResult, ordersResult] = await Promise.all([
    analyticsService.getRevenueAnalytics(user.id, {
      sellerId: seller.id,
      startDate: last7.startDate,
      endDate: last7.endDate,
      groupBy: "day",
    }),
    analyticsService.getRevenueAnalytics(user.id, {
      sellerId: seller.id,
      startDate: formatDate(prev7Start),
      endDate: formatDate(prev7End),
      groupBy: "day",
    }),
    analyticsService.getRevenueAnalytics(user.id, {
      sellerId: seller.id,
      startDate: allTimeStart,
      endDate: formatDate(today),
      groupBy: "month",
    }),
    analyticsService.getProductAnalytics(user.id, { sellerId: seller.id, limit: 100 }),
    createOrderService({ orders: createSupabaseOrderRepository(supabase as any) }).listForSeller(
      seller.id,
      user.id,
      undefined,
      5
    ),
  ]);

  const last7Points = last7Result.ok ? last7Result.data : [];
  const prev7Points = prev7Result.ok ? prev7Result.data : [];
  const allTimePoints = allTimeResult.ok ? allTimeResult.data : [];
  const products = productResult.ok ? productResult.data : [];
  const recentOrders = ordersResult.ok ? ordersResult.data.items : [];

  const last7Revenue = last7Points.reduce((sum, p) => sum + p.grossRevenueMinor, 0);
  const prev7Revenue = prev7Points.reduce((sum, p) => sum + p.grossRevenueMinor, 0);
  const revenueTrend = prev7Revenue > 0 ? ((last7Revenue - prev7Revenue) / prev7Revenue) * 100 : null;

  const last7Orders = last7Points.reduce((sum, p) => sum + p.ordersCount, 0);
  const prev7Orders = prev7Points.reduce((sum, p) => sum + p.ordersCount, 0);
  const ordersTrend = prev7Orders > 0 ? ((last7Orders - prev7Orders) / prev7Orders) * 100 : null;

  const totalRevenueMinor = allTimePoints.reduce((sum, p) => sum + p.grossRevenueMinor, 0);
  const totalOrders = allTimePoints.reduce((sum, p) => sum + p.ordersCount, 0);

  const activeProducts = products.filter((p) => p.status === "active").length;
  const lowStock = products
    .filter((p) => p.isLowStock)
    .sort((a, b) => a.stockAvailable - b.stockAvailable)
    .slice(0, 5);

  // New customers = distinct buyers whose first order with this seller fell in the last 7 days.
  const { data: recentBuyers } = await supabase
    .from("orders")
    .select("buyer_id")
    .eq("seller_id", seller.id)
    .gte("created_at", `${last7.startDate}T00:00:00Z`);
  const newCustomers = new Set((recentBuyers ?? []).map((r: { buyer_id: string }) => r.buyer_id)).size;

  const stats = [
    {
      title: "Revenue (7 days)",
      value: formatMoney(last7Revenue, currency),
      trend: revenueTrend,
      icon: DollarSign,
    },
    {
      title: "Orders (7 days)",
      value: String(last7Orders),
      trend: ordersTrend,
      icon: ShoppingCart,
    },
    {
      title: "Active Products",
      value: String(activeProducts),
      trend: null,
      icon: Package,
    },
    {
      title: "New Customers (7 days)",
      value: String(newCustomers),
      trend: null,
      icon: Users,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Welcome back! Here&apos;s what&apos;s happening with {seller.storeName ?? "your store"} today.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle className="text-base">Revenue (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <RevenueChart
              data={last7Points.map((p) => ({ day: p.period.slice(5), revenue: p.grossRevenueMinor / 100 }))}
            />
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-base">Low Stock Alerts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {lowStock.length === 0 && (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Nothing running low right now.
              </p>
            )}
            {lowStock.map((item) => (
              <div
                key={item.productId}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{item.productName}</p>
                  <p className="text-xs text-muted-foreground">SKU: {item.sku ?? "—"}</p>
                </div>
                <div className="ml-4 text-right">
                  <p className="text-sm font-semibold text-destructive">{item.stockAvailable}</p>
                  <p className="text-xs text-muted-foreground">in stock</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.orderNumber}</TableCell>
                  <TableCell>{order.shippingAddress.recipientName}</TableCell>
                  <TableCell>{order.items.reduce((sum, item) => sum + item.quantity, 0)}</TableCell>
                  <TableCell>{formatMoney(order.totalMinor, order.currency)}</TableCell>
                  <TableCell>
                    <Badge variant={statusColors[order.status] ?? "outline"}>{formatStatus(order.status)}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDateDisplay(order.placedAt ?? order.createdAt)}
                  </TableCell>
                </TableRow>
              ))}
              {recentOrders.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-12 text-center text-muted-foreground">
                    No orders yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">
        Lifetime: {formatMoney(totalRevenueMinor, currency)} across {totalOrders} orders.
      </p>
    </div>
  );
}
