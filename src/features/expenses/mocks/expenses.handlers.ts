import { delay, http, HttpResponse } from "msw"

import { applySort } from "@/mocks/mock-utils"
import { Expense, ExpenseFormValues } from "../expense.schema"
import { mockExpenses } from "./expenses.mock"
import { mockMasterSettings } from "@/features/master-settings/mocks/master-settings.mock"

let expenses = [...mockExpenses]

export const expenseHandlers = [
  // GET all expenses with pagination and search
  http.get("https://api.example.com/expenses", async ({ request }) => {
    await delay(500)
    const url = new URL(request.url)
    const page = Number(url.searchParams.get("page") || "1")
    const pageSize = Number(url.searchParams.get("pageSize") || "10")
    const search = url.searchParams.get("search")?.toLowerCase() || ""
    const sort = url.searchParams.get("_sort")
    const order = url.searchParams.get("_order")

    const filteredData = expenses.filter((expense) => {
      const searchMatch = expense.title.toLowerCase().includes(search)
      return searchMatch
    })

    const sortedData = applySort(filteredData, sort, order)

    const dataWithCategory = sortedData.map(expense => {
        const category = mockMasterSettings.find(s => s.id === expense.category_id && s.type === 'EXPENSE_CAT');
        return { ...expense, category: category ? {id: category.id, label: category.label, value: category.value} : undefined };
    });

    const total = dataWithCategory.length
    const totalPages = Math.ceil(total / pageSize)
    const start = (page - 1) * pageSize
    const end = start + pageSize
    const paginatedData = dataWithCategory.slice(start, end)

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

  // GET a single expense by ID
  http.get("*/expenses/:id", ({ params }) => {
    const { id } = params
    const expense = expenses.find((e) => e.id === id)
    if (!expense) {
      return new HttpResponse(null, { status: 404 })
    }
    const category = mockMasterSettings.find(s => s.id === expense.category_id && s.type === 'EXPENSE_CAT');
    return HttpResponse.json({ ...expense, category: category ? {id: category.id, label: category.label, value: category.value} : undefined })
  }),

  // POST a new expense
  http.post("https://api.example.com/expenses", async ({ request }) => {
    await delay(1000)
    const formData = await request.formData()
    const attachmentFile = formData.get("attachment_url");
    let attachmentUrl: string | undefined = undefined;

    if (attachmentFile instanceof File) {
        attachmentUrl = URL.createObjectURL(attachmentFile);
    } else if (typeof attachmentFile === 'string') {
        attachmentUrl = attachmentFile;
    }

    const data = Object.fromEntries(formData.entries()) as any;

    const newExpense: Expense = {
      id: `exp-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      title: data.title,
      amount: Number(data.amount),
      date: new Date(data.date).toISOString(),
      category_id: data.category_id,
      branch_id: data.branch_id,
      notes: data.notes,
      attachment_url: attachmentUrl,
    }
    expenses.unshift(newExpense)
    return HttpResponse.json(newExpense, { status: 201 })
  }),

  // POST for update
  http.post("*/expenses/:id", async ({ params, request }) => {
    await delay(1000)
    const { id } = params;
    const formData = await request.formData()
    
    const updates = Object.fromEntries(formData.entries()) as any;
    
    const attachmentFile = formData.get("attachment_url");

    if (attachmentFile instanceof File) {
        updates.attachment_url = URL.createObjectURL(attachmentFile);
    } else if (formData.get("attachment_url") === "null") {
        updates.attachment_url = null;
    } else {
        delete updates.attachment_url; // Don't update if not changed
    }
    
    let updatedExpense: Expense | undefined
    expenses = expenses.map((expense) => {
      if (expense.id === id) {
        updatedExpense = { 
            ...expense, 
            ...updates,
            amount: Number(updates.amount),
            date: new Date(updates.date).toISOString(),
            updatedAt: new Date().toISOString() 
        }
        return updatedExpense
      }
      return expense
    })

    if (!updatedExpense) {
      return new HttpResponse(null, { status: 404 })
    }

    return HttpResponse.json(updatedExpense)
  }),

  // DELETE an expense
  http.delete("*/expenses/:id", ({ params }) => {
    const { id } = params
    expenses = expenses.filter((e) => e.id !== id)
    return new HttpResponse(null, { status: 204 })
  }),

  // DELETE (bulk) expenses
  http.delete("https://api.example.com/expenses", async ({ request }) => {
    await delay(1000)
    const { ids } = (await request.json()) as { ids: string[] }
    expenses = expenses.filter((e) => !ids.includes(e.id))
    return HttpResponse.json({ status: "ok" })
  }),

  // GET expense options for dropdowns
  http.get("*/expenses/options", async () => {
    await delay(300)
    const expenseOptions = expenses.map((e) => ({ id: e.id, title: e.title }))
    return HttpResponse.json(expenseOptions)
  }),
]
