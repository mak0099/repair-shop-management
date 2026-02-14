import { delay, http, HttpResponse } from "msw"

import { applySort } from "@/mocks/mock-utils"
import { Brand } from "../brand.schema"
import { mockBrands } from "./brands.mock"

// Mutable copy for mock operations
let brands = [...mockBrands]

export const brandHandlers = [
  // GET all brands with pagination and search
  http.get("https://api.example.com/brands", async ({ request }) => {
    await delay(500)
    const url = new URL(request.url)
    const page = Number(url.searchParams.get("page") || "1")
    const pageSize = Number(url.searchParams.get("pageSize") || "10")
    const search = url.searchParams.get("search")?.toLowerCase() || ""
    const sort = url.searchParams.get("_sort")
    const order = url.searchParams.get("_order")
    const status = url.searchParams.get("status")

    const filteredData = brands.filter((brand) => {
      const searchMatch = brand.name.toLowerCase().includes(search)
      const statusMatch = !status || status === "all" || (brand.isActive ? "active" : "inactive") === status
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

  // GET a single brand by ID
  http.get("*/brands/:id", ({ params }) => {
    const { id } = params
    const brand = brands.find((b) => b.id === id)
    if (!brand) {
      return new HttpResponse(null, { status: 404 })
    }
    return HttpResponse.json(brand)
  }),

  // POST a new brand
  http.post("https://api.example.com/brands", async ({ request }) => {
    await delay(1000)
    const formData = await request.formData()

    const logoFile = formData.get("logo")
    let logoUrl: string | null = null
    if (logoFile instanceof File) {
      logoUrl = URL.createObjectURL(logoFile)
    } else if (typeof logoFile === "string") {
      logoUrl = logoFile
    }

    const newBrand: Brand = {
      id: `brand-${Date.now()}`,
      createdAt: new Date().toISOString(),
      name: formData.get("name") as string,
      logo: logoUrl,
      isActive: formData.get("isActive") === "true",
    }
    brands.unshift(newBrand)
    return HttpResponse.json(newBrand, { status: 201 })
  }),

  // POST (for form data updates, mimicking _method: "PUT")
  http.post("*/brands/:id", async ({ params, request }) => {
    await delay(1000)
    const { id } = params
    const formData = await request.formData()
    const updates: Partial<Omit<Brand, "id">> = {}

    if (formData.has("name")) updates.name = formData.get("name") as string
    if (formData.has("isActive")) updates.isActive = formData.get("isActive") === "true"

    const logoFile = formData.get("logo")
    if (logoFile instanceof File) {
      updates.logo = URL.createObjectURL(logoFile)
    } else if (typeof logoFile === "string") {
      updates.logo = logoFile
    } else if (formData.get("logo") === "null") {
      updates.logo = null
    }

    let updatedBrand: Brand | undefined
    brands = brands.map((brand) => {
      if (brand.id === id) {
        updatedBrand = { ...brand, ...updates }
        return updatedBrand
      }
      return brand
    })

    if (!updatedBrand) {
      return new HttpResponse(null, { status: 404 })
    }

    return HttpResponse.json(updatedBrand)
  }),

  // DELETE a brand
  http.delete("*/brands/:id", ({ params }) => {
    const { id } = params
    brands = brands.filter((b) => b.id !== id)
    return new HttpResponse(null, { status: 204 })
  }),

  // PATCH a single brand (for status updates, etc.)
  http.patch("*/brands/:id", async ({ params, request }) => {
    await delay(500)
    const { id } = params
    const data = (await request.json()) as Partial<Omit<Brand, "id">>

    let updatedBrand: Brand | undefined
    brands = brands.map((brand) => {
      if (brand.id === id) {
        updatedBrand = { ...brand, ...data }
        return updatedBrand
      }
      return brand
    })

    if (!updatedBrand) {
      return new HttpResponse(null, { status: 404 })
    }

    return HttpResponse.json(updatedBrand)
  }),

  // PATCH (bulk update) brands
  http.patch("https://api.example.com/brands", async ({ request }) => {
    await delay(1000)
    const { ids, data } = (await request.json()) as { ids: string[]; data: Partial<Omit<Brand, "id">> }

    brands = brands.map((brand) => {
      if (ids.includes(brand.id)) {
        return { ...brand, ...data }
      }
      return brand
    })

    return HttpResponse.json({ status: "ok" })
  }),

  // DELETE (bulk) brands
  http.delete("https://api.example.com/brands", async ({ request }) => {
    await delay(1000)
    const { ids } = (await request.json()) as { ids: string[] }
    brands = brands.filter((b) => !ids.includes(b.id))
    return HttpResponse.json({ status: "ok" })
  }),

  // GET brand options for dropdowns
  http.get("*/brands/options", async () => {
    await delay(300)
    const brandOptions = brands.map((b) => ({ id: b.id, name: b.name }))
    return HttpResponse.json(brandOptions)
  }),
]