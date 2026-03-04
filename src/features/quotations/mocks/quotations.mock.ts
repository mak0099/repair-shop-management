import { Quotation } from "../quotations.schema";
import { QUOTATION_STATUS } from "../quotations.constants";

export const mockQuotations: Quotation[] = [
  {
    id: "quote-001",
    quotationNumber: "EST-2024-001",
    customerId: "cust-101",
    items: [
      { productId: "p-item-100", name: "iPhone 15 Pro OLED Screen", price: 15000, quantity: 1, subtotal: 15000, type: "PRODUCT", tax: 0, discount: 0 },
      { productId: "s-item-500", name: "Installation Labor", price: 1500, quantity: 1, subtotal: 1500, type: "SERVICE", tax: 0, discount: 0 }
    ],
    subtotal: 16500,
    totalTax: 825,
    totalDiscount: 500,
    grandTotal: 16825,
    status: QUOTATION_STATUS.SENT,
    validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    notes: "Original parts with 6 months warranty.",
    createdBy: "staff-001",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "quote-002",
    quotationNumber: "EST-2024-002",
    customerId: "cust-105",
    items: [
      { productId: "p-item-102", name: "MacBook Air Battery", price: 8500, quantity: 1, subtotal: 8500, type: "PRODUCT", tax: 0, discount: 0 }
    ],
    subtotal: 8500,
    totalTax: 425,
    totalDiscount: 0,
    grandTotal: 8925,
    status: QUOTATION_STATUS.DRAFT,
    validUntil: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    notes: "Customer is considering the price.",
    createdBy: "staff-001",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  }
];