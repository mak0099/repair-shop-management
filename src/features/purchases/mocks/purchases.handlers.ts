import { delay, http, HttpResponse } from "msw"
import { mockPurchases } from "./purchases.mock"
import { mockItems } from "@/features/items/mocks/items.mock"
import { ProductPurchase, PurchaseFormValues } from "../purchases.schema"

let purchases = [...mockPurchases];

export const purchaseHandlers = [
  // Get List
  http.get("*/purchases", async () => {
    await delay(500);
    return HttpResponse.json({
      data: purchases,
      meta: { total: purchases.length }
    });
  }),

  // Get One
  http.get("*/purchases/:id", async ({ params }) => {
    const { id } = params;
    const purchase = purchases.find(p => p.id === id);
    if (!purchase) return new HttpResponse(null, { status: 404 });
    return HttpResponse.json(purchase);
  }),

  // Create Purchase
  http.post("*/purchases", async ({ request }) => {
    await delay(1000);
    const data = (await request.json()) as PurchaseFormValues;
    
    const newPurchase: ProductPurchase = {
      ...data,
      id: `pur-${Date.now()}`,
      // ২০২৬ সাল অনুযায়ী ইনভয়েস নম্বর জেনারেশন
      purchaseNumber: `PUR-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as ProductPurchase;
    
    purchases.unshift(newPurchase);
    return HttpResponse.json(newPurchase, { status: 201 });
  }),

  // Delete
  http.delete("*/purchases/:id", async ({ params }) => {
    const { id } = params;
    purchases = purchases.filter(p => p.id !== id);
    return new HttpResponse(null, { status: 204 });
  }),

  /**
   * Get Specific Item Details for Purchase
   * UPDATED: এখন এটি isSerialized ফ্ল্যাগটি পাঠাবে যাতে ফর্ম লজিক কাজ করে।
   */
  http.get("*/purchases/item-details/:id", async ({ params }) => {
    await delay(300);
    const { id } = params;
    
    // Items মক ডেটা থেকে খুঁজে বের করা
    const item = mockItems.find(i => i.id === id);
    
    if (!item) {
      return new HttpResponse(null, { status: 404 });
    }
    
    return HttpResponse.json({
      id: item.id,
      name: item.name,
      sku: item.sku,
      purchasePrice: item.purchasePrice || 0,
      // এই ফ্ল্যাগটিই আপনার ফর্মের IMEI ইনপুট ফিল্ডগুলোকে কন্ট্রোল করবে
      isSerialized: item.isSerialized || false,
      // মক ডেটায় যদি আগে থেকে কিছু সিরিয়াল থাকে তাও পাঠিয়ে দিচ্ছি (Sales এর সময় কাজে লাগবে)
      serialList: item.serialList || []
    });
  }),
];