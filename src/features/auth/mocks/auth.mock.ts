import { User } from "../auth-context"

export const MOCK_USERS: (User & { password: string })[] = [
  {
    id: "1",
    name: "Admin User",
    email: "admin@shop.com",
    role: "ADMIN",
    permissions: ["*"],
    password: "password123"
  },
  {
    id: "2",
    name: "Manager User",
    email: "manager@shop.com",
    role: "MANAGER",
    permissions: ["products:read", "products:write"],
    password: "password123"
  }
]