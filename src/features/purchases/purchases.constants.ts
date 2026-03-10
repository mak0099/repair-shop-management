export const PURCHASE_STATUS = {
  ORDERED: "ORDERED",
  RECEIVED: "RECEIVED",
  CANCELLED: "CANCELLED",
} as const;

export const PURCHASE_PAYMENT_STATUS = {
  PAID: "PAID",
  PARTIAL: "PARTIAL",
  DUE: "DUE",
} as const;

export type PurchaseStatus = keyof typeof PURCHASE_STATUS;
export type PurchasePaymentStatus = keyof typeof PURCHASE_PAYMENT_STATUS;