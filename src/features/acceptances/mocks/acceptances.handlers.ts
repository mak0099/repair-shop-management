// src/features/acceptances/mocks/acceptances.handlers.ts

import { http, HttpResponse, delay } from 'msw';
import { mockAcceptances } from './acceptances.mock';
import { mockCustomers } from '@/features/customers/mocks/customers.mock';
import { Acceptance } from '../acceptance.schema';
import { mockBrands } from '@/features/brands/mocks/brands.mock';
import { mockModels } from '@/features/models/mocks/models.mock';

// In-memory store for mock operations
let acceptances = [...mockAcceptances];

export const acceptanceHandlers = [
  // GET all acceptances with pagination, search, and filtering
  http.get('*/acceptances', async ({ request }) => {
    await delay(300);
    const url = new URL(request.url);
    const page = Number(url.searchParams.get("page") || "1");
    const pageSize = Number(url.searchParams.get("pageSize") || "10");
    const search = url.searchParams.get("search")?.toLowerCase() || "";
    const status = url.searchParams.get("currentStatus");

    // Populate related data for display in the list
    const populatedAcceptances = acceptances.map(acceptance => {
        const customer = mockCustomers.find(c => c.id === acceptance.customerId);
        const brand = mockBrands.find(b => b.id === acceptance.brandId);
        const model = mockModels.find(m => m.id === acceptance.modelId);
        return {
            ...acceptance,
            customer: customer ? { id: customer.id, name: customer.name } : undefined,
            brand: brand ? { id: brand.id, name: brand.name } : undefined,
            model: model ? { id: model.id, name: model.name } : undefined,
        };
    });

    const filteredData = populatedAcceptances.filter(acceptance => {
        const searchMatch = search 
            ? acceptance.acceptanceNumber.toLowerCase().includes(search) ||
              acceptance.customer?.name.toLowerCase().includes(search) ||
              (acceptance.imei || "").toLowerCase().includes(search)
            : true;

        const statusMatch = !status || status === 'all' || acceptance.currentStatus === status;

        return searchMatch && statusMatch;
    });

    const total = filteredData.length;
    const totalPages = Math.ceil(total / pageSize);
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginatedData = filteredData.slice(start, end);

    return HttpResponse.json({
      data: paginatedData,
      meta: {
        total,
        page,
        pageSize,
        totalPages,
      },
    });
  }),

  // POST Request Mock
  http.post('*/acceptances', async ({ request }) => {
    const body = await request.json() as Omit<Acceptance, "id" | "acceptanceNumber">;
    const newAcceptance: Acceptance = {
      id: `rec-${Math.random().toString(36).substring(7)}`,
      ...body,
      acceptanceNumber: `${Math.floor(Math.random() * 10000)}-${new Date().getFullYear()}`,
      acceptanceDate: new Date(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    acceptances.unshift(newAcceptance);
    return HttpResponse.json(newAcceptance, { status: 201 });
  }),

  // PUT Request Mock (Update)
  http.put('*/acceptances/:id', async ({ params, request }) => {
    const { id } = params;
    const body = await request.json() as Partial<Acceptance>;
    const index = acceptances.findIndex(acc => acc.id === id);
    if (index !== -1) {
        acceptances[index] = { ...acceptances[index], ...body, updatedAt: new Date().toISOString() };
        return HttpResponse.json(acceptances[index]);
    }
    return HttpResponse.json({ message: 'Not found' }, { status: 404 });
  }),

  // DELETE Request Mock
  http.delete('*/acceptances/:id', ({ params }) => {
    const { id } = params;
    const initialLength = acceptances.length;
    acceptances = acceptances.filter(acc => acc.id !== id);
    if (acceptances.length < initialLength) {
        return new HttpResponse(null, { status: 204 });
    }
    return HttpResponse.json({ message: 'Not found' }, { status: 404 });
  }),
];
