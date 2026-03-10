import { Sale } from "../sales.schema";

export const mockSales: Sale[] = [
  {
    id: "inv-001",
    invoiceNumber: "INV-2024-001",
    customerId: "cust-101",
    items: [
      { productId: "p-item-100", name: "iPhone 15 Pro", price: 145000, quantity: 1, subtotal: 145000, type: "PRODUCT", tax: 0, discount: 0 }
    ],
    subtotal: 145000,
    totalTax: 7250,
    totalDiscount: 0,
    grandTotal: 152250,
    paymentMethod: "CASH",
    amountReceived: 153000,
    changeAmount: 750,
    status: "COMPLETED",
    paymentStatus: "PAID",
    processedBy: "staff-001",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "inv-002",
    invoiceNumber: "INV-2024-002",
    customerId: null,
    items: [
      { productId: "s-item-501", name: "Software Flashing", price: 1000, quantity: 1, subtotal: 1000, type: "SERVICE", tax: 0, discount: 0 }
    ],
    subtotal: 1000,
    totalTax: 50,
    totalDiscount: 0,
    grandTotal: 1050,
    paymentMethod: "MOBILE_PAYMENT",
    amountReceived: 1050,
    changeAmount: 0,
    status: "COMPLETED",
    paymentStatus: "PAID",
    processedBy: "staff-001",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  }
];