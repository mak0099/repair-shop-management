import { DefaultSession, DefaultUser } from "next-auth"
import { PermissionType } from "@/constants/permissions"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: string
      permissions: PermissionType[]
    } & DefaultSession["user"]
  }

  interface User extends DefaultUser {
    role: string
    permissions: PermissionType[]
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: string
    permissions: PermissionType[]
  }
}