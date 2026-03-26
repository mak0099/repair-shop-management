import { delay, http, HttpResponse } from "msw"
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
    const itemTypeParam = url.searchParams.get("itemType")
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

    if (itemTypeParam && itemTypeParam !== "all") {
      filtered = filtered.filter(item => item.itemType === itemTypeParam)
    }

    const total = filtered.length
    const totalPages = Math.ceil(total / pageSize)
    const start = (page - 1) * pageSize
    const end = start + pageSize
    const paginatedData = filtered.slice(start, end)

    return HttpResponse.json({ data: paginatedData, meta: { total, page, pageSize, totalPages } })
  }),

  // GET item options for dropdowns - lightweight response with optional extra fields
  http.get("*/items/options", ({ request }) => {
    const url = new URL(request.url)
    const itemTypeParam = url.searchParams.get("itemType")
    const inStockParam = url.searchParams.get("inStock")
    // Handle both single field and array of fields
    const fieldsParams = url.searchParams.getAll("fields[]") || url.searchParams.getAll("fields") || []
    
    console.log("[ItemsAPI /options]", {
      url: request.url,
      itemTypeParam,
      totalItemsCount: items.length,
      loanerItemsCount: items.filter(i => i.itemType === "LOANER").length,
      paramsReceived: {
        itemType: itemTypeParam,
        inStock: inStockParam,
        fields: fieldsParams.length > 0 ? fieldsParams : "none"
      }
    })
    
    let filtered = items
    
    // Filter by item type if provided
    if (itemTypeParam) {
      filtered = filtered.filter(item => item.itemType === itemTypeParam)
      console.log(`[ItemsAPI] After filtering by type "${itemTypeParam}": ${filtered.length} items`)
    }
    
    // Filter by stock status if provided
    if (inStockParam === "true") {
      filtered = filtered.filter(item => {
        // Check if item has stock available
        // Assuming items can have quantity property from stock system
        const itemRecord = item as Record<string, unknown>
        const hasStock = itemRecord.quantity !== undefined 
          ? (itemRecord.quantity as number) > 0
          : true // If no quantity field, assume in stock
        return hasStock
      })
    }
    
    // Build options with id, name + requested fields
    const itemOptions = filtered.map((item) => {
      const option: Record<string, unknown> = { id: item.id, name: item.name }
      
      // Add requested extra fields
      fieldsParams.forEach(field => {
        if (field && field in item) {
          option[field] = (item as Record<string, unknown>)[field]
        }
      })
      
      return option
    })
    
    console.log(`[ItemsAPI /options] Returning ${itemOptions.length} options`)
    
    return HttpResponse.json(itemOptions)
  }),

  http.post("*/items", async ({ request }) => {
    const data = (await request.json()) as Item
    const newItem = { ...data, id: `item_${Date.now()}`, createdAt: new Date().toISOString() }
    items.unshift(newItem)
    return HttpResponse.json(newItem, { status: 201 })
  }),
]