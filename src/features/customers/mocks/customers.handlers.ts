import { delay, http, HttpResponse } from "msw"

import { Customer, CustomerFormValues } from "../customer.schema"
import { mockCustomers } from "./customers.mock"

function getNestedValue(obj: any, path: string): any {
  return path.split(".").reduce((o, k) => (o ? o[k] : undefined), obj)
}

function applySort<T>(data: T[], sort: string | null, order: string | null): T[] {
  if (!sort || !order) {
    return data
  }

  // Use a stable sort by creating a shallow copy
  return [...data].sort((a, b) => {
    const valA = getNestedValue(a, sort)
    const valB = getNestedValue(b, sort)

    if (valA === null || typeof valA === "undefined") return 1
    if (valB === null || typeof valB === "undefined") return -1

    const comparison = String(valA).localeCompare(String(valB), undefined, { numeric: true, sensitivity: "base" })

    return order === "asc" ? comparison : -comparison
  })
}

// Mutable copy for mock operations
let customers = [...mockCustomers]

export const customerHandlers = [
  // GET all customers with pagination and search
  http.get("https://api.example.com/customers", async ({ request }) => {
    await delay(500)
    const url = new URL(request.url)
    const page = Number(url.searchParams.get("page") || "1")
    const pageSize = Number(url.searchParams.get("pageSize") || "10")
    const search = url.searchParams.get("search")?.toLowerCase() || ""
    const sort = url.searchParams.get("_sort")
    const order = url.searchParams.get("_order")
    const isDealer = url.searchParams.get("isDealer")
    const branch = url.searchParams.get("branch")
    const status = url.searchParams.get("status")

    let filteredData = customers.filter((customer) => {
      const searchMatch =
        customer.name.toLowerCase().includes(search) ||
        (customer.email || "").toLowerCase().includes(search) ||
        (customer.mobile || "").toLowerCase().includes(search)

      const roleMatch = !isDealer || isDealer === "all" || customer.isDealer === (isDealer === "true")
      const statusMatch = !status || status === "all" || (customer.isActive ? "active" : "inactive") === status

      return searchMatch && roleMatch && statusMatch
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

  // GET a single customer by ID
  http.get("*/customers/:id", ({ params }) => {
    const { id } = params
    const customer = customers.find((c) => c.id === id)
    if (!customer) {
      return new HttpResponse(null, { status: 404 })
    }
    return HttpResponse.json(customer)
  }),

  // POST (create) a customer
  http.post("https://api.example.com/customers", async ({ request }) => {
    await delay(500)
    const data = (await request.json()) as CustomerFormValues
    const newCustomer: Customer = {
      id: `cust_${Date.now()}`,
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    customers.unshift(newCustomer)
    return HttpResponse.json(newCustomer, { status: 201 })
  }),

  // DELETE a customer
  http.delete("*/customers/:id", ({ params }) => {
    const { id } = params
    customers = customers.filter((c) => c.id !== id)
    return new HttpResponse(null, { status: 204 })
  }),

  // PATCH a single customer (for status updates, etc.)
  http.patch("*/customers/:id", async ({ params, request }) => {
    await delay(500)
    const { id } = params
    const data = (await request.json()) as Partial<Omit<Customer, "id">>

    let updatedCustomer: Customer | undefined
    customers = customers.map((customer) => {
      if (customer.id === id) {
        updatedCustomer = { ...customer, ...data }
        return updatedCustomer
      }
      return customer
    })

    if (!updatedCustomer) {
      return new HttpResponse(null, { status: 404 })
    }

    return HttpResponse.json(updatedCustomer)
  }),

  // PATCH (bulk update) customers
  http.patch("https://api.example.com/customers", async ({ request }) => {
    await delay(1000)
    const { ids, data } = (await request.json()) as { ids: string[]; data: Partial<Omit<Customer, "id">> }

    customers = customers.map((customer) => {
      if (ids.includes(customer.id)) {
        return { ...customer, ...data }
      }
      return customer
    })

    return HttpResponse.json({ status: "ok" })
  }),

  // DELETE (bulk) customers
  http.delete("https://api.example.com/customers", async ({ request }) => {
    await delay(1000)
    const { ids } = (await request.json()) as { ids: string[] }
    customers = customers.filter((c) => !ids.includes(c.id))
    return HttpResponse.json({ status: "ok" })
  }),
]