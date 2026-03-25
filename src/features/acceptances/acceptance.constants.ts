/**
 * Repair Status Enum - Used throughout the system
 * UPPER_SNAKE_CASE for consistency in conditions and database
 */
export const REPAIR_STATUSES = {
  PENDING: "PENDING",
  DIAGNOSING: "DIAGNOSING",
  IN_PROGRESS: "IN_PROGRESS",
  ON_HOLD: "ON_HOLD",
  WAITING_PARTS: "WAITING_PARTS",
  UNREPAIRABLE: "UNREPAIRABLE",
  READY: "READY",
  DELIVERED: "DELIVERED",
  TRADE_IN: "TRADE_IN",
  BUYBACK: "BUYBACK",
  CANCELLED: "CANCELLED",
} as const;

/**
 * Display options for filters and dropdowns
 * Maps UPPER_SNAKE_CASE values to user-friendly labels
 */
export const REPAIR_STATUS_OPTIONS = [
  { label: "All Status", value: "all" },
  { label: "Pending", value: REPAIR_STATUSES.PENDING },
  { label: "Diagnosing", value: REPAIR_STATUSES.DIAGNOSING },
  { label: "In Progress", value: REPAIR_STATUSES.IN_PROGRESS },
  { label: "On Hold", value: REPAIR_STATUSES.ON_HOLD },
  { label: "Waiting Parts", value: REPAIR_STATUSES.WAITING_PARTS },
  { label: "Unrepairable", value: REPAIR_STATUSES.UNREPAIRABLE },
  { label: "Ready", value: REPAIR_STATUSES.READY },
  { label: "Delivered", value: REPAIR_STATUSES.DELIVERED },
  { label: "Trade In", value: REPAIR_STATUSES.TRADE_IN },
  { label: "Buyback", value: REPAIR_STATUSES.BUYBACK },
  { label: "Cancelled", value: REPAIR_STATUSES.CANCELLED },
];

/**
 * Kanban board columns in order
 */
export const KANBAN_COLUMNS = [
  REPAIR_STATUSES.PENDING,
  REPAIR_STATUSES.DIAGNOSING,
  REPAIR_STATUSES.IN_PROGRESS,
  REPAIR_STATUSES.ON_HOLD,
  REPAIR_STATUSES.WAITING_PARTS,
  REPAIR_STATUSES.UNREPAIRABLE,
  REPAIR_STATUSES.READY,
  REPAIR_STATUSES.DELIVERED,
] as const;

/**
 * Terminal statuses that cannot be changed
 */
export const TERMINAL_STATUSES = [
  REPAIR_STATUSES.DELIVERED,
  REPAIR_STATUSES.TRADE_IN,
  REPAIR_STATUSES.BUYBACK,
  REPAIR_STATUSES.CANCELLED,
] as const;
