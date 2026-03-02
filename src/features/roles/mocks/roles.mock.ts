import { Role } from "../role.schema";
import { PERMISSIONS } from "@/constants/permissions";

export const mockRoles: Role[] = [
  {
    id: "role-admin",
    name: "Super Admin",
    slug: "admin",
    description: "Full system access with all capabilities.",
    permissions: Object.values(PERMISSIONS), // All permissions assigned
    isSystem: true,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "role-manager",
    name: "Shop Manager",
    slug: "manager",
    description: "Can manage inventory, sales, and repairs but not system settings.",
    permissions: [
      PERMISSIONS.ITEMS_VIEW, PERMISSIONS.ITEMS_CREATE, PERMISSIONS.ITEMS_EDIT,
      PERMISSIONS.STOCK_VIEW, PERMISSIONS.STOCK_ADJUST,
      PERMISSIONS.REPAIR_VIEW_ALL, PERMISSIONS.REPAIR_ASSIGN_TECH, PERMISSIONS.REPAIR_STATUS_UPDATE,
      PERMISSIONS.POS_ACCESS, PERMISSIONS.SALES_CREATE, PERMISSIONS.SALES_VIEW_ALL,
      PERMISSIONS.CUSTOMERS_MANAGE, PERMISSIONS.KHATA_VIEW
    ],
    isSystem: false,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "role-technician",
    name: "Service Technician",
    slug: "technician",
    description: "Handles repair tasks and views assigned hardware jobs.",
    permissions: [
      PERMISSIONS.REPAIR_VIEW_ASSIGNED,
      PERMISSIONS.REPAIR_PERFORM,
      PERMISSIONS.REPAIR_STATUS_UPDATE,
      PERMISSIONS.REPAIR_SPARE_PARTS_USE,
      PERMISSIONS.ITEMS_VIEW,
      PERMISSIONS.STOCK_VIEW
    ],
    isSystem: false,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "role-frontdesk",
    name: "Front Desk / Sales",
    slug: "frontdesk",
    description: "Responsible for customer reception, POS, and repair entry.",
    permissions: [
      PERMISSIONS.POS_ACCESS,
      PERMISSIONS.SALES_CREATE,
      PERMISSIONS.REPAIR_CREATE,
      PERMISSIONS.REPAIR_VIEW_ALL,
      PERMISSIONS.CUSTOMERS_MANAGE
    ],
    isSystem: false,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];