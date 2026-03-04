export const QUOTATION_STATUS = {
  DRAFT: "DRAFT",
  SENT: "SENT",
  ACCEPTED: "ACCEPTED",
  REJECTED: "REJECTED",
  EXPIRED: "EXPIRED",
  CONVERTED: "CONVERTED", // When it becomes a Sale
} as const;

export const QUOTATION_VALIDITY_DAYS = [
  { label: "7 Days", value: 7 },
  { label: "15 Days", value: 15 },
  { label: "30 Days", value: 30 },
  { label: "Custom", value: 0 },
] as const;

export type QuotationStatus = keyof typeof QUOTATION_STATUS;