export const RETURN_STATUS = {
  PENDING: "PENDING",
  COMPLETED: "COMPLETED",
  REJECTED: "REJECTED",
} as const;

export const ITEM_CONDITION_ON_RETURN = {
  RESALABLE: "RESALABLE", // স্টক এ যোগ হবে
  DAMAGED: "DAMAGED",     // স্টক এ যোগ হবে না (Waste)
  REFURBISHED: "REFURBISHED",
} as const;

export type ReturnStatus = keyof typeof RETURN_STATUS;
export type ReturnItemCondition = keyof typeof ITEM_CONDITION_ON_RETURN;