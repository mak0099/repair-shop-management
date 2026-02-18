import { http, HttpResponse } from "msw"

import { applySort } from "@/mocks/mock-utils"
import { Brand, BrandFormValues } from "../brand.schema"
import { mockBrands } from "./brands.mock"

// In-memory store for brands
let brands: Brand[] = [...mockBrands]

export const brandHandlers = [
  // Get all brands
  http.get("https://api.example.com/brands", ({ request }) => {
    const url = new URL(request.url)
    const search = url.searchParams.get("search") || ""
    const status = url.searchParams.get("status") // 'active', 'inactive', 'all'
    const page = parseInt(url.searchParams.get("page") || "1", 10)
    const pageSize = parseInt(url.searchParams.get("pageSize") || "10", 10)
    const sort = url.searchParams.get("_sort")
    const order = url.searchParams.get("_order")

    let filteredBrands = brands

    // Filter by search query
    if (search) {
      const lowercasedSearch = search.toLowerCase()
      filteredBrands = filteredBrands.filter((brand) => brand.name.toLowerCase().includes(lowercasedSearch))
    }

    // Filter by status (isActive)
    if (status && status !== "all") {
      const isActive = status === "active"
      filteredBrands = filteredBrands.filter((brand) => brand.isActive === isActive)
    }

    const sortedData = applySort(filteredBrands, sort, order)

    // Paginate results
    const total = sortedData.length
    const totalPages = Math.ceil(total / pageSize)
    const paginatedData = sortedData.slice((page - 1) * pageSize, page * pageSize)

    return HttpResponse.json({ data: paginatedData, meta: { total, page, pageSize, totalPages } })
  }),

  // Create Brand
  http.post("https://api.example.com/brands", async ({ request }) => {
    try {
      const contentType = request.headers.get("content-type") || ""
      let data: BrandFormValues

      if (contentType.includes("multipart/form-data")) {
        const formData = await request.formData()
        data = {
          name: formData.get("name") as string,
          logo: formData.get("logo") as File | null,
          isActive: formData.get("isActive") === "true",
        }
      } else {
        data = (await request.json()) as BrandFormValues
      }

      if (!data.name) {
        return HttpResponse.json({ message: "Brand name is required" }, { status: 400 })
      }

      let logoUrl = null
      if (data.logo instanceof File && data.logo.size > 0) {
        logoUrl = `/uploads/mock_${Date.now()}_${data.logo.name}`
      }

      const newBrand: Brand = {
        id: `brand_${Date.now()}`,
        name: data.name,
        logo: logoUrl,
        isActive: data.isActive,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      brands.push(newBrand)
      return HttpResponse.json(newBrand, { status: 201 })
    } catch (e) {
      const error = e as Error
      console.error("Error in MSW handler for POST /brands:", error.message)
      return HttpResponse.json({ message: "MSW Handler Error", error: error.message }, { status: 500 })
    }
  }),

  // Update Brand
  http.patch("https://api.example.com/brands/:id", async ({ request, params }) => {
    try {
      const { id } = params
      const brandIndex = brands.findIndex((b) => b.id === id)

      if (brandIndex === -1) {
        return HttpResponse.json({ message: "Brand not found" }, { status: 404 })
      }

      const existingBrand = brands[brandIndex]
      const updatedBrand: Brand = { ...existingBrand, updatedAt: new Date().toISOString() }

      const contentType = request.headers.get("content-type") || ""

      if (contentType.includes("multipart/form-data")) {
        const formData = await request.formData()

        const name = formData.get("name")
        if (typeof name === "string") {
          updatedBrand.name = name
        }

        const isActive = formData.get("isActive")
        if (typeof isActive === "string") {
          updatedBrand.isActive = isActive === "true"
        }

        if (formData.has("logo")) {
          const logoValue = formData.get("logo")
          if (logoValue instanceof File && logoValue.size > 0) {
            updatedBrand.logo = `/uploads/mock_${Date.now()}_${logoValue.name}`
          } else if (logoValue === "null") {
            updatedBrand.logo = null
          }
        }
      } else {
        const jsonData = (await request.json()) as Partial<BrandFormValues>
        Object.assign(updatedBrand, jsonData)
      }

      brands[brandIndex] = updatedBrand

      return HttpResponse.json(updatedBrand, { status: 200 })
    } catch (e) {
      const error = e as Error
      console.error(`Error in MSW handler for PATCH /brands/:id:`, error.message)
      return HttpResponse.json({ message: "MSW Handler Error", error: error.message }, { status: 500 })
    }
  }),

  // DELETE a brand
  http.delete("https://api.example.com/brands/:id", ({ params }) => {
    const { id } = params
    brands = brands.filter((b) => b.id !== id)
    return new HttpResponse(null, { status: 204 })
  }),

  // GET brand options for dropdowns
  http.get("*/brands/options", () => {
    const brandOptions = brands.map((b) => ({ id: b.id, name: b.name }))
    return HttpResponse.json(brandOptions)
  }),
]