import React from 'react';

// ============================================================================
// SELLER ANALYTICS DASHBOARD PAGE
// ============================================================================

export default function SellerAnalyticsPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Seller Analytics Dashboard
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Monitor your store performance, sales, and customer insights
          </p>
        </div>

        {/* Date Range Filter */}
        <div className="mb-6 flex items-center gap-4">
          <select className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300">
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="last_7_days">Last 7 Days</option>
            <option value="last_30_days" selected>Last 30 Days</option>
            <option value="last_90_days">Last 90 Days</option>
            <option value="last_year">Last Year</option>
            <option value="custom">Custom Range</option>
          </select>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Export Report
          </button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Revenue</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">KES 125,000</p>
            <p className="text-sm text-green-600 dark:text-green-400 mt-2">↑ 12.5%</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Orders</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">234</p>
            <p className="text-sm text-green-600 dark:text-green-400 mt-2">↑ 8.2%</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">New Customers</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">45</p>
            <p className="text-sm text-red-600 dark:text-red-400 mt-2">↓ 3.1%</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Average Order Value</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">KES 534</p>
            <p className="text-sm text-green-600 dark:text-green-400 mt-2">↑ 4.3%</p>
          </div>
        </div>

        {/* Revenue Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Revenue Trend
          </h2>
          <div className="h-64 flex items-center justify-center text-gray-400 dark:text-gray-600">
            Revenue chart will be rendered here using LineChart component
          </div>
        </div>

        {/* Product and Customer Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Top Products
            </h2>
            <div className="h-64 flex items-center justify-center text-gray-400 dark:text-gray-600">
              Product analytics will be rendered here using BarChart component
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Customer Distribution
            </h2>
            <div className="h-64 flex items-center justify-center text-gray-400 dark:text-gray-600">
              Customer distribution will be rendered here using PieChart component
            </div>
          </div>
        </div>

        {/* Recent Orders Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Recent Orders
          </h2>
          <div className="h-64 flex items-center justify-center text-gray-400 dark:text-gray-600">
            Recent orders will be rendered here using DataTable component
          </div>
        </div>
      </div>
    </div>
  );
}
