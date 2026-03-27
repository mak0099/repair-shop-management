/**
 * Logging utility for Acceptance tickets
 * Handles creation of operational and timeline logs
 */

type OperationalAction =
  | "TICKET_CREATED"
  | "STATUS_CHANGED"
  | "TECHNICIAN_ASSIGNED"
  | "PART_ADDED"
  | "PART_REMOVED"
  | "PAYMENT_RECEIVED"
  | "NOTE_ADDED"
  | "PHOTO_ADDED"
  | "DELIVERY_COMPLETED";

type TimelineAction = "TICKET_CREATED" | "TECHNICIAN_ASSIGNED" | "STATUS_CHANGED" | "DELIVERY_COMPLETED" | "PART_ADDED" | "PART_REMOVED" | "NOTE_ADDED";

type LogColor = "blue" | "indigo" | "emerald" | "amber" | "red";

export interface OperationalLog {
  id: string;
  action: OperationalAction;
  description: string;
  timestamp: string;
  userId?: string;
  metadata?: Record<string, unknown>;
}

export interface TimelineLog {
  id: string;
  action: TimelineAction;
  description: string;
  icon?: string;
  color?: LogColor;
  timestamp: string;
  userId?: string;
  metadata?: {
    // Financial snapshot at time of this event
    totalCost?: number;
    advancePayment?: number;
    balanceDue?: number;
    [key: string]: unknown;
  };
}

/**
 * Create an operational log entry
 */
export const createOperationalLog = (
  action: OperationalAction,
  description: string,
  userId?: string,
  metadata?: OperationalLog["metadata"],
  timestamp?: string | Date
): OperationalLog => ({
  id: `op-log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  action,
  description,
  timestamp: timestamp ? (typeof timestamp === 'string' ? timestamp : timestamp.toISOString()) : new Date().toISOString(),
  userId,
  metadata,
});

/**
 * Create a timeline log entry
 */
export const createTimelineLog = (
  action: TimelineAction,
  description: string,
  icon?: string,
  color?: LogColor,
  userId?: string,
  timestamp?: string | Date,
  metadata?: TimelineLog["metadata"]
): TimelineLog => ({
  id: `timeline-log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  action,
  description,
  icon,
  color,
  timestamp: timestamp ? (typeof timestamp === 'string' ? timestamp : timestamp.toISOString()) : new Date().toISOString(),
  userId,
  metadata,
});

/**
 * Get icon for timeline action
 */
export const getIconForAction = (action: TimelineAction): string => {
  const iconMap: Record<TimelineAction, string> = {
    TICKET_CREATED: "receipt",
    TECHNICIAN_ASSIGNED: "user-check",
    STATUS_CHANGED: "arrow-right",
    DELIVERY_COMPLETED: "check-circle",
    PART_ADDED: "wrench",
    PART_REMOVED: "wrench",
    NOTE_ADDED: "message-square-plus",
  };
  return iconMap[action];
};

/**
 * Get color for status change
 */
export const getColorForStatus = (status: string): LogColor => {
  const colorMap: Record<string, LogColor> = {
    PENDING: "blue",
    DIAGNOSING: "indigo",
    IN_PROGRESS: "indigo",
    ON_HOLD: "amber",
    WAITING_PARTS: "amber",
    UNREPAIRABLE: "red",
    READY: "emerald",
    DELIVERED: "emerald",
    TRADE_IN: "blue",
    BUYBACK: "blue",
    CANCELLED: "red",
  };
  return colorMap[status] || "blue";
};

/**
 * Prepend log to existing logs array (new logs at top)
 */
export const prependLog = <T>(existingLogs: T[], newLog: T): T[] => {
  return [newLog, ...existingLogs];
};
