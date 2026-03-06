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
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar"

export const data = {
  user: {
    name: "Admin User",
    email: "admin@example.com",
    avatar: "/avatars/user.jpg",
  },
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
        // { title: "Recycle Bin", url: "/dashboard/acceptances/deleted" },
      ],
    },
    {
      title: "Inventory & Stock",
      url: "/dashboard/inventory",
      icon: Package,
      items: [
        { title: "Current Stock", url: "/dashboard/inventory/stock" },
        { title: "Products & Items", url: "/dashboard/inventory/products" },
        { title: "Product Attributes", url: "/dashboard/inventory/attributes" },
        { title: "Stock Adjustment", url: "/dashboard/inventory/stock-adjustment" },
        { title: "Print Labels/Barcodes", url: "/dashboard/inventory/barcode" },
        // { title: "Used Devices (Tracking)", url: "/dashboard/inventory/tracking" },
        { title: "Categories", url: "/dashboard/inventory/categories" },
        { title: "Brands", url: "/dashboard/inventory/brands" },
        { title: "Models", url: "/dashboard/inventory/models" },
        { title: "Box Locations", url: "/dashboard/inventory/box-numbers" },
      ],
    },
    {
      title: "Sales & POS",
      url: "/dashboard/sales",
      icon: ShoppingCart,
      items: [
        {
          title: "POS Terminal",
          url: "/dashboard/sales/pos"
        },
        {
          title: "All Sales",
          url: "/dashboard/sales"
        },
        {
          title: "Quotations",
          url: "/dashboard/sales/quotations"
        },
        {
          title: "Returns",
          url: "/dashboard/sales/returns"
        },
        {
          title: "Register Log",
          url: "/dashboard/sales/register"
        },
      ],
    },
    {
      title: "Purchases & Expenses",
      url: "/dashboard/finance",
      icon: BarChart3,
      items: [
        { title: "Product Purchases", url: "/dashboard/finance/purchase" },
        { title: "General Expenses", url: "/dashboard/finance/expenses" },
        { title: "Daily Khata", url: "/dashboard/finance/khata" },
      ],
    },
    {
      title: "Business Reports",
      url: "/dashboard/reports",
      icon: FileText,
      items: [
        { title: "Profit/Loss Report", url: "/dashboard/reports/profit-loss" },
        { title: "Sale Report", url: "/dashboard/reports/sale-report" },
        { title: "Expense Report", url: "/dashboard/reports/expense-report" },
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
        { title: "Invoice Setup", url: "/dashboard/admin/invoice-setup" },
        { title: "Business Settings", url: "/dashboard/admin/master-settings" },
        { title: "Users", url: "/dashboard/admin/users" },
        { title: "Roles", url: "/dashboard/admin/roles" },
      ],
    },
  ],
  // projects: [
  //   { name: "Activity Logs", url: "/dashboard/logs", icon: History },
  // ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <GalleryVerticalEnd className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">TELEFIX</span>
                  <span className="truncate text-xs">Professional Edition</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        {/* <NavProjects projects={data.projects} /> */}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}