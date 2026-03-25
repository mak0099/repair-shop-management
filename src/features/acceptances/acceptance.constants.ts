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

/**
 * Status-specific color mappings for light/dark theme compatibility
 * Uses Tailwind color utilities with dark: prefix for automatic theme switching
 * Each status has: bg (background), text (text color), and accent (border/accent)
 */
export const STATUS_COLORS = {
  [REPAIR_STATUSES.PENDING]: {
    bg: "bg-blue-50 dark:bg-blue-950/30",
    text: "text-blue-700 dark:text-blue-300",
    accent: "border-blue-200 dark:border-blue-800",
    dot: "bg-blue-500 dark:bg-blue-400",
    label: "Pending",
  },
  [REPAIR_STATUSES.DIAGNOSING]: {
    bg: "bg-cyan-50 dark:bg-cyan-950/30",
    text: "text-cyan-700 dark:text-cyan-300",
    accent: "border-cyan-200 dark:border-cyan-800",
    dot: "bg-cyan-500 dark:bg-cyan-400",
    label: "Diagnosing",
  },
  [REPAIR_STATUSES.IN_PROGRESS]: {
    bg: "bg-indigo-50 dark:bg-indigo-950/30",
    text: "text-indigo-700 dark:text-indigo-300",
    accent: "border-indigo-200 dark:border-indigo-800",
    dot: "bg-indigo-500 dark:bg-indigo-400",
    label: "In Progress",
  },
  [REPAIR_STATUSES.ON_HOLD]: {
    bg: "bg-orange-50 dark:bg-orange-950/30",
    text: "text-orange-700 dark:text-orange-300",
    accent: "border-orange-200 dark:border-orange-800",
    dot: "bg-orange-500 dark:bg-orange-400",
    label: "On Hold",
  },
  [REPAIR_STATUSES.WAITING_PARTS]: {
    bg: "bg-amber-50 dark:bg-amber-950/30",
    text: "text-amber-700 dark:text-amber-300",
    accent: "border-amber-200 dark:border-amber-800",
    dot: "bg-amber-500 dark:bg-amber-400",
    label: "Waiting Parts",
  },
  [REPAIR_STATUSES.UNREPAIRABLE]: {
    bg: "bg-red-50 dark:bg-red-950/30",
    text: "text-red-700 dark:text-red-300",
    accent: "border-red-200 dark:border-red-800",
    dot: "bg-red-500 dark:bg-red-400",
    label: "Unrepairable",
  },
  [REPAIR_STATUSES.READY]: {
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
    text: "text-emerald-700 dark:text-emerald-300",
    accent: "border-emerald-200 dark:border-emerald-800",
    dot: "bg-emerald-500 dark:bg-emerald-400",
    label: "Ready",
  },
  [REPAIR_STATUSES.DELIVERED]: {
    bg: "bg-green-50 dark:bg-green-950/30",
    text: "text-green-700 dark:text-green-300",
    accent: "border-green-200 dark:border-green-800",
    dot: "bg-green-500 dark:bg-green-400",
    label: "Delivered",
  },
  [REPAIR_STATUSES.TRADE_IN]: {
    bg: "bg-purple-50 dark:bg-purple-950/30",
    text: "text-purple-700 dark:text-purple-300",
    accent: "border-purple-200 dark:border-purple-800",
    dot: "bg-purple-500 dark:bg-purple-400",
    label: "Trade In",
  },
  [REPAIR_STATUSES.BUYBACK]: {
    bg: "bg-fuchsia-50 dark:bg-fuchsia-950/30",
    text: "text-fuchsia-700 dark:text-fuchsia-300",
    accent: "border-fuchsia-200 dark:border-fuchsia-800",
    dot: "bg-fuchsia-500 dark:bg-fuchsia-400",
    label: "Buyback",
  },
  [REPAIR_STATUSES.CANCELLED]: {
    bg: "bg-gray-50 dark:bg-gray-900/30",
    text: "text-gray-700 dark:text-gray-300",
    accent: "border-gray-200 dark:border-gray-800",
    dot: "bg-gray-500 dark:bg-gray-400",
    label: "Cancelled",
  },
} as const;

/**
 * Helper function to get color classes for a status
 * Usage: const colors = getStatusColors(REPAIR_STATUSES.IN_PROGRESS);
 *        <div className={`${colors.bg} ${colors.text}`}>...</div>
 */
export const getStatusColors = (status: keyof typeof STATUS_COLORS) => {
  return STATUS_COLORS[status] || STATUS_COLORS[REPAIR_STATUSES.PENDING];
};
