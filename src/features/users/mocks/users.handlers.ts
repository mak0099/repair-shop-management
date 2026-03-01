import { delay, http, HttpResponse } from "msw"

import { applySort } from "@/mocks/mock-utils"
import { User, UserFormValues } from "../user.schema"
import { mockUsers } from "./users.mock"

let users = [...mockUsers]

export const userHandlers = [
  // GET all users with pagination and search
  http.get("*/users", async ({ request }) => {
    await delay(500)
    const url = new URL(request.url)
    const page = Number(url.searchParams.get("page") || "1")
    const pageSize = Number(url.searchParams.get("pageSize") || "10")
    const search = url.searchParams.get("search")?.toLowerCase() || ""
    const sort = url.searchParams.get("_sort")
    const order = url.searchParams.get("_order")
    const status = url.searchParams.get("isActive")
    const role = url.searchParams.get("role")

    const filteredData = users.filter((user) => {
      const searchMatch =
        user.name.toLowerCase().includes(search) ||
        user.email.toLowerCase().includes(search)
      const statusMatch = !status || status === "all" || (user.isActive ? "true" : "false") === status
      const roleMatch = !role || role === "all" || user.role === role
      return searchMatch && statusMatch && roleMatch
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

  // GET user options for dropdowns
  http.get("*/users/options", async () => {
    await delay(300)
    const userOptions = users.map((u) => ({ id: u.id, name: u.name }))
    return HttpResponse.json(userOptions)
  }),

  // GET a single user by ID
  http.get("*/users/:id", ({ params }) => {
    const { id } = params
    const user = users.find((u) => u.id === id)
    if (!user) {
      return new HttpResponse(null, { status: 404 })
    }
    return HttpResponse.json(user)
  }),

  // POST a new user
  http.post("*/users", async ({ request }) => {
    await delay(1000)
    const data = (await request.json()) as UserFormValues
    
    const { password, ...rest } = data;

    const newUser: User = {
      id: `user-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...rest,
    }
    users.unshift(newUser)
    return HttpResponse.json(newUser, { status: 201 })
  }),

  // PATCH a user
  http.patch("*/users/:id", async ({ params, request }) => {
    await delay(1000)
    const { id } = params
    const updates = (await request.json()) as Partial<UserFormValues>

    let updatedUser: User | undefined
    users = users.map((user) => {
      if (user.id === id) {
        const { password, ...rest } = updates;
        updatedUser = { ...user, ...rest, updatedAt: new Date().toISOString() }
        return updatedUser
      }
      return user
    })

    if (!updatedUser) {
      return new HttpResponse(null, { status: 404 })
    }

    return HttpResponse.json(updatedUser)
  }),

  // DELETE a user
  http.delete("*/users/:id", ({ params }) => {
    const { id } = params
    users = users.filter((u) => u.id !== id)
    return new HttpResponse(null, { status: 204 })
  }),

  // PATCH (bulk update) users
  http.patch("*/users", async ({ request }) => {
    await delay(1000)
    const { ids, data } = (await request.json()) as { ids: string[]; data: Partial<Omit<User, "id">> }

    users = users.map((user) => {
      if (ids.includes(user.id)) {
        return { ...user, ...data, updatedAt: new Date().toISOString() }
      }
      return user
    })

    return HttpResponse.json({ status: "ok" })
  }),

  // DELETE (bulk) users
  http.delete("*/users", async ({ request }) => {
    await delay(1000)
    const { ids } = (await request.json()) as { ids: string[] }
    users = users.filter((u) => !ids.includes(u.id))
    return HttpResponse.json({ status: "ok" })
  }),
]
