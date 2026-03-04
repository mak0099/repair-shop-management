import { delay, http, HttpResponse } from "msw";
import { mockQuotations } from "./quotations.mock";
import { Quotation, QuotationFormValues } from "../quotations.schema";

let quotations = [...mockQuotations];

export const quotationHandlers = [
  http.get("*/quotations", async () => {
    await delay(500);
    return HttpResponse.json({
      data: quotations,
      meta: { total: quotations.length }
    });
  }),

  http.post("*/quotations", async ({ request }) => {
    await delay(800);
    const data = (await request.json()) as QuotationFormValues;
    
    const newQuotation: Quotation = {
      ...data,
      id: `quote-${Date.now()}`,
      quotationNumber: `EST-${Math.floor(10000 + Math.random() * 90000)}`,
      createdBy: "staff-001",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    quotations.unshift(newQuotation);
    return HttpResponse.json(newQuotation, { status: 201 });
  }),

  http.delete("*/quotations/:id", async ({ params }) => {
    await delay(400);
    const { id } = params;
    quotations = quotations.filter(q => q.id !== id);
    return new HttpResponse(null, { status: 204 });
  })
];