import { delay, http, HttpResponse } from "msw"

import { applySort } from "@/mocks/mock-utils"
import { Category, CategoryFormValues } from "../category.schema"
import { mockCategories } from "./categories.mock"

let categories = [...mockCategories]

export const categoryHandlers = [
  // GET all categories with pagination and search
  http.get("*/categories", async ({ request }) => {
    await delay(500)
    const url = new URL(request.url)
    const page = Number(url.searchParams.get("page") || "1")
    const pageSize = Number(url.searchParams.get("pageSize") || "10")
    const search = url.searchParams.get("search")?.toLowerCase() || ""
    const sort = url.searchParams.get("_sort")
    const order = url.searchParams.get("_order")
    const status = url.searchParams.get("status")

    const filteredData = categories.filter((category) => {
      const searchMatch = category.name.toLowerCase().includes(search)
      const statusMatch = !status || status === "all" || (category.isActive ? "active" : "inactive") === status
      return searchMatch && statusMatch
    })

    const sortedData = applySort(filteredData, sort, order)
    
    const dataWithParent = sortedData.map(category => {
        const parent = categories.find(c => c.id === category.parent_id);
        return { ...category, parent: parent ? {id: parent.id, name: parent.name} : undefined };
    });

    const total = dataWithParent.length
    const totalPages = Math.ceil(total / pageSize)
    const start = (page - 1) * pageSize
    const end = start + pageSize
    const paginatedData = dataWithParent.slice(start, end)

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

  // GET category options for dropdowns
  http.get("*/categories/options", async ({ request }) => {
    await delay(300)
    const url = new URL(request.url)
    const parentId = url.searchParams.get("parentId")

    let options = categories
    if(parentId) {
        options = categories.filter(c => c.parent_id === parentId)
    } else {
        options = categories.filter(c => !c.parent_id)
    }

    const categoryOptions = options.map((c) => ({ id: c.id, name: c.name }))
    return HttpResponse.json(categoryOptions)
  }),

  // GET a single category by ID
  http.get("*/categories/:id", ({ params }) => {
    const { id } = params
    const category = categories.find((c) => c.id === id)
    if (!category) {
      return new HttpResponse(null, { status: 404 })
    }
    const parent = categories.find(c => c.id === category.parent_id);
    return HttpResponse.json({ ...category, parent: parent ? {id: parent.id, name: parent.name} : undefined })
  }),

  // POST a new category
  http.post("*/categories", async ({ request }) => {
    await delay(1000)
    const data = (await request.json()) as CategoryFormValues

    const newCategory: Category = {
      id: `cat-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...data,
    }
    categories.unshift(newCategory)
    return HttpResponse.json(newCategory, { status: 201 })
  }),

  // PATCH a category
  http.patch("*/categories/:id", async ({ params, request }) => {
    await delay(1000)
    const { id } = params
    const updates = (await request.json()) as Partial<CategoryFormValues>

    let updatedCategory: Category | undefined
    categories = categories.map((category) => {
      if (category.id === id) {
        updatedCategory = { ...category, ...updates, updatedAt: new Date().toISOString() }
        return updatedCategory
      }
      return category
    })

    if (!updatedCategory) {
      return new HttpResponse(null, { status: 404 })
    }

    return HttpResponse.json(updatedCategory)
  }),

  // DELETE a category
  http.delete("*/categories/:id", ({ params }) => {
    const { id } = params
    categories = categories.filter((c) => c.id !== id)
    return new HttpResponse(null, { status: 204 })
  }),

  // PATCH (bulk update) categories
  http.patch("*/categories", async ({ request }) => {
    await delay(1000)
    const { ids, data } = (await request.json()) as { ids: string[]; data: Partial<Omit<Category, "id">> }

    categories = categories.map((category) => {
      if (ids.includes(category.id)) {
        return { ...category, ...data, updatedAt: new Date().toISOString() }
      }
      return category
    })

    return HttpResponse.json({ status: "ok" })
  }),

  // DELETE (bulk) categories
  http.delete("*/categories", async ({ request }) => {
    await delay(1000)
    const { ids } = (await request.json()) as { ids: string[] }
    categories = categories.filter((c) => !ids.includes(c.id))
    return HttpResponse.json({ status: "ok" })
  }),
]
