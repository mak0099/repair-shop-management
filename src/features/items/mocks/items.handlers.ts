import { delay, http, HttpResponse } from "msw"
import { applySort } from "@/mocks/mock-utils"
import { Item } from "../item.schema"
import { mockItems } from "./items.mock"

const items = [...mockItems]

export const itemHandlers = [
  http.get("*/items", async ({ request }) => {
    await delay(300)
    const url = new URL(request.url)
    const search = url.searchParams.get("search")?.toLowerCase() || ""
    const isActiveParam = url.searchParams.get("isActive")
    const conditionParam = url.searchParams.get("condition")
    const page = Number(url.searchParams.get("page") || "1")
    const pageSize = Number(url.searchParams.get("pageSize") || "10")
    
    let filtered = items.filter(item => 
      item.name.toLowerCase().includes(search) || (item.sku?.toLowerCase().includes(search))
    )

    if (isActiveParam && isActiveParam !== "all") {
      filtered = filtered.filter(item => item.isActive === (isActiveParam === "true"))
    }

    if (conditionParam && conditionParam !== "all") {
      filtered = filtered.filter(item => item.condition === conditionParam)
    }

    const total = filtered.length
    const totalPages = Math.ceil(total / pageSize)
    const start = (page - 1) * pageSize
    const end = start + pageSize
    const paginatedData = filtered.slice(start, end)

    return HttpResponse.json({ data: paginatedData, meta: { total, page, pageSize, totalPages } })
  }),

  http.post("*/items", async ({ request }) => {
    const data = (await request.json()) as Item
    const newItem = { ...data, id: `item_${Date.now()}`, createdAt: new Date().toISOString() }
    items.unshift(newItem)
    return HttpResponse.json(newItem, { status: 201 })
  }),
]