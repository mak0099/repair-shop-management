// ১. Money Flow (IN/OUT)
export const KHATA_FLOWS = {
  IN: {
    label: "Cash In (Debit)",
    value: "IN",
    color: "bg-emerald-50 text-emerald-600 border-emerald-500",
    iconColor: "text-emerald-500",
  },
  OUT: {
    label: "Cash Out (Credit)",
    value: "OUT",
    color: "bg-rose-50 text-rose-600 border-rose-500",
    iconColor: "text-rose-500",
  },
} as const;

export const FLOW_OPTIONS = Object.values(KHATA_FLOWS).map(
  ({ label, value }) => ({ label, value }),
);

// ২. Transaction Types (Modules & Reasons)
export const TRANSACTION_TYPES = {
  PURCHASE: { label: "Purchase Bill", value: "PURCHASE" },
  SALE: { label: "Sales Bill", value: "SALE" },
  REPAIRMENT: { label: "Repairment Service", value: "REPAIRMENT" },
  EXPENSE: { label: "Shop Expense", value: "EXPENSE" },
  PURCHASE_RETURN: { label: "Purchase Return", value: "PURCHASE_RETURN" },
  SALE_RETURN: { label: "Sales Return", value: "SALE_RETURN" },
  PURCHASE_DUE_PAYMENT: {
    label: "Supplier Payment",
    value: "PURCHASE_DUE_PAYMENT",
  },
  SALE_DUE_PAYMENT: { label: "Customer Collection", value: "SALE_DUE_PAYMENT" },
  ADJUSTMENT: { label: "Manual Adjustment", value: "ADJUSTMENT" },
} as const;

export const TRANSACTION_TYPE_OPTIONS = Object.values(TRANSACTION_TYPES).map(
  ({ label, value }) => ({ label, value }),
);

// ৩. Adjustment Reasons
export const ADJUSTMENT_REASONS = {
  OPENING_BALANCE: { label: "Opening Balance", value: "OPENING_BALANCE" },
  SHOP_RENT: { label: "Shop Rent", value: "SHOP_RENT" },
  ELECTRIC_BILL: { label: "Electricity Bill", value: "ELECTRIC_BILL" },
  STAFF_SALARY: { label: "Staff Salary", value: "STAFF_SALARY" },
  OWNER_WITHDRAW: { label: "Owner Withdraw", value: "OWNER_WITHDRAW" },
  MISC: { label: "Miscellaneous", value: "MISC" },
} as const;

export const ADJUSTMENT_REASON_OPTIONS = Object.values(ADJUSTMENT_REASONS).map(
  ({ label, value }) => ({ label, value }),
);

// ৪. Payment Methods
export const PAYMENT_METHODS = {
  CASH: { label: "Cash", value: "CASH" },
  CARD: { label: "Card", value: "CARD" },
  BANK_TRANSFER: { label: "Bank Transfer", value: "BANK_TRANSFER" },
  CHECK: { label: "Check", value: "CHECK" },
} as const;

export const PAYMENT_METHOD_OPTIONS = Object.values(PAYMENT_METHODS).map(
  ({ label, value }) => ({ label, value }),
);

export const PARTY_TYPES = {
  SUPPLIER: { label: "Supplier", value: "SUPPLIER", color: "text-orange-600 bg-orange-50" },
  CUSTOMER: { label: "Customer", value: "CUSTOMER", color: "text-blue-600 bg-blue-50" },
} as const;

export const PARTY_TYPE_OPTIONS = Object.values(PARTY_TYPES).map(({ label, value }) => ({ label, value }));