import { SaleReturn } from "../returns.schema";
import { RETURN_STATUS, ITEM_CONDITION_ON_RETURN } from "../returns.constants";

export const mockReturns: SaleReturn[] = [
  {
    id: "ret-101",
    returnNumber: "RET-9901",
    saleId: "INV-98542", // Reference to a real invoice
    items: [
      { 
        productId: "p-item-100", 
        name: "iPhone 15 Pro OLED Screen", 
        quantity: 1, 
        price: 15000, 
        subtotal: 15000, 
        condition: ITEM_CONDITION_ON_RETURN.RESALABLE 
      }
    ],
    totalRefundAmount: 15000,
    restockingFee: 0,
    reason: "Customer changed mind before installation",
    status: RETURN_STATUS.COMPLETED,
    processedBy: "staff-001",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];