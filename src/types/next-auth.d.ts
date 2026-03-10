import { DefaultSession } from "next-auth"
import { PermissionType } from "@/constants/permissions"

declare module "next-auth" {
  interface User {
    id: string
    roleIds: string[]
    extraPermissions: PermissionType[]
    isActive: boolean
  }

  interface Session {
    user: {
      id: string
      roleIds: string[]
      extraPermissions: PermissionType[]
    } & DefaultSession["user"]
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    sub: string
    roleIds: string[]
    extraPermissions: PermissionType[]
  }
}