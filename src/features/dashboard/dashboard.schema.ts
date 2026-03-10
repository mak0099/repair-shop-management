import { z } from "zod"

export const dashboardStatsSchema = z.object({
  totalUsers: z.number(),
  activeSessions: z.number(),
  totalRevenue: z.number(),
  totalOrders: z.number(),
  revenueChange: z.number(),
  usersChange: z.number(),
  sessionsChange: z.number(),
  ordersChange: z.number(),
})

export const revenueChartDataSchema = z.array(z.object({
  name: z.string(),
  total: z.number(),
}))

export const statusDistributionSchema = z.array(z.object({
  name: z.string(),
  value: z.number(),
  fill: z.string(),
}))

export const inventoryReportSchema = z.object({
  totalItems: z.number(),
  lowStockItems: z.number(),
  totalValue: z.number(),
})

export const salesReportSchema = z.object({
  todayCount: z.number(),
  todayRevenue: z.number(),
  monthRevenue: z.number(),
})

export const purchaseReportSchema = z.object({
  pendingOrders: z.number(),
  monthExpenses: z.number(),
})

export type DashboardStats = z.infer<typeof dashboardStatsSchema>
export type RevenueChartData = z.infer<typeof revenueChartDataSchema>
export type StatusDistribution = z.infer<typeof statusDistributionSchema>
export type InventoryReport = z.infer<typeof inventoryReportSchema>
export type SalesReport = z.infer<typeof salesReportSchema>
export type PurchaseReport = z.infer<typeof purchaseReportSchema>

export const frontdeskStatsSchema = z.object({
  todayAcceptances: z.number(),
  pendingJobs: z.number(),
  readyToDeliver: z.number(),
  totalRevenue: z.number(),
  acceptancesChange: z.number(),
  revenueChange: z.number(),
})

export type FrontdeskStats = z.infer<typeof frontdeskStatsSchema>

export const recentActivitySchema = z.object({
  id: z.string(),
  customer: z.string(),
  device: z.string(),
  issue: z.string(),
  status: z.string(),
  time: z.string(),
})

export type RecentActivity = z.infer<typeof recentActivitySchema>

export const urgentJobSchema = z.object({
  id: z.string(),
  customer: z.string(),
  device: z.string(),
  issue: z.string(),
  priority: z.string(),
  dueDate: z.string(),
})

export type UrgentJob = z.infer<typeof urgentJobSchema>
