"use client"

import * as React from "react"
import {
  AudioWaveform,
  BarChart3,
  BookOpen,
  Bot,
  CheckCircle,
  Command,
  Frame,
  GalleryVerticalEnd,
  Home,
  Map,
  Package,
  PieChart,
  Search,
  Settings2,
  ShoppingCart,
  SquareTerminal,
  Truck,
  Users,
  Wrench,
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

// This is sample data.
export const data = {
  user: {
    name: "Admin User",
    email: "admin@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Admin Panel",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
  ],
  navMain: [
    {
      title: "Home",
      url: "/dashboard",
      icon: Home,
      isActive: true,
      items: [
        {
          title: "Frontdesk",
          url: "/dashboard/frontdesk",
        },
        {
          title: "Branch Products List",
          url: "/dashboard/branch-products",
        },
      ],
    },
    {
      title: "Acceptances",
      url: "/dashboard/acceptances",
      icon: CheckCircle,
      items: [
        {
          title: "Add New",
          url: "/dashboard/acceptances/add",
        },
        {
          title: "Search",
          url: "/dashboard/acceptances/search",
        },
        {
          title: "List",
          url: "/dashboard/acceptances/list",
        },
        {
          title: "Profit/Loss",
          url: "/dashboard/acceptances/profit-loss",
        },
        {
          title: "Deleted",
          url: "/dashboard/acceptances/deleted",
        },
        {
          title: "Generate Refund",
          url: "/dashboard/acceptances/refund",
        },
      ],
    },
    {
      title: "Search",
      url: "/dashboard/acceptances/search",
      icon: Search,
    },
    {
      title: "Sale/Order System",
      url: "/dashboard/sales",
      icon: ShoppingCart,
      items: [
        {
          title: "Add General Sale",
          url: "/dashboard/sales/add",
        },
        {
          title: "Back Office E-Commerce Sale",
          items: [
            {
              title: "Add E-Commerce Sale",
              url: "/dashboard/sales/ecommerce/add",
            },
            {
              title: "List",
              url: "/dashboard/sales/ecommerce/list",
            },
          ],
        },
        {
          title: "Order Spare Parts",
          items: [
            {
              title: "Submit Order Parts",
              url: "/dashboard/sales/parts/submit",
            },
            {
              title: "List of Order Parts",
              url: "/dashboard/sales/parts/list",
            },
          ],
        },
        {
          title: "Online Sale",
          items: [
            {
              title: "All Online Orders",
              url: "/dashboard/sales/online/all",
            },
            {
              title: "Pending Orders",
              url: "/dashboard/sales/online/pending",
            },
            {
              title: "Payment Received",
              url: "/dashboard/sales/online/payment-received",
            },
            {
              title: "Waiting to Deliver",
              url: "/dashboard/sales/online/waiting-deliver",
            },
            {
              title: "Completed Orders",
              url: "/dashboard/sales/online/completed",
            },
          ],
        },
      ],
    },
    {
      title: "Expenses",
      url: "/dashboard/expenses",
      icon: BarChart3,
      items: [
        {
          title: "Product Purchase",
          items: [
            {
              title: "Search",
              url: "/dashboard/expenses/purchase/search",
            },
            {
              title: "Add Product Purchase",
              url: "/dashboard/inventory/purchase",
            },
          ],
        },
        {
          title: "General Expenses",
          items: [
            {
              title: "Search",
              url: "/dashboard/expenses/general/search",
            },
            {
              title: "Add New",
              url: "/dashboard/expenses/general/add",
            },
          ],
        },
      ],
    },
    {
      title: "Options",
      url: "/dashboard/options",
      icon: Settings2,
      items: [
        {
          title: "Branches",
          items: [
            {
              title: "Search",
              url: "/dashboard/options/branches/search",
            },
            {
              title: "Add Branch",
              url: "/dashboard/options/branches/add",
            },
          ],
        },
        {
          title: "Managerial Tasks",
          items: [
            {
              title: "Transactions",
              url: "/dashboard/options/tasks/transactions",
            },
            {
              title: "Khata Online",
              url: "/dashboard/reports/khata",
            },
            {
              title: "DDT Viewer",
              url: "/dashboard/options/tasks/ddt-viewer",
            },
            {
              title: "DDT Generator",
              url: "/dashboard/options/tasks/ddt-generator",
            },
            {
              title: "Attendances",
              url: "/dashboard/options/tasks/attendances",
            },
            {
              title: "Employee Performance",
              url: "/dashboard/options/tasks/performance",
            },
            {
              title: "Final Accounts",
              url: "/dashboard/options/tasks/final-accounts",
            },
            {
              title: "Current Balance",
              url: "/dashboard/reports/balance",
            },
          ],
        },
      ],
    },
    {
      title: "System",
      url: "/dashboard/system",
      icon: Users,
      items: [
        {
          title: "User Management",
          url: "/dashboard/system/users",
        },
        {
          title: "Add User",
          url: "/dashboard/system/users/add",
        },
        {
          title: "Customers",
          url: "/dashboard/system/customers",
        },
        {
          title: "Add Customer",
          url: "/dashboard/system/customers/add",
        },
        {
          title: "Suppliers",
          url: "/dashboard/system/suppliers",
        },
        {
          title: "Add Supplier",
          url: "/dashboard/system/suppliers/add",
        },
        {
          title: "Box Numbers",
          url: "/dashboard/system/box-numbers",
        },
      ],
    },
    {
      title: "Tracking Device",
      url: "/dashboard/tracking",
      icon: Map,
      items: [
        {
          title: "List",
          url: "/dashboard/tracking/list",
        },
        {
          title: "Add Tracking Device",
          url: "/dashboard/tracking/add",
        },
        {
          title: "Regenerate",
          url: "/dashboard/tracking/regenerate",
        },
      ],
    },
    {
      title: "E-Commerce Dashboard",
      url: "/dashboard/ecommerce",
      icon: Package,
      items: [
        {
          title: "Products",
          url: "/dashboard/ecommerce/products",
        },
        {
          title: "Add Product",
          url: "/dashboard/ecommerce/products/add",
        },
        {
          title: "Categories",
          url: "/dashboard/ecommerce/categories",
        },
        {
          title: "Add Category",
          url: "/dashboard/ecommerce/categories/add",
        },
        {
          title: "Brands",
          url: "/dashboard/ecommerce/brands",
        },
        {
          title: "Add Brand",
          url: "/dashboard/ecommerce/brands/add",
        },
        {
          title: "Models",
          url: "/dashboard/ecommerce/models",
        },
        {
          title: "Add Model",
          url: "/dashboard/ecommerce/models/add",
        },
        {
          title: "Home Stock List",
          url: "/dashboard/ecommerce/stock",
        },
      ],
    },
  ],
  projects: [
    {
      name: "Analytics",
      url: "#",
      icon: Frame,
    },
    {
      name: "Reports",
      url: "#",
      icon: PieChart,
    },
    {
      name: "Logs",
      url: "#",
      icon: Map,
    },
  ],
}

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