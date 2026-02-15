import { delay, http, HttpResponse } from "msw"

import { applySort } from "@/mocks/mock-utils"
import { MasterSetting, MasterSettingFormValues } from "../master-setting.schema"
import { mockMasterSettings } from "./master-settings.mock"

let settings = [...mockMasterSettings]

export const masterSettingHandlers = [
  // GET all settings with pagination and search
  http.get("https://api.example.com/master-settings", async ({ request }) => {
    await delay(500)
    const url = new URL(request.url)
    const page = Number(url.searchParams.get("page") || "1")
    const pageSize = Number(url.searchParams.get("pageSize") || "10")
    const search = url.searchParams.get("search")?.toLowerCase() || ""
    const sort = url.searchParams.get("_sort")
    const order = url.searchParams.get("_order")
    const status = url.searchParams.get("status")
    const type = url.searchParams.get("type")

    const filteredData = settings.filter((setting) => {
      const searchMatch =
        setting.label.toLowerCase().includes(search) ||
        setting.value.toLowerCase().includes(search)
      const statusMatch = !status || status === "all" || (setting.isActive ? "active" : "inactive") === status
      const typeMatch = !type || type === "all" || setting.type === type
      return searchMatch && statusMatch && typeMatch
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

  // GET a single setting by ID
  http.get("*/master-settings/:id", ({ params }) => {
    const { id } = params
    const setting = settings.find((s) => s.id === id)
    if (!setting) {
      return new HttpResponse(null, { status: 404 })
    }
    return HttpResponse.json(setting)
  }),

  // POST a new setting
  http.post("https://api.example.com/master-settings", async ({ request }) => {
    await delay(1000)
    const data = (await request.json()) as MasterSettingFormValues

    const newSetting: MasterSetting = {
      id: `setting-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...data,
    }
    settings.unshift(newSetting)
    return HttpResponse.json(newSetting, { status: 201 })
  }),

  // PATCH a setting
  http.patch("*/master-settings/:id", async ({ params, request }) => {
    await delay(1000)
    const { id } = params
    const updates = (await request.json()) as Partial<MasterSettingFormValues>

    let updatedSetting: MasterSetting | undefined
    settings = settings.map((setting) => {
      if (setting.id === id) {
        updatedSetting = { ...setting, ...updates, updatedAt: new Date().toISOString() }
        return updatedSetting
      }
      return setting
    })

    if (!updatedSetting) {
      return new HttpResponse(null, { status: 404 })
    }

    return HttpResponse.json(updatedSetting)
  }),

  // DELETE a setting
  http.delete("*/master-settings/:id", ({ params }) => {
    const { id } = params
    settings = settings.filter((s) => s.id !== id)
    return new HttpResponse(null, { status: 204 })
  }),

  // PATCH (bulk update) settings
  http.patch("https://api.example.com/master-settings", async ({ request }) => {
    await delay(1000)
    const { ids, data } = (await request.json()) as { ids: string[]; data: Partial<Omit<MasterSetting, "id">> }

    settings = settings.map((setting) => {
      if (ids.includes(setting.id)) {
        return { ...setting, ...data, updatedAt: new Date().toISOString() }
      }
      return setting
    })

    return HttpResponse.json({ status: "ok" })
  }),

  // DELETE (bulk) settings
  http.delete("https://api.example.com/master-settings", async ({ request }) => {
    await delay(1000)
    const { ids } = (await request.json()) as { ids: string[] }
    settings = settings.filter((s) => !ids.includes(s.id))
    return HttpResponse.json({ status: "ok" })
  }),

  // GET setting options for dropdowns
  http.get("*/master-settings/options", async ({ request }) => {
    await delay(300)
    const url = new URL(request.url)
    const type = url.searchParams.get("type")
    
    let options = settings
    if(type) {
        options = settings.filter(s => s.type === type)
    }

    const settingOptions = options.map((s) => ({ id: s.id, label: s.label, value: s.value }))
    return HttpResponse.json(settingOptions)
  }),
]
