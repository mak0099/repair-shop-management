import { delay, http, HttpResponse } from "msw"
import { applySort } from "@/mocks/mock-utils"
import { User, UserFormValues } from "../user.schema"
import { mockUsers } from "./users.mock"
import { mockRoles } from "@/features/roles/mocks/roles.mock"
import { PermissionType } from "@/constants/permissions"

let users = [...mockUsers]

export const userHandlers = [
  /**
   * GET all users with filtering, sorting and pagination
   */
  http.get("*/users", async ({ request }) => {
    await delay(500)
    const url = new URL(request.url)
    const page = Number(url.searchParams.get("page") || "1")
    const pageSize = Number(url.searchParams.get("pageSize") || "10")
    const search = url.searchParams.get("search")?.toLowerCase() || ""
    const status = url.searchParams.get("isActive")
    const roleId = url.searchParams.get("roleId")
    const hasPermission = url.searchParams.get("hasPermission")

    const filteredData = users.filter((user) => {
      const searchMatch =
        user.name.toLowerCase().includes(search) ||
        user.email.toLowerCase().includes(search)
      
      const statusMatch = !status || status === "all" || (user.isActive ? "true" : "false") === status
      
      const roleMatch = !roleId || roleId === "all" || user.roleIds.includes(roleId)
      
      const permissionMatch = !hasPermission || 
        user.extraPermissions.includes(hasPermission as PermissionType) ||
        (hasPermission === "repair.perform" && user.roleIds.includes("role-technician"))

      return searchMatch && statusMatch && roleMatch && permissionMatch
    })

    const sort = url.searchParams.get("_sort")
    const order = url.searchParams.get("_order")
    const sortedData = applySort(filteredData, sort, order)

    const total = sortedData.length
    const paginatedData = sortedData.slice((page - 1) * pageSize, page * pageSize)

    const enrichedData = paginatedData.map(user => ({
      ...user,
      roles: user.roleIds.map(id => mockRoles.find(r => r.id === id)).filter(Boolean)
    }))

    return HttpResponse.json({
      data: enrichedData,
      meta: { total, page, pageSize, totalPages: Math.ceil(total / pageSize) },
    })
  }),

    // GET user options
    http.get("*/users/options", async ({ request }) => {
      await delay(200)
      const url = new URL(request.url)
      const search = url.searchParams.get("search")?.toLowerCase() || ""
  
      const filtered = users.filter(
        (u) => u.isActive && (u.name.toLowerCase().includes(search))
      )
  
      const options = filtered.map((u) => ({
        id: u.id,
        name: u.name,
      }))
  
      return HttpResponse.json(options)
    }),

  /**
   * POST a new user
   */
  http.post("*/users", async ({ request }) => {
    await delay(800)
    const data = (await request.json()) as UserFormValues
    const { extraPermissions, ...rest } = data;

    const newUser: User = {
      id: `user-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...rest,
      isActive: rest.isActive ?? true,
      extraPermissions: (extraPermissions || []) as PermissionType[],
    }
    
    users.unshift(newUser)
    return HttpResponse.json(newUser, { status: 201 })
  }),

  /**
   * PATCH/Update an existing user
   */
  http.patch("*/users/:id", async ({ params, request }) => {
    await delay(800)
    const { id } = params
    const updates = (await request.json()) as Partial<UserFormValues>

    let updatedUser: User | undefined
    users = users.map((user) => {
      if (user.id === id) {
        const { extraPermissions, ...rest } = updates;
        
        updatedUser = { 
          ...user, 
          ...rest, 
          extraPermissions: (extraPermissions || user.extraPermissions) as PermissionType[],
          updatedAt: new Date().toISOString() 
        } as User
        
        return updatedUser
      }
      return user
    })

    return updatedUser ? HttpResponse.json(updatedUser) : new HttpResponse(null, { status: 404 })
  }),

  /**
   * DELETE a user
   */
  http.delete("*/users/:id", ({ params }) => {
    const { id } = params
    users = users.filter((u) => u.id !== id)
    return new HttpResponse(null, { status: 204 })
  }),
]