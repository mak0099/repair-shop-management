// src/features/khata/mocks/khata.handlers.ts
"use client"

import { delay, http, HttpResponse } from "msw"
import { applySort } from "@/mocks/mock-utils"
import { mockKhataEntries } from "./khata.mock"
import { KhataEntry, KhataFormValues } from "../khata.schema"

let khataEntries = [...mockKhataEntries]

export const khataHandlers = [
  // 1. GET all entries with direction, type, and partyId filtering
  http.get("*/khata", async ({ request }) => {
    await delay(500)
    const url = new URL(request.url)
    
    // Parse query parameters
    const page = parseInt(url.searchParams.get("page") || "1", 10)
    const pageSize = parseInt(url.searchParams.get("pageSize") || "10", 10)
    const search = url.searchParams.get("search") || ""
    const sort = url.searchParams.get("_sort")
    const order = url.searchParams.get("_order")
    
    // New Filters from UI
    const direction = url.searchParams.get("direction")
    const type = url.searchParams.get("type")
    const partyId = url.searchParams.get("partyId")

    let filteredData = [...khataEntries]

    // A. Search Filter (Party Name or Reference)
    if (search) {
      const lowerSearch = search.toLowerCase()
      filteredData = filteredData.filter(e => 
        e.partyName?.toLowerCase().includes(lowerSearch) || 
        e.referenceId?.toLowerCase().includes(lowerSearch) ||
        e.note?.toLowerCase().includes(lowerSearch)
      )
    }

    // B. Direction Filter (IN/OUT)
    if (direction && direction !== "all") {
      filteredData = filteredData.filter(e => e.direction === direction)
    }

    // C. Type Filter (PURCHASE, SALE, etc.)
    if (type && type !== "all") {
      filteredData = filteredData.filter(e => e.type === type)
    }

    // D. Party Specific Filter (For Ledger View)
    if (partyId && partyId !== "undefined" && partyId !== "null") {
      filteredData = filteredData.filter(e => e.partyId === partyId)
    }

    // E. Apply Sorting
    const sortedData = applySort(filteredData, sort, order)
    
    const total = sortedData.length
    const paginatedData = sortedData.slice((page - 1) * pageSize, page * pageSize)

    return HttpResponse.json({
      data: paginatedData,
      meta: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    })
  }),

  // 2. POST a new transaction
  http.post("*/khata", async ({ request }) => {
    try {
      await delay(800)
      const data = (await request.json()) as KhataFormValues
      
      const newEntry: KhataEntry = {
        id: `trx-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        balanceAfter: 0, // In real DB, this is calculated based on last balance
        ...data,
      } as KhataEntry

      khataEntries.unshift(newEntry)
      return HttpResponse.json(newEntry, { status: 201 })
    } catch (error) {
      return HttpResponse.json({ message: "Failed to create entry" }, { status: 400 })
    }
  }),

  // 3. PATCH (Update) an entry
  http.patch("*/khata/:id", async ({ params, request }) => {
    await delay(500)
    const { id } = params
    const data = (await request.json()) as Partial<KhataFormValues>
    
    const index = khataEntries.findIndex(e => e.id === id)
    if (index === -1) return new HttpResponse(null, { status: 404 })

    const updatedEntry = {
      ...khataEntries[index],
      ...data,
      updatedAt: new Date().toISOString()
    }
    khataEntries[index] = updatedEntry

    return HttpResponse.json(updatedEntry)
  }),

  // 4. DELETE (Single)
  http.delete("*/khata/:id", async ({ params }) => {
    const { id } = params
    khataEntries = khataEntries.filter(e => e.id !== id)
    return new HttpResponse(null, { status: 204 })
  }),

  // 5. DELETE (Bulk)
  http.delete("*/khata", async ({ request }) => {
    try {
      await delay(1000)
      const { ids } = (await request.json()) as { ids: string[] }
      khataEntries = khataEntries.filter((e) => !ids.includes(e.id))
      return HttpResponse.json({ status: "ok" })
    } catch (error) {
      return HttpResponse.json({ message: "Bulk delete failed" }, { status: 500 })
    }
  }),
]