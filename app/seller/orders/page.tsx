import Link from "next/link";
import { redirect } from "next/navigation";
import { Eye, MessageSquare, ShoppingCart } from "lucide-react";

import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Card, CardContent } from "../../../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "../../../components/ui/table";
import { createOrderService, createSupabaseOrderRepository, type OrderStatus, ORDER_STATUSES } from "../../../lib/orders";
import { createSupabaseSellerRepository } from "../../../lib/seller";
import { createSupabaseClient } from "../../../lib/supabase/server";

type SearchParams = {
  status?: string;
  cursor?: string;
};

const tabs: { label: string; value: OrderStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Processing", value: "processing" },
  { label: "Shipped", value: "shipped" },
  { label: "Delivered", value: "delivered" },
  { label: "Cancelled", value: "cancelled" }
];

const statusColors: Record<string, string> = {
  draft: "bg-slate-100 text-slate-800 hover:bg-slate-100/80",
  pending_payment: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100/80",
  pending: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100/80",
  paid: "bg-sky-100 text-sky-800 hover:bg-sky-100/80",
  confirmed: "bg-blue-100 text-blue-800 hover:bg-blue-100/80",
  processing: "bg-blue-100 text-blue-800 hover:bg-blue-100/80",
  ready_for_shipment: "bg-violet-100 text-violet-800 hover:bg-violet-100/80",
  shipped: "bg-violet-100 text-violet-800 hover:bg-violet-100/80",
  delivered: "bg-emerald-100 text-emerald-800 hover:bg-emerald-100/80",
  completed: "bg-emerald-100 text-emerald-800 hover:bg-emerald-100/80",
  cancelled: "bg-red-100 text-red-800 hover:bg-red-100/80",
  refunded: "bg-rose-100 text-rose-800 hover:bg-rose-100/80",
  returned: "bg-orange-100 text-orange-800 hover:bg-orange-100/80"
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

function statusHref(status: OrderStatus | "all") {
  return status === "all" ? "/seller/orders" : `/seller/orders?status=${status}`;
}

export default async function SellerOrdersPage({ searchParams }: { searchParams?: Promise<SearchParams> }) {
  const params = (await searchParams) ?? {};
  const supabase = await createSupabaseClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const seller = await createSupabaseSellerRepository(supabase as any).findByOwnerId(user.id);
  if (!seller) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
          <p className="text-sm text-muted-foreground">View and manage all customer orders.</p>
        </div>
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No seller account is linked to this session.
          </CardContent>
        </Card>
      </div>
    );
  }

  const status = ORDER_STATUSES.includes(params.status as OrderStatus) ? (params.status as OrderStatus) : undefined;
  const service = createOrderService({ orders: createSupabaseOrderRepository(supabase as any) });
  const result = await service.listForSeller(seller.id, user.id, params.cursor, 25);
  if (!result.ok) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">{result.message}</CardContent>
        </Card>
      </div>
    );
  }

  const orders = status ? result.data.items.filter((order) => order.status === status) : result.data.items;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
        <p className="text-sm text-muted-foreground">View and manage all customer orders.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => {
          const active = (status ?? "all") === tab.value;
          return (
            <Button key={tab.value} asChild size="sm" variant={active ? "default" : "secondary"}>
              <Link href={statusHref(tab.value)}>{tab.label}</Link>
            </Button>
          );
        })}
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="w-[140px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.orderNumber}</TableCell>
                  <TableCell>{order.shippingAddress.recipientName}</TableCell>
                  <TableCell>{order.items.reduce((sum, item) => sum + item.quantity, 0)}</TableCell>
                  <TableCell>{formatMoney(order.totalMinor, order.currency)}</TableCell>
                  <TableCell>
                    <Badge className={statusColors[order.status]} variant="outline">
                      {formatStatus(order.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(order.placedAt ?? order.createdAt)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button asChild variant="ghost" size="icon">
                        <Link href={`/seller/orders/${order.id}`} aria-label={`View ${order.orderNumber}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button asChild variant="ghost" size="icon">
                        <Link href={`/seller/messages?orderId=${order.id}`} aria-label={`Message buyer for ${order.orderNumber}`}>
                          <MessageSquare className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {orders.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="py-12 text-center text-muted-foreground">
                    <ShoppingCart className="mx-auto mb-2 h-8 w-8" />
                    No orders found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {result.data.nextCursor && (
        <div className="flex justify-end">
          <Button asChild variant="outline" size="sm">
            <Link href={`/seller/orders?cursor=${encodeURIComponent(result.data.nextCursor)}`}>Next page</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
