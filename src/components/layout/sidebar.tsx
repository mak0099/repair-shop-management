"use client";

import * as React from "react";
import {
  BarChart3,
  CheckCircle,
  FileText,
  Home,
  LayoutTemplate,
  Package,
  Settings2,
  ShoppingCart,
  Users,
} from "lucide-react";

import { NavMain } from "@/components/layout/nav-main";
import { NavUser } from "@/components/layout/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { useLayout } from "@/components/layout/layout-context";
import { BrandLogo } from "@/components/layout/brand-logo";
import {
  SHOP_PROFILE_BASE_HREF,
  DASHBOARD_BASE_HREF,
  DASHBOARD_FRONTDESK_HREF,
  ACCEPTANCES_BASE_HREF,
  ACCEPTANCES_ADD_HREF,
  ACCEPTANCES_LIST_HREF,
  INVENTORY_BASE_HREF,
  INVENTORY_STOCK_HREF,
  INVENTORY_PRODUCTS_HREF,
  INVENTORY_ATTRIBUTES_HREF,
  INVENTORY_STOCK_ADJUSTMENT_HREF,
  INVENTORY_BARCODE_HREF,
  INVENTORY_CATEGORIES_HREF,
  INVENTORY_BRANDS_HREF,
  INVENTORY_MODELS_HREF,
  INVENTORY_BOX_NUMBERS_HREF,
  SALES_BASE_HREF,
  SALES_POS_HREF,
  SALES_LIST_HREF,
  SALES_QUOTATIONS_HREF,
  SALES_RETURNS_HREF,
  SALES_REGISTER_HREF,
  FINANCE_BASE_HREF,
  FINANCE_PURCHASE_HREF,
  FINANCE_EXPENSES_HREF,
  FINANCE_KHATA_HREF,
  REPORTS_BASE_HREF,
  REPORTS_PROFIT_LOSS_HREF,
  REPORTS_SALE_HREF,
  REPORTS_EXPENSE_HREF,
  REPORTS_BALANCE_HREF,
  CRM_BASE_HREF,
  CRM_CUSTOMERS_HREF,
  CRM_SUPPLIERS_HREF,
  ADMIN_BASE_HREF,
  ADMIN_INVOICE_SETUP_HREF,
  ADMIN_SETTINGS_HREF,
  ADMIN_USERS_HREF,
  ADMIN_ROLES_HREF,
} from "@/config/paths";

export const data = {
  user: {
    name: "Admin User",
    email: "admin@example.com",
    avatar: "/avatars/user.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: DASHBOARD_BASE_HREF,
      icon: Home,
      isActive: true,
      items: [
        { title: "Frontdesk View", url: DASHBOARD_FRONTDESK_HREF },
        { title: "Overview", url: DASHBOARD_BASE_HREF },
      ],
    },
    {
      title: "Repairs (Acceptance)",
      url: ACCEPTANCES_BASE_HREF,
      icon: CheckCircle,
      items: [
        { title: "New Acceptance", url: ACCEPTANCES_ADD_HREF },
        { title: "Acceptance List", url: ACCEPTANCES_LIST_HREF },
        // { title: "Recycle Bin", url: "/dashboard/acceptances/deleted" },
      ],
    },
    {
      title: "Inventory & Stock",
      url: INVENTORY_BASE_HREF,
      icon: Package,
      items: [
        { title: "Current Stock", url: INVENTORY_STOCK_HREF },
        { title: "Products & Items", url: INVENTORY_PRODUCTS_HREF },
        { title: "Product Attributes", url: INVENTORY_ATTRIBUTES_HREF },
        { title: "Stock Adjustment", url: INVENTORY_STOCK_ADJUSTMENT_HREF },
        { title: "Print Labels/Barcodes", url: INVENTORY_BARCODE_HREF },
        // { title: "Used Devices (Tracking)", url: "/dashboard/inventory/tracking" },
        { title: "Categories", url: INVENTORY_CATEGORIES_HREF },
        { title: "Brands", url: INVENTORY_BRANDS_HREF },
        { title: "Models", url: INVENTORY_MODELS_HREF },
        { title: "Box Locations", url: INVENTORY_BOX_NUMBERS_HREF },
      ],
    },
    {
      title: "Sales & POS",
      url: SALES_BASE_HREF,
      icon: ShoppingCart,
      items: [
        { title: "POS Terminal", url: SALES_POS_HREF },
        { title: "All Sales", url: SALES_LIST_HREF },
        { title: "Quotations", url: SALES_QUOTATIONS_HREF },
        { title: "Returns", url: SALES_RETURNS_HREF },
        { title: "Register Log", url: SALES_REGISTER_HREF },
      ],
    },
    {
      title: "Purchases & Expenses",
      url: FINANCE_BASE_HREF,
      icon: BarChart3,
      items: [
        { title: "Product Purchases", url: FINANCE_PURCHASE_HREF },
        { title: "General Expenses", url: FINANCE_EXPENSES_HREF },
        { title: "Daily Khata", url: FINANCE_KHATA_HREF },
      ],
    },
    {
      title: "Business Reports",
      url: REPORTS_BASE_HREF,
      icon: FileText,
      items: [
        { title: "Profit/Loss Report", url: REPORTS_PROFIT_LOSS_HREF },
        { title: "Sale Report", url: REPORTS_SALE_HREF },
        { title: "Expense Report", url: REPORTS_EXPENSE_HREF },
        { title: "Cash Balance", url: REPORTS_BALANCE_HREF },
      ],
    },
    {
      title: "People (CRM)",
      url: CRM_BASE_HREF,
      icon: Users,
      items: [
        { title: "Customers", url: CRM_CUSTOMERS_HREF },
        { title: "Suppliers", url: CRM_SUPPLIERS_HREF },
      ],
    },
    {
      title: "Administration",
      url: ADMIN_BASE_HREF,
      icon: Settings2,
      items: [
        { title: "Shop Profile", url: SHOP_PROFILE_BASE_HREF },
        { title: "Invoice Setup", url: ADMIN_INVOICE_SETUP_HREF },
        { title: "Business Settings", url: ADMIN_SETTINGS_HREF },
        { title: "Users", url: ADMIN_USERS_HREF },
        { title: "Roles", url: ADMIN_ROLES_HREF },
      ],
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { toggleLayout } = useLayout();

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a
                href={SHOP_PROFILE_BASE_HREF}
                className="group-data-[collapsible=icon]:!p-0 group-data-[collapsible=icon]:justify-center [&>div:last-child]:group-data-[collapsible=icon]:hidden"
              >
                <BrandLogo />
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={toggleLayout} tooltip="Switch Layout">
              <LayoutTemplate className="size-4" />
              <span>Switch Layout</span>
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
  );
}
