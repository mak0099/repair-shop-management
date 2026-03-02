import { User } from "../auth.schema"

export const MOCK_USERS: (User & { password: string })[] = [
  {
    id: "user-001",
    name: "Admin User",
    email: "admin@shop.com",
    role: "ADMIN",
    permissions: ["*"],
    password: "password123"
  },
  {
    id: "user-002",
    name: "Manager User",
    email: "manager@shop.com",
    role: "MANAGER",
    permissions: ["products:read", "products:write"],
    password: "password123"
  }
]