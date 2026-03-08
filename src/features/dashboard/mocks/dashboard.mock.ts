import { DashboardStats, FrontdeskStats, RecentActivity, UrgentJob, RevenueChartData, StatusDistribution, InventoryReport, SalesReport, PurchaseReport } from "../dashboard.schema"
import { mockAcceptances } from "@/features/acceptances/mocks/acceptances.mock"
import { mockCustomers } from "@/features/customers/mocks/customers.mock"
import { mockItems } from "@/features/items/mocks/items.mock"
import { mockSales } from "@/features/sales/mocks/sales.mock"
import { mockPurchases } from "@/features/purchases/mocks/purchases.mock"
import { format, subDays, isSameDay, startOfMonth, isAfter } from "date-fns"

// Helper to calculate totals
const totalRevenue = mockAcceptances.reduce((sum, acc) => sum + (acc.priceOffered || acc.estimatedPrice || 0), 0)
const totalOrders = mockAcceptances.length
const totalCustomers = mockCustomers.length

// Helper for date comparisons
const today = new Date()
const yesterday = subDays(today, 1)
const startOfCurrentMonth = startOfMonth(today)

const todayAcceptances = mockAcceptances.filter(a => isSameDay(new Date(a.acceptanceDate), today))
const yesterdayAcceptances = mockAcceptances.filter(a => isSameDay(new Date(a.acceptanceDate), yesterday))

// Ready to Deliver: Jobs that are completed/ready but not yet delivered
const readyToDeliver = mockAcceptances.filter(a => a.currentStatus === "Completed" || a.currentStatus === "Ready")

const pendingJobs = mockAcceptances.filter(a => 
  !["Completed", "Delivered", "Cancelled"].includes(a.currentStatus)
)

// --- 1. Dashboard Overview Stats ---
export const mockDashboardStats: DashboardStats = {
  totalUsers: totalCustomers,
  activeSessions: 12, // Static as we don't have session mocks
  totalRevenue: totalRevenue,
  totalOrders: totalOrders,
  revenueChange: 12.5, // Mocked change
  usersChange: 5.2,    // Mocked change
  sessionsChange: 0,
  ordersChange: ((todayAcceptances.length - yesterdayAcceptances.length) / (yesterdayAcceptances.length || 1)) * 100,
}

// --- 2. Frontdesk Stats ---
export const mockFrontdeskStats: FrontdeskStats = {
  todayAcceptances: todayAcceptances.length,
  pendingJobs: pendingJobs.length,
  readyToDeliver: readyToDeliver.length,
  totalRevenue: todayAcceptances.reduce((sum, acc) => sum + (acc.priceOffered || 0), 0),
  acceptancesChange: todayAcceptances.length - yesterdayAcceptances.length,
  revenueChange: 8.5,
}

// --- 3. Recent Activities (Derived from Acceptances) ---
export const mockRecentActivities: RecentActivity[] = mockAcceptances
  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  .slice(0, 5)
  .map(acc => {
    const customer = mockCustomers.find(c => c.id === acc.customerId)
    return {
      id: acc.acceptanceNumber,
      customer: customer ? customer.name : "Unknown Customer",
      device: `${acc.brandId} ${acc.modelId}`, // In real app, these would be names resolved from IDs
      issue: acc.defectDescription.substring(0, 30) + "...",
      status: acc.currentStatus,
      time: format(new Date(acc.createdAt), "p"), // e.g., 2:30 PM
    }
  })

// --- 4. Urgent Jobs (Derived from Acceptances) ---
export const mockUrgentJobs: UrgentJob[] = mockAcceptances
  .filter(acc => acc.urgent)
  .slice(0, 5)
  .map(acc => {
    const customer = mockCustomers.find(c => c.id === acc.customerId)
    return {
      id: acc.acceptanceNumber,
      customer: customer ? customer.name : "Unknown",
      device: `${acc.brandId} ${acc.modelId}`,
      issue: acc.defectDescription,
      priority: "High",
      dueDate: acc.urgentDate ? format(new Date(acc.urgentDate), "dd MMM") : "ASAP",
    }
  })

// --- 5. Revenue Chart Data (Last 7 Days) ---
export const mockRevenueChartData: RevenueChartData[] = Array.from({ length: 7 }).map((_, i) => {
  const date = subDays(today, 6 - i)
  const dayAcceptances = mockAcceptances.filter(a => isSameDay(new Date(a.acceptanceDate), date))
  const dailyTotal = dayAcceptances.reduce((sum, acc) => sum + (acc.priceOffered || 0), 0)
  
  return {
    name: format(date, "EEE"), // Mon, Tue, Wed
    total: dailyTotal,
  }
})

// --- 6. Status Distribution ---
const statusCounts = mockAcceptances.reduce((acc, curr) => {
  acc[curr.currentStatus] = (acc[curr.currentStatus] || 0) + 1
  return acc
}, {} as Record<string, number>)

const statusColors: Record<string, string> = {
  "Pending": "#fbbf24", // yellow
  "In Progress": "#3b82f6", // blue
  "Completed": "#10b981", // green
  "Delivered": "#6366f1", // indigo
  "Cancelled": "#ef4444", // red
}

export const mockStatusDistribution: StatusDistribution[] = Object.entries(statusCounts).map(([status, count]) => ({
  name: status,
  value: count,
  fill: statusColors[status] || "#94a3b8",
}))

// --- 7. Inventory Report ---
export const mockInventoryReport: InventoryReport = {
  totalItems: mockItems.length,
  lowStockItems: mockItems.filter(i => i.initialStock <= (i.lowStockThreshold || 5)).length,
  totalValue: mockItems.reduce((sum, i) => sum + (i.initialStock * i.purchasePrice), 0),
}

// --- 8. Sales Report ---
const todaySales = mockSales.filter(s => isSameDay(new Date(s.createdAt), today))
const monthSales = mockSales.filter(s => isAfter(new Date(s.createdAt), startOfCurrentMonth))

export const mockSalesReport: SalesReport = {
  todayCount: todaySales.length,
  todayRevenue: todaySales.reduce((sum, s) => sum + s.grandTotal, 0),
  monthRevenue: monthSales.reduce((sum, s) => sum + s.grandTotal, 0),
}

// --- 9. Purchase Report ---
const monthPurchases = mockPurchases.filter(p => isAfter(new Date(p.purchaseDate), startOfCurrentMonth))

export const mockPurchaseReport: PurchaseReport = {
  pendingOrders: mockPurchases.filter(p => p.status === "Ordered" || p.status === "Pending").length,
  monthExpenses: monthPurchases.reduce((sum, p) => sum + p.totalAmount, 0),
}
