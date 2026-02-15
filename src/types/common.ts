// src/types/common.ts

/**
 * Common properties for all database entities.
 */
export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Standard format for API responses.
 */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

/**
 * Reusable interface for dropdowns and select inputs.
 */
export interface SelectOption {
  label: string;
  value: string;
}

/**
 * Types for Master Settings / Lookups.
 */
export type SettingType =
  | "COLOR"
  | "WARRANTY"
  | "DEVICE_TYPE"
  | "REPAIR_STATUS"
  | "CHECKLIST_ACCESSORY"
  | "EXPENSE_CAT";

export interface MasterSetting extends BaseEntity {
  type: SettingType;
  label: string;
  value: string;
  isActive: boolean;
}