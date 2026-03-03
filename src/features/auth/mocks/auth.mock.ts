import { User } from "../auth.schema"
import { PERMISSIONS } from "@/constants/permissions"

/**
 * Mock users for authentication testing.
 * Note: password is included here for mock-login validation only.
 */
export const MOCK_USERS: (User & { password: string })[] = [
  {
    id: "user-001",
    name: "Admin User",
    email: "admin@shop.com",
    // Updated to use the roleIds array architecture
    roleIds: ["role-admin"], 
    // Fix: Instead of "*", we provide all values from the PERMISSIONS constant
    extraPermissions: Object.values(PERMISSIONS), 
    password: "password123",
    isActive: true,
  },
  {
    id: "user-002",
    name: "Manager User",
    email: "manager@shop.com",
    roleIds: ["role-manager"],
    extraPermissions: [], // Manager permissions usually come from the role itself
    password: "password123",
    isActive: true,
  }
]