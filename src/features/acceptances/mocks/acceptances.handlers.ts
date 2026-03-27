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
            customer: customer ? { 
              id: customer.id, 
              name: customer.name, 
              mobile: customer.mobile, 
              phone: customer.phone,
            } : undefined,
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

  // POST Request Mock - Handle both JSON and FormData with logs
  http.post('*/acceptances', async ({ request }) => {
    let body: any;
    const contentType = request.headers.get('content-type');

    // Handle FormData (sent from axios with convertToFormData)
    if (contentType?.includes('multipart/form-data')) {
      const formData = await request.formData();
      body = {};
      
      // Convert FormData to object
      for (const [key, value] of formData.entries()) {
        // Parse stringified JSON arrays/objects
        if (typeof value === 'string' && (value.startsWith('[') || value.startsWith('{'))) {
          try {
            body[key] = JSON.parse(value);
          } catch {
            body[key] = value;
          }
        } else {
          body[key] = value;
        }
      }
    } else {
      // Handle regular JSON
      body = await request.json();
    }

    // Ensure logs are arrays of objects, not strings
    // First handle stringified JSON from FormData, then parse individual entries
    const parsedOpLogs = typeof body.operationalLogs === 'string' 
      ? JSON.parse(body.operationalLogs) 
      : body.operationalLogs;

    const operationalLogs = Array.isArray(parsedOpLogs) 
      ? parsedOpLogs.map((log: any) => 
          typeof log === 'string' ? JSON.parse(log) : log
        )
      : [];

    const parsedTLogs = typeof body.timelineLogs === 'string' 
      ? JSON.parse(body.timelineLogs) 
      : body.timelineLogs;

    const timelineLogs = Array.isArray(parsedTLogs)
      ? parsedTLogs.map((log: any) =>
          typeof log === 'string' ? JSON.parse(log) : log
        )
      : [];

    // Create new acceptance without logs first, then add them explicitly
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const newAcceptance: Acceptance = {
      id: `rec-${Math.random().toString(36).substring(7)}`,
      // Copy all body fields except logs
      ...Object.fromEntries(
        Object.entries(body).filter(([key]) => key !== 'operationalLogs' && key !== 'timelineLogs')
      ),
      // Add computed/default fields
      acceptanceNumber: `${Math.floor(Math.random() * 10000)}-${new Date().getFullYear()}`,
      acceptanceDate: body.acceptanceDate ? new Date(body.acceptanceDate) : new Date(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      // Explicitly set logs
      operationalLogs,
      timelineLogs,
    } as any;

    acceptances.unshift(newAcceptance);

    // Populate related data for response
    const customer = mockCustomers.find(c => c.id === newAcceptance.customerId);
    const brand = mockBrands.find(b => b.id === newAcceptance.brandId);
    const model = mockModels.find(m => m.id === newAcceptance.modelId);
    const technician = newAcceptance.technicianId ? mockUsers.find(u => u.id === newAcceptance.technicianId) : undefined;

    // Build response by explicitly including all fields
    const response = {
      id: newAcceptance.id,
      acceptanceNumber: newAcceptance.acceptanceNumber,
      customerId: newAcceptance.customerId,
      brandId: newAcceptance.brandId,
      modelId: newAcceptance.modelId,
      technicianId: newAcceptance.technicianId,
      currentStatus: newAcceptance.currentStatus,
      acceptanceDate: newAcceptance.acceptanceDate,
      estimatedPrice: newAcceptance.estimatedPrice,
      advancePayment: newAcceptance.advancePayment,
      finalPayment: newAcceptance.finalPayment,
      totalCost: newAcceptance.totalCost,
      balanceDue: newAcceptance.balanceDue,
      defectDescription: newAcceptance.defectDescription,
      notes: newAcceptance.notes,
      imei: newAcceptance.imei,
      secondaryImei: newAcceptance.secondaryImei,
      color: newAcceptance.color,
      accessories: newAcceptance.accessories,
      deviceType: newAcceptance.deviceType,
      partsUsed: newAcceptance.partsUsed,
      createdAt: newAcceptance.createdAt,
      updatedAt: newAcceptance.updatedAt,
      // Explicitly include logs
      operationalLogs: operationalLogs,
      timelineLogs: timelineLogs,
      // Populated data
      customer: customer ? { 
        id: customer.id, 
        name: customer.name, 
        mobile: customer.mobile, 
        phone: customer.phone,
      } : undefined,
      brand: brand ? { id: brand.id, name: brand.name } : undefined,
      model: model ? { id: model.id, name: model.name } : undefined,
      technician: technician ? { id: technician.id, name: technician.name } : undefined,
    };

    return HttpResponse.json(response, { status: 201 });
  }),

  // PUT Request Mock (Update) - Handle both JSON and FormData with logs
  http.put('*/acceptances/:id', async ({ params, request }) => {
    const { id } = params;
    let body: any;
    const contentType = request.headers.get('content-type');

    // Handle FormData
    if (contentType?.includes('multipart/form-data')) {
      const formData = await request.formData();
      body = {};
      
      // Convert FormData to object
      for (const [key, value] of formData.entries()) {
        if (typeof value === 'string' && (value.startsWith('[') || value.startsWith('{'))) {
          try {
            body[key] = JSON.parse(value);
          } catch {
            body[key] = value;
          }
        } else {
          body[key] = value;
        }
      }
    } else {
      // Handle regular JSON
      body = await request.json();
    }

    // Parse logs if they're stringified from FormData
    let operationalLogs = [];
    if (body.operationalLogs) {
      const parsed = typeof body.operationalLogs === 'string' 
        ? JSON.parse(body.operationalLogs) 
        : body.operationalLogs;
      if (Array.isArray(parsed)) {
        operationalLogs = parsed.map((log: any) =>
          typeof log === 'string' ? JSON.parse(log) : log
        );
      }
    }

    let timelineLogs = [];
    if (body.timelineLogs) {
      const parsed = typeof body.timelineLogs === 'string' 
        ? JSON.parse(body.timelineLogs) 
        : body.timelineLogs;
      if (Array.isArray(parsed)) {
        timelineLogs = parsed.map((log: any) =>
          typeof log === 'string' ? JSON.parse(log) : log
        );
      }
    }

    const index = acceptances.findIndex(acc => acc.id === id);
    if (index !== -1) {
      // Merge logs with existing logs (prepend new logs)
      const existingAcceptance = acceptances[index];
      const mergedData = {
        ...existingAcceptance,
        ...body,
        operationalLogs: [
          ...operationalLogs,
          ...(existingAcceptance.operationalLogs || []),
        ],
        timelineLogs: [
          ...timelineLogs,
          ...(existingAcceptance.timelineLogs || []),
        ],
        updatedAt: new Date().toISOString(),
      };
      acceptances[index] = mergedData;

      // Populate related data for response
      const customer = mockCustomers.find(c => c.id === mergedData.customerId);
      const brand = mockBrands.find(b => b.id === mergedData.brandId);
      const model = mockModels.find(m => m.id === mergedData.modelId);
      const technician = mergedData.technicianId ? mockUsers.find(u => u.id === mergedData.technicianId) : undefined;

      const populatedAcceptance: Acceptance = {
        ...mergedData,
        // Explicitly preserve logs
        operationalLogs: mergedData.operationalLogs,
        timelineLogs: mergedData.timelineLogs,
        customer: customer ? { 
          id: customer.id, 
          name: customer.name, 
          mobile: customer.mobile, 
          phone: customer.phone,
        } : undefined,
        brand: brand ? { id: brand.id, name: brand.name } : undefined,
        model: model ? { id: model.id, name: model.name } : undefined,
        technician: technician ? { id: technician.id, name: technician.name } : undefined,
      };

      // Ensure logs are definitely in the response
      const responseData = {
        ...populatedAcceptance,
        operationalLogs: mergedData.operationalLogs || [],
        timelineLogs: mergedData.timelineLogs || [],
      };

      return HttpResponse.json(responseData);
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
