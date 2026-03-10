import { delay, http, HttpResponse } from "msw";
import { mockQuotations } from "./quotations.mock";
import { Quotation, QuotationFormValues } from "../quotations.schema";
import { mockItems } from "@/features/items";
import { mockCustomers } from "@/features/customers/mocks/customers.mock";

let quotations = [...mockQuotations];

export const quotationHandlers = [
  http.get("*/quotations", async () => {
    await delay(500);
    
    // Enrich quotations with customerName from mockCustomers
    const enrichedQuotations = quotations.map(q => {
      const customer = mockCustomers.find(c => c.id === q.customerId);
      return {
        ...q,
        customerName: customer?.name || "Unknown Customer"
      };
    });

    return HttpResponse.json({
      data: enrichedQuotations,
      meta: { total: quotations.length }
    });
  }),

  http.get("*/items/:id", async ({ params }) => {
    await delay(300); // হালকা ডিলে যাতে লোডার দেখা যায়
    const { id } = params;
    
    // মক আইটেম লিস্ট থেকে খুঁজে বের করা
    const item = mockItems.find(i => i.id === id);

    if (!item) {
      return new HttpResponse(JSON.stringify({ message: "Item not found" }), { 
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return HttpResponse.json(item);
  }),

  http.post("*/quotations", async ({ request }) => {
    await delay(800);
    const data = (await request.json()) as QuotationFormValues;
    
    // Enrich with customer name immediately upon creation
    const customer = mockCustomers.find(c => c.id === data.customerId);
    
    const newQuotation: Quotation = {
      ...data,
      id: `quote-${Date.now()}`,
      quotationNumber: `EST-${Math.floor(10000 + Math.random() * 90000)}`,
      createdBy: "staff-001",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      customerName: customer?.name || "Unknown Customer"
    };
    
    quotations.unshift(newQuotation);
    return HttpResponse.json(newQuotation, { status: 201 });
  }),

  http.patch("*/quotations/:id", async ({ params, request }) => {
    await delay(600);
    const { id } = params;
    const data = (await request.json()) as Partial<QuotationFormValues>;
    
    const index = quotations.findIndex(q => q.id === id);
    if (index === -1) return new HttpResponse(null, { status: 404 });

    const updatedQuote = { ...quotations[index], ...data, updatedAt: new Date().toISOString() };
    
    // Enrich with customer name
    if (updatedQuote.customerId) {
        const customer = mockCustomers.find(c => c.id === updatedQuote.customerId);
        updatedQuote.customerName = customer?.name || "Unknown Customer";
    }

    quotations[index] = updatedQuote;
    return HttpResponse.json(updatedQuote);
  }),

  http.delete("*/quotations/:id", async ({ params }) => {
    await delay(400);
    const { id } = params;
    quotations = quotations.filter(q => q.id !== id);
    return new HttpResponse(null, { status: 204 });
  })
];