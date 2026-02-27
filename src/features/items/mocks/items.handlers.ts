import { delay, http, HttpResponse } from "msw"

import { applySort } from "@/mocks/mock-utils"

import { Item } from "../item.schema"
import { mockItems } from "./items.mock"

let items = [...mockItems]

export const itemHandlers = [
  // GET all items
  http.get("*/items", async ({ request }) => {
    await delay(300)
    const url = new URL(request.url)
    const page = Number(url.searchParams.get("page") || "1")
    const pageSize = Number(url.searchParams.get("pageSize") || "10")
    const search = url.searchParams.get("search")?.toLowerCase() || ""
    const sort = url.searchParams.get("_sort")
    const order = url.searchParams.get("_order")

    let filteredData = items.filter((item) => {
      return (
        item.name.toLowerCase().includes(search) ||
        (item.sku && item.sku.toLowerCase().includes(search))
      )
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

  // GET item options for dropdowns
  http.get("*/items/options", async ({ request }) => {
    await delay(200)
    const url = new URL(request.url)
    const search = url.searchParams.get("search")?.toLowerCase() || ""

    const filtered = items.filter(
      (item) =>
        item.isActive &&
        (item.name.toLowerCase().includes(search) ||
          (item.sku && item.sku.toLowerCase().includes(search)))
    )

    const options = filtered.map((item) => ({
      id: item.id,
      name: item.name,
    }))

    return HttpResponse.json(options)
  }),

  // POST new item
  http.post("*/items", async ({ request }) => {
    await delay(500)
    const data = (await request.json()) as any
    const newItem: Item = {
      ...data,
      id: `item_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      stock_qty: data.initialStock || 0,
      hasVariants: Array.isArray(data.variants) && data.variants.length > 0,
    }
    items.unshift(newItem)
    return HttpResponse.json(newItem, { status: 201 })
  }),
]