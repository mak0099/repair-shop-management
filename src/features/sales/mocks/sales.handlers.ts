import { delay, http, HttpResponse } from "msw"
import { mockPOSProducts } from "./products.mock"
import { mockSales } from "./sales.mock"
import { Sale, SaleFormValues } from "../sales.schema"

const salesHistory = [...mockSales];

export const salesHandlers = [
  // POS Search API
  http.get("*/pos/products", async () => {
    await delay(300);
    return HttpResponse.json({ data: mockPOSProducts });
  }),

  // Sales History API
  http.get("*/sales", async () => {
    await delay(500);
    return HttpResponse.json({
      data: salesHistory,
      meta: { total: salesHistory.length }
    });
  }),

  // Create Sale API
  http.post("*/sales", async ({ request }) => {
    await delay(800);
    const data = (await request.json()) as SaleFormValues;
    const newSale = {
      ...data,
      id: `inv-${Date.now()}`,
      invoiceNumber: `INV-${Math.floor(Math.random() * 90000)}`,
      createdAt: new Date().toISOString(),
    } as Sale;
    salesHistory.unshift(newSale);
    return HttpResponse.json(newSale, { status: 201 });
  })
];