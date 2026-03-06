import { ProductPurchase } from "../purchases.schema";
import { PURCHASE_STATUS, PURCHASE_PAYMENT_STATUS } from "../purchases.constants";

export const mockPurchases: ProductPurchase[] = [
  // ভেরিয়েশন ১: শুধুমাত্র নন-সিরিয়ালাইজড আইটেম (পার্টস/এক্সেসরিজ)
  {
    id: "pur-001",
    purchaseNumber: "PUR-2026-0001",
    supplierId: "Global Tech Distribution",
    purchaseDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    billNumber: "INV/GT/8852",
    items: [
      { 
        productId: "item-103", 
        name: "iPhone 13 Display (OLED)", 
        quantity: 10, 
        costPrice: 45, 
        subtotal: 450, 
        isSerialized: false, 
        serialList: [] 
      },
      { 
        productId: "item-104", 
        name: "USB-C Charger 20W", 
        quantity: 20, 
        costPrice: 15, 
        subtotal: 300, 
        isSerialized: false, 
        serialList: [] 
      }
    ],
    subtotal: 750,
    totalAmount: 750,
    paidAmount: 750,
    dueAmount: 0,
    paymentStatus: PURCHASE_PAYMENT_STATUS.PAID,
    addToKhata: true,
    status: PURCHASE_STATUS.RECEIVED,
    notes: "Spare parts batch.",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // ভেরিয়েশন ২: পিওর সিরিয়ালাইজড আইটেম (একই মডেলের ৩টি ফোন)
  {
    id: "pur-002",
    purchaseNumber: "PUR-2026-0002",
    supplierId: "Apple Italia Wholesale",
    purchaseDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    billNumber: "APL-IT-990",
    items: [
      { 
        productId: "item-100", 
        name: "iPhone 15 Pro", 
        quantity: 3, 
        costPrice: 850, 
        subtotal: 2550, 
        isSerialized: true, 
        serialList: ["IMEI-88552211001", "IMEI-88552211002", "IMEI-88552211003"] 
      }
    ],
    subtotal: 2550,
    totalAmount: 2550,
    paidAmount: 1000,
    dueAmount: 1550,
    paymentStatus: PURCHASE_PAYMENT_STATUS.PARTIAL,
    addToKhata: true,
    status: PURCHASE_STATUS.RECEIVED,
    notes: "High value units.",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // ভেরিয়েশন ৩: মিক্সড ডাটা (ফোন + এক্সেসরিজ এক সাথে)
  {
    id: "pur-003",
    purchaseNumber: "PUR-2026-0003",
    supplierId: "Local Parts Hub",
    purchaseDate: new Date().toISOString(),
    billNumber: "LPH-2026-X",
    items: [
      { 
        productId: "item-101", 
        name: "Galaxy S24 Ultra", 
        quantity: 1, 
        costPrice: 1000, 
        subtotal: 1000, 
        isSerialized: true, 
        serialList: ["SN-SAM-S24-PROMO-001"] 
      },
      { 
        productId: "item-104", 
        name: "Galaxy Buds 2 Pro", 
        quantity: 5, 
        costPrice: 120, 
        subtotal: 600, 
        isSerialized: false, 
        serialList: [] 
      }
    ],
    subtotal: 1600,
    totalAmount: 1600,
    paidAmount: 0,
    dueAmount: 1600,
    paymentStatus: PURCHASE_PAYMENT_STATUS.DUE,
    addToKhata: true,
    status: PURCHASE_STATUS.ORDERED,
    notes: "Combo purchase for store display.",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];