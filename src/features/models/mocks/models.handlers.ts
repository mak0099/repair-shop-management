import { delay, http, HttpResponse } from "msw"

import { applySort } from "@/mocks/mock-utils"
import { Model, ModelFormValues } from "../model.schema"
import { mockModels } from "./models.mock"
import { mockBrands } from "@/features/brands/mocks/brands.mock"

let models = [...mockModels]

export const modelHandlers = [
  // GET all models with pagination and search
  http.get("https://api.example.com/models", async ({ request }) => {
    await delay(500)
    const url = new URL(request.url)
    const page = Number(url.searchParams.get("page") || "1")
    const pageSize = Number(url.searchParams.get("pageSize") || "10")
    const search = url.searchParams.get("search")?.toLowerCase() || ""
    const sort = url.searchParams.get("_sort")
    const order = url.searchParams.get("_order")
    const status = url.searchParams.get("status")

    const filteredData = models.filter((model) => {
      const searchMatch = model.name.toLowerCase().includes(search)
      const statusMatch = !status || status === "all" || (model.isActive ? "active" : "inactive") === status
      return searchMatch && statusMatch
    })

    const sortedData = applySort(filteredData, sort, order)
    
    // Attach brand object
    const dataWithBrand = sortedData.map(model => {
        const brand = mockBrands.find(b => b.id === model.brand_id);
        return { ...model, brand: brand ? {id: brand.id, name: brand.name} : undefined };
    });

    const total = dataWithBrand.length
    const totalPages = Math.ceil(total / pageSize)
    const start = (page - 1) * pageSize
    const end = start + pageSize
    const paginatedData = dataWithBrand.slice(start, end)

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

  // GET a single model by ID
  http.get("*/models/:id", ({ params }) => {
    const { id } = params
    const model = models.find((m) => m.id === id)
    if (!model) {
      return new HttpResponse(null, { status: 404 })
    }
    const brand = mockBrands.find(b => b.id === model.brand_id);
    return HttpResponse.json({ ...model, brand: brand ? {id: brand.id, name: brand.name} : undefined })
  }),

  // POST a new model
  http.post("https://api.example.com/models", async ({ request }) => {
    await delay(1000)
    const data = (await request.json()) as ModelFormValues

    const newModel: Model = {
      id: `model-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...data,
    }
    models.unshift(newModel)
    return HttpResponse.json(newModel, { status: 201 })
  }),

  // PATCH a model
  http.patch("*/models/:id", async ({ params, request }) => {
    await delay(1000)
    const { id } = params
    const updates = (await request.json()) as Partial<ModelFormValues>

    let updatedModel: Model | undefined
    models = models.map((model) => {
      if (model.id === id) {
        updatedModel = { ...model, ...updates, updatedAt: new Date().toISOString() }
        return updatedModel
      }
      return model
    })

    if (!updatedModel) {
      return new HttpResponse(null, { status: 404 })
    }

    return HttpResponse.json(updatedModel)
  }),

  // DELETE a model
  http.delete("*/models/:id", ({ params }) => {
    const { id } = params
    models = models.filter((m) => m.id !== id)
    return new HttpResponse(null, { status: 204 })
  }),

  // PATCH (bulk update) models
  http.patch("https://api.example.com/models", async ({ request }) => {
    await delay(1000)
    const { ids, data } = (await request.json()) as { ids: string[]; data: Partial<Omit<Model, "id">> }

    models = models.map((model) => {
      if (ids.includes(model.id)) {
        return { ...model, ...data, updatedAt: new Date().toISOString() }
      }
      return model
    })

    return HttpResponse.json({ status: "ok" })
  }),

  // DELETE (bulk) models
  http.delete("https://api.example.com/models", async ({ request }) => {
    await delay(1000)
    const { ids } = (await request.json()) as { ids: string[] }
    models = models.filter((m) => !ids.includes(m.id))
    return HttpResponse.json({ status: "ok" })
  }),

  // GET model options for dropdowns
  http.get("*/models/options", async () => {
    await delay(300)
    const modelOptions = models.map((m) => ({ id: m.id, name: m.name }))
    return HttpResponse.json(modelOptions)
  }),
]
