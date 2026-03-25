// src/features/acceptances/mocks/acceptances.handlers.ts

import { http, HttpResponse, delay } from 'msw';
import { mockAcceptances } from './acceptances.mock';
import { mockCustomers } from '@/features/customers/mocks/customers.mock';
import { Acceptance } from '../acceptance.schema';
import { mockBrands } from '@/features/brands/mocks/brands.mock';
import { mockModels } from '@/features/models/mocks/models.mock';
import { mockUsers } from '@/features/users/mocks/users.mock';

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
    const customerId = url.searchParams.get("customerId");
    const brandId = url.searchParams.get("brandId");
    const modelId = url.searchParams.get("modelId");
    const acceptanceDate = url.searchParams.get("acceptanceDate");

    // Populate related data for display in the list
    const populatedAcceptances = acceptances.map(acceptance => {
        const customer = mockCustomers.find(c => c.id === acceptance.customerId);
        const brand = mockBrands.find(b => b.id === acceptance.brandId);
        const model = mockModels.find(m => m.id === acceptance.modelId);
        const technician = acceptance.technicianId ? mockUsers.find(u => u.id === acceptance.technicianId) : undefined;
        return {
            ...acceptance,
            customer: customer ? { id: customer.id, name: customer.name, mobile: customer.mobile, phone: customer.phone } : undefined,
            brand: brand ? { id: brand.id, name: brand.name } : undefined,
            model: model ? { id: model.id, name: model.name } : undefined,
            technician: technician ? { id: technician.id, name: technician.name } : undefined,
        };
    });

    const filteredData = populatedAcceptances.filter(acceptance => {
        const searchMatch = search 
            ? acceptance.acceptanceNumber.toLowerCase().includes(search) ||
              (acceptance.customer?.name?.toLowerCase() || "").includes(search) ||
              (acceptance.customer?.mobile || "").includes(search) ||
              (acceptance.customer?.phone || "").includes(search) ||
              (acceptance.imei || "").toLowerCase().includes(search)
            : true;

        const statusMatch = !status || status === 'all' || String(acceptance.currentStatus) === String(status);
        const customerMatch = !customerId || customerId === 'all' || String(acceptance.customerId) === String(customerId);
        const brandMatch = !brandId || brandId === 'all' || String(acceptance.brandId) === String(brandId);
        const modelMatch = !modelId || modelId === 'all' || String(acceptance.modelId) === String(modelId);

        let dateMatch = true;
        if (acceptanceDate && acceptanceDate !== "undefined" && acceptanceDate !== "null") {
            const [fromStr, toStr] = acceptanceDate.split(",");
            if (fromStr && toStr) {
                const fromDate = new Date(`${fromStr}T00:00:00`).getTime();
                const toDate = new Date(`${toStr}T23:59:59.999`).getTime();
                const currentAccDate = new Date(acceptance.acceptanceDate).getTime();
                dateMatch = currentAccDate >= fromDate && currentAccDate <= toDate;
            }
        }

        return searchMatch && statusMatch && customerMatch && brandMatch && modelMatch && dateMatch;
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
