export const PURCHASE_STATUS = {
  PENDING: "PENDING",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
} as const;

export const PURCHASE_PAYMENT_STATUS = {
  PAID: "PAID",
  PARTIAL: "PARTIAL",
  DUE: "DUE",
} as const;

export type PurchaseStatus = keyof typeof PURCHASE_STATUS;
export type PurchasePaymentStatus = keyof typeof PURCHASE_PAYMENT_STATUS;