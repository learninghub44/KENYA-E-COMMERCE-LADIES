import type { MarketplaceDashboard } from "../../../lib/analytics/marketplace";
import { AdminComparisonCard } from "./comparison-card";
import { AdminKpiCard } from "./kpi-card";
import { AdminSummaryTable } from "./summary-table";

const currencyFormatter = new Intl.NumberFormat("en-KE", {
  style: "currency",
  currency: "KES",
  maximumFractionDigits: 0,
});

function money(minor: number) {
  return currencyFormatter.format(minor / 100);
}

export function MarketplaceAdminDashboard({ dashboard }: { dashboard: MarketplaceDashboard }) {
  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminKpiCard title="GMV" value={money(dashboard.revenue.gmvMinor)} growthRate={dashboard.revenue.revenueGrowth.growthRate} />
        <AdminKpiCard title="Orders" value={dashboard.orders.totalOrders} growthRate={dashboard.orders.orderGrowth.growthRate} />
        <AdminKpiCard title="Active Buyers" value={dashboard.users.activeBuyers} growthRate={dashboard.users.buyerGrowth.growthRate} />
        <AdminKpiCard title="Active Sellers" value={dashboard.sellers.activeSellers} growthRate={dashboard.sellers.sellerGrowth.growthRate} />
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <AdminComparisonCard
          title="Revenue Growth"
          currentLabel="Current"
          currentValue={money(dashboard.revenue.revenueGrowth.current)}
          previousLabel="Previous"
          previousValue={money(dashboard.revenue.revenueGrowth.previous)}
          growthRate={dashboard.revenue.revenueGrowth.growthRate}
        />
        <AdminComparisonCard
          title="Order Growth"
          currentLabel="Current"
          currentValue={dashboard.orders.orderGrowth.current}
          previousLabel="Previous"
          previousValue={dashboard.orders.orderGrowth.previous}
          growthRate={dashboard.orders.orderGrowth.growthRate}
        />
        <AdminComparisonCard
          title="Product Growth"
          currentLabel="Current"
          currentValue={dashboard.products.productGrowth.current}
          previousLabel="Previous"
          previousValue={dashboard.products.productGrowth.previous}
          growthRate={dashboard.products.productGrowth.growthRate}
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <AdminSummaryTable
          title="Highest Revenue Categories"
          rows={dashboard.categories.highestRevenueCategories}
          columns={[
            { key: "name", label: "Category" },
            { key: "count", label: "Products", align: "right" },
            { key: "revenueMinor", label: "Revenue", align: "right", format: (value) => money(Number(value)) },
            { key: "revenueShare", label: "Share", align: "right", format: (value) => `${value}%` },
          ]}
        />
        <AdminSummaryTable
          title="Highest Revenue Brands"
          rows={dashboard.brands.highestRevenueBrands}
          columns={[
            { key: "name", label: "Brand" },
            { key: "count", label: "Products", align: "right" },
            { key: "revenueMinor", label: "Revenue", align: "right", format: (value) => money(Number(value)) },
            { key: "revenueShare", label: "Share", align: "right", format: (value) => `${value}%` },
          ]}
        />
      </section>
    </div>
  );
}
