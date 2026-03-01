import { delay, http, HttpResponse } from "msw"
import { mockStock } from "./stock.mock"
import { applySort } from "@/mocks/mock-utils"

const stocks = [...mockStock]

export const stockHandlers = [
  // GET all stocks with pagination and search
  http.get("*/stock", async ({ request }) => {
    await delay(500)
    const url = new URL(request.url)
    const page = Number(url.searchParams.get("page") || "1")
    const pageSize = Number(url.searchParams.get("pageSize") || "10")
    const search = url.searchParams.get("search")?.toLowerCase() || ""
    const sort = url.searchParams.get("_sort")
    const order = url.searchParams.get("_order")
    const status = url.searchParams.get("status")
    const category = url.searchParams.get("category")

    const filteredData = stocks.filter((item) => {
      const searchMatch =
        item.itemName.toLowerCase().includes(search) ||
        item.sku.toLowerCase().includes(search) ||
        (item.imei && item.imei.toLowerCase().includes(search))

      let statusMatch = true
      if (status && status !== "all") {
        if (status === "LOW_STOCK") {
          statusMatch = item.stockQuantity > 0 && item.stockQuantity <= item.lowStockThreshold
        } else if (status === "OUT_OF_STOCK") {
          statusMatch = item.stockQuantity === 0
        } else {
          statusMatch = item.status === status
        }
      }
      const categoryMatch = !category || category === "all" || item.categoryName === category

      return searchMatch && statusMatch && categoryMatch
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

  // GET stock options for dropdowns
  http.get("*/stock/options", async ({ request }) => {
    await delay(300)
    const url = new URL(request.url)
    const search = url.searchParams.get("search")?.toLowerCase() || ""

    const filtered = stocks.filter(
      (stock) =>
        stock.isActive &&
        (stock.itemName.toLowerCase().includes(search) ||
          (stock.imei && stock.imei.includes(search)))
    )

    const options = filtered.map((stock) => ({
      id: stock.id,
      itemName: stock.itemName,
      imei: stock.imei,
    }))

    return HttpResponse.json(options)
  }),
  
  // GET a single stock item by ID
  http.get("*/stock/:id", async ({ params }) => {
    await delay(300)
    const { id } = params
    const stock = stocks.find((s) => s.id === id)

    if (!stock) {
      return new HttpResponse(null, { status: 404 })
    }

    return HttpResponse.json(stock)
  }),

]