import { Buyback } from "../buyback.schema";

export const mockBuybacks: Buyback[] = [
  {
    id: "bb-001",
    buybackNumber: "BB-2024-0001",
    customerId: "cust-100", 
    items: [
      {
        productId: "item-001",
        name: "iPhone 13",
        quantity: 1,
        agreedPrice: 250,
        subtotal: 250,
        isSerialized: true,
        serialList: [{
          imei: "358123456789012",
          condition: "Grade A",
        }]
      }
    ],
    subtotal: 250,
    totalAmount: 250,
    paidAmount: 250,
    dueAmount: 0,
    buybackDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    paymentMethod: "CASH",
    notes: "Customer traded in for a new iPhone 15.",
    status: "COMPLETED",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "bb-002",
    buybackNumber: "BB-2024-0002",
    customerId: "cust-101",
    items: [
      {
        productId: "item-002",
        name: "Samsung Galaxy S22",
        quantity: 1,
        agreedPrice: 100,
        subtotal: 100,
        isSerialized: true,
        serialList: [{
          imei: "358987654321098",
          condition: "Broken Screen",
        }]
      }
    ],
    subtotal: 100,
    totalAmount: 100,
    paidAmount: 100,
    dueAmount: 0,
    buybackDate: new Date().toISOString(),
    paymentMethod: "STORE_CREDIT",
    notes: "Screen replacement costs too much, customer preferred to sell.",
    status: "PENDING",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];