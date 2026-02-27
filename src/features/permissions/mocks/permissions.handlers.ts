import { delay, http, HttpResponse } from "msw"

import { applySort } from "@/mocks/mock-utils"
import { Permission, PermissionFormValues } from "../permission.schema"
import { mockPermissions } from "./permissions.mock"

let permissions = [...mockPermissions]

export const permissionHandlers = [
  // GET all permissions with pagination and search
  http.get("*/permissions", async ({ request }) => {
    await delay(500)
    const url = new URL(request.url)
    const page = Number(url.searchParams.get("page") || "1")
    const pageSize = Number(url.searchParams.get("pageSize") || "10")
    const search = url.searchParams.get("search")?.toLowerCase() || ""
    const sort = url.searchParams.get("_sort")
    const order = url.searchParams.get("_order")

    const filteredData = permissions.filter((permission) => {
      const searchMatch =
        permission.name.toLowerCase().includes(search) ||
        (permission.description && permission.description.toLowerCase().includes(search))
      return searchMatch
    })

    const sortedData = applySort(filteredData, sort, order)

    const total = sortedData.length
    const totalPages = Math.ceil(total / pageSize)
    const start = (page - 1) * pageSize
    const end = start + pageSize
    const paginatedData = sortedData.slice(start, end)

    return HttpResponse.json({
      data: paginatedData,
      meta: {
        total,
        page,
        pageSize,
        totalPages,
      },
    })
  }),

  // GET permission options for dropdowns
  http.get("*/permissions/options", async () => {
    await delay(300)
    const permissionOptions = permissions.map((p) => ({ id: p.id, name: p.name }))
    return HttpResponse.json(permissionOptions)
  }),

  // GET a single permission by ID
  http.get("*/permissions/:id", ({ params }) => {
    const { id } = params
    const permission = permissions.find((p) => p.id === id)
    if (!permission) {
      return new HttpResponse(null, { status: 404 })
    }
    return HttpResponse.json(permission)
  }),

  // POST a new permission
  http.post("*/permissions", async ({ request }) => {
    await delay(1000)
    const data = (await request.json()) as PermissionFormValues

    const newPermission: Permission = {
      id: `perm-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...data,
    }
    permissions.unshift(newPermission)
    return HttpResponse.json(newPermission, { status: 201 })
  }),

  // PATCH a permission
  http.patch("*/permissions/:id", async ({ params, request }) => {
    await delay(1000)
    const { id } = params
    const updates = (await request.json()) as Partial<PermissionFormValues>

    let updatedPermission: Permission | undefined
    permissions = permissions.map((permission) => {
      if (permission.id === id) {
        updatedPermission = { ...permission, ...updates, updatedAt: new Date().toISOString() }
        return updatedPermission
      }
      return permission
    })

    if (!updatedPermission) {
      return new HttpResponse(null, { status: 404 })
    }

    return HttpResponse.json(updatedPermission)
  }),

  // DELETE a permission
  http.delete("*/permissions/:id", ({ params }) => {
    const { id } = params
    permissions = permissions.filter((p) => p.id !== id)
    return new HttpResponse(null, { status: 204 })
  }),

  // PATCH (bulk update) permissions
  http.patch("*/permissions", async ({ request }) => {
    await delay(1000)
    const { ids, data } = (await request.json()) as { ids: string[]; data: Partial<Omit<Permission, "id">> }

    permissions = permissions.map((permission) => {
      if (ids.includes(permission.id)) {
        return { ...permission, ...data, updatedAt: new Date().toISOString() }
      }
      return permission
    })

    return HttpResponse.json({ status: "ok" })
  }),

  // DELETE (bulk) permissions
  http.delete("*/permissions", async ({ request }) => {
    await delay(1000)
    const { ids } = (await request.json()) as { ids: string[] }
    permissions = permissions.filter((p) => !ids.includes(p.id))
    return HttpResponse.json({ status: "ok" })
  }),
]
