"use client"

import * as React from "react"
import {
  BarChart3,
  CheckCircle,
  FileText,
  GalleryVerticalEnd,
  Home,
  Package,
  Settings2,
  ShoppingCart,
  Users,
  History,
} from "lucide-react"

import { NavMain } from "@/components/layout/nav-main"
import { NavProjects } from "@/components/layout/nav-projects"
import { NavUser } from "@/components/layout/nav-user"
import { TeamSwitcher } from "@/components/layout/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

export const data = {
  user: {
    name: "Admin User",
    email: "admin@example.com",
    avatar: "/avatars/user.jpg",
  },
  teams: [
    {
      name: "TELEFIX",
      logo: GalleryVerticalEnd,
      plan: "Professional Edition",
    },
  ],
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: Home,
      isActive: true,
      items: [
        { title: "Frontdesk View", url: "/dashboard/frontdesk" },
        { title: "Quick Statistics", url: "/dashboard" },
      ],
    },
    {
      title: "Repairs (Acceptance)",
      url: "/dashboard/acceptances",
      icon: CheckCircle,
      items: [
        { title: "New Acceptance", url: "/dashboard/acceptances/add" },
        { title: "Acceptance List", url: "/dashboard/acceptances" }, 
        { title: "Recycle Bin", url: "/dashboard/acceptances/deleted" },
      ],
    },
    {
      title: "Inventory & Stock",
      url: "/dashboard/inventory",
      icon: Package,
      items: [
        { title: "Current Stock", url: "/dashboard/inventory/stock" },
        { title: "Products & Items", url: "/dashboard/inventory/products" },
        { title: "Used Devices (Tracking)", url: "/dashboard/inventory/tracking" }, // Added back
        { title: "Categories", url: "/dashboard/inventory/categories" },
        { title: "Brands", url: "/dashboard/inventory/brands" },
        { title: "Models", url: "/dashboard/inventory/models" },
        { title: "Box Locations", url: "/dashboard/inventory/box-numbers" },
      ],
    },
    {
      title: "Sales (POS)",
      url: "/dashboard/sales",
      icon: ShoppingCart,
      items: [
        { title: "New POS Sale", url: "/dashboard/sales/add" },
        { title: "Sales History", url: "/dashboard/sales" },
        { title: "Spare Parts Orders", url: "/dashboard/sales/parts" },
      ],
    },
    {
      title: "Finance & Accounts",
      url: "/dashboard/finance",
      icon: BarChart3,
      items: [
        { title: "Product Purchases", url: "/dashboard/finance/purchase" },
        { title: "General Expenses", url: "/dashboard/finance/expenses" },
        { title: "Daily Khata (Entry)", url: "/dashboard/finance/khata" },
      ],
    },
    {
      title: "Business Reports",
      url: "/dashboard/reports",
      icon: FileText,
      items: [
        { title: "Profit/Loss Report", url: "/dashboard/reports/profit-loss" },
        { title: "Sales Analytics", url: "/dashboard/reports/sales" },
        { title: "Expense Summary", url: "/dashboard/reports/expenses" },
        { title: "Cash Balance", url: "/dashboard/reports/balance" },
      ],
    },
    {
      title: "People (CRM)",
      url: "/dashboard/crm",
      icon: Users,
      items: [
        { title: "Customers", url: "/dashboard/crm/customers" },
        { title: "Suppliers", url: "/dashboard/crm/suppliers" },
      ],
    },
    {
      title: "Administration",
      url: "/dashboard/admin",
      icon: Settings2,
      items: [
        { title: "Shop Profile", url: "/dashboard/admin/shop-profile" }, 
        { title: "Master Settings", url: "/dashboard/admin/master-settings" },
        { title: "Users Management", url: "/dashboard/admin/users" },
        { title: "Roles & Permissions", url: "/dashboard/admin/permissions" },
      ],
    },
  ],
  projects: [
    { name: "Activity Logs", url: "/dashboard/logs", icon: History },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}