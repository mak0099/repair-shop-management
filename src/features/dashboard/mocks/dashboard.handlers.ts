import { http, HttpResponse } from "msw"
import { mockDashboardStats, mockFrontdeskStats, mockRecentActivities, mockUrgentJobs, mockRevenueChartData, mockStatusDistribution, mockInventoryReport, mockSalesReport, mockPurchaseReport } from "./dashboard.mock"

export const dashboardHandlers = [
  http.get("/api/dashboard/stats", () => {
    return HttpResponse.json(mockDashboardStats)
  }),
  http.get("/api/dashboard/frontdesk/stats", () => {
    return HttpResponse.json(mockFrontdeskStats)
  }),
  http.get("/api/dashboard/frontdesk/recent", () => {
    return HttpResponse.json(mockRecentActivities)
  }),
  http.get("/api/dashboard/frontdesk/urgent", () => {
    return HttpResponse.json(mockUrgentJobs)
  }),
  http.get("/api/dashboard/charts/revenue", () => {
    return HttpResponse.json(mockRevenueChartData)
  }),
  http.get("/api/dashboard/charts/status", () => {
    return HttpResponse.json(mockStatusDistribution)
  }),
  http.get("/api/dashboard/reports/inventory", () => {
    return HttpResponse.json(mockInventoryReport)
  }),
  http.get("/api/dashboard/reports/sales", () => {
    return HttpResponse.json(mockSalesReport)
  }),
  http.get("/api/dashboard/reports/purchase", () => {
    return HttpResponse.json(mockPurchaseReport)
  }),
]
