import { useQuery } from "@tanstack/react-query"
import axios from "axios"
import { DashboardStats, FrontdeskStats, RecentActivity, UrgentJob, RevenueChartData, StatusDistribution, InventoryReport, SalesReport, PurchaseReport } from "./dashboard.schema"
import { DASHBOARD_QUERY_KEYS } from "./dashboard.constants"

export const useDashboardStats = () => {
  return useQuery({
    queryKey: DASHBOARD_QUERY_KEYS.stats,
    queryFn: async () => {
      const { data } = await axios.get<DashboardStats>("/api/dashboard/stats")
      return data
    },
  })
}

export const useInventoryReport = () => {
  return useQuery({
    queryKey: ["dashboard", "inventory-report"],
    queryFn: async () => {
      const { data } = await axios.get<InventoryReport>("/api/dashboard/reports/inventory")
      return data
    },
  })
}

export const useSalesReport = () => {
  return useQuery({
    queryKey: ["dashboard", "sales-report"],
    queryFn: async () => {
      const { data } = await axios.get<SalesReport>("/api/dashboard/reports/sales")
      return data
    },
  })
}

export const usePurchaseReport = () => {
  return useQuery({
    queryKey: ["dashboard", "purchase-report"],
    queryFn: async () => {
      const { data } = await axios.get<PurchaseReport>("/api/dashboard/reports/purchase")
      return data
    },
  })
}

export const useRevenueChart = () => {
  return useQuery({
    queryKey: ["dashboard", "revenue-chart"],
    queryFn: async () => {
      const { data } = await axios.get<RevenueChartData>("/api/dashboard/charts/revenue")
      return data
    },
  })
}

export const useStatusDistribution = () => {
  return useQuery({
    queryKey: ["dashboard", "status-distribution"],
    queryFn: async () => {
      const { data } = await axios.get<StatusDistribution>("/api/dashboard/charts/status")
      return data
    },
  })
}

export const useFrontdeskStats = () => {
  return useQuery({
    queryKey: DASHBOARD_QUERY_KEYS.frontdesk,
    queryFn: async () => {
      const { data } = await axios.get<FrontdeskStats>("/api/dashboard/frontdesk/stats")
      return data
    },
  })
}

export const useRecentActivities = () => {
  return useQuery({
    queryKey: DASHBOARD_QUERY_KEYS.recentActivities,
    queryFn: async () => {
      const { data } = await axios.get<RecentActivity[]>("/api/dashboard/frontdesk/recent")
      return data
    },
  })
}

export const useUrgentJobs = () => {
  return useQuery({
    queryKey: DASHBOARD_QUERY_KEYS.urgentJobs,
    queryFn: async () => {
      const { data } = await axios.get<UrgentJob[]>("/api/dashboard/frontdesk/urgent")
      return data
    },
  })
}
