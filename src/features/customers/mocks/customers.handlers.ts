import { http, HttpResponse, delay } from "msw"
import { mockCustomers } from "./customers.mock"
import { applySort } from "@/mocks/mock-utils"
import { Customer } from "../customer.schema"

const customers = [...mockCustomers]

export const customerHandlers = [
  // GET all customers
  http.get("*/customers", async ({ request }) => {
    await delay(400)
    const url = new URL(request.url)
    const page = Number(url.searchParams.get("page") || "1")
    const pageSize = Number(url.searchParams.get("pageSize") || "10")
    const search = url.searchParams.get("search")?.toLowerCase() || ""
    const sort = url.searchParams.get("_sort")
    const order = url.searchParams.get("_order")
    const isDealer = url.searchParams.get("isDealer")
    const isActiveParam = url.searchParams.get("isActive")

    const filteredData = customers.filter((customer) => {
      const searchMatch =
        customer.name.toLowerCase().includes(search) ||
        customer.mobile.includes(search) ||
        (customer.email && customer.email.toLowerCase().includes(search))

      let dealerMatch = true
      if (isDealer && isDealer !== "all") {
        dealerMatch = String(customer.isDealer) === isDealer
      }

      let activeMatch = true
      if (isActiveParam && isActiveParam !== "all") {
        activeMatch = String(customer.isActive) === isActiveParam
      }

      return searchMatch && dealerMatch && activeMatch
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

  // GET customer options
  http.get("*/customers/options", async ({ request }) => {
    await delay(200)
    const url = new URL(request.url)
    const search = url.searchParams.get("search")?.toLowerCase() || ""

    const filtered = customers.filter(
      (c) => c.isActive && (c.name.toLowerCase().includes(search) || c.mobile.includes(search))
    )

    const options = filtered.map((c) => ({
      id: c.id,
      name: c.name,
      mobile: c.mobile,
    }))

    return HttpResponse.json(options)
  }),

  // GET single customer
  http.get("*/customers/:id", ({ params }) => {
    const { id } = params
    const customer = customers.find((c) => c.id === id)
    if (!customer) {
      return new HttpResponse(null, { status: 404 })
    }
    return HttpResponse.json(customer)
  }),

  // POST new customer
  http.post("*/customers", async ({ request }) => {
    const data = (await request.json()) as Omit<Customer, "id" | "createdAt" | "updatedAt">
    const newCustomer: Customer = {
      ...data,
      id: `cust_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    customers.unshift(newCustomer)
    return HttpResponse.json(newCustomer, { status: 201 })
  }),

  // PATCH update customer
  http.patch("*/customers/:id", async ({ params, request }) => {
    const { id } = params
    const data = (await request.json()) as Partial<Customer>
    const index = customers.findIndex((c) => c.id === id)
    if (index === -1) {
      return new HttpResponse(null, { status: 404 })
    }
    customers[index] = { ...customers[index], ...data, updatedAt: new Date().toISOString() }
    return HttpResponse.json(customers[index])
  }),
]