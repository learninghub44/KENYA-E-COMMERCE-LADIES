import { describe, it } from 'node:test';
import assert from 'node:assert';
import { 
  dashboardRequestSchema,
  revenueAnalyticsRequestSchema,
  productAnalyticsRequestSchema,
  customerAnalyticsRequestSchema,
  exportRequestSchema,
  dateRangeSchema,
  customDateRangeSchema,
  timeGroupingSchema,
} from './analytics-service';

// ============================================================================
// SCHEMA VALIDATION TESTS
// ============================================================================

describe('Analytics Service Schemas', () => {
  describe('dateRangeSchema', () => {
    it('should validate valid date ranges', () => {
      const validRanges = ['today', 'yesterday', 'last_7_days', 'last_30_days', 'last_90_days', 'last_year', 'custom'];
      
      for (const range of validRanges) {
        const result = dateRangeSchema.safeParse(range);
        assert.strictEqual(result.success, true, `Should validate ${range}`);
      }
    });

    it('should reject invalid date ranges', () => {
      const result = dateRangeSchema.safeParse('invalid_range');
      assert.strictEqual(result.success, false);
    });
  });

  describe('customDateRangeSchema', () => {
    it('should validate valid custom date range', () => {
      const result = customDateRangeSchema.safeParse({
        startDate: '2024-01-01',
        endDate: '2024-01-31',
      });
      assert.strictEqual(result.success, true);
    });

    it('should reject invalid date format', () => {
      const result = customDateRangeSchema.safeParse({
        startDate: '01/01/2024',
        endDate: '01/31/2024',
      });
      assert.strictEqual(result.success, false);
    });

    it('should reject missing startDate', () => {
      const result = customDateRangeSchema.safeParse({
        endDate: '2024-01-31',
      });
      assert.strictEqual(result.success, false);
    });

    it('should reject missing endDate', () => {
      const result = customDateRangeSchema.safeParse({
        startDate: '2024-01-01',
      });
      assert.strictEqual(result.success, false);
    });
  });

  describe('timeGroupingSchema', () => {
    it('should validate valid time groupings', () => {
      const validGroupings = ['hour', 'day', 'week', 'month', 'year'];
      
      for (const grouping of validGroupings) {
        const result = timeGroupingSchema.safeParse(grouping);
        assert.strictEqual(result.success, true, `Should validate ${grouping}`);
      }
    });

    it('should reject invalid time grouping', () => {
      const result = timeGroupingSchema.safeParse('invalid');
      assert.strictEqual(result.success, false);
    });
  });

  describe('dashboardRequestSchema', () => {
    it('should validate valid dashboard request', () => {
      const result = dashboardRequestSchema.safeParse({
        sellerId: '123e4567-e89b-12d3-a456-426614174000',
        dateRange: 'last_30_days',
      });
      assert.strictEqual(result.success, true);
    });

    it('should use default dateRange when not provided', () => {
      const result = dashboardRequestSchema.safeParse({
        sellerId: '123e4567-e89b-12d3-a456-426614174000',
      });
      assert.strictEqual(result.success, true);
      if (result.success) {
        assert.strictEqual(result.data.dateRange, 'last_30_days');
      }
    });

    it('should validate with custom date range', () => {
      const result = dashboardRequestSchema.safeParse({
        sellerId: '123e4567-e89b-12d3-a456-426614174000',
        dateRange: 'custom',
        customDateRange: {
          startDate: '2024-01-01',
          endDate: '2024-01-31',
        },
      });
      assert.strictEqual(result.success, true);
    });

    it('should reject invalid sellerId', () => {
      const result = dashboardRequestSchema.safeParse({
        sellerId: 'not-a-uuid',
        dateRange: 'last_30_days',
      });
      assert.strictEqual(result.success, false);
    });
  });

  describe('revenueAnalyticsRequestSchema', () => {
    it('should validate valid revenue analytics request', () => {
      const result = revenueAnalyticsRequestSchema.safeParse({
        sellerId: '123e4567-e89b-12d3-a456-426614174000',
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        groupBy: 'day',
      });
      assert.strictEqual(result.success, true);
    });

    it('should use default groupBy when not provided', () => {
      const result = revenueAnalyticsRequestSchema.safeParse({
        sellerId: '123e4567-e89b-12d3-a456-426614174000',
        startDate: '2024-01-01',
        endDate: '2024-01-31',
      });
      assert.strictEqual(result.success, true);
      if (result.success) {
        assert.strictEqual(result.data.groupBy, 'day');
      }
    });

    it('should reject missing dates', () => {
      const result = revenueAnalyticsRequestSchema.safeParse({
        sellerId: '123e4567-e89b-12d3-a456-426614174000',
      });
      assert.strictEqual(result.success, false);
    });
  });

  describe('productAnalyticsRequestSchema', () => {
    it('should validate valid product analytics request', () => {
      const result = productAnalyticsRequestSchema.safeParse({
        sellerId: '123e4567-e89b-12d3-a456-426614174000',
        limit: 50,
      });
      assert.strictEqual(result.success, true);
    });

    it('should use default limit when not provided', () => {
      const result = productAnalyticsRequestSchema.safeParse({
        sellerId: '123e4567-e89b-12d3-a456-426614174000',
      });
      assert.strictEqual(result.success, true);
      if (result.success) {
        assert.strictEqual(result.data.limit, 50);
      }
    });

    it('should reject limit below minimum', () => {
      const result = productAnalyticsRequestSchema.safeParse({
        sellerId: '123e4567-e89b-12d3-a456-426614174000',
        limit: 0,
      });
      assert.strictEqual(result.success, false);
    });

    it('should reject limit above maximum', () => {
      const result = productAnalyticsRequestSchema.safeParse({
        sellerId: '123e4567-e89b-12d3-a456-426614174000',
        limit: 101,
      });
      assert.strictEqual(result.success, false);
    });
  });

  describe('customerAnalyticsRequestSchema', () => {
    it('should validate valid customer analytics request', () => {
      const result = customerAnalyticsRequestSchema.safeParse({
        sellerId: '123e4567-e89b-12d3-a456-426614174000',
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        limit: 50,
      });
      assert.strictEqual(result.success, true);
    });

    it('should use default limit when not provided', () => {
      const result = customerAnalyticsRequestSchema.safeParse({
        sellerId: '123e4567-e89b-12d3-a456-426614174000',
        startDate: '2024-01-01',
        endDate: '2024-01-31',
      });
      assert.strictEqual(result.success, true);
      if (result.success) {
        assert.strictEqual(result.data.limit, 50);
      }
    });
  });

  describe('exportRequestSchema', () => {
    it('should validate valid export request', () => {
      const result = exportRequestSchema.safeParse({
        sellerId: '123e4567-e89b-12d3-a456-426614174000',
        reportType: 'sales',
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        format: 'csv',
      });
      assert.strictEqual(result.success, true);
    });

    it('should use default format when not provided', () => {
      const result = exportRequestSchema.safeParse({
        sellerId: '123e4567-e89b-12d3-a456-426614174000',
        reportType: 'sales',
        startDate: '2024-01-01',
        endDate: '2024-01-31',
      });
      assert.strictEqual(result.success, true);
      if (result.success) {
        assert.strictEqual(result.data.format, 'csv');
      }
    });

    it('should validate all report types', () => {
      const reportTypes = ['sales', 'revenue', 'inventory', 'orders', 'reviews', 'customers'];
      
      for (const reportType of reportTypes) {
        const result = exportRequestSchema.safeParse({
          sellerId: '123e4567-e89b-12d3-a456-426614174000',
          reportType,
          startDate: '2024-01-01',
          endDate: '2024-01-31',
        });
        assert.strictEqual(result.success, true, `Should validate ${reportType}`);
      }
    });

    it('should validate all formats', () => {
      const formats = ['csv', 'xlsx', 'pdf'];
      
      for (const format of formats) {
        const result = exportRequestSchema.safeParse({
          sellerId: '123e4567-e89b-12d3-a456-426614174000',
          reportType: 'sales',
          startDate: '2024-01-01',
          endDate: '2024-01-31',
          format,
        });
        assert.strictEqual(result.success, true, `Should validate ${format}`);
      }
    });
  });
});
