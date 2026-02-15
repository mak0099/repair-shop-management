import { http, HttpResponse } from "msw"

import { Customer, CustomerFormValues } from "../customer.schema"

// In-memory store for customers
let customers: Customer[] = [
  {
    id: "cust_1",
    name: "Mario Rossi (Dealer)",
    mobile: "3331234567",
    email: "mario.rossi@example.com",
    isDealer: true,
    isActive: true,
    createdAt: "2023-10-26T10:00:00Z",
    updatedAt: "2023-10-26T10:00:00Z",
    phone: "02123456",
    fiscal_code: "RSSMRA80A01H501U",
    vat: "IT01234567890",
    sdi_code: "1234567",
    pec_email: "mario.rossi@pec.it",
    address: "Via Roma 1",
    location: "Milano",
    province: "MI",
    postal_code: "20121",
    notes: "VIP Customer",
  },
  {
    id: "cust_2",
    name: "Luigi Verdi",
    mobile: "3471234567",
    email: "luigi.verdi@example.com",
    isDealer: false,
    isActive: true,
    createdAt: "2023-10-25T11:00:00Z",
    updatedAt: "2023-10-25T11:00:00Z",
    phone: "06123456",
    fiscal_code: "VRDLGU85B02H501A",
    vat: "",
    sdi_code: "",
    pec_email: "",
    address: "Via Garibaldi 10",
    location: "Roma",
    province: "RM",
    postal_code: "00184",
    notes: "",
  },
  {
    id: "cust_3",
    name: "Peach Bianchi (Inactive)",
    mobile: "3281234567",
    email: "peach.bianchi@example.com",
    isDealer: false,
    isActive: false,
    createdAt: "2023-10-24T12:00:00Z",
    updatedAt: "2023-10-24T12:00:00Z",
    phone: "081123456",
    fiscal_code: "BNCPLC82C41F839Z",
    vat: "",
    sdi_code: "",
    pec_email: "",
    address: "Via Toledo 20",
    location: "Napoli",
    province: "NA",
    postal_code: "80132",
    notes: "Inactive account",
  },
]

export const customerHandlers = [
  // Get all customers with filtering
  http.get("https://api.example.com/customers", ({ request }) => {
    const url = new URL(request.url)
    const search = url.searchParams.get("search") || ""
    const status = url.searchParams.get("status") // 'active', 'inactive', 'all'
    const isDealer = url.searchParams.get("isDealer") // 'true', 'false', 'all'
    const page = parseInt(url.searchParams.get("page") || "1", 10)
    const pageSize = parseInt(url.searchParams.get("pageSize") || "10", 10)

    let filteredCustomers = customers

    // Filter by search query
    if (search) {
      const lowercasedSearch = search.toLowerCase()
      filteredCustomers = filteredCustomers.filter(
        (customer) =>
          customer.name.toLowerCase().includes(lowercasedSearch) ||
          (customer.email && customer.email.toLowerCase().includes(lowercasedSearch)) ||
          (customer.mobile && customer.mobile.includes(lowercasedSearch))
      )
    }

    // Filter by status (isActive)
    if (status && status !== "all") {
      const isActive = status === "active"
      filteredCustomers = filteredCustomers.filter((customer) => customer.isActive === isActive)
    }

    // Filter by role (isDealer)
    if (isDealer && isDealer !== "all") {
      const isDealerBool = isDealer === "true"
      filteredCustomers = filteredCustomers.filter((customer) => customer.isDealer === isDealerBool)
    }

    // Paginate results
    const total = filteredCustomers.length
    const totalPages = Math.ceil(total / pageSize)
    const paginatedData = filteredCustomers.slice((page - 1) * pageSize, page * pageSize)

    return HttpResponse.json({
      data: paginatedData,
      meta: { total, page, pageSize, totalPages },
    })
  }),

  // Create Customer
  http.post("https://api.example.com/customers", async ({ request }) => {
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

  // Update Customer
  http.patch("https://api.example.com/customers/:id", async ({ request, params }) => {
    const { id } = params
    const data = (await request.json()) as Partial<CustomerFormValues>
    const customerIndex = customers.findIndex((c) => c.id === id)
    if (customerIndex === -1) {
      return HttpResponse.json({ message: "Customer not found" }, { status: 404 })
    }
    const updatedCustomer = { ...customers[customerIndex], ...data, updatedAt: new Date().toISOString() }
    customers[customerIndex] = updatedCustomer
    return HttpResponse.json(updatedCustomer, { status: 200 })
  }),

  // Delete Customer
  http.delete("https://api.example.com/customers/:id", ({ params }) => {
    const { id } = params
    customers = customers.filter((c) => c.id !== id)
    return new HttpResponse(null, { status: 204 })
  }),
]