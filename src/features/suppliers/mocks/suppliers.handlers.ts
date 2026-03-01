import { delay, http, HttpResponse } from "msw"

import { applySort } from "@/mocks/mock-utils"
import { Supplier, SupplierFormValues } from "../supplier.schema"
import { mockSuppliers } from "./suppliers.mock"

let suppliers = [...mockSuppliers]

export const supplierHandlers = [
  // GET all suppliers with pagination and search
  http.get("*/suppliers", async ({ request }) => {
    await delay(500)
    const url = new URL(request.url)
    const page = Number(url.searchParams.get("page") || "1")
    const pageSize = Number(url.searchParams.get("pageSize") || "10")
    const search = url.searchParams.get("search")?.toLowerCase() || ""
    const sort = url.searchParams.get("_sort")
    const order = url.searchParams.get("_order")
    const status = url.searchParams.get("isActive")

    const filteredData = suppliers.filter((supplier) => {
      const searchMatch =
        supplier.company_name.toLowerCase().includes(search) ||
        (supplier.contact_person || "").toLowerCase().includes(search)
      const statusMatch = !status || status === "all" || (supplier.isActive ? "true" : "false") === status
      return searchMatch && statusMatch
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

  // GET a single supplier by ID
  http.get("*/suppliers/:id", ({ params }) => {
    const { id } = params
    const supplier = suppliers.find((s) => s.id === id)
    if (!supplier) {
      return new HttpResponse(null, { status: 404 })
    }
    return HttpResponse.json(supplier)
  }),

  // POST a new supplier
  http.post("*/suppliers", async ({ request }) => {
    await delay(1000)
    const data = (await request.json()) as SupplierFormValues

    const newSupplier: Supplier = {
      id: `sup-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...data,
    }
    suppliers.unshift(newSupplier)
    return HttpResponse.json(newSupplier, { status: 201 })
  }),

  // PATCH a supplier
  http.patch("*/suppliers/:id", async ({ params, request }) => {
    await delay(1000)
    const { id } = params
    const updates = (await request.json()) as Partial<SupplierFormValues>

    let updatedSupplier: Supplier | undefined
    suppliers = suppliers.map((supplier) => {
      if (supplier.id === id) {
        updatedSupplier = { ...supplier, ...updates, updatedAt: new Date().toISOString() }
        return updatedSupplier
      }
      return supplier
    })

    if (!updatedSupplier) {
      return new HttpResponse(null, { status: 404 })
    }

    return HttpResponse.json(updatedSupplier)
  }),

  // DELETE a supplier
  http.delete("*/suppliers/:id", ({ params }) => {
    const { id } = params
    suppliers = suppliers.filter((s) => s.id !== id)
    return new HttpResponse(null, { status: 204 })
  }),

  // PATCH (bulk update) suppliers
  http.patch("*/suppliers", async ({ request }) => {
    await delay(1000)
    const { ids, data } = (await request.json()) as { ids: string[]; data: Partial<Omit<Supplier, "id">> }

    suppliers = suppliers.map((supplier) => {
      if (ids.includes(supplier.id)) {
        return { ...supplier, ...data, updatedAt: new Date().toISOString() }
      }
      return supplier
    })

    return HttpResponse.json({ status: "ok" })
  }),

  // DELETE (bulk) suppliers
  http.delete("*/suppliers", async ({ request }) => {
    await delay(1000)
    const { ids } = (await request.json()) as { ids: string[] }
    suppliers = suppliers.filter((s) => !ids.includes(s.id))
    return HttpResponse.json({ status: "ok" })
  }),

  // GET supplier options for dropdowns
  http.get("*/suppliers/options", async ({ request }) => {
    await delay(300)
    const url = new URL(request.url)
    const search = url.searchParams.get("search")?.toLowerCase() || ""

    const filtered = suppliers.filter(
      (s) => s.isActive && s.company_name.toLowerCase().includes(search)
    )

    const options = filtered.map((s) => ({
      id: s.id,
      name: s.company_name, // Standardize to 'name' for comboboxes
    }))

    return HttpResponse.json(options)
  }),
]
