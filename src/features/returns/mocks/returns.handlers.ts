import { delay, http, HttpResponse } from "msw"
import { mockReturns } from "./returns.mock"
import { SaleReturn, ReturnFormValues } from "../returns.schema"
import { mockCustomers } from "@/features/customers/mocks/customers.mock"

// Local state for our mock returns history
let returnsHistory = [...mockReturns];

export const returnsHandlers = [
  /**
   * Get Returns History (All Returns List)
   */
  http.get("*/returns", async () => {
    await delay(500);
    
    // Enrich with customerName
    const enrichedReturns = returnsHistory.map(r => {
      const customer = mockCustomers.find(c => c.id === r.customerId);
      return {
        ...r,
        customerName: customer?.name || "Unknown Customer"
      };
    });

    return HttpResponse.json({
      data: enrichedReturns,
      meta: { total: returnsHistory.length }
    });
  }),

  /**
   * Get a Single Return by ID
   */
  http.get("*/returns/:id", async ({ params }) => {
    await delay(300);
    const { id } = params;
    const item = returnsHistory.find(r => r.id === id);
    
    if (!item) {
      return new HttpResponse(null, { status: 404 });
    }
    
    const customer = mockCustomers.find(c => c.id === item.customerId);
    
    return HttpResponse.json({
        ...item,
        customerName: customer?.name || "Unknown Customer"
    });
  }),

  /**
   * Process a New Sales Return
   */
  http.post("*/returns", async ({ request }) => {
    await delay(800);
    const data = (await request.json()) as ReturnFormValues;
    
    const customer = mockCustomers.find(c => c.id === data.customerId);
    
    // Construct the full return object with server-side fields
    const newReturn: SaleReturn = {
      ...data,
      id: `ret-${Date.now()}`,
      returnNumber: `RET-${Math.floor(1000 + Math.random() * 9000)}`,
      processedBy: "staff-001",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      customerName: customer?.name || "Unknown Customer"
    };
    
    returnsHistory.unshift(newReturn);
    return HttpResponse.json(newReturn, { status: 201 });
  }),

  /**
   * Delete a Return Record
   */
  http.delete("*/returns/:id", async ({ params }) => {
    await delay(400);
    const { id } = params;
    returnsHistory = returnsHistory.filter(r => r.id !== id);
    
    return new HttpResponse(null, { status: 204 });
  })
];