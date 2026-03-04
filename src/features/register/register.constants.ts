export const REGISTER_STATUS = {
  OPEN: "OPEN",
  CLOSED: "CLOSED",
} as const;

export type RegisterStatus = keyof typeof REGISTER_STATUS;