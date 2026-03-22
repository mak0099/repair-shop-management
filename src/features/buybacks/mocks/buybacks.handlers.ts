import { delay, http, HttpResponse } from "msw";
import { mockBuybacks } from "./buybacks.mock";
import { Buyback, BuybackFormValues } from "../buyback.schema";
import { mockCustomers } from "@/features/customers/mocks/customers.mock";

let buybacks = [...mockBuybacks];

export const buybackHandlers = [
  http.get("*/buybacks", async ({ request }) => {
    await delay(300);
    const url = new URL(request.url);
    const search = url.searchParams.get("search")?.toLowerCase() || "";

    const populatedBuybacks = buybacks.map(bb => {
      const customer = mockCustomers.find(c => c.id === bb.customerId);
      return {
        ...bb,
        customer: customer ? { id: customer.id, name: customer.name } : undefined,
      };
    });

    const filteredData = populatedBuybacks.filter(bb => {
      if (!search) return true;
      return (
        bb.buybackNumber.toLowerCase().includes(search) ||
        (bb.customer?.name || "").toLowerCase().includes(search)
      );
    });

    return HttpResponse.json({
      data: filteredData,
      meta: { total: filteredData.length }
    });
  }),

  http.get("*/buybacks/:id", async ({ params }) => {
    const { id } = params;
    const buyback = buybacks.find(b => b.id === id);
    if (!buyback) return new HttpResponse(null, { status: 404 });
    return HttpResponse.json(buyback);
  }),

  http.post("*/buybacks", async ({ request }) => {
    await delay(1000);
    const data = (await request.json()) as BuybackFormValues;
    
    const newBuyback: Buyback = {
      ...data,
      id: `bb-${Date.now()}`,
      buybackNumber: `BB-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as Buyback;
    
    buybacks.unshift(newBuyback);
    return HttpResponse.json(newBuyback, { status: 201 });
  }),

  http.put("*/buybacks/:id", async ({ params, request }) => {
    const { id } = params;
    const body = await request.json() as Partial<Buyback>;
    const index = buybacks.findIndex(b => b.id === id);
    if (index !== -1) {
        buybacks[index] = { ...buybacks[index], ...body, updatedAt: new Date().toISOString() };
        return HttpResponse.json(buybacks[index]);
    }
    return HttpResponse.json({ message: 'Not found' }, { status: 404 });
  }),

  http.delete("*/buybacks/:id", async ({ params }) => {
    const { id } = params;
    buybacks = buybacks.filter(b => b.id !== id);
    return new HttpResponse(null, { status: 204 });
  }),
];