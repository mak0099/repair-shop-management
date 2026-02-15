import { delay, http, HttpResponse } from "msw"

import { applySort } from "@/mocks/mock-utils"
import { Item, ItemFormValues } from "../item.schema"
import { mockItems } from "./items.mock"

let items = [...mockItems]

export const itemHandlers = [
  // GET all items with pagination and search
  http.get("https://api.example.com/items", async ({ request }) => {
    await delay(500)
    const url = new URL(request.url)
    const page = Number(url.searchParams.get("page") || "1")
    const pageSize = Number(url.searchParams.get("pageSize") || "10")
    const search = url.searchParams.get("search")?.toLowerCase() || ""
    const sort = url.searchParams.get("_sort")
    const order = url.searchParams.get("_order")
    const status = url.searchParams.get("status")
    const type = url.searchParams.get("type")

    const filteredData = items.filter((item) => {
      const searchMatch =
        item.name.toLowerCase().includes(search) ||
        item.sku.toLowerCase().includes(search)
      const statusMatch = !status || status === "all" || (item.isActive ? "active" : "inactive") === status
      const typeMatch = !type || type === "all" || item.type === type
      return searchMatch && statusMatch && typeMatch
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

  // GET a single item by ID
  http.get("*/items/:id", ({ params }) => {
    const { id } = params
    const item = items.find((i) => i.id === id)
    if (!item) {
      return new HttpResponse(null, { status: 404 })
    }
    return HttpResponse.json(item)
  }),

  // POST a new item
  http.post("https://api.example.com/items", async ({ request }) => {
    await delay(1000)
    const data = (await request.json()) as ItemFormValues

    const newItem: Item = {
      id: `item-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...data,
    }
    items.unshift(newItem)
    return HttpResponse.json(newItem, { status: 201 })
  }),

  // PATCH an item
  http.patch("*/items/:id", async ({ params, request }) => {
    await delay(1000)
    const { id } = params
    const updates = (await request.json()) as Partial<ItemFormValues>

    let updatedItem: Item | undefined
    items = items.map((item) => {
      if (item.id === id) {
        updatedItem = { ...item, ...updates, updatedAt: new Date().toISOString() }
        return updatedItem
      }
      return item
    })

    if (!updatedItem) {
      return new HttpResponse(null, { status: 404 })
    }

    return HttpResponse.json(updatedItem)
  }),

  // DELETE an item
  http.delete("*/items/:id", ({ params }) => {
    const { id } = params
    items = items.filter((i) => i.id !== id)
    return new HttpResponse(null, { status: 204 })
  }),

  // PATCH (bulk update) items
  http.patch("https://api.example.com/items", async ({ request }) => {
    await delay(1000)
    const { ids, data } = (await request.json()) as { ids: string[]; data: Partial<Omit<Item, "id">> }

    items = items.map((item) => {
      if (ids.includes(item.id)) {
        return { ...item, ...data, updatedAt: new Date().toISOString() }
      }
      return item
    })

    return HttpResponse.json({ status: "ok" })
  }),

  // DELETE (bulk) items
  http.delete("https://api.example.com/items", async ({ request }) => {
    await delay(1000)
    const { ids } = (await request.json()) as { ids: string[] }
    items = items.filter((i) => !ids.includes(i.id))
    return HttpResponse.json({ status: "ok" })
  }),

  // GET item options for dropdowns
  http.get("*/items/options", async () => {
    await delay(300)
    const itemOptions = items.map((i) => ({ id: i.id, name: i.name }))
    return HttpResponse.json(itemOptions)
  }),
]
