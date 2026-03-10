export const PAYMENT_METHODS = [
  { label: "Cash", value: "CASH", icon: "Banknote" },
  { label: "Card", value: "CARD", icon: "CreditCard" },
  { label: "Mobile Pay", value: "MOBILE_PAYMENT", icon: "Smartphone" },
  { label: "Split", value: "SPLIT", icon: "LayoutGrid" },
] as const;

export const DEFAULT_TAX_RATE = 0.05; // ৫% ভ্যাট

export type PaymentMethod = typeof PAYMENT_METHODS[number]["value"];